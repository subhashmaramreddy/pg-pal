import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function test() {
  try {
    console.log('Testing admin login...');
    const res = await axios.post(`${BASE_URL}/auth/admin/login`, {
      email: 'admin@pgpal.com',
      password: 'admin@123',
    });
    console.log('Response:', JSON.stringify(res.data, null, 2));
  } catch (err: any) {
    console.error('Error:', err.response?.data || err.message);
    console.error('Status:', err.response?.status);
  }
}

test();
