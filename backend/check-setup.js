/**
 * Backend Setup Diagnostic Tool
 * Run: node check-setup.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Backend Setup Diagnostic Tool\n');
console.log('=' .repeat(50));

// Check Node.js version
console.log('\n1. Node.js Version:');
const nodeVersion = process.version;
console.log(`   ✅ Node.js ${nodeVersion}`);
if (parseInt(nodeVersion.split('.')[0].substring(1)) < 14) {
  console.log('   ⚠️  Warning: Node.js v14 or higher recommended');
}

// Check if node_modules exists
console.log('\n2. Dependencies:');
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('   ✅ node_modules folder exists');
} else {
  console.log('   ❌ node_modules folder NOT found');
  console.log('   💡 Run: npm install');
}

// Check if .env exists
console.log('\n3. Environment Configuration:');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('   ✅ .env file exists');
  
  // Try to read and check variables
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const requiredVars = ['MONGODB_URI', 'EMAIL_USER', 'EMAIL_PASS'];
    const missingVars = [];
    
    requiredVars.forEach(varName => {
      if (!envContent.includes(`${varName}=`) || envContent.includes(`${varName}=your-`)) {
        missingVars.push(varName);
      }
    });
    
    if (missingVars.length === 0) {
      console.log('   ✅ All required variables are set');
    } else {
      console.log('   ⚠️  Missing or not configured:');
      missingVars.forEach(v => console.log(`      - ${v}`));
    }
  } catch (error) {
    console.log('   ⚠️  Could not read .env file');
  }
} else {
  console.log('   ❌ .env file NOT found');
  console.log('   💡 Run: copy .env.example .env (Windows) or cp .env.example .env (Mac/Linux)');
}

// Check required files
console.log('\n4. Required Files:');
const requiredFiles = [
  'server.js',
  'routes/auth.js',
  'models/User.js',
  'models/TempUser.js',
  'utils/emailService.js',
  'middleware/rateLimiter.js',
];

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - MISSING`);
  }
});

// Check package.json
console.log('\n5. Package Configuration:');
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
  console.log('   ✅ package.json exists');
  try {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    console.log(`   ✅ Package name: ${packageJson.name}`);
    console.log(`   ✅ Scripts available: ${Object.keys(packageJson.scripts).join(', ')}`);
  } catch (error) {
    console.log('   ⚠️  Could not read package.json');
  }
} else {
  console.log('   ❌ package.json NOT found');
}

console.log('\n' + '='.repeat(50));
console.log('\n📋 Next Steps:');
console.log('1. If node_modules is missing: npm install');
console.log('2. If .env is missing: copy .env.example .env');
console.log('3. Edit .env and add your configuration');
console.log('4. Start MongoDB (mongod) or configure MongoDB Atlas');
console.log('5. Run: npm run dev');
console.log('\n');
