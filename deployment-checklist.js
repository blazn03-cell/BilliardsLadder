#!/usr/bin/env node

// Production Deployment Checklist
// Run this before deploying to production

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function checkEnvVar(name, required = true) {
    const value = process.env[name];
    const exists = !!value;
    const isSecure = value && value.length > 10 && !value.includes('test') && !value.includes('example');

    if (required) {
        if (!exists) {
            console.log(`❌ MISSING: ${name} (required)`);
            return false;
        } else if (!isSecure) {
            console.log(`⚠️  WEAK: ${name} (may be test/example value)`);
            return false;
        } else {
            console.log(`✅ OK: ${name}`);
            return true;
        }
    } else {
        if (exists) {
            console.log(`✅ OK: ${name} (optional, present)`);
        } else {
            console.log(`⚠️  MISSING: ${name} (optional)`);
        }
        return true; // Optional vars don't fail the check
    }
}

function runDeploymentChecklist() {
    console.log('🚀 Production Deployment Checklist\n');

    let allGood = true;

    // Load .env file if it exists
    const envPath = path.join(path.dirname(__dirname), '.env');
    if (fs.existsSync(envPath)) {
        console.log('📄 Loading environment variables from .env file...');
        const dotenv = await import('dotenv');
        dotenv.config({ path: envPath });

        console.log('\n🔐 Security & Authentication\n');

        allGood &= checkEnvVar('STRIPE_SECRET_KEY');
        allGood &= checkEnvVar('STRIPE_WEBHOOK_SECRET');
        allGood &= checkEnvVar('SESSION_SECRET');
        allGood &= checkEnvVar('DATABASE_URL');
        allGood &= checkEnvVar('REPLIT_DOMAINS');
        allGood &= checkEnvVar('REPL_ID');

        console.log('\n💳 Stripe Configuration\n');

        allGood &= checkEnvVar('SMALL_PRICE_ID');
        allGood &= checkEnvVar('MEDIUM_PRICE_ID');
        allGood &= checkEnvVar('LARGE_PRICE_ID');
        allGood &= checkEnvVar('MEGA_PRICE_ID');
        allGood &= checkEnvVar('PLAYER_ROOKIE_MONTHLY_PRICE_ID');
        allGood &= checkEnvVar('PLAYER_STANDARD_MONTHLY_PRICE_ID');
        allGood &= checkEnvVar('PLAYER_PREMIUM_MONTHLY_PRICE_ID');

        console.log('\n🗄️  Database Configuration\n');

        const dbUrl = process.env.DATABASE_URL;
        if (dbUrl) {
            const hasSSL = dbUrl.includes('sslmode=require') || dbUrl.includes('ssl=1');
            if (hasSSL) {
                console.log('✅ OK: Database URL includes SSL');
            } else {
                console.log('⚠️  WARNING: Database URL may not include SSL');
            }
        }

        console.log('\n🏗️  Build & Deployment\n');

        // Check if build files exist
        const serverDist = path.join(path.dirname(__dirname), 'server', 'dist');
        const clientDist = path.join(path.dirname(__dirname), 'client', 'dist');
        if (fs.existsSync(serverDist)) {
            console.log('✅ OK: Server build exists');
        } else {
            console.log('❌ MISSING: Server build (run npm run build)');
            allGood = false;
        }

        if (fs.existsSync(clientDist)) {
            console.log('✅ OK: Client build exists');
        } else {
            console.log('❌ MISSING: Client build (run npm run build)');
            allGood = false;
        }

        console.log('\n📋 Final Status\n');

        if (allGood) {
            console.log('🎉 All checks passed! Ready for production deployment.');
            console.log('\nNext steps:');
            console.log('1. Run: npm run db:push (to sync database schema)');
            console.log('2. Run: npm run build (if not already done)');
            console.log('3. Deploy to production environment');
            console.log('4. Run QA validation: node qa-validation.js');
        } else {
            console.log('⚠️  Some checks failed. Please address the issues above before deploying.');
        }

        return allGood;
    }

    // Run checklist if executed directly
    if (require.main === module) {
        runDeploymentChecklist();
    }

    module.exports = { runDeploymentChecklist };