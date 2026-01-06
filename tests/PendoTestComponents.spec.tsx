import React from 'react';
import { render, screen } from '@testing-library/react';
import { generatePendoReport, scanForPII, verifyPendoExclusions } from '../src/verification/verifyPendoData';
import {
    BadEmailInAttribute,
    BadPhoneInClass,
    BadCreditCardInData,
    BadSSNInId,
    BadAPIKeyInTitle,
    BadUnexcludedForm,
    BadBankAccountInPlaceholder,
    BadIBANInAlt,
    GoodEmailExcluded,
    GoodExcludedForm,
    GoodIndividualInputsExcluded,
    GoodSensitiveDataExcluded,
    GoodPaymentExcluded,
    GoodAPIConfigExcluded,
    GoodMixedContent,
    EdgeCaseVersionNumber,
    EdgeCasePostalCodes,
    PendoTestPage,
} from '../src/test-components/PendoTestComponents';

describe('Pendo PII Detection - Bad Examples', () => {
    
    test('BadEmailInAttribute should detect email in tracking attribute', () => {
        const { container } = render(<BadEmailInAttribute />);
        const piiIssues = scanForPII(container);
        
        expect(piiIssues.length).toBeGreaterThan(0);
        expect(piiIssues.some(issue => 
            issue.reason.includes('Email') && issue.severity === 'high'
        )).toBe(true);
    });
    
    test('BadPhoneInClass should detect phone number in class name', () => {
        const { container } = render(<BadPhoneInClass />);
        const piiIssues = scanForPII(container);
        
        expect(piiIssues.length).toBeGreaterThan(0);
        expect(piiIssues.some(issue => 
            issue.reason.includes('Phone') && issue.severity === 'high'
        )).toBe(true);
    });
    
    test('BadCreditCardInData should detect credit card number', () => {
        const { container } = render(<BadCreditCardInData />);
        const piiIssues = scanForPII(container);
        
        expect(piiIssues.length).toBeGreaterThan(0);
        expect(piiIssues.some(issue => 
            issue.reason.includes('Credit card') && issue.severity === 'high'
        )).toBe(true);
    });
    
    test('BadSSNInId should detect SSN in ID attribute', () => {
        const { container } = render(<BadSSNInId />);
        const piiIssues = scanForPII(container);
        
        expect(piiIssues.length).toBeGreaterThan(0);
        expect(piiIssues.some(issue => 
            issue.reason.includes('Social Security') && issue.severity === 'high'
        )).toBe(true);
    });
    
    test('BadAPIKeyInTitle should detect API key in title attribute', () => {
        const { container } = render(<BadAPIKeyInTitle />);
        const piiIssues = scanForPII(container);
        
        expect(piiIssues.length).toBeGreaterThan(0);
        expect(piiIssues.some(issue => 
            issue.reason.includes('API key') && issue.severity === 'high'
        )).toBe(true);
    });
    
    test('BadUnexcludedForm should detect unexcluded sensitive inputs', () => {
        const { container } = render(<BadUnexcludedForm />);
        const exclusionIssues = verifyPendoExclusions(container);
        
        expect(exclusionIssues.length).toBeGreaterThan(0);
        expect(exclusionIssues.some(issue => 
            issue.reason.includes('Sensitive input')
        )).toBe(true);
    });
    
    test('BadBankAccountInPlaceholder should detect bank account number', () => {
        const { container } = render(<BadBankAccountInPlaceholder />);
        const piiIssues = scanForPII(container);
        
        expect(piiIssues.length).toBeGreaterThan(0);
        expect(piiIssues.some(issue => 
            issue.reason.includes('Bank account') && issue.severity === 'high'
        )).toBe(true);
    });
    
    test('BadIBANInAlt should detect IBAN in alt text', () => {
        const { container } = render(<BadIBANInAlt />);
        const piiIssues = scanForPII(container);
        
        expect(piiIssues.length).toBeGreaterThan(0);
        expect(piiIssues.some(issue => 
            issue.reason.includes('IBAN') && issue.severity === 'high'
        )).toBe(true);
    });
});

describe('Pendo PII Detection - Good Examples', () => {
    
    test('GoodEmailExcluded should not trigger warnings (properly excluded)', () => {
        const { container } = render(<GoodEmailExcluded />);
        const piiIssues = scanForPII(container);
        
        // Should have no issues because the element is excluded
        expect(piiIssues.length).toBe(0);
    });
    
    test('GoodExcludedForm should not detect unexcluded inputs', () => {
        const { container } = render(<GoodExcludedForm />);
        const exclusionIssues = verifyPendoExclusions(container);
        
        // Should have no issues because form is excluded
        expect(exclusionIssues.length).toBe(0);
    });
    
    test('GoodIndividualInputsExcluded should not detect issues on excluded inputs', () => {
        const { container } = render(<GoodIndividualInputsExcluded />);
        const exclusionIssues = verifyPendoExclusions(container);
        
        // Should have no issues because inputs have data-pendo-ignore
        expect(exclusionIssues.length).toBe(0);
    });
    
    test('GoodSensitiveDataExcluded should not detect PII in excluded section', () => {
        const { container } = render(<GoodSensitiveDataExcluded />);
        const piiIssues = scanForPII(container);
        
        // Should have no issues because sensitive data is in excluded div
        expect(piiIssues.length).toBe(0);
    });
    
    test('GoodPaymentExcluded should not detect payment info in excluded section', () => {
        const { container } = render(<GoodPaymentExcluded />);
        const piiIssues = scanForPII(container);
        
        // Should have no issues because payment section has exclusion class
        expect(piiIssues.length).toBe(0);
    });
    
    test('GoodAPIConfigExcluded should not detect API key in excluded section', () => {
        const { container } = render(<GoodAPIConfigExcluded />);
        const piiIssues = scanForPII(container);
        
        // Should have no issues because API config is excluded
        expect(piiIssues.length).toBe(0);
    });
    
    test('GoodMixedContent should only track safe elements', () => {
        const { container } = render(<GoodMixedContent />);
        const report = generatePendoReport(container);
        
        // Should pass with no high severity issues
        expect(report.summary.highSeverityCount).toBe(0);
        expect(report.summary.passed).toBe(true);
    });
});

