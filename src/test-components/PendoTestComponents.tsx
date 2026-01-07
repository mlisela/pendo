import React from 'react';

/**
 * Test Components for Pendo PII Detection
 * 
 * These components demonstrate various scenarios:
 * - Components that SHOULD trigger PII warnings (bad examples)
 * - Components that are properly excluded (good examples)
 * - Edge cases and common patterns
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface EdgeCaseDynamicContentProps {
    email?: string;
    phone?: string;
}

declare global {
    interface Window {
        pendoVerify?: {
            scan: () => void;
            report: () => unknown;
            highlight: (report: unknown) => void;
            scanPII: () => unknown[];
            checkExclusions: () => unknown[];
        };
    }
}

// ============================================================================
// BAD EXAMPLES - These SHOULD trigger PII warnings
// ============================================================================

/**
 * BAD: Exposes email in tracking attributes without exclusion
 */
export const BadEmailInAttribute = (): JSX.Element => {
    return (
        <div data-pendo-id="user-email-john.doe@example.com">
            <h2>User Profile</h2>
            <p>Welcome back!</p>
        </div>
    );
};

/**
 * BAD: Phone number in class name
 */
export const BadPhoneInClass = (): JSX.Element => {
    return (
        <div className="contact-555-123-4567">
            <span>Call us!</span>
        </div>
    );
};

/**
 * BAD: Credit card number in data attribute
 */
export const BadCreditCardInData = (): JSX.Element => {
    return (
        <div data-pendo="card-4532-1234-5678-9010">
            <p>Payment Method</p>
        </div>
    );
};

/**
 * BAD: SSN in ID attribute
 */
export const BadSSNInId = (): JSX.Element => {
    return (
        <div id="ssn-123-45-6789">
            <label>Social Security</label>
        </div>
    );
};

/**
 * BAD: API key exposed in title
 */
export const BadAPIKeyInTitle = (): JSX.Element => {
    return (
        <button title="api_key=sk_test_FAKE_KEY_abcdefghijklmnopqrstuvwxyz">
            Configure API
        </button>
    );
};

/**
 * BAD: User ID in name attribute
 */
export const BadUserIdInName = (): JSX.Element => {
    return (
        <input type="text" name="user_id=12345678" placeholder="Search" />
    );
};

/**
 * BAD: JWT token in aria-label
 */
export const BadJWTInAriaLabel = (): JSX.Element => {
    return (
        <div aria-label="token:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U">
            Authenticated Section
        </div>
    );
};

/**
 * BAD: IP Address in text content
 */
export const BadIPInText = (): JSX.Element => {
    return (
        <div>
            <p>Server IP: 192.168.1.100</p>
        </div>
    );
};

/**
 * BAD: Form with unexcluded sensitive inputs
 */
export const BadUnexcludedForm = (): JSX.Element => {
    return (
        <form>
            <input type="email" name="email" placeholder="Enter email" />
            <input type="password" name="password" placeholder="Password" />
            <input type="tel" name="phone" placeholder="Phone number" />
            <button type="submit">Submit</button>
        </form>
    );
};

/**
 * BAD: Bank account in placeholder
 */
export const BadBankAccountInPlaceholder = (): JSX.Element => {
    return (
        <input 
            type="text" 
            placeholder="Example: account_number=123456789012345" 
        />
    );
};

/**
 * BAD: IBAN code in alt text
 */
export const BadIBANInAlt = (): JSX.Element => {
    return (
        <img src="/icon.png" alt="IBAN: GB82WEST12345698765432" />
    );
};

/**
 * BAD: Client ID exposed in data attribute
 */
export const BadClientIdInData = (): JSX.Element => {
    return (
        <div data-pendo-id="client-section" data-client-id="client_id=87654321">
            <h3>Client Dashboard</h3>
            <p>View client details</p>
        </div>
    );
};

/**
 * BAD: User ID exposed in tracking attribute
 */
export const BadUserIdInTracking = (): JSX.Element => {
    return (
        <div data-pendo="user_id=12345678">
            <span>User Dashboard</span>
        </div>
    );
};

/**
 * BAD: ISIN code in title attribute
 */
export const BadISINInTitle = (): JSX.Element => {
    return (
        <button title="Security: US0378331005" data-pendo-id="stock-button">
            View Stock Details
        </button>
    );
};

// ============================================================================
// GOOD EXAMPLES - Properly excluded from Pendo tracking
// ============================================================================

/**
 * GOOD: Email properly excluded with data-pendo-ignore
 */
export const GoodEmailExcluded = (): JSX.Element => {
    return (
        <div data-pendo-ignore>
            <div data-pendo-id="user-email-john.doe@example.com">
                <h2>User Profile</h2>
                <p>Welcome back!</p>
            </div>
        </div>
    );
};

/**
 * GOOD: Form with inputs excluded
 */
export const GoodExcludedForm = (): JSX.Element => {
    return (
        <form data-pendo-ignore>
            <input type="email" name="email" placeholder="Enter email" />
            <input type="password" name="password" placeholder="Password" />
            <input type="tel" name="phone" placeholder="Phone number" />
            <button type="submit">Submit</button>
        </form>
    );
};

