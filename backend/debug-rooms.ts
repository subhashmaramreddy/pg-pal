import axios from 'axios';

async function test() {
  try {
    // Login
    const loginRes = await axios.post('http://localhost:5000/api/auth/admin/login', {
      email: 'guesthubpg@gmail.com',
      password: 'Guesthub117',
    });
    
    const token = loginRes.data.data.token;
    console.log('✓ Admin logged in');
    
    // Try to create ONE room
    console.log('\nAttempting to create room...');
    try {
      const createRes = await axios.post(
        'http://localhost:5000/api/admin/rooms',
        { room_number: 'TEST-001', floor: 1, capacity: 2 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('✓ Room created:', createRes.data);
    } catch (createErr: any) {
      console.log('✗ Room creation failed:');
      console.log('Status:', createErr.response?.status);
      console.log('Error:', createErr.response?.data);
    }
    
    // Try to get rooms
    console.log('\nGetting rooms...');
    const roomsRes = await axios.get('http://localhost:5000/api/admin/rooms', {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    console.log(`Found ${roomsRes.data.data.length} rooms`);
    if (roomsRes.data.data.length > 0) {
      console.log('Rooms:', roomsRes.data.data.map((r: any) => r.room_number));
    }
  } catch (err: any) {
    console.error('Error:', err.response?.data || err.message);
  }
}

test();
