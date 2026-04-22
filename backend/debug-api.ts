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
    console.log('pgType from response:', loginRes.data.data.pgType);
    
    // Get rooms
    console.log('\nCalling /admin/rooms...');
    const roomsRes = await axios.get('http://localhost:5000/api/admin/rooms', {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    console.log('Response:', JSON.stringify(roomsRes.data, null, 2));
  } catch (err: any) {
    console.error('Error:', err.response?.data || err.message);
    console.error('Status:', err.response?.status);
  }
}

test();