/**
 * GOOD: Individual inputs with data-pendo-ignore
 */
export const GoodIndividualInputsExcluded = (): JSX.Element => {
    return (
        <form>
            <label htmlFor="email">Email</label>
            <input 
                id="email"
                type="email" 
                name="email" 
                placeholder="Enter email" 
                data-pendo-ignore 
            />
            
            <label htmlFor="password">Password</label>
            <input 
                id="password"
                type="password" 
                name="password" 
                placeholder="Password" 
                data-pendo-ignore 
            />
            
            <button type="submit" data-pendo-id="submit-button">
                Submit
            </button>
        </form>
    );
};

/**
 * GOOD: Sensitive data in excluded container
 */
export const GoodSensitiveDataExcluded = (): JSX.Element => {
    return (
        <div>
            <h2 data-pendo-id="profile-header">User Profile</h2>
            <div data-pendo-exclude>
                <p>Email: john.doe@example.com</p>
                <p>Phone: 555-123-4567</p>
                <p>SSN: 123-45-6789</p>
            </div>
            <button data-pendo-id="edit-profile">Edit Profile</button>
        </div>
    );
};

/**
 * GOOD: Payment information with exclusion class
 */
export const GoodPaymentExcluded = (): JSX.Element => {
    return (
        <div>
            <h3 data-pendo-id="payment-header">Payment Methods</h3>
            <div className="_pendo-exclude_">
                <div data-pendo="card-4532-1234-5678-9010">
                    <span>Card ending in 9010</span>
                </div>
                <div>IBAN: GB82WEST12345698765432</div>
            </div>
        </div>
    );
};

/**
 * GOOD: API configuration excluded
 */
export const GoodAPIConfigExcluded = (): JSX.Element => {
    return (
        <div>
            <h2 data-pendo-id="api-settings">API Settings</h2>
            <div data-pendo-ignore>
                <input 
                    type="text" 
                    value="sk_test_FAKE_KEY_abcdefghijklmnopqrstuvwxyz"
                    readOnly
                />
                <button>Regenerate Key</button>
            </div>
            <button data-pendo-id="save-settings">Save Settings</button>
        </div>
    );
};

/**
 * GOOD: Mixed content with proper exclusions
 */
export const GoodMixedContent = (): JSX.Element => {
    return (
        <div data-pendo-id="user-dashboard">
            <header>
                <h1>Dashboard</h1>
                <button data-pendo-id="logout-button">Logout</button>
            </header>
            
            {/* Safe tracking on navigation */}
            <nav>
                <a href="/home" data-pendo-id="nav-home">Home</a>
                <a href="/settings" data-pendo-id="nav-settings">Settings</a>
            </nav>
            
            {/* Excluded sensitive user info */}
            <section data-pendo-ignore>
                <h2>Your Information</h2>
                <p>Email: user@example.com</p>
                <p>User ID: 98765432</p>
                <p>Member since: 2024</p>
            </section>
            
            {/* Safe tracking on actions */}
            <section>
                <button data-pendo-id="create-new">Create New</button>
                <button data-pendo-id="view-reports">View Reports</button>
            </section>
        </div>
    );
};

// ============================================================================
// EDGE CASES
// ============================================================================

/**
 * EDGE CASE: False positive - version number looks like IP
 */
export const EdgeCaseVersionNumber = (): JSX.Element => {
    return (
        <div data-pendo-ignore>
            <p>App Version: 1.2.3.4</p>
        </div>
    );
};

/**
 * EDGE CASE: Nested exclusions
 */
export const EdgeCaseNestedExclusions = (): JSX.Element => {
    return (
        <div data-pendo-ignore>
            <div>
                <div data-pendo-ignore>
                    <input type="email" value="nested@example.com" />
                </div>
            </div>
        </div>
    );
};

/**
 * EDGE CASE: Textarea with sensitive content
 */
export const EdgeCaseTextarea = (): JSX.Element => {
    return (
        <div>
            <label htmlFor="notes">Notes (Excluded)</label>
            <textarea 
                id="notes"
                data-pendo-ignore
                placeholder="Enter your notes here"
                defaultValue="Email: test@example.com"
            />
        </div>
    );
};

/**
 * EDGE CASE: Select dropdown with sensitive data attributes
 */
export const EdgeCaseSelectWithSensitiveData = (): JSX.Element => {
    return (
        <div data-pendo-ignore>
            <select data-user-id="12345" data-email="user@example.com">
                <option value="1">Option 1</option>
                <option value="2">Option 2</option>
            </select>
        </div>
    );
};

/**
 * EDGE CASE: Dynamic content with PII
 */
export const EdgeCaseDynamicContent = ({ 
    email = 'default@example.com', 
    phone = '555-000-0000' 
}: EdgeCaseDynamicContentProps): JSX.Element => {
    return (
        <div data-pendo-ignore>
            <p data-email={email}>Contact: {phone}</p>
        </div>
    );
};

/**
 * EDGE CASE: AWS credentials (should be detected)
 */
