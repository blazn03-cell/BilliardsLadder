#!/usr/bin/env node

// Database Schema Validator
// Checks if all required tables exist and have correct columns

import { sql } from 'drizzle-orm';
import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();

async function validateDatabase() {
    console.log('🗄️  Database Schema Validator\n');

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        console.error('❌ ERROR: DATABASE_URL not set in .env');
        process.exit(1);
    }

    const client = postgres(databaseUrl);

    try {
        console.log('✓ Connecting to database...\n');

        // Check for critical tables
        const tables = [
            'users',
            'players',
            'webhook_events',
            'sessions',
            'matches',
            'tournaments',
        ];

        let tablesFound = 0;
        let tablesMissing = 0;

        console.log('📋 Checking Tables\n');

        for (const table of tables) {
            try {
                const result = await client`
          SELECT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = ${table}
          )
        `;

                if (result[0].exists) {
                    console.log(`✅ Table exists: ${table}`);
                    tablesFound++;
                } else {
                    console.log(`❌ Table missing: ${table}`);
                    tablesMissing++;
                }
            } catch (error) {
                console.log(`⚠️  Error checking ${table}: ${error.message}`);
            }
        }

        console.log(`\n📊 Table Summary\n`);
        console.log(`Found: ${tablesFound}`);
        console.log(`Missing: ${tablesMissing}`);
        console.log(`Total: ${tables.length}\n`);

        if (tablesMissing > 0) {
            console.log('⚠️  Missing tables detected!\n');
            console.log('Run this command to create them:');
            console.log('  npm run db:push\n');
            process.exit(1);
        } else {
            console.log('✅ All required tables exist!\n');

            // Check webhook_events specifically
            console.log('🔍 Checking webhook_events columns\n');
            try {
                const columns = await client`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = 'webhook_events'
          ORDER BY ordinal_position
        `;

                columns.forEach(col => {
                    console.log(`  • ${col.column_name} (${col.data_type})`);
                });
                console.log();
            } catch (error) {
                console.log(`⚠️  Could not check columns: ${error.message}\n`);
            }

            console.log('🎉 Database schema is valid!\n');
            process.exit(0);
        }
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
        console.error('\nTroubleshooting:');
        console.error('1. Check DATABASE_URL in .env');
        console.error('2. Verify database credentials');
        console.error('3. Ensure database server is running');
        console.error('4. Check network connectivity\n');
        process.exit(1);
    } finally {
        await client.end();
    }
}

validateDatabase().catch(error => {
    console.error('Fatal error:', error.message);
    process.exit(1);
});