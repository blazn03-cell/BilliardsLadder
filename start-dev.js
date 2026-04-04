#!/usr/bin/env node

// Development Server Launcher
// Starts both client and server for testing

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting BilliardsLadder Development Environment...\n');

console.log('📦 Installing dependencies...');
const installProcess = spawn('npm', ['install'], {
    cwd: path.dirname(__dirname),
});

installProcess.on('close', (code) => {
    if (code !== 0) {
        console.error('❌ Failed to install dependencies');
        process.exit(1);
    }

    console.log('✅ Dependencies installed\n');

    console.log('🏗️  Building application...');
    const buildProcess = spawn('npm', ['run', 'build'], {
        cwd: path.dirname(__dirname),
    });

    buildProcess.on('close', (buildCode) => {
        if (buildCode !== 0) {
            console.error('❌ Build failed');
            process.exit(1);
        }

        console.log('✅ Build complete\n');

        console.log('🗄️  Setting up database...');
        const dbProcess = spawn('npm', ['run', 'db:push'], {
            cwd: path.dirname(__dirname),
        });

        dbProcess.on('close', (dbCode) => {
            if (dbCode !== 0) {
                console.error('❌ Database setup failed');
                process.exit(1);
            }

            console.log('✅ Database ready\n');

            console.log('🚀 Starting development server...');
            const devProcess = spawn('npm', ['run', 'dev'], {
                cwd: path.dirname(__dirname),
            });

            devProcess.on('close', (devCode) => {
                console.log(`\n🛑 Development server stopped (exit code: ${devCode})`);
            });

            // Handle graceful shutdown
            process.on('SIGINT', () => {
                console.log('\n🛑 Shutting down development server...');
                devProcess.kill('SIGINT');
            });
        });
    });
});