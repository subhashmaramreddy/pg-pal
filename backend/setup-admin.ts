#!/usr/bin/env tsx

import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function createAdmin() {
  try {
    console.log('Creating test admin account...');
    
    const response = await axios.post(`${BASE_URL}/dev/seed-admin`, {
      email: 'guesthubpg@gmail.com',
      password: 'Guesthub117',
      pgType: 'boys',
    });

    console.log('✅ Admin account created successfully');
    console.log('Response:', response.data);
    return true;
  } catch (error: any) {
    if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
      console.log('✅ Admin account already exists');
      return true;
    }
    console.log('❌ Failed to create admin');
    console.log('Error:', error.response?.data?.message || error.message);
    return false;
  }
}

createAdmin();