export const EdgeCaseAWSKey = (): JSX.Element => {
    return (
        <div data-pendo-ignore>
            <code>Access Key: AKIAIOSFODNN7EXAMPLE</code>
        </div>
    );
};

/**
 * EDGE CASE: Postal codes (low severity)
 */
export const EdgeCasePostalCodes = (): JSX.Element => {
    return (
        <div>
            <p>Shipping to: 90210</p>
            <p>UK Postcode: SW1A 1AA</p>
        </div>
    );
};

/**
 * EDGE CASE: Multiple ID types in excluded container
 */
export const EdgeCaseMultipleIDs = (): JSX.Element => {
    return (
        <div data-pendo-ignore>
            <p data-client-id="client_id=11223344">Client Information</p>
            <p data-user-id="user_id=55667788">User Details</p>
            <p title="ISIN: GB0002374006">Stock Portfolio</p>
        </div>
    );
};

// ============================================================================
// COMPOSITE TEST COMPONENT
// ============================================================================

/**
 * Comprehensive test page with all scenarios
 */
export const PendoTestPage = (): JSX.Element => {
    const handleRunVerification = (): void => {
        if (window.pendoVerify) {
            window.pendoVerify.scan();
        } else {
            alert('Pendo verification tools not loaded');
        }
    };

    return (
        <div data-testid="pendo-test-page">
            <h1>Pendo PII Detection Test Suite</h1>
            
            <section>
                <h2>❌ Bad Examples (Should Trigger Warnings)</h2>
                <div style={{ border: '2px solid red', padding: '10px', margin: '10px 0' }}>
                    <h3>Email in Attribute</h3>
                    <BadEmailInAttribute />
                </div>
                
                <div style={{ border: '2px solid red', padding: '10px', margin: '10px 0' }}>
                    <h3>Phone in Class</h3>
                    <BadPhoneInClass />
                </div>
                
                <div style={{ border: '2px solid red', padding: '10px', margin: '10px 0' }}>
                    <h3>Unexcluded Form</h3>
                    <BadUnexcludedForm />
                </div>
                
                <div style={{ border: '2px solid red', padding: '10px', margin: '10px 0' }}>
                    <h3>API Key in Title</h3>
                    <BadAPIKeyInTitle />
                </div>
                
                <div style={{ border: '2px solid red', padding: '10px', margin: '10px 0' }}>
                    <h3>Client ID in Data</h3>
                    <BadClientIdInData />
                </div>
                
                <div style={{ border: '2px solid red', padding: '10px', margin: '10px 0' }}>
                    <h3>User ID in Tracking</h3>
                    <BadUserIdInTracking />
                </div>
                
                <div style={{ border: '2px solid red', padding: '10px', margin: '10px 0' }}>
                    <h3>ISIN in Title</h3>
                    <BadISINInTitle />
                </div>
            </section>
            
            <section>
                <h2>✅ Good Examples (Properly Excluded)</h2>
                <div style={{ border: '2px solid green', padding: '10px', margin: '10px 0' }}>
                    <h3>Excluded Form</h3>
                    <GoodExcludedForm />
                </div>
                
                <div style={{ border: '2px solid green', padding: '10px', margin: '10px 0' }}>
                    <h3>Individual Inputs Excluded</h3>
                    <GoodIndividualInputsExcluded />
                </div>
                
                <div style={{ border: '2px solid green', padding: '10px', margin: '10px 0' }}>
                    <h3>Sensitive Data Excluded</h3>
                    <GoodSensitiveDataExcluded />
                </div>
                
                <div style={{ border: '2px solid green', padding: '10px', margin: '10px 0' }}>
                    <h3>Mixed Content</h3>
                    <GoodMixedContent />
                </div>
            </section>
            
            <section>
                <h2>⚠️ Edge Cases</h2>
                <div style={{ border: '2px solid orange', padding: '10px', margin: '10px 0' }}>
                    <h3>Version Number (False Positive)</h3>
                    <EdgeCaseVersionNumber />
                </div>
                
                <div style={{ border: '2px solid orange', padding: '10px', margin: '10px 0' }}>
                    <h3>Postal Codes</h3>
                    <EdgeCasePostalCodes />
                </div>
                
                <div style={{ border: '2px solid orange', padding: '10px', margin: '10px 0' }}>
                    <h3>Nested Exclusions</h3>
                    <EdgeCaseNestedExclusions />
                </div>
                
                <div style={{ border: '2px solid orange', padding: '10px', margin: '10px 0' }}>
                    <h3>Multiple IDs (Excluded)</h3>
                    <EdgeCaseMultipleIDs />
                </div>
            </section>
            
            <section style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f0f0f0' }}>
                <h2>Run Verification</h2>
                <p>Open browser console and run:</p>
                <code style={{ display: 'block', padding: '10px', backgroundColor: '#fff', margin: '10px 0' }}>
                    window.pendoVerify.scan()
                </code>
                <button 
                    onClick={handleRunVerification}
                    style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
                    type="button"
                >
                    Run Pendo Verification
                </button>
            </section>
        </div>
    );
};

