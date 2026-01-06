import React, { useState } from 'react';
import { PendoTestPage } from './PendoTestComponents';
import type { IPendoVerificationReport } from '../verification/verifyPendoData';

/**
 * Interactive Demo Page for Pendo PII Detection
 * 
 * This component provides an interactive interface to test and visualize
 * the Pendo verification utility in action.
 */
export const PendoInteractiveDemo: React.FC = () => {
    const [report, setReport] = useState<IPendoVerificationReport | null>(null);
    const [isHighlighted, setIsHighlighted] = useState(false);
    const [showTestPage, setShowTestPage] = useState(true);

    const runVerification = () => {
        if ((window as any).pendoVerify) {
            const newReport = (window as any).pendoVerify.report();
            setReport(newReport);
            console.log('Pendo Verification Report:', newReport);
        } else {
            alert('Pendo verification tools not loaded. Make sure you are in development mode.');
        }
    };

    const highlightIssues = () => {
        if ((window as any).pendoVerify && report) {
            (window as any).pendoVerify.highlight(report);
            setIsHighlighted(true);
        }
    };

    const clearHighlights = () => {
        document.querySelectorAll('.pendo-verification-highlight').forEach((el) => el.remove());
        document.querySelectorAll('[class*="pendo-pii-"]').forEach((el) => {
            el.classList.remove('pendo-pii-high', 'pendo-pii-medium', 'pendo-pii-low');
        });
        document.querySelectorAll('.pendo-exclusion-issue').forEach((el) => {
            el.classList.remove('pendo-exclusion-issue');
        });
        setIsHighlighted(false);
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high': return '#ef4444';
            case 'medium': return '#f97316';
            case 'low': return '#eab308';
            default: return '#6b7280';
        }
    };

    return (
        <div style={{ fontFamily: 'system-ui, sans-serif', padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <header style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                color: 'white', 
                padding: '30px', 
                borderRadius: '10px',
                marginBottom: '30px'
            }}>
                <h1 style={{ margin: '0 0 10px 0', fontSize: '32px' }}>
                    🔍 Pendo PII Detection Demo
                </h1>
                <p style={{ margin: 0, fontSize: '16px', opacity: 0.9 }}>
                    Interactive testing suite for Pendo verification utility
                </p>
            </header>

            {/* Control Panel */}
            <div style={{ 
                background: '#f3f4f6', 
                padding: '20px', 
                borderRadius: '10px',
                marginBottom: '30px',
                display: 'flex',
                gap: '15px',
                flexWrap: 'wrap',
                alignItems: 'center'
            }}>
                <button
                    onClick={runVerification}
                    style={{
                        padding: '12px 24px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#059669'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#10b981'}
                >
                    ▶ Run Verification
                </button>

                <button
                    onClick={highlightIssues}
                    disabled={!report}
                    style={{
                        padding: '12px 24px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        background: report ? '#f59e0b' : '#9ca3af',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: report ? 'pointer' : 'not-allowed',
                        transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => report && (e.currentTarget.style.background = '#d97706')}
                    onMouseOut={(e) => report && (e.currentTarget.style.background = '#f59e0b')}
                >
                    🎨 Highlight Issues
                </button>

                <button
                    onClick={clearHighlights}
                    disabled={!isHighlighted}
                    style={{
                        padding: '12px 24px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        background: isHighlighted ? '#6366f1' : '#9ca3af',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: isHighlighted ? 'pointer' : 'not-allowed',
                        transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => isHighlighted && (e.currentTarget.style.background = '#4f46e5')}
                    onMouseOut={(e) => isHighlighted && (e.currentTarget.style.background = '#6366f1')}
                >
                    🧹 Clear Highlights
                </button>

                <button
                    onClick={() => setShowTestPage(!showTestPage)}
                    style={{
                        padding: '12px 24px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        background: '#8b5cf6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#7c3aed'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#8b5cf6'}
                >
                    {showTestPage ? '👁️ Hide' : '👁️ Show'} Test Components
                </button>
            </div>

            {/* Report Summary */}
            {report && (
                <div style={{ marginBottom: '30px' }}>
                    <div style={{
                        background: report.summary.passed ? '#d1fae5' : '#fee2e2',
                        border: `2px solid ${report.summary.passed ? '#10b981' : '#ef4444'}`,
                        borderRadius: '10px',
                        padding: '20px'
                    }}>
                        <h2 style={{ 
                            margin: '0 0 15px 0', 
                            color: report.summary.passed ? '#065f46' : '#991b1b',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            {report.summary.passed ? '✅' : '❌'} Verification Report
                        </h2>
                        
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '15px',
                            marginBottom: '15px'
                        }}>
                            <div style={{ background: 'white', padding: '15px', borderRadius: '8px' }}>
                                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>
                                    Total Elements
                                </div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                                    {report.totalElements}
                                </div>
                            </div>
                            
                            <div style={{ background: 'white', padding: '15px', borderRadius: '8px' }}>
                                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>
                                    Form Inputs
                                </div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                                    {report.totalInputs}
                                </div>
                            </div>
                            
                            <div style={{ background: 'white', padding: '15px', borderRadius: '8px' }}>
                                <div style={{ fontSize: '12px', color: '#ef4444', marginBottom: '5px' }}>
                                    🔴 High Severity
                                </div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>
                                    {report.summary.highSeverityCount}
                                </div>
                            </div>
                            
                            <div style={{ background: 'white', padding: '15px', borderRadius: '8px' }}>
                                <div style={{ fontSize: '12px', color: '#f97316', marginBottom: '5px' }}>
                                    🟠 Medium Severity
                                </div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f97316' }}>
                                    {report.summary.mediumSeverityCount}
                                </div>
                            </div>
                            
                            <div style={{ background: 'white', padding: '15px', borderRadius: '8px' }}>
                                <div style={{ fontSize: '12px', color: '#eab308', marginBottom: '5px' }}>
                                    🟡 Low Severity
                                </div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#eab308' }}>
                                    {report.summary.lowSeverityCount}
                                </div>
                            </div>
                            
                            <div style={{ background: 'white', padding: '15px', borderRadius: '8px' }}>
                                <div style={{ fontSize: '12px', color: '#8b5cf6', marginBottom: '5px' }}>
                                    🟣 Unexcluded Inputs
                                </div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6' }}>
                                    {report.summary.unexcludedInputsCount}
                                </div>
                            </div>
                        </div>

                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            Generated: {new Date(report.timestamp).toLocaleString()}
                        </div>
                    </div>

                    {/* PII Issues Table */}
                    {report.piiIssues.length > 0 && (
                        <div style={{ marginTop: '20px', background: 'white', borderRadius: '10px', padding: '20px' }}>
                            <h3 style={{ margin: '0 0 15px 0' }}>🚨 PII Issues ({report.piiIssues.length})</h3>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                    <thead>
                                        <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                                            <th style={{ padding: '12px', textAlign: 'left' }}>Severity</th>
                                            <th style={{ padding: '12px', textAlign: 'left' }}>Element</th>
                                            <th style={{ padding: '12px', textAlign: 'left' }}>Attribute</th>
                                            <th style={{ padding: '12px', textAlign: 'left' }}>Reason</th>
                                            <th style={{ padding: '12px', textAlign: 'left' }}>Value</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {report.piiIssues.map((issue, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                                <td style={{ padding: '12px' }}>
                                                    <span style={{
                                                        background: getSeverityColor(issue.severity),
                                                        color: 'white',
                                                        padding: '4px 8px',
                                                        borderRadius: '4px',
                                                        fontSize: '12px',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        {issue.severity.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '12px' }}>
                                                    {issue.element}
                                                </td>
                                                <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '12px' }}>
                                                    {issue.attribute}
                                                </td>
                                                <td style={{ padding: '12px' }}>{issue.reason}</td>
                                                <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '12px', color: '#6b7280' }}>
                                                    {issue.value}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Exclusion Issues */}
                    {report.exclusionIssues.length > 0 && (
                        <div style={{ marginTop: '20px', background: 'white', borderRadius: '10px', padding: '20px' }}>
                            <h3 style={{ margin: '0 0 15px 0' }}>⚠️ Exclusion Issues ({report.exclusionIssues.length})</h3>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                    <thead>
                                        <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                                            <th style={{ padding: '12px', textAlign: 'left' }}>Element</th>
                                            <th style={{ padding: '12px', textAlign: 'left' }}>Type</th>
                                            <th style={{ padding: '12px', textAlign: 'left' }}>Reason</th>
                                            <th style={{ padding: '12px', textAlign: 'left' }}>Suggestion</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {report.exclusionIssues.map((issue, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                                <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '12px' }}>
                                                    {issue.element}
                                                </td>
                                                <td style={{ padding: '12px' }}>{issue.inputType || 'N/A'}</td>
                                                <td style={{ padding: '12px' }}>{issue.reason}</td>
                                                <td style={{ padding: '12px', color: '#059669' }}>{issue.suggestion}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Test Components */}
            {showTestPage && (
                <div style={{ 
                    background: 'white', 
                    borderRadius: '10px', 
                    padding: '20px',
                    border: '2px solid #e5e7eb'
                }}>
                    <PendoTestPage />
                </div>
            )}

            {/* Instructions */}
            <div style={{
                marginTop: '30px',
                background: '#eff6ff',
                border: '2px solid #3b82f6',
                borderRadius: '10px',
                padding: '20px'
            }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#1e40af' }}>💡 How to Use</h3>
                <ol style={{ margin: 0, paddingLeft: '20px', color: '#1e3a8a' }}>
                    <li style={{ marginBottom: '10px' }}>
                        Click <strong>"Run Verification"</strong> to scan the page for PII and exclusion issues
                    </li>
                    <li style={{ marginBottom: '10px' }}>
                        Review the report summary and detailed tables above
                    </li>
                    <li style={{ marginBottom: '10px' }}>
                        Click <strong>"Highlight Issues"</strong> to visually mark problematic elements
                    </li>
                    <li style={{ marginBottom: '10px' }}>
                        Use <strong>"Clear Highlights"</strong> to remove visual markers
                    </li>
                    <li>
                        Toggle <strong>"Show/Hide Test Components"</strong> to see example implementations
                    </li>
                </ol>
            </div>
        </div>
    );
};

export default PendoInteractiveDemo;

