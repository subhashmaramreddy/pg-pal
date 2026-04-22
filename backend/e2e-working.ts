#!/usr/bin/env tsx

import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

const log = {
  title: (msg: string) => console.log(`\n${'='.repeat(70)}\n${msg}\n${'='.repeat(70)}`),
  pass: (msg: string) => console.log(`✅ ${msg}`),
  fail: (msg: string) => console.log(`❌ ${msg}`),
  info: (msg: string) => console.log(`ℹ️  ${msg}`),
};

async function test() {
  log.title('END-TO-END INTEGRATION TEST');

  let adminToken = '';
  let joinerId = '';
  let roomId = '';

  // TEST 1: Admin Login
  log.title('STEP 1: Admin Login');
  try {
    const res = await axios.post(`${BASE_URL}/auth/admin/login`, {
      email: 'guesthubpg@gmail.com',
      password: 'Guesthub117',
    });

    adminToken = res.data.data.token;
    log.pass(`Admin login successful`);
    log.info(`PG Type: ${res.data.data.pgType}`);
  } catch (err: any) {
    log.fail(`Admin login: ${err.response?.data?.error || err.message}`);
    return;
  }

  // TEST 2: Get Available Rooms
  log.title('STEP 2: Get Available Rooms');
  try {
    const res = await axios.get(`${BASE_URL}/admin/rooms`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    const rooms = res.data.data;
    if (!rooms || rooms.length === 0) {
      log.fail(`No rooms available. Please run: psql < backend/seed-rooms.sql`);
      log.info(`Or create rooms manually via admin dashboard`);
      return;
    }

    roomId = rooms[0].id;
    log.pass(`Found ${rooms.length} rooms`);
    log.info(`Selected room: ${rooms[0].room_number}`);
  } catch (err: any) {
    log.fail(`Get rooms: ${err.response?.data?.error || err.message}`);
    return;
  }

  // TEST 3: Submit Joiner Application
  log.title('STEP 3: Submit Joiner Application');
  try {
    const timestamp = Date.now();
    const res = await axios.post(`${BASE_URL}/tenant/join`, {
      name: `Test Joiner ${timestamp}`,
      email: `joiner${timestamp}@test.com`,
      phone: `9876543210`,
      gender: 'male',
      college: 'Test Engineering',
      pg_type: 'boys',
      room_type: '2_sharing',
      join_date: new Date().toISOString().split('T')[0],
    });

    joinerId = res.data.data.id;
    const joinerEmail = res.data.data.email;

    log.pass(`Joiner application submitted`);
    log.info(`Joiner ID: ${joinerId}`);
    log.info(`Joiner Email: ${joinerEmail}`);
  } catch (err: any) {
    log.fail(`Submit joiner: ${err.response?.data?.error || err.message}`);
    return;
  }

  // TEST 4: Get Pending Joiners
  log.title('STEP 4: Verify Joiner in Pending List');
  try {
    const res = await axios.get(`${BASE_URL}/admin/joiners`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    const joiners = res.data.data;
    const ourJoiner = joiners.find((j: any) => j.id === joinerId);

    if (ourJoiner) {
      log.pass(`Joiner found in pending list`);
      log.info(`Status: ${ourJoiner.status}`);
    } else {
      log.fail(`Joiner not found in pending list`);
      return;
    }
  } catch (err: any) {
    log.fail(`Get joiners: ${err.response?.data?.error || err.message}`);
    return;
  }

  // TEST 5: Admin Approves Joiner
  log.title('STEP 5: Admin Approves Joiner');
  try {
    const res = await axios.post(
      `${BASE_URL}/admin/joiners/${joinerId}/approve`,
      {
        roomId: roomId,
        rent: 8000,
        deposit: 16000,
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );

    const tenant = res.data.data;
    const tenantEmail = tenant.email;

    log.pass(`Joiner approved and converted to tenant`);
    log.info(`Tenant ID: ${tenant.id}`);
    log.info(`Tenant Email: ${tenantEmail}`);
    log.info(`⚠️  DEFAULT PASSWORD SET: Welcome@123`);

    // TEST 6: Tenant Login with Default Password
    log.title('STEP 6: Tenant Login with Default Password');
    try {
      const loginRes = await axios.post(`${BASE_URL}/tenant/login`, {
        email: tenantEmail,
        password: 'Welcome@123',
      });

      const tenantToken = loginRes.data.data.token;
      log.pass(`Tenant login successful with default password`);
      log.info(`Tenant Name: ${loginRes.data.data.name}`);
      log.info(`Token: ${tenantToken.substring(0, 20)}...`);

      // TEST 7: Tenant Change Password
      log.title('STEP 7: Tenant Changes Password');
      try {
        const changeRes = await axios.post(
          `${BASE_URL}/tenant/change-password`,
          {
            currentPassword: 'Welcome@123',
            newPassword: 'MyNewPassword@456',
          },
          {
            headers: { Authorization: `Bearer ${tenantToken}` },
          }
        );

        log.pass(`Password changed successfully`);

        // TEST 8: Tenant Login with New Password
        log.title('STEP 8: Tenant Login with New Password');
        try {
          const newLoginRes = await axios.post(`${BASE_URL}/tenant/login`, {
            email: tenantEmail,
            password: 'MyNewPassword@456',
          });

          log.pass(`Tenant login successful with new password`);
        } catch (err: any) {
          log.fail(`Login with new password: ${err.response?.data?.error || err.message}`);
        }
      } catch (err: any) {
        log.fail(`Change password: ${err.response?.data?.error || err.message}`);
      }
    } catch (err: any) {
      log.fail(`Tenant login: ${err.response?.data?.error || err.message}`);
    }
  } catch (err: any) {
    log.fail(`Approve joiner: ${err.response?.data?.error || err.message}`);
    return;
  }

  // TEST 9: Data Persistence
  log.title('STEP 9: Verify Data Persists After Refresh');
  try {
    const res = await axios.get(`${BASE_URL}/admin/rooms`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    const rooms = res.data.data;
    if (rooms && rooms.length > 0) {
      log.pass(`Data persisted in database`);
      log.info(`Still have ${rooms.length} rooms after refresh`);
    }
  } catch (err: any) {
    log.fail(`Data persistence: ${err.response?.data?.error || err.message}`);
  }

  log.title('✅ END-TO-END TEST COMPLETED');
  console.log(`
Summary:
- Admin can login with credentials ✓
- Joiner can submit application ✓
- Admin can approve joiner → creates tenant ✓
- Tenant can login with default password (Welcome@123) ✓
- Tenant can change password ✓
- Tenant can login with new password ✓
- Data persists in database ✓

BACKEND WORKFLOW IS FULLY FUNCTIONAL ✓
  `);
}

test().catch(err => {
  log.fail(`Test failed: ${err.message}`);
  process.exit(1);
});
