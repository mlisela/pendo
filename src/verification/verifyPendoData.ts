/**
 * Pendo Data Verification Utility (Development Only)
 *
 * A development-only utility that scans the DOM to verify Pendo exclusion is working correctly.
 * Checks for PII in tracking attributes and ensures form inputs are properly excluded.
 *
 * Usage:
 *   import { verifyPendoExclusions, scanForPII, generatePendoReport } from 'app/utils/verifyPendoData';
 *
 *   // Run a full scan
 *   const report = generatePendoReport();
 *   console.table(report.issues);
 *
 *   // Or run specific checks
 *   const piiIssues = scanForPII();
 *   const exclusionIssues = verifyPendoExclusions();
 */

// Declare process as optional global for environment checks
declare const process: { env?: { NODE_ENV?: string } } | undefined;

/**
 * Interface for PII detection issue
 */
export interface IPIIIssue {
    element: string;
    attribute: string;
    value: string;
    reason: string;
    severity: "high" | "medium" | "low";
    xpath: string;
}

/**
 * Interface for Pendo exclusion issue
 */
export interface IPendoExclusionIssue {
    element: string;
    inputType?: string;
    reason: string;
    suggestion: string;
    xpath: string;
}

/**
 * Interface for the complete Pendo verification report
 */
export interface IPendoVerificationReport {
    timestamp: string;
    totalElements: number;
    totalInputs: number;
    piiIssues: IPIIIssue[];
    exclusionIssues: IPendoExclusionIssue[];
    summary: {
        highSeverityCount: number;
        mediumSeverityCount: number;
        lowSeverityCount: number;
        unexcludedInputsCount: number;
        passed: boolean;
    };
}

/**
 * PII patterns to detect sensitive information
 */
