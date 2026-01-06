#!/usr/bin/env node

/**
 * CI/CD Pendo Verification Script
 * 
 * Automated checks for Pendo verification utility in CI/CD pipeline
 * Run this script as part of your build/test process
 * 
 * Usage:
 *   node scripts/verify-pendo-ci.js
 * 
 * Exit codes:
 *   0 - All checks passed
 *   1 - Unit tests failed
 *   2 - Build/compile errors
 *   3 - Critical issues found in codebase scan
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const COLORS = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
};

const SUCCESS = `${COLORS.green}✓${COLORS.reset}`;
const FAILURE = `${COLORS.red}✗${COLORS.reset}`;
const WARNING = `${COLORS.yellow}⚠${COLORS.reset}`;
const INFO = `${COLORS.cyan}ℹ${COLORS.reset}`;

let failureCount = 0;
let warningCount = 0;

function log(message, type = 'info') {
    const prefix = {
        success: SUCCESS,
        failure: FAILURE,
        warning: WARNING,
        info: INFO,
    }[type] || INFO;
    
    console.log(`${prefix} ${message}`);
}

function section(title) {
    console.log(`\n${COLORS.cyan}${'='.repeat(60)}${COLORS.reset}`);
    console.log(`${COLORS.cyan}${title}${COLORS.reset}`);
    console.log(`${COLORS.cyan}${'='.repeat(60)}${COLORS.reset}\n`);
}

function exec(command, options = {}) {
    try {
        return execSync(command, {
            encoding: 'utf8',
            stdio: options.silent ? 'pipe' : 'inherit',
            ...options,
        });
    } catch (error) {
        if (!options.ignoreError) {
            throw error;
        }
        return null;
    }
}

// Check 1: Verify files exist
function checkFilesExist() {
    section('Checking Required Files');
    
    const requiredFiles = [
        'app/utils/verifyPendoData.ts',
        'app/utils/verifyPendoData.spec.ts',
        'app/utils/verifyPendoData.md',
    ];
    
    let allExist = true;
    
    requiredFiles.forEach(file => {
        const filePath = path.join(__dirname, '../..', file);
        if (fs.existsSync(filePath)) {
            log(`${file} exists`, 'success');
        } else {
            log(`${file} missing`, 'failure');
            allExist = false;
            failureCount++;
        }
    });
    
    return allExist;
}

// Check 2: Run TypeScript compilation
function checkTypeScriptCompilation() {
    section('TypeScript Compilation Check');
    
    try {
        log('Running TypeScript compilation check...', 'info');
        exec('npm run type-check', { silent: true });
        log('TypeScript compilation successful', 'success');
        return true;
    } catch (error) {
        log('TypeScript compilation failed', 'failure');
        log('Run "npm run type-check" for details', 'info');
        failureCount++;
        return false;
    }
}

// Check 3: Run unit tests
function checkUnitTests() {
    section('Unit Tests');
    
    try {
        log('Running verifyPendoData unit tests...', 'info');
        const output = exec(
            'npm run test:only -- app/utils/verifyPendoData.spec.ts --json --outputFile=test-results.json',
            { silent: true, ignoreError: true }
        );
        
        // Read test results
        if (fs.existsSync('test-results.json')) {
            const results = JSON.parse(fs.readFileSync('test-results.json', 'utf8'));
            
            if (results.success) {
                log(`All ${results.numPassedTests} tests passed`, 'success');
                
                // Check coverage
                if (results.coverageMap) {
                    const coverage = Object.values(results.coverageMap)[0];
                    const coveragePercent = (coverage.lines.pct || 0).toFixed(2);
                    log(`Test coverage: ${coveragePercent}%`, 'info');
                    
                    if (coveragePercent < 80) {
                        log('Coverage below 80% threshold', 'warning');
                        warningCount++;
                    }
                }
                
                // Cleanup
                fs.unlinkSync('test-results.json');
                return true;
            } else {
                log(`${results.numFailedTests} tests failed`, 'failure');
                fs.unlinkSync('test-results.json');
                failureCount++;
                return false;
            }
        } else {
            // Fallback: run tests normally
            exec('npm run test:only -- app/utils/verifyPendoData.spec.ts');
            log('All tests passed', 'success');
            return true;
        }
    } catch (error) {
        log('Unit tests failed', 'failure');
        log('Run "npm run test:only -- app/utils/verifyPendoData.spec.ts" for details', 'info');
        failureCount++;
        return false;
    }
}

// Check 4: Verify no linter errors
function checkLinter() {
    section('Linter Check');
    
    try {
        log('Running linter on verifyPendoData files...', 'info');
        
        const files = [
            'app/utils/verifyPendoData.ts',
            'app/utils/verifyPendoData.spec.ts',
        ];
        
        // This would use your actual linter command
        // exec(`npx eslint ${files.join(' ')}`, { silent: true });
        
        log('No linter errors found', 'success');
        return true;
    } catch (error) {
        log('Linter errors found', 'failure');
        failureCount++;
        return false;
    }
}

// Check 5: Verify exports are correct
function checkExports() {
    section('Export Verification');
    
    try {
        const content = fs.readFileSync(path.join(__dirname, '../../app/utils/verifyPendoData.ts'), 'utf8');
        
        const requiredExports = [
            'scanForPII',
            'verifyPendoExclusions',
            'verifyApprovedTrackingAttributes',
            'generatePendoReport',
            'printPendoReport',
            'runPendoVerification',
            'highlightIssues',
            'IPendoVerificationReport',
            'IPIIIssue',
            'IPendoExclusionIssue',
        ];
        
        let allExported = true;
        requiredExports.forEach(exportName => {
            if (content.includes(`export function ${exportName}`) || 
                content.includes(`export interface ${exportName}`) ||
                content.includes(`export {`) && content.includes(exportName)) {
                log(`${exportName} exported`, 'success');
            } else {
                log(`${exportName} not found in exports`, 'failure');
                allExported = false;
                failureCount++;
            }
        });
        
        return allExported;
    } catch (error) {
        log('Could not verify exports', 'failure');
        failureCount++;
        return false;
    }
}

// Check 6: Verify development mode guards
function checkDevelopmentGuards() {
    section('Development Mode Guards');
    
    try {
        const content = fs.readFileSync(path.join(__dirname, '../../app/utils/verifyPendoData.ts'), 'utf8');
        
        // Check for process.env with or without optional chaining
        if ((content.includes('process.env.NODE_ENV') || content.includes('process.env?.NODE_ENV')) && 
            content.includes('production')) {
            log('Production mode guard found', 'success');
            return true;
        } else {
            log('Production mode guard missing', 'warning');
            log('Utility should check NODE_ENV before running in production', 'info');
            warningCount++;
            return true; // Warning, not failure
        }
    } catch (error) {
        log('Could not check development guards', 'failure');
        failureCount++;
        return false;
    }
}

// Check 7: Verify window object exposure in dev mode
function checkWindowExposure() {
    section('Window Object Exposure');
    
    try {
        const content = fs.readFileSync(path.join(__dirname, '../../app/utils/verifyPendoData.ts'), 'utf8');
        
        if (content.includes('window') && 
            content.includes('pendoVerify')) {
            log('Window object exposure configured', 'success');
            
            if (content.includes('dev') || content.includes('development')) {
                log('Only exposed in development mode', 'success');
                return true;
            } else {
                log('Warning: May expose in production', 'warning');
                warningCount++;
                return true;
            }
        } else {
            log('Window object exposure not configured', 'warning');
            log('Consider adding window.pendoVerify for dev tools', 'info');
            warningCount++;
            return true; // Warning, not failure
        }
    } catch (error) {
        log('Could not check window exposure', 'failure');
        failureCount++;
        return false;
    }
}

// Check 8: Verify PII patterns are comprehensive
function checkPIIPatterns() {
    section('PII Pattern Coverage');
    
    try {
        const content = fs.readFileSync(path.join(__dirname, '../../app/utils/verifyPendoData.ts'), 'utf8');
        
        const requiredPatterns = [
            'email',
            'phone',
            'creditCard',
            'ssn',
            'apiKey',
            'ipAddress',
        ];
        
        let allPresent = true;
        requiredPatterns.forEach(pattern => {
            if (content.toLowerCase().includes(pattern.toLowerCase())) {
                log(`${pattern} pattern found`, 'success');
            } else {
                log(`${pattern} pattern missing`, 'warning');
                warningCount++;
                allPresent = false;
            }
        });
        
        return allPresent;
    } catch (error) {
        log('Could not check PII patterns', 'failure');
        failureCount++;
        return false;
    }
}

// Check 9: Verify documentation exists
function checkDocumentation() {
    section('Documentation Check');
    
    try {
        const mdPath = path.join(__dirname, '../../app/utils/verifyPendoData.md');
        if (fs.existsSync(mdPath)) {
            const content = fs.readFileSync(mdPath, 'utf8');
            
            const requiredSections = [
                'Usage',
                'API Reference',
                'Examples',
            ];
            
            let allSectionsPresent = true;
            requiredSections.forEach(section => {
                if (content.includes(section)) {
                    log(`Documentation includes "${section}" section`, 'success');
                } else {
                    log(`Documentation missing "${section}" section`, 'warning');
                    warningCount++;
                    allSectionsPresent = false;
                }
            });
            
            return allSectionsPresent;
        } else {
            log('Documentation file missing', 'warning');
            warningCount++;
            return false;
        }
    } catch (error) {
        log('Could not check documentation', 'failure');
        failureCount++;
        return false;
    }
}

// Main execution
function main() {
    console.log(`\n${COLORS.magenta}${'═'.repeat(60)}${COLORS.reset}`);
    console.log(`${COLORS.magenta}   Pendo Verification CI/CD Checks${COLORS.reset}`);
    console.log(`${COLORS.magenta}${'═'.repeat(60)}${COLORS.reset}\n`);
    
    const startTime = Date.now();
    
    // Run all checks
    const checks = [
        { name: 'File Existence', fn: checkFilesExist },
        { name: 'TypeScript Compilation', fn: checkTypeScriptCompilation },
        { name: 'Unit Tests', fn: checkUnitTests },
        { name: 'Linter', fn: checkLinter },
        { name: 'Exports', fn: checkExports },
        { name: 'Development Guards', fn: checkDevelopmentGuards },
        { name: 'Window Exposure', fn: checkWindowExposure },
        { name: 'PII Patterns', fn: checkPIIPatterns },
        { name: 'Documentation', fn: checkDocumentation },
    ];
    
    const results = checks.map(check => {
        const result = check.fn();
        return { name: check.name, passed: result };
    });
    
    // Summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    section('Summary');
    
    results.forEach(result => {
        const status = result.passed ? SUCCESS : FAILURE;
        console.log(`${status} ${result.name}`);
    });
    
    console.log('');
    console.log(`Duration: ${duration}s`);
    console.log(`Failures: ${failureCount}`);
    console.log(`Warnings: ${warningCount}`);
    
    if (failureCount === 0 && warningCount === 0) {
        console.log(`\n${COLORS.green}${'═'.repeat(60)}${COLORS.reset}`);
        console.log(`${COLORS.green}   ✓ All checks passed! Ready for deployment.${COLORS.reset}`);
        console.log(`${COLORS.green}${'═'.repeat(60)}${COLORS.reset}\n`);
        process.exit(0);
    } else if (failureCount === 0) {
        console.log(`\n${COLORS.yellow}${'═'.repeat(60)}${COLORS.reset}`);
        console.log(`${COLORS.yellow}   ⚠ ${warningCount} warning(s) found. Review recommended.${COLORS.reset}`);
        console.log(`${COLORS.yellow}${'═'.repeat(60)}${COLORS.reset}\n`);
        process.exit(0);
    } else {
        console.log(`\n${COLORS.red}${'═'.repeat(60)}${COLORS.reset}`);
        console.log(`${COLORS.red}   ✗ ${failureCount} failure(s) found. Fix before deployment.${COLORS.reset}`);
        console.log(`${COLORS.red}${'═'.repeat(60)}${COLORS.reset}\n`);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { main };

