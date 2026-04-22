import axios from 'axios';

async function test() {
  try {
    // Seed first
    console.log('Seeding rooms...');
    const seedRes = await axios.post('http://localhost:5000/api/dev/seed-rooms');
    console.log('Seed response:', seedRes.data);
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Login
    console.log('\nLogging in...');
    const loginRes = await axios.post('http://localhost:5000/api/auth/admin/login', {
      email: 'guesthubpg@gmail.com',
      password: 'Guesthub117',
    });
    
    const token = loginRes.data.data.token;
    console.log('✓ Admin logged in');
    
    // Get rooms
    console.log('Fetching rooms...');
    const roomsRes = await axios.get('http://localhost:5000/api/admin/rooms', {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    console.log(`Found ${roomsRes.data.data.length} rooms`);
    console.log('Rooms:', JSON.stringify(roomsRes.data.data, null, 2));
  } catch (err: any) {
    console.error('Error:', err.response?.data || err.message);
  }
}

test();
