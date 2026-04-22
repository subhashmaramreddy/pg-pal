import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function seedRooms() {
  try {
    console.log('Seeding rooms...');
    const res = await axios.post(`${BASE_URL}/dev/seed-rooms`);
    console.log('✓ Rooms seeded:', res.data.message);
  } catch (error: any) {
    console.error('Error:', error.response?.data || error.message);
  }
}

seedRooms();
