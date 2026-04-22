import axios from 'axios';

async function test() {
  try {
    // Login
    const loginRes = await axios.post('http://localhost:5000/api/auth/admin/login', {
      email: 'admin@pgpal.com',
      password: 'admin@123',
    });
    
    const token = loginRes.data.data.token;
    console.log('✓ Admin logged in');
    
    // Get rooms
    const roomsRes = await axios.get('http://localhost:5000/api/admin/rooms', {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    console.log('Rooms response:', JSON.stringify(roomsRes.data, null, 2));
  } catch (err: any) {
    console.error('Error:', err.response?.data || err.message);
  }
}

test();
