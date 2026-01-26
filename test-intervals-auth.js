/**
 * Test script for intervals.icu authentication
 * Run with: node test-intervals-auth.js <athleteId> <apiKey>
 */

const IntervalsIcuService = require('./server/intervals-icu');

async function testAuth() {
  const athleteId = process.argv[2];
  const apiKey = process.argv[3];

  if (!athleteId || !apiKey) {
    console.error('Usage: node test-intervals-auth.js <athleteId> <apiKey>');
    process.exit(1);
  }

  console.log('Testing intervals.icu authentication...');
  console.log(`Athlete ID: ${athleteId}`);
  console.log(`API Key: ${apiKey.substring(0, 5)}...`);
  console.log('');

  const service = new IntervalsIcuService();
  service.setCredentials(athleteId, apiKey);

  try {
    // Test connection
    console.log('1. Testing connection...');
    const isConnected = await service.testConnection();
    console.log(`   ✓ Connection ${isConnected ? 'successful' : 'failed'}`);
    console.log('');

    if (isConnected) {
      // Get athlete info
      console.log('2. Fetching athlete info...');
      const athleteResponse = await service.getAthlete();
      const athlete = athleteResponse.data;
      console.log(`   ✓ Name: ${athlete.name || 'N/A'}`);
      console.log(`   ✓ ID: ${athlete.id}`);
      console.log('');

      // Get recent workouts (last 7 days)
      console.log('3. Fetching recent workouts (last 7 days)...');
      const newest = new Date().toISOString().split('T')[0];
      const oldest = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      console.log(`   Date range: ${oldest} to ${newest}`);
      const workouts = await service.getWorkouts(oldest, newest);
      console.log(`   ✓ Found ${workouts.length} workouts`);
      
      if (workouts.length > 0) {
        console.log('');
        console.log('   Recent workouts:');
        workouts.slice(0, 5).forEach((w, i) => {
          const name = w.name || w.description || 'Untitled';
          const type = w.type || w.sport_type || 'Unknown';
          const date = w.start_date_local?.split('T')[0] || w.date;
          console.log(`   ${i + 1}. ${date} - ${type}: ${name}`);
        });
      }
      console.log('');
      console.log('✓ All tests passed!');
    } else {
      console.log('✗ Authentication failed. Please check your credentials.');
      process.exit(1);
    }
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

testAuth();