const PII_PATTERNS = {
    email: {
        regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
        severity: "high" as const,
        description: "Email address detected",
    },
    phone: {
        regex: /(\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g,
        severity: "high" as const,
        description: "Phone number detected",
    },
    ssn: {
        regex: /\b\d{3}-\d{2}-\d{4}\b/g,
        severity: "high" as const,
        description: "Social Security Number detected",
    },
    creditCard: {
        regex: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
        severity: "high" as const,
        description: "Credit card number detected",
    },
    ipAddress: {
        regex: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
        severity: "medium" as const,
        description: "IP address detected",
    },
    apiKey: {
        regex: /(api[_-]?key|token)["\s:=]+[a-zA-Z0-9_-]{20,}/gi,
        severity: "high" as const,
        description: "API key or token detected",
    },
    // Financial/Client-specific patterns
    clientId: {
        regex: /\b(client[_-]?id|account[_-]?id)["\s:=]+\d{6,}/gi,
        severity: "high" as const,
        description: "Client/Account ID detected",
    },
    userId: {
        regex: /\b(user[_-]?id|uid)["\s:=]+\d{4,}/gi,
        severity: "medium" as const,
        description: "User ID detected",
    },
    isin: {
        regex: /\b[A-Z]{2}[A-Z0-9]{9}\d\b/g,
        severity: "medium" as const,
        description: "ISIN code detected",
    },
    taxId: {
        regex: /\b(tax[_-]?id|tin|ein)["\s:=]+\d{2,3}[-\s]?\d{7,9}\b/gi,
        severity: "high" as const,
        description: "Tax ID detected",
    },
    bankAccount: {
        regex: /\b(account[_-]?number|bank[_-]?account)["\s:=]+\d{8,17}\b/gi,
        severity: "high" as const,
        description: "Bank account number detected",
    },
    iban: {
        regex: /\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/g,
        severity: "high" as const,
        description: "IBAN detected",
    },
    jwt: {
        regex: /eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/g,
        severity: "high" as const,
        description: "JWT token detected",
    },
    password: {
        regex: /\b(password|passwd|pwd|secret)["\s:=]+["']?[^\s"']{8,}["']?/gi,
        severity: "high" as const,
        description: "Password/Secret detected",
    },
    awsKey: {
        regex: /AKIA[0-9A-Z]{16}/g,
        severity: "high" as const,
        description: "AWS Access Key detected",
    },
    postalCode: {
        regex: /\b\d{5}(-\d{4})?\b|\b[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}\b/g,
        severity: "low" as const,
        description: "Postal/ZIP code detected",
    },
};

/**
 * Attributes that should not contain PII
 */
const TRACKABLE_ATTRIBUTES = [
    "data-pendo",
    "data-pendo-id",
    "id",
    "class",
    "name",
    "aria-label",
    "title",
    "placeholder",
    "alt",
];

/**
 * Input types that typically contain sensitive data
 */
const SENSITIVE_INPUT_TYPES = [
    "password",
    "email",
    "tel",
    "number",
    "credit-card",
    "cc-number",
    "cc-exp",
    "cc-csc",
];

/**
 * Pendo exclusion classes and attributes
 */
const PENDO_EXCLUSION_MARKERS = [
    "data-pendo-ignore",
    "_pendo-exclude_",
    "pendo-exclude",
    "data-pendo-exclude",
    "_pensieve-exclude_",
];

/**
 * Approved Pendo tracking attributes
 */
const APPROVED_PENDO_ATTRIBUTES = [
    "data-pendo-id",
    "data-pendo-guide-id",
    "data-pendo-ignore",
    "data-pendo-exclude",
];

/**
 * Gets XPath for an element
 */
function getXPath(element: Element): string {
    if (element.id) {
        return `//*[@id="${element.id}"]`;
    }

    const parts: string[] = [];
    let current: Element | null = element;

    while (current && current.nodeType === Node.ELEMENT_NODE) {
        let index = 0;
        let sibling = current.previousSibling;

        while (sibling) {
            if (sibling.nodeType === Node.ELEMENT_NODE && sibling.nodeName === current.nodeName) {
                index++;
            }
            sibling = sibling.previousSibling;
        }

        const tagName = current.nodeName.toLowerCase();
        const pathIndex = index > 0 ? `[${index + 1}]` : "";
        parts.unshift(tagName + pathIndex);

        current = current.parentElement;
    }

    return parts.length ? "/" + parts.join("/") : "";
}

/**
 * Gets a readable element descriptor
 */
function getElementDescriptor(element: Element): string {
    const tag = element.tagName.toLowerCase();
    const id = element.id ? `#${element.id}` : "";
    const classes = element.className ? `.${element.className.split(" ").join(".")}` : "";
    return `<${tag}${id}${classes}>`;
}

/**
 * Checks if an element is excluded from Pendo tracking
 */
function isElementExcluded(element: Element): boolean {
    // Check for exclusion classes
    const classList = element.className?.split(" ") || [];
    if (PENDO_EXCLUSION_MARKERS.some((marker) => classList.includes(marker))) {
        return true;
    }

    // Check for exclusion attributes
    if (PENDO_EXCLUSION_MARKERS.some((marker) => element.hasAttribute(marker))) {
        return true;
    }

    // Check if parent is excluded
    let parent = element.parentElement;
    while (parent) {
        const parentClassList = parent.className?.split(" ") || [];
        if (PENDO_EXCLUSION_MARKERS.some((marker) => parentClassList.includes(marker))) {
            return true;
        }
        if (PENDO_EXCLUSION_MARKERS.some((marker) => parent?.hasAttribute(marker))) {
            return true;
        }
        parent = parent.parentElement;
    }

    return false;
}

/**
 * Checks if a value contains PII
 */
function containsPII(value: string): { hasPII: boolean; matches: Array<{ pattern: string; severity: string }> } {
    const matches: Array<{ pattern: string; severity: string }> = [];

    for (const [patternName, pattern] of Object.entries(PII_PATTERNS)) {
        if (pattern.regex.test(value)) {
            matches.push({
                pattern: pattern.description,
                severity: pattern.severity,
            });
        }
    }

    return {
        hasPII: matches.length > 0,
        matches,
    };
}

/**
 * Scans the DOM for PII in trackable attributes
 */
export function scanForPII(rootElement: Document | Element = document): IPIIIssue[] {
    const issues: IPIIIssue[] = [];
    const elements = rootElement.querySelectorAll("*");

    elements.forEach((element) => {
        // Skip if element is excluded
        if (isElementExcluded(element)) {
            return;
        }

        // Check each trackable attribute
        TRACKABLE_ATTRIBUTES.forEach((attr) => {
            const value = element.getAttribute(attr);
            if (value) {
                const piiCheck = containsPII(value);
                if (piiCheck.hasPII) {
                    piiCheck.matches.forEach((match) => {
                        issues.push({
                            element: getElementDescriptor(element),
                            attribute: attr,
                            value: value.substring(0, 50) + (value.length > 50 ? "..." : ""),
                            reason: match.pattern,
                            severity: match.severity as "high" | "medium" | "low",
                            xpath: getXPath(element),
                        });
                    });
                }
            }
        });

        // Check text content for exposed PII
        if (element.childNodes.length === 1 && element.childNodes[0].nodeType === Node.TEXT_NODE) {
            const textContent = element.textContent?.trim() || "";
            if (textContent) {
                const piiCheck = containsPII(textContent);
                if (piiCheck.hasPII) {
                    piiCheck.matches.forEach((match) => {
                        issues.push({
                            element: getElementDescriptor(element),
                            attribute: "textContent",
                            value: textContent.substring(0, 50) + (textContent.length > 50 ? "..." : ""),
                            reason: match.pattern,
                            severity: match.severity as "high" | "medium" | "low",
                            xpath: getXPath(element),
                        });
                    });
                }
            }
        }
    });

    return issues;
}

/**
 * Verifies that form inputs are properly excluded from Pendo
 */
export function verifyPendoExclusions(rootElement: Document | Element = document): IPendoExclusionIssue[] {
    const issues: IPendoExclusionIssue[] = [];

    // Check all input elements
    const inputs = rootElement.querySelectorAll("input, textarea, select");

    inputs.forEach((input) => {
        const element = input as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
        const type = "type" in element ? element.type : "textarea";
        const name = element.getAttribute("name") || "";
        const id = element.id || "";

        // Check if it's a sensitive input type
        const isSensitive =
            SENSITIVE_INPUT_TYPES.includes(type) ||
            SENSITIVE_INPUT_TYPES.some((sensitiveType) => name.toLowerCase().includes(sensitiveType)) ||
            SENSITIVE_INPUT_TYPES.some((sensitiveType) => id.toLowerCase().includes(sensitiveType));

        // Skip non-sensitive inputs
        if (!isSensitive && type !== "text" && type !== "textarea") {
            return;
        }

        // Check if element is properly excluded
        if (!isElementExcluded(element)) {
            issues.push({
                element: getElementDescriptor(element),
                inputType: type,
                reason: isSensitive
                    ? "Sensitive input is not excluded from Pendo tracking"
                    : "Text input is not excluded from Pendo tracking (recommended)",
                suggestion: `Add data-pendo-ignore attribute to exclude from tracking`,
                xpath: getXPath(element),
            });
        }
    });

    return issues;
}

/**
 * Verifies that elements with specific data attributes are excluded
 */
export function verifyDataAttributeExclusions(rootElement: Document | Element = document): IPendoExclusionIssue[] {
    const issues: IPendoExclusionIssue[] = [];
    const sensitiveDataAttributes = [
        "data-user-id",
        "data-client-id",
        "data-email",
        "data-token",
        "data-api-key",
        "data-isin",
        "data-account-id",
    ];

    sensitiveDataAttributes.forEach((attr) => {
        const elements = rootElement.querySelectorAll(`[${attr}]`);
        elements.forEach((element) => {
            if (!isElementExcluded(element)) {
                issues.push({
                    element: getElementDescriptor(element),
                    reason: `Element has sensitive attribute "${attr}" but is not excluded`,
                    suggestion: `Add data-pendo-ignore attribute or wrap in excluded container`,
                    xpath: getXPath(element),
                });
            }
        });
    });

    return issues;
}

/**
 * Verifies only approved Pendo tracking attributes are present
 */
export function verifyApprovedTrackingAttributes(rootElement: Document | Element = document): IPendoExclusionIssue[] {
    const issues: IPendoExclusionIssue[] = [];
    const elements = rootElement.querySelectorAll("*");

    elements.forEach((element) => {
        const attributes = element.getAttributeNames();
        
        attributes.forEach((attr) => {
            // Check for any pendo-related attributes
            if (attr.toLowerCase().includes("pendo")) {
                // Verify it's an approved attribute
                if (!APPROVED_PENDO_ATTRIBUTES.includes(attr)) {
                    issues.push({
                        element: getElementDescriptor(element),
                        reason: `Unapproved Pendo attribute "${attr}" found`,
                        suggestion: `Use only approved attributes: ${APPROVED_PENDO_ATTRIBUTES.join(", ")}`,
                        xpath: getXPath(element),
                    });
                }
            }
        });
    });

    return issues;
}

/**
 * Generates a comprehensive Pendo verification report
 */
export function generatePendoReport(rootElement: Document | Element = document): IPendoVerificationReport {
    const piiIssues = scanForPII(rootElement);
    const exclusionIssues = verifyPendoExclusions(rootElement);
    const dataAttrIssues = verifyDataAttributeExclusions(rootElement);
    const trackingAttrIssues = verifyApprovedTrackingAttributes(rootElement);

    const allExclusionIssues = [...exclusionIssues, ...dataAttrIssues, ...trackingAttrIssues];

    const highSeverityCount = piiIssues.filter((i) => i.severity === "high").length;
    const mediumSeverityCount = piiIssues.filter((i) => i.severity === "medium").length;
    const lowSeverityCount = piiIssues.filter((i) => i.severity === "low").length;

    const report: IPendoVerificationReport = {
        timestamp: new Date().toISOString(),
        totalElements: rootElement.querySelectorAll("*").length,
        totalInputs: rootElement.querySelectorAll("input, textarea, select").length,
        piiIssues,
        exclusionIssues: allExclusionIssues,
        summary: {
            highSeverityCount,
            mediumSeverityCount,
            lowSeverityCount,
            unexcludedInputsCount: allExclusionIssues.length,
            passed: highSeverityCount === 0 && allExclusionIssues.length === 0,
        },
    };

    return report;
}

/**
 * Prints a formatted report to the console with actionable warnings
 */
export function printPendoReport(report: IPendoVerificationReport): void {
    console.group("🔍 Pendo Exclusion Verification Report");
    console.log(`Generated: ${report.timestamp}`);
    console.log(`Total Elements Scanned: ${report.totalElements}`);
    console.log(`Total Form Inputs: ${report.totalInputs}`);
    console.log("");

    if (report.summary.passed) {
        console.log("✅ All checks passed! No issues found.");
    } else {
        console.log("❌ Issues detected - Review and fix before deploying to production!");
    }

    console.log("");
    console.log("Summary:");
    console.log(`  🔴 High Severity PII Issues: ${report.summary.highSeverityCount}`);
    console.log(`  🟠 Medium Severity PII Issues: ${report.summary.mediumSeverityCount}`);
    console.log(`  🟡 Low Severity PII Issues: ${report.summary.lowSeverityCount}`);
    console.log(`  🟣 Unexcluded Inputs/Tracking Issues: ${report.summary.unexcludedInputsCount}`);
    console.groupEnd();

    if (report.piiIssues.length > 0) {
        console.group("🚨 PII Issues - Elements lacking data-pendo-ignore");
        console.warn(
            `Found ${report.piiIssues.length} element(s) with potential PII that are not excluded from Pendo tracking.`
        );
        console.table(
            report.piiIssues.map((issue) => ({
                Element: issue.element,
                Attribute: issue.attribute,
                Reason: issue.reason,
                Severity: issue.severity.toUpperCase(),
                Value: issue.value,
            }))
        );
        console.log("📝 Action: Add data-pendo-ignore attribute to these elements or their parent containers.");
        console.groupEnd();
    }

    if (report.exclusionIssues.length > 0) {
        console.group("⚠️ Exclusion & Tracking Issues");
        console.warn(
            `Found ${report.exclusionIssues.length} issue(s) with form inputs or tracking attributes.`
        );
        console.table(
            report.exclusionIssues.map((issue) => ({
                Element: issue.element,
                Type: issue.inputType || "N/A",
                Reason: issue.reason,
                Action: issue.suggestion,
            }))
        );
        console.groupEnd();
    }

    // Print detailed actionable steps
    if (!report.summary.passed) {
        console.group("📋 Action Items");
        
        if (report.summary.highSeverityCount > 0) {
            console.error(
                `🔴 CRITICAL: ${report.summary.highSeverityCount} high severity PII issue(s) must be fixed immediately!`
            );
        }
        
        if (report.summary.unexcludedInputsCount > 0) {
            console.warn(
                `🟣 ${report.summary.unexcludedInputsCount} form input(s) or tracking issue(s) need attention.`
            );
        }

        console.log("");
        console.log("Recommended fixes:");
        console.log("  1. Add data-pendo-ignore to elements containing PII");
        console.log("  2. Ensure all form inputs have data-pendo-ignore");
        console.log("  3. Use only approved Pendo attributes: data-pendo-id, data-pendo-guide-id");
        console.log("  4. Wrap sensitive sections in containers with data-pendo-ignore");
        console.log("");
        console.log("Example: <input type=\"email\" data-pendo-ignore />");
        console.log("Example: <div data-pendo-ignore>...sensitive content...</div>");
        
        console.groupEnd();
    }
}

/**
 * Runs a live scan and logs results (Development only)
 */
export function runPendoVerification(): IPendoVerificationReport {
    // Guard against running in production
    if (typeof process !== "undefined" && process.env?.NODE_ENV === "production") {
        console.warn("Pendo verification should only be run in development environments");
        return {
            timestamp: new Date().toISOString(),
            totalElements: 0,
            totalInputs: 0,
            piiIssues: [],
            exclusionIssues: [],
            summary: {
                highSeverityCount: 0,
                mediumSeverityCount: 0,
                lowSeverityCount: 0,
                unexcludedInputsCount: 0,
                passed: true,
            },
        };
    }

    const report = generatePendoReport();
    printPendoReport(report);
    return report;
}

/**
 * Highlights problematic elements in the DOM for visual debugging
 */
export function highlightIssues(report: IPendoVerificationReport): void {
    // Remove any existing highlights
    document.querySelectorAll(".pendo-verification-highlight").forEach((el) => el.remove());

    const style = document.createElement("style");
    style.className = "pendo-verification-highlight";
    style.textContent = `
        .pendo-pii-high { outline: 3px solid red !important; }
        .pendo-pii-medium { outline: 3px solid orange !important; }
        .pendo-pii-low { outline: 3px solid yellow !important; }
        .pendo-exclusion-issue { outline: 3px dashed purple !important; }
    `;
    document.head.appendChild(style);

    // Highlight PII issues
    report.piiIssues.forEach((issue) => {
        try {
            const element = document.evaluate(issue.xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
                .singleNodeValue as Element;
            if (element) {
                element.classList.add(`pendo-pii-${issue.severity}`);
                element.setAttribute("data-pendo-issue", issue.reason);
            }
        } catch (e) {
            console.error("Could not highlight element:", issue.xpath, e);
        }
    });

    // Highlight exclusion issues
    report.exclusionIssues.forEach((issue) => {
        try {
            const element = document.evaluate(issue.xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
                .singleNodeValue as Element;
            if (element) {
                element.classList.add("pendo-exclusion-issue");
                element.setAttribute("data-pendo-issue", issue.reason);
            }
        } catch (e) {
            console.error("Could not highlight element:", issue.xpath, e);
        }
    });

    console.log("✨ Problematic elements are now highlighted on the page");
}

// Make available globally in development only
// This block will only execute in non-production environments
if (typeof window !== "undefined") {
    // Check if we're NOT in production
    const isProduction = typeof process !== "undefined" && 
                         process.env?.NODE_ENV === "production";
    
    if (!isProduction) {
        (window as any).pendoVerify = {
            scan: runPendoVerification,
            report: generatePendoReport,
            highlight: highlightIssues,
            scanPII: scanForPII,
            checkExclusions: verifyPendoExclusions,
        };
        console.log("💡 Pendo verification tools available via window.pendoVerify");
    }
}