describe('Pendo PII Detection - Edge Cases', () => {
    
    test('EdgeCaseVersionNumber should not trigger warning when excluded', () => {
        const { container } = render(<EdgeCaseVersionNumber />);
        const piiIssues = scanForPII(container);
        
        // Version numbers can look like IPs but are excluded here
        expect(piiIssues.length).toBe(0);
    });
    
    test('EdgeCasePostalCodes should detect postal codes as low severity', () => {
        const { container } = render(<EdgeCasePostalCodes />);
        const piiIssues = scanForPII(container);
        
        // Should detect postal codes but as low severity
        const postalIssues = piiIssues.filter(issue => 
            issue.severity === 'low' && issue.reason.includes('Postal')
        );
        expect(postalIssues.length).toBeGreaterThan(0);
    });
});

describe('Pendo Verification Report - Comprehensive Tests', () => {
    
    test('PendoTestPage should generate comprehensive report', () => {
        const { container } = render(<PendoTestPage />);
        const report = generatePendoReport(container);
        
        // Should detect multiple issues in bad examples
        expect(report.piiIssues.length).toBeGreaterThan(0);
        expect(report.exclusionIssues.length).toBeGreaterThan(0);
        
        // Should have some high severity issues
        expect(report.summary.highSeverityCount).toBeGreaterThan(0);
        
        // Overall should not pass due to bad examples
        expect(report.summary.passed).toBe(false);
    });
    
    test('Report should include all required metadata', () => {
        const { container } = render(<PendoTestPage />);
        const report = generatePendoReport(container);
        
        expect(report.timestamp).toBeDefined();
        expect(report.totalElements).toBeGreaterThan(0);
        expect(report.totalInputs).toBeGreaterThan(0);
        expect(report.piiIssues).toBeInstanceOf(Array);
        expect(report.exclusionIssues).toBeInstanceOf(Array);
        expect(report.summary).toBeDefined();
    });
    
    test('PII issues should include xpath for debugging', () => {
        const { container } = render(<BadEmailInAttribute />);
        const piiIssues = scanForPII(container);
        
        expect(piiIssues.length).toBeGreaterThan(0);
        expect(piiIssues[0].xpath).toBeDefined();
        expect(typeof piiIssues[0].xpath).toBe('string');
    });
    
    test('Exclusion issues should include suggestions', () => {
        const { container } = render(<BadUnexcludedForm />);
        const exclusionIssues = verifyPendoExclusions(container);
        
        expect(exclusionIssues.length).toBeGreaterThan(0);
        expect(exclusionIssues[0].suggestion).toBeDefined();
        expect(exclusionIssues[0].suggestion).toContain('data-pendo-ignore');
    });
});

describe('Severity Classification', () => {
    
    test('High severity PII should be properly classified', () => {
        const highSeverityComponents = [
            <BadEmailInAttribute />,
            <BadCreditCardInData />,
            <BadSSNInId />,
            <BadAPIKeyInTitle />,
        ];
        
        highSeverityComponents.forEach(component => {
            const { container } = render(component);
            const piiIssues = scanForPII(container);
            
            const highSeverityIssue = piiIssues.find(issue => issue.severity === 'high');
            expect(highSeverityIssue).toBeDefined();
        });
    });
    
    test('Low severity PII should be properly classified', () => {
        const { container } = render(<EdgeCasePostalCodes />);
        const piiIssues = scanForPII(container);
        
        const lowSeverityIssues = piiIssues.filter(issue => issue.severity === 'low');
        expect(lowSeverityIssues.length).toBeGreaterThan(0);
    });
});

describe('Integration Tests', () => {
    
    test('Full workflow: render bad component, detect issues, verify report', () => {
        // Render component with issues
        const { container } = render(<BadEmailInAttribute />);
        
        // Generate report
        const report = generatePendoReport(container);
        
        // Verify report structure
        expect(report.summary.highSeverityCount).toBeGreaterThan(0);
        expect(report.summary.passed).toBe(false);
        expect(report.piiIssues.length).toBeGreaterThan(0);
        
        // Verify issue details
        const emailIssue = report.piiIssues.find(issue => 
            issue.reason.includes('Email')
        );
        expect(emailIssue).toBeDefined();
        expect(emailIssue?.attribute).toBe('data-pendo-id');
        expect(emailIssue?.element).toContain('div');
    });
    
    test('Full workflow: render good component, verify no issues', () => {
        // Render properly excluded component
        const { container } = render(<GoodExcludedForm />);
        
        // Generate report
        const report = generatePendoReport(container);
        
        // Should pass all checks
        expect(report.summary.passed).toBe(true);
        expect(report.summary.highSeverityCount).toBe(0);
        expect(report.piiIssues.length).toBe(0);
        expect(report.exclusionIssues.length).toBe(0);
    });
});

describe('Performance Tests', () => {
    
    test('Should handle large DOM efficiently', () => {
        const { container } = render(<PendoTestPage />);
        
        const startTime = performance.now();
        const report = generatePendoReport(container);
        const endTime = performance.now();
        
        const duration = endTime - startTime;
        
        // Should complete in reasonable time (< 1 second for test components)
        expect(duration).toBeLessThan(1000);
        expect(report).toBeDefined();
    });
});

