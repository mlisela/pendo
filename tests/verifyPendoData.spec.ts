import * as pendoUtils from "../src/verification/verifyPendoData";

describe("verifyPendoData - DOM Scanner for PII and Exclusions", () => {
    let container: HTMLElement;

    beforeEach(() => {
        // Create a clean container for each test
        container = document.createElement("div");
        document.body.appendChild(container);
    });

    afterEach(() => {
        // Clean up
        document.body.removeChild(container);
    });

    describe("scanForPII", () => {
        it("should detect email addresses in attributes", () => {
            container.innerHTML = '<div data-pendo-id="user-test@example.com"></div>';
            const issues = pendoUtils.scanForPII(container);

            expect(issues.length).toBeGreaterThan(0);
            expect(issues[0].reason).toContain("Email");
            expect(issues[0].severity).toBe("high");
        });

        it("should not flag excluded elements with PII", () => {
            container.innerHTML = '<div data-pendo-ignore data-pendo-id="user-test@example.com"></div>';
            const issues = pendoUtils.scanForPII(container);

            expect(issues.length).toBe(0);
        });

        it("should detect phone numbers", () => {
            container.innerHTML = '<div title="Call us at 555-123-4567"></div>';
            const issues = pendoUtils.scanForPII(container);

            expect(issues.length).toBeGreaterThan(0);
            expect(issues[0].reason).toContain("Phone");
        });

        it("should detect credit card numbers", () => {
            container.innerHTML = '<input placeholder="1234 5678 9012 3456" />';
            const issues = pendoUtils.scanForPII(container);

            expect(issues.length).toBeGreaterThan(0);
            expect(issues[0].reason).toContain("Credit card");
        });

        it("should detect API keys", () => {
            container.innerHTML = '<div title="api_key=abcdef123456789012345"></div>';
            const issues = pendoUtils.scanForPII(container);

            expect(issues.length).toBeGreaterThan(0);
            expect(issues[0].severity).toBe("high");
        });

        it("should detect PII in text content", () => {
            container.innerHTML = "<span>Contact: test@example.com</span>";
            const issues = pendoUtils.scanForPII(container);

            expect(issues.length).toBeGreaterThan(0);
            expect(issues[0].attribute).toBe("textContent");
        });

        it("should skip elements with data-pendo-ignore in parent", () => {
            container.innerHTML = `
                <div data-pendo-ignore>
                    <input type="email" value="test@example.com" />
                </div>
            `;
            const issues = pendoUtils.scanForPII(container);

            expect(issues.length).toBe(0);
        });

        it("should detect IP addresses", () => {
            container.innerHTML = '<div id="server-192.168.1.1"></div>';
            const issues = pendoUtils.scanForPII(container);

            expect(issues.length).toBeGreaterThan(0);
            expect(issues[0].severity).toBe("medium");
        });

        it("should detect client IDs", () => {
            container.innerHTML = '<div title="client_id=123456789"></div>';
            const issues = pendoUtils.scanForPII(container);

            expect(issues.length).toBeGreaterThan(0);
            expect(issues[0].reason).toContain("Client/Account ID");
            expect(issues[0].severity).toBe("high");
        });

        it("should detect user IDs", () => {
            container.innerHTML = '<div data-pendo-id="user_id=98765"></div>';
            const issues = pendoUtils.scanForPII(container);

            expect(issues.length).toBeGreaterThan(0);
            expect(issues[0].reason).toContain("User ID");
            expect(issues[0].severity).toBe("medium");
        });

        it("should detect ISIN codes", () => {
            container.innerHTML = '<div title="GB00B03MLX29"></div>';
            const issues = pendoUtils.scanForPII(container);

            expect(issues.length).toBeGreaterThan(0);
            expect(issues.some(i => i.reason.includes("ISIN"))).toBe(true);
        });

        it("should detect tax IDs", () => {
            container.innerHTML = '<div title="tax_id=12-3456789"></div>';
            const issues = pendoUtils.scanForPII(container);

            expect(issues.length).toBeGreaterThan(0);
            expect(issues[0].reason).toContain("Tax ID");
            expect(issues[0].severity).toBe("high");
        });

        it("should detect bank account numbers", () => {
            container.innerHTML = '<div name="bank_account=987654321012"></div>';
            const issues = pendoUtils.scanForPII(container);

            expect(issues.length).toBeGreaterThan(0);
            expect(issues.some(i => i.reason.includes("Bank account"))).toBe(true);
        });

        it("should detect IBAN codes", () => {
            container.innerHTML = '<div name="GB82WEST12345698765432"></div>';
            const issues = pendoUtils.scanForPII(container);

            expect(issues.length).toBeGreaterThan(0);
            expect(issues[0].reason).toContain("IBAN");
            expect(issues[0].severity).toBe("high");
        });

        it("should detect JWT tokens", () => {
            container.innerHTML = '<div title="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U"></div>';
            const issues = pendoUtils.scanForPII(container);

            expect(issues.length).toBeGreaterThan(0);
            expect(issues[0].reason).toContain("JWT token");
            expect(issues[0].severity).toBe("high");
        });

        it("should detect passwords", () => {
            container.innerHTML = '<div placeholder="password=MySecretPass123"></div>';
            const issues = pendoUtils.scanForPII(container);

            expect(issues.length).toBeGreaterThan(0);
            expect(issues[0].reason).toContain("Password/Secret");
            expect(issues[0].severity).toBe("high");
        });

        it("should detect AWS access keys", () => {
            container.innerHTML = '<div class="AKIAIOSFODNN7EXAMPLE"></div>';
            const issues = pendoUtils.scanForPII(container);

            expect(issues.length).toBeGreaterThan(0);
            expect(issues[0].reason).toContain("AWS Access Key");
            expect(issues[0].severity).toBe("high");
        });

        it("should detect postal codes", () => {
            container.innerHTML = '<div id="zip-12345"></div>';
            const issues = pendoUtils.scanForPII(container);

            expect(issues.length).toBeGreaterThan(0);
            expect(issues[0].reason).toContain("Postal/ZIP code");
            expect(issues[0].severity).toBe("low");
        });
    });

    describe("verifyPendoExclusions", () => {
        it("should flag password inputs without exclusion", () => {
            container.innerHTML = '<input type="password" />';
            const issues = pendoUtils.verifyPendoExclusions(container);

            expect(issues.length).toBe(1);
            expect(issues[0].reason).toContain("Sensitive input");
            expect(issues[0].suggestion).toContain("data-pendo-ignore");
        });

        it("should not flag password inputs with data-pendo-ignore", () => {
            container.innerHTML = '<input type="password" data-pendo-ignore />';
            const issues = pendoUtils.verifyPendoExclusions(container);

            expect(issues.length).toBe(0);
        });

        it("should flag email inputs without exclusion", () => {
            container.innerHTML = '<input type="email" />';
            const issues = pendoUtils.verifyPendoExclusions(container);

            expect(issues.length).toBe(1);
            expect(issues[0].inputType).toBe("email");
        });

        it("should flag tel inputs without exclusion", () => {
            container.innerHTML = '<input type="tel" />';
            const issues = pendoUtils.verifyPendoExclusions(container);

            expect(issues.length).toBe(1);
        });

        it("should flag textareas without exclusion", () => {
            container.innerHTML = "<textarea></textarea>";
            const issues = pendoUtils.verifyPendoExclusions(container);

            expect(issues.length).toBe(1);
        });

        it("should not flag inputs inside excluded container", () => {
            container.innerHTML = `
                <div data-pendo-ignore>
                    <input type="email" />
                    <input type="password" />
                    <textarea></textarea>
                </div>
            `;
            const issues = pendoUtils.verifyPendoExclusions(container);

            expect(issues.length).toBe(0);
        });

        it("should flag inputs with sensitive names", () => {
            container.innerHTML = '<input type="text" name="user-email" />';
            const issues = pendoUtils.verifyPendoExclusions(container);

            expect(issues.length).toBe(1);
        });

        it("should flag selects without exclusion", () => {
            container.innerHTML = '<select name="credit-card-type"></select>';
            const issues = pendoUtils.verifyPendoExclusions(container);

            expect(issues.length).toBe(1);
        });
    });

    describe("verifyDataAttributeExclusions", () => {
        it("should flag elements with data-user-id without exclusion", () => {
            container.innerHTML = '<div data-user-id="12345"></div>';
            const issues = pendoUtils.verifyDataAttributeExclusions(container);

            expect(issues.length).toBe(1);
            expect(issues[0].reason).toContain("data-user-id");
        });

        it("should flag elements with data-email without exclusion", () => {
            container.innerHTML = '<div data-email="test@example.com"></div>';
            const issues = pendoUtils.verifyDataAttributeExclusions(container);

            expect(issues.length).toBe(1);
        });

        it("should not flag excluded elements with sensitive attributes", () => {
            container.innerHTML = '<div data-user-id="12345" data-pendo-ignore></div>';
            const issues = pendoUtils.verifyDataAttributeExclusions(container);

            expect(issues.length).toBe(0);
        });

        it("should flag elements with data-token", () => {
            container.innerHTML = '<div data-token="abc123"></div>';
            const issues = pendoUtils.verifyDataAttributeExclusions(container);

            expect(issues.length).toBe(1);
        });

        it("should flag elements with data-api-key", () => {
            container.innerHTML = '<div data-api-key="secret"></div>';
            const issues = pendoUtils.verifyDataAttributeExclusions(container);

            expect(issues.length).toBe(1);
        });
    });

    describe("verifyApprovedTrackingAttributes", () => {
        it("should allow approved Pendo attributes", () => {
            container.innerHTML = `
                <div data-pendo-id="test-id"></div>
                <div data-pendo-guide-id="guide-123"></div>
                <div data-pendo-ignore></div>
            `;
            const issues = pendoUtils.verifyApprovedTrackingAttributes(container);

            expect(issues.length).toBe(0);
        });

        it("should flag unapproved pendo attributes", () => {
            container.innerHTML = '<div data-pendo-custom="value"></div>';
            const issues = pendoUtils.verifyApprovedTrackingAttributes(container);

            expect(issues.length).toBe(1);
            expect(issues[0].reason).toContain("Unapproved");
            expect(issues[0].reason).toContain("data-pendo-custom");
        });

        it("should flag multiple unapproved attributes", () => {
            container.innerHTML = `
                <div data-pendo-custom="value" data-pendo-test="test"></div>
            `;
            const issues = pendoUtils.verifyApprovedTrackingAttributes(container);

            expect(issues.length).toBe(2);
        });

        it("should be case insensitive when detecting pendo attributes", () => {
            container.innerHTML = '<div data-PENDO-custom="value"></div>';
            const issues = pendoUtils.verifyApprovedTrackingAttributes(container);

            expect(issues.length).toBe(1);
        });
    });

    describe("generatePendoReport", () => {
        it("should generate a complete report", () => {
            container.innerHTML = `
                <div data-email="test@example.com"></div>
                <input type="password" />
                <div data-pendo-custom="bad"></div>
            `;
            const report = pendoUtils.generatePendoReport(container);

            expect(report.timestamp).toBeDefined();
            expect(report.totalElements).toBeGreaterThan(0);
            expect(report.totalInputs).toBe(1);
            expect(report.exclusionIssues.length).toBeGreaterThan(0);
            expect(report.summary.passed).toBe(false);
        });

        it("should pass when no issues found", () => {
            container.innerHTML = `
                <div data-pendo-id="safe-id"></div>
                <input type="password" data-pendo-ignore />
            `;
            const report = pendoUtils.generatePendoReport(container);

            expect(report.summary.passed).toBe(true);
            expect(report.piiIssues.length).toBe(0);
            expect(report.exclusionIssues.length).toBe(0);
        });

        it("should categorize severity correctly", () => {
            container.innerHTML = `
                <div title="test@example.com"></div>
                <div id="server-192.168.1.1"></div>
            `;
            const report = pendoUtils.generatePendoReport(container);

            expect(report.summary.highSeverityCount).toBeGreaterThan(0);
            expect(report.summary.mediumSeverityCount).toBeGreaterThan(0);
        });

        it("should count unexcluded inputs", () => {
            container.innerHTML = `
                <input type="email" />
                <input type="password" />
                <textarea></textarea>
            `;
            const report = pendoUtils.generatePendoReport(container);

            expect(report.summary.unexcludedInputsCount).toBe(3);
        });
    });

    describe("printPendoReport", () => {
        let consoleGroupSpy: jest.SpyInstance;
        let consoleLogSpy: jest.SpyInstance;
        let consoleWarnSpy: jest.SpyInstance;
        let consoleErrorSpy: jest.SpyInstance;
        let consoleGroupEndSpy: jest.SpyInstance;

        beforeEach(() => {
            consoleGroupSpy = jest.spyOn(console, "group").mockImplementation();
            consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
            consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();
            consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
            consoleGroupEndSpy = jest.spyOn(console, "groupEnd").mockImplementation();
        });

        afterEach(() => {
            consoleGroupSpy.mockRestore();
            consoleLogSpy.mockRestore();
            consoleWarnSpy.mockRestore();
            consoleErrorSpy.mockRestore();
            consoleGroupEndSpy.mockRestore();
        });

        it("should print report to console", () => {
            container.innerHTML = '<input type="password" />';
            const report = pendoUtils.generatePendoReport(container);

            pendoUtils.printPendoReport(report);

            expect(consoleGroupSpy).toHaveBeenCalled();
            expect(consoleLogSpy).toHaveBeenCalled();
        });

        it("should show success message when passed", () => {
            container.innerHTML = '<input type="password" data-pendo-ignore />';
            const report = pendoUtils.generatePendoReport(container);

            pendoUtils.printPendoReport(report);

            expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("All checks passed"));
        });

        it("should show warnings for issues", () => {
            container.innerHTML = '<input type="password" />';
            const report = pendoUtils.generatePendoReport(container);

            pendoUtils.printPendoReport(report);

            expect(consoleWarnSpy).toHaveBeenCalled();
        });

        it("should show critical error for high severity PII", () => {
            container.innerHTML = '<div title="test@example.com"></div>';
            const report = pendoUtils.generatePendoReport(container);

            pendoUtils.printPendoReport(report);

            expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining("CRITICAL"));
        });
    });

    describe("runPendoVerification", () => {
        it("should run verification in development mode", () => {
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = "development";

            const report = pendoUtils.runPendoVerification();

            expect(report).toBeDefined();
            expect(report.timestamp).toBeDefined();

            process.env.NODE_ENV = originalEnv;
        });

        it("should warn in production mode", () => {
            const originalEnv = process.env.NODE_ENV;
            const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();
            process.env.NODE_ENV = "production";

            const report = pendoUtils.runPendoVerification();

            expect(consoleWarnSpy).toHaveBeenCalledWith(
                expect.stringContaining("development environments")
            );
            expect(report.summary.passed).toBe(true);

            process.env.NODE_ENV = originalEnv;
            consoleWarnSpy.mockRestore();
        });
    });

    describe("highlightIssues", () => {
        it("should add highlight styles to the page", () => {
            container.innerHTML = '<input type="password" />';
            const report = pendoUtils.generatePendoReport(container);

            pendoUtils.highlightIssues(report);

            const styleElements = document.querySelectorAll(".pendo-verification-highlight");
            expect(styleElements.length).toBeGreaterThan(0);

            // Cleanup
            styleElements.forEach((el) => el.remove());
        });

        it("should add classes to problematic elements", () => {
            container.innerHTML = '<div id="test-element" title="test@example.com"></div>';
            const report = pendoUtils.generatePendoReport(container);

            pendoUtils.highlightIssues(report);

            const element = document.getElementById("test-element");
            expect(element?.className).toContain("pendo-pii");

            // Cleanup
            document.querySelectorAll(".pendo-verification-highlight").forEach((el) => el.remove());
        });
    });

    describe("Development mode integration", () => {
        it("should expose utilities on window in development", () => {
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = "development";

            // Re-require the module to trigger the window assignment
            jest.resetModules();
            require("./verifyPendoData");

            expect((window as any).pendoVerify).toBeDefined();

            process.env.NODE_ENV = originalEnv;
            delete (window as any).pendoVerify;
        });
    });
});
