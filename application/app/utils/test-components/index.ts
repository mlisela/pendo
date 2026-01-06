/**
 * Pendo Test Components - Index
 * 
 * Centralized exports for all Pendo PII detection test components
 */

// Main test components
export {
    // Bad Examples (should trigger warnings)
    BadEmailInAttribute,
    BadPhoneInClass,
    BadCreditCardInData,
    BadSSNInId,
    BadAPIKeyInTitle,
    BadUserIdInName,
    BadJWTInAriaLabel,
    BadIPInText,
    BadUnexcludedForm,
    BadBankAccountInPlaceholder,
    BadIBANInAlt,
    
    // Good Examples (properly excluded)
    GoodEmailExcluded,
    GoodExcludedForm,
    GoodIndividualInputsExcluded,
    GoodSensitiveDataExcluded,
    GoodPaymentExcluded,
    GoodAPIConfigExcluded,
    GoodMixedContent,
    
    // Edge Cases
    EdgeCaseVersionNumber,
    EdgeCaseNestedExclusions,
    EdgeCaseTextarea,
    EdgeCaseSelectWithSensitiveData,
    EdgeCaseDynamicContent,
    EdgeCaseAWSKey,
    EdgeCasePostalCodes,
    
    // Composite test page
    PendoTestPage,
} from './PendoTestComponents';

// Interactive demo
export { PendoInteractiveDemo } from './PendoInteractiveDemo';
export { default as PendoInteractiveDemoDefault } from './PendoInteractiveDemo';

// Re-export types from the main utility
export type {
    IPIIIssue,
    IPendoExclusionIssue,
    IPendoVerificationReport,
} from '../verifyPendoData';

