const axios = require('axios');

/**
 * Test script to verify SkillChain platform is running correctly
 */

async function testBackend() {
  try {
    console.log('🔍 Testing backend API...');
    const response = await axios.get('http://localhost:3001/health');
    
    if (response.status === 200) {
      console.log('   ✅ Backend API is running');
      console.log(`   📊 Response: ${response.data.status}`);
      return true;
    }
  } catch (error) {
    console.log('   ❌ Backend API is not responding');
    console.log('   💡 Make sure to run: npm run dev:backend');
    return false;
  }
}

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection...');
    const response = await axios.get('http://localhost:3001/api/quests');
    
    if (response.status === 200) {
      console.log('   ✅ Database connection working');
      console.log(`   📊 Found ${response.data.data?.length || 0} quests`);
      return true;
    }
  } catch (error) {
    console.log('   ❌ Database connection failed');
    console.log('   💡 Make sure to run: npm run db:setup && npm run db:seed');
    return false;
  }
}

async function testFrontend() {
  try {
    console.log('🔍 Testing frontend...');
    const response = await axios.get('http://localhost:3000');
    
    if (response.status === 200) {
      console.log('   ✅ Frontend is running');
      return true;
    }
  } catch (error) {
    console.log('   ❌ Frontend is not responding');
    console.log('   💡 Make sure to run: npm run dev:frontend');
    return false;
  }
}

async function main() {
  console.log('🧪 Testing SkillChain platform setup...\n');

  const backendOk = await testBackend();
  const databaseOk = await testDatabase();
  const frontendOk = await testFrontend();

  console.log('\n📋 Test Results:');
  console.log(`   Backend API: ${backendOk ? '✅' : '❌'}`);
  console.log(`   Database: ${databaseOk ? '✅' : '❌'}`);
  console.log(`   Frontend: ${frontendOk ? '✅' : '❌'}`);

  if (backendOk && databaseOk && frontendOk) {
    console.log('\n🎉 All systems are working! Your SkillChain platform is ready.');
    console.log('\n🚀 Try these URLs:');
    console.log('   Frontend: http://localhost:3000');
    console.log('   Backend API: http://localhost:3001/health');
    console.log('   Quests API: http://localhost:3001/api/quests');
  } else {
    console.log('\n⚠️  Some components are not working. Check the messages above.');
    console.log('\n🔧 Common fixes:');
    console.log('   1. Make sure all services are running: npm run dev');
    console.log('   2. Check database setup: npm run db:setup');
    console.log('   3. Seed the database: npm run db:seed');
    console.log('   4. Check environment variables in backend/.env');
  }
}

// Handle script execution
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };