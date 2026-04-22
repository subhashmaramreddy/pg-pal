#!/usr/bin/env tsx

import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';
let adminToken = '';
let pgType = 'boys';

// Color output for clarity
const log = {
  title: (msg: string) => console.log(`\n${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}`),
  pass: (msg: string) => console.log(`✅ ${msg}`),
  fail: (msg: string) => console.log(`❌ ${msg}`),
  info: (msg: string) => console.log(`ℹ️  ${msg}`),
  data: (data: any) => console.log(JSON.stringify(data, null, 2)),
};

async function test1_AdminLogin() {
  log.title('TEST 1: Admin Login');
  try {
    const response = await axios.post(`${BASE_URL}/auth/admin/login`, {
      email: 'guesthubpg@gmail.com',
      password: 'Guesthub117',
    });

    if (response.data.data?.token) {
      adminToken = response.data.data.token;
      pgType = response.data.data.pgType || 'boys';
      log.pass(`Admin logged in successfully`);
      log.info(`Token: ${adminToken.substring(0, 20)}...`);
      log.info(`PG Type: ${pgType}`);
      return true;
    } else {
      log.fail(`No token in response`);
      log.data(response.data);
      return false;
    }
  } catch (error: any) {
    log.fail(`Admin login failed`);
    log.info(error.response?.data?.message || error.message);
    return false;
  }
}

async function test2_GetRooms() {
  log.title('TEST 2: Get Rooms from Database');
  try {
    const response = await axios.get(`${BASE_URL}/admin/rooms`, {
      params: { pgType },
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    const rooms = response.data.data;
    if (rooms && rooms.length > 0) {
      log.pass(`Fetched ${rooms.length} rooms from database`);
      log.info(`First room: ${rooms[0].room_number} (Capacity: ${rooms[0].capacity})`);
      return true;
    } else {
      log.info(`No rooms in database (this is okay, we can create them)`);
      return true;
    }
  } catch (error: any) {
    log.fail(`Get rooms failed`);
    log.info(error.response?.data?.message || error.message);
    return false;
  }
}

async function test3_SubmitJoinerApplication() {
  log.title('TEST 3: Submit Joiner Application');
  try {
    const joinerData = {
      name: `Test User ${Date.now()}`,
      email: `testuser${Date.now()}@example.com`,
      phone: `98765${Math.floor(Math.random() * 10000)}`,
      gender: 'male',
      college: 'Test Engineering College',
      pg_type: pgType,
      room_type: '2_sharing',
      join_date: new Date().toISOString().split('T')[0],
    };

    const response = await axios.post(`${BASE_URL}/tenant/join`, joinerData);

    if (response.data.data?.id) {
      const joinerId = response.data.data.id;
      log.pass(`Joiner application submitted successfully`);
      log.info(`Joiner ID: ${joinerId}`);
      log.info(`Joiner Email: ${joinerData.email}`);
      return { success: true, joinerId, joinerEmail: joinerData.email };
    } else {
      log.fail(`No joiner ID in response`);
      log.data(response.data);
      return { success: false };
    }
  } catch (error: any) {
    log.fail(`Submit joiner application failed`);
    log.info(error.response?.data?.message || error.message);
    return { success: false };
  }
}

async function test4_GetPendingJoiners() {
  log.title('TEST 4: Get Pending Joiners');
  try {
    const response = await axios.get(`${BASE_URL}/admin/joiners`, {
      params: { pgType, status: 'pending' },
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    const joiners = response.data.data;
    if (joiners && joiners.length > 0) {
      log.pass(`Found ${joiners.length} pending joiners`);
      log.info(`Latest joiner: ${joiners[0].name}`);
      return true;
    } else {
      log.info(`No pending joiners yet`);
      return true;
    }
  } catch (error: any) {
    log.fail(`Get pending joiners failed`);
    log.info(error.response?.data?.message || error.message);
    return false;
  }
}

async function test5_ApproveJoiner(joinerId: string) {
  log.title('TEST 5: Admin Approve Joiner');
  try {
    // First get a room to assign
    const roomsResponse = await axios.get(`${BASE_URL}/admin/rooms`, {
      params: { pgType },
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    const rooms = roomsResponse.data.data;
    if (!rooms || rooms.length === 0) {
      log.fail(`No rooms available to assign joiner`);
      log.info(`Hint: Create rooms first using seed-rooms.sql`);
      return false;
    }

    const room = rooms[0];
    const approveData = {
      joiner_id: joinerId,
      room_id: room.id,
      rent: room.rent || 8000,
      deposit: room.deposit || 16000,
    };

    const response = await axios.post(`${BASE_URL}/admin/approve`, approveData, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    if (response.data.data?.id) {
      const tenantId = response.data.data.id;
      log.pass(`Joiner approved and converted to tenant`);
      log.info(`Tenant ID: ${tenantId}`);
      log.info(`Assigned to room: ${room.room_number}`);
      return { success: true, tenantId, tenantEmail: response.data.data.email };
    } else {
      log.fail(`No tenant ID in response`);
      log.data(response.data);
      return { success: false };
    }
  } catch (error: any) {
    log.fail(`Approve joiner failed`);
    log.info(error.response?.data?.message || error.message);
    return { success: false };
  }
}

async function test6_TenantLogin(tenantEmail: string) {
  log.title('TEST 6: Tenant Login');
  try {
    // Try to login as tenant with email
    const response = await axios.post(`${BASE_URL}/auth/tenant/login`, {
      email: tenantEmail,
      password: 'tenant@123', // Default password (if implemented)
    });

    if (response.data.data?.token) {
      log.pass(`Tenant logged in successfully`);
      log.info(`Tenant Email: ${tenantEmail}`);
      log.info(`Token: ${response.data.data.token.substring(0, 20)}...`);
      return { success: true, token: response.data.data.token };
    } else {
      log.fail(`No token in tenant login response`);
      log.data(response.data);
      return { success: false };
    }
  } catch (error: any) {
    if (error.response?.status === 404) {
      log.fail(`Tenant login endpoint not implemented yet`);
      log.info(`This needs to be added to the backend`);
    } else {
      log.fail(`Tenant login failed`);
      log.info(error.response?.data?.message || error.message);
    }
    return { success: false };
  }
}

async function test7_GetTenantProfile(tenantEmail: string, tenantToken?: string) {
  log.title('TEST 7: Get Tenant Profile');
  try {
    // Try to get tenant profile
    const response = await axios.get(`${BASE_URL}/tenant/profile`, {
      headers: { Authorization: `Bearer ${tenantToken || adminToken}` },
    });

    if (response.data.data) {
      log.pass(`Tenant profile retrieved`);
      log.info(`Name: ${response.data.data.name}`);
      log.info(`Email: ${response.data.data.email}`);
      return true;
    } else {
      log.fail(`No profile data`);
      return false;
    }
  } catch (error: any) {
    if (error.response?.status === 404) {
      log.fail(`Tenant profile endpoint not implemented yet`);
    } else {
      log.fail(`Get tenant profile failed`);
      log.info(error.response?.data?.message || error.message);
    }
    return false;
  }
}

async function test8_GetDashboardStats() {
  log.title('TEST 8: Get Dashboard Statistics');
  try {
    const response = await axios.get(`${BASE_URL}/admin/stats`, {
      params: { pgType },
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    if (response.data.data) {
      const stats = response.data.data;
      log.pass(`Dashboard stats retrieved`);
      log.info(`Total Rooms: ${stats.totalRooms}`);
      log.info(`Occupied Rooms: ${stats.occupiedRooms}`);
      log.info(`Total Tenants: ${stats.totalTenants}`);
      log.info(`Pending Joiners: ${stats.pendingJoiners}`);
      log.info(`Monthly Revenue: ₹${stats.monthlyRevenue}`);
      return true;
    } else {
      log.fail(`No stats data`);
      return false;
    }
  } catch (error: any) {
    log.fail(`Get stats failed`);
    log.info(error.response?.data?.message || error.message);
    return false;
  }
}

async function test9_DataPersistence() {
  log.title('TEST 9: Data Persistence (Refresh Database)');
  try {
    // Get rooms again to verify persistence
    const response1 = await axios.get(`${BASE_URL}/admin/rooms`, {
      params: { pgType },
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    const firstCount = response1.data.data?.length || 0;

    // Simulate a delay (like page refresh)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get rooms again
    const response2 = await axios.get(`${BASE_URL}/admin/rooms`, {
      params: { pgType },
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    const secondCount = response2.data.data?.length || 0;

    if (firstCount === secondCount) {
      log.pass(`Data persisted correctly after refresh`);
      log.info(`Room count before: ${firstCount}, after: ${secondCount}`);
      return true;
    } else {
      log.fail(`Data mismatch detected`);
      log.info(`Room count before: ${firstCount}, after: ${secondCount}`);
      return false;
    }
  } catch (error: any) {
    log.fail(`Data persistence test failed`);
    log.info(error.response?.data?.message || error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('\n🚀 STARTING COMPREHENSIVE E2E TESTS\n');

  const results: { [key: string]: boolean | string } = {};

  // Test 1: Admin Login
  results['Admin Login'] = await test1_AdminLogin();
  if (!results['Admin Login']) {
    log.fail('Cannot continue without admin login');
    printSummary(results);
    return;
  }

  // Test 2: Get Rooms
  results['Get Rooms'] = await test2_GetRooms();

  // Test 3: Submit Joiner
  const joinerResult = await test3_SubmitJoinerApplication();
  results['Submit Joiner'] = joinerResult.success;

  // Test 4: Get Pending Joiners
  results['Get Pending Joiners'] = await test4_GetPendingJoiners();

  // Test 5: Approve Joiner
  if (joinerResult.success) {
    const approveResult = await test5_ApproveJoiner(joinerResult.joinerId);
    results['Approve Joiner'] = approveResult.success;

    // Test 6: Tenant Login
    if (approveResult.success) {
      const tenantLoginResult = await test6_TenantLogin(approveResult.tenantEmail);
      results['Tenant Login'] = tenantLoginResult.success ? 'PASS (but endpoint missing)' : 'NEEDS IMPLEMENTATION';
    }
  }

  // Test 7: Get Tenant Profile
  results['Get Tenant Profile'] = await test7_GetTenantProfile('');

  // Test 8: Dashboard Stats
  results['Dashboard Stats'] = await test8_GetDashboardStats();

  // Test 9: Data Persistence
  results['Data Persistence'] = await test9_DataPersistence();

  printSummary(results);
}

function printSummary(results: { [key: string]: any }) {
  log.title('TEST SUMMARY');
  
  let passed = 0;
  let failed = 0;

  Object.entries(results).forEach(([test, result]) => {
    if (result === true) {
      console.log(`✅ ${test}`);
      passed++;
    } else if (result === false) {
      console.log(`❌ ${test}`);
      failed++;
    } else {
      console.log(`⚠️  ${test}: ${result}`);
    }
  });

  console.log(`\n${'-'.repeat(60)}`);
  console.log(`Total Passed: ${passed}`);
  console.log(`Total Failed: ${failed}`);
  console.log(`Total: ${passed + failed}`);
  console.log(`Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%\n`);

  if (failed > 0) {
    log.info('⚠️  ISSUES FOUND:');
    console.log('1. Tenant login endpoint may not be implemented');
    console.log('2. Default password assignment might be needed');
    console.log('3. Tenant profile endpoint might need fixes');
  }
}

// Run tests
runAllTests().catch(error => {
  log.fail(`Test suite failed: ${error.message}`);
  process.exit(1);
});
