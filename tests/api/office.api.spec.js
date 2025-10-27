const { test, expect, request } = require('@playwright/test');
const LoginPage = require('../../pages/common/LoginPage');
const { performLogin } = require('../../utils/loginHelper');
const loginData = require('../../fixtures/loginData.json');

const BASE_URL = 'https://exolutusv2.exoerp.com';
const CREATE_OFFICE_API = `${BASE_URL}/api/services/app/Offices/CreateOrEdit`;
const GET_ALL_OFFICES_API = `${BASE_URL}/api/services/app/Offices/GetAll`;
const DELETE_OFFICE_API = `${BASE_URL}/api/services/app/Offices/Delete`;
const GET_CURRENT_USER_API = `${BASE_URL}/api/services/app/Session/GetCurrentLoginInformations`;

test.use({ ignoreHTTPSErrors: true }); // accept self-signed certs if present

test.describe('Office API — simple create using UI session', () => {
  let apiContext;
  let xsrfToken;

  test.beforeEach(async ({ browser }) => {
    // 1) Open browser and log in (reuses your existing helper)
    const page = await browser.newPage();
    const loginPage = new LoginPage(page);
    await page.goto(BASE_URL);
    await performLogin(loginPage, loginData.admin);
    console.log('Logged in via UI');

    // 2) Grab XSRF cookie and browser storage state (in-memory)
    const cookies = await page.context().cookies();
    xsrfToken = cookies.find(c => c.name === 'XSRF-TOKEN')?.value ?? null;
    const storage = await page.context().storageState(); // { cookies, origins }
    await page.close();

    // 3) Create API context that reuses the logged-in session
    apiContext = await request.newContext({
      ignoreHTTPSErrors: true,
      storageState: storage
    });

    // 4) Quick session check
    const session = await apiContext.get(GET_CURRENT_USER_API);
    const sessionJson = await session.json();
    console.log('Session user:', sessionJson.result.user.userName);
  });

  test('Create Office via API', async () => {
    const officeData = {
      officeName: `API Office`,
      parentOfficeId: '1002',
      officeStartTime: '09:00:00',
      officeEndTime: '17:00:00',
      breakStartTime: '13:00:00',
      breakEndTime: '14:00:00',
      workingDaysPerMonth: '22.000',
      workingHours: '8.000',
      weekendDays: [4115, 4121],
      officeStatusListItemId: '7'
    };

    // 5) Call the API with XSRF header if we found one
    const headers = { 'Content-Type': 'application/json' };
    if (xsrfToken) headers['X-XSRF-TOKEN'] = xsrfToken;

    const createResp = await apiContext.post(CREATE_OFFICE_API, { data: officeData, headers });
    console.log(' Create status:', createResp.status());

    const createJson = await createResp.json();
    expect(createJson.success).toBeTruthy();
    console.log(' Created office:', officeData.officeName);

    // Step 2: Verify in GetAll list
    console.log(' Verifying created office via GetAll...');
    const getAllResp = await apiContext.get(GET_ALL_OFFICES_API);
    expect(getAllResp.ok()).toBeTruthy();

    const allJson = await getAllResp.json();
    const officeList = allJson.result.items.map(i => i.office.officeName);
    const found = officeList.includes(officeData.officeName);

    // Step 3: Assert office is present
    expect(found).toBeTruthy();
    console.log(` Verified: "${officeData.officeName}" found in GetAll list.`);
  });

  test('Edit existing Office via API', async () => {
    // 🧠 Step 1: Choose an existing office ID to edit
    // You can hardcode one, or fetch it dynamically using GetAll API.
    const existingOfficeId = 3018; // example ID — replace with a real one
  
    // 🧠 Step 2: Prepare updated data
    const updatedOfficeData = {
      id: existingOfficeId, // ✅ required for edit
      officeName: `Updated Office`,
      parentOfficeId: '1002',
      officeStartTime: '09:30:00',
      officeEndTime: '17:30:00',
      breakStartTime: '13:00:00',
      breakEndTime: '14:00:00',
      workingDaysPerMonth: '22.000',
      workingHours: '8.000',
      weekendDays: [4115, 4121],
      officeStatusListItemId: '7'
    };
  
    // 🧠 Step 3: Send request (same endpoint as create)
   // 5) Call the API with XSRF header if we found one
   const headers = { 'Content-Type': 'application/json' };
   if (xsrfToken) headers['X-XSRF-TOKEN'] = xsrfToken;
  
    console.log('✏️ Editing Office...');
    const editResp = await apiContext.post(CREATE_OFFICE_API, { data: updatedOfficeData, headers });
    expect(editResp.ok()).toBeTruthy();

    const editJson = await editResp.json();
    expect(editJson.success).toBeTruthy();
    console.log(' Edited Office Name:', updatedOfficeData.officeName);

    // 3️⃣ Verify via GetAll
    console.log(' Verifying edited office...');
    const getAllResp = await apiContext.get(GET_ALL_OFFICES_API);
    expect(getAllResp.ok()).toBeTruthy();

    const allJson = await getAllResp.json();
    const officeList = allJson.result.items.map(i => i.office.officeName);
    const found = officeList.includes(updatedOfficeData.officeName);

    expect(found).toBeTruthy();
    console.log(` Verified updated office: "${updatedOfficeData.officeName}" found in GetAll.`);
  });

  test('Delete office by ID if it exists', async () => {
    const headers = { 'Content-Type': 'application/json' };
    if (xsrfToken) headers['X-XSRF-TOKEN'] = xsrfToken;

    const officeId = 3018; // ID to delete

    // Step 1: Check if office exists in GetAll list
    const getAllResp = await apiContext.get(GET_ALL_OFFICES_API);
    const allJson = await getAllResp.json();
    const officeList = allJson.result.items;
    const officeItem = officeList.find(o => o.office.id === officeId);

    if (!officeItem) {
      console.log(` Office ID ${officeId} not found. Nothing to delete.`);
      return;
    }

    console.log(` Office found: "${officeItem.office.officeName}" — proceeding to delete.`);

    // Step 2: Delete the office
    const deleteResp = await apiContext.delete(`${DELETE_OFFICE_API}?id=${officeId}`, { headers });
    const deleteJson = await deleteResp.json();
    expect(deleteJson.success).toBeTruthy();
    console.log(' Deleted office ID:', officeId);

    // Step 3: Verify deletion
    const verifyResp = await apiContext.get(GET_ALL_OFFICES_API);
    const verifyJson = await verifyResp.json();
    const stillExists = verifyJson.result.items.some(o => o.office.id === officeId);
    expect(stillExists).toBeFalsy();
    console.log(' Verified office deleted:', officeItem.office.officeName);
  });

  test('Search office by term (all columns, safe)', async () => {
    const headers = { 'Content-Type': 'application/json' };
    if (xsrfToken) headers['X-XSRF-TOKEN'] = xsrfToken;
  
    const searchTerm = 'office';
    const searchResp = await apiContext.get(`${GET_ALL_OFFICES_API}?filter=${encodeURIComponent(searchTerm)}`, { headers });
    expect(searchResp.ok()).toBeTruthy();
  
    const searchJson = await searchResp.json();
    const items = searchJson.result.items;
  
    if (items.length === 0) {
      console.warn(`⚠️ No offices returned for search term: "${searchTerm}". Could be backend filtering or permissions.`);
    } else {
      console.log(`✅ Found ${items.length} offices matching search term "${searchTerm}"`);
  
      items.forEach(i => {
        const office = i.office;
        const searchTermLower = searchTerm.toLowerCase();

        const matches =
          (office.officeName && office.officeName.toLowerCase().includes(searchTermLower)) ||
          (office.officeStartTime && office.officeStartTime.toLowerCase().includes(searchTermLower)) ||
          (office.officeEndTime && office.officeEndTime.toLowerCase().includes(searchTermLower)) ||
          (office.workingDaysPerMonth != null && office.workingDaysPerMonth.toString().includes(searchTermLower)) ||
          (office.workingHours != null && office.workingHours.toString().includes(searchTermLower)) ||
          (office.breakStartTime && office.breakStartTime.toLowerCase().includes(searchTermLower)) ||
          (office.breakEndTime && office.breakEndTime.toLowerCase().includes(searchTermLower))||
          (office.parentOfficeName&& office.parentOfficeName.toLowerCase().includes(searchTermLower))||
          (office.status && office.status.toLowerCase().includes(searchTermLower));
        
  
        console.log(` - ${office.officeName}: ${matches ? '✅ matches' : '❌ no match in columns'}`);
        expect(matches).toBeTruthy(); // fails only if a returned item doesn't match
      });
    }
  });
  test('Verify sorting of Offices for multiple columns (asc & desc)', async () => {
    const headers = { 'Content-Type': 'application/json' };
    if (xsrfToken) headers['X-XSRF-TOKEN'] = xsrfToken;
  
    // ✅ Map of API sort keys → actual JSON response field keys
    const columns = {
      officeName: 'officeName',
      officeStartTime: 'officeStartTime',
      officeEndTime: 'officeEndTime',
      workingDaysPerMonth: 'workingDaysPerMonth',
      workingHours: 'workingHours',
      parentOfficeName: 'parentOfficeName',
      officeStatus: 'status' // 🩵 API key vs. JSON key
    };
  
    for (const [apiColumn, jsonKey] of Object.entries(columns)) {
      console.log(`\n Checking sorting for column: ${apiColumn}`);
  
      // 1️⃣ Ascending order check
      const ascResp = await apiContext.get(
        `${GET_ALL_OFFICES_API}?filter=&sorting=${apiColumn} asc&skipCount=0&maxResultCount=50`,
        { headers }
      );
      expect(ascResp.ok()).toBeTruthy();
  
      const ascJson = await ascResp.json();
      const ascValues = ascJson.result.items.map(i => {
        const val = i.office[jsonKey] ?? '';
        return typeof val === 'string' ? val.trim().toLowerCase() : val.toString();
      });
  
      const isAscSorted = ascValues.every((v, i, arr) => i === 0 || arr[i - 1] <= v);
      console.log(` Ascending ${jsonKey}:`, ascValues);
      expect(isAscSorted).toBeTruthy();
      console.log(` Verified ascending sorting for: ${apiColumn}`);
  
      // 2️⃣ Descending order check
      const descResp = await apiContext.get(
        `${GET_ALL_OFFICES_API}?filter=&sorting=${apiColumn} desc&skipCount=0&maxResultCount=50`,
        { headers }
      );
      expect(descResp.ok()).toBeTruthy();
  
      const descJson = await descResp.json();
      const descValues = descJson.result.items.map(i => {
        const val = i.office[jsonKey] ?? '';
        return typeof val === 'string' ? val.trim().toLowerCase() : val.toString();
      });
  
      const isDescSorted = descValues.every((v, i, arr) => i === 0 || arr[i - 1] >= v);
      console.log(` Descending ${jsonKey}:`, descValues);
      expect(isDescSorted).toBeTruthy();
      console.log(` Verified descending sorting for: ${apiColumn}`);
    }
  
    console.log('\n All column sorting checks completed successfully.');
  }); 
  
  test('Verify duplicate office name validation', async () => {
    const headers = { 'Content-Type': 'application/json' };
    if (xsrfToken) headers['X-XSRF-TOKEN'] = xsrfToken;
  
    // Use an existing office name in your system
    const existingOfficeName = 'Test Office'; // 
  
    // Step 1️⃣ — Try to create an office with the same name
    const createData = {
      officeName: existingOfficeName,
      parentOfficeId: '1002',
      officeStartTime: '09:00:00',
      officeEndTime: '17:00:00',
      breakStartTime: '13:00:00',
      breakEndTime: '14:00:00',
      workingDaysPerMonth: '22.000',
      workingHours: '8.000',
      weekendDays: [4115, 4121],
      officeStatusListItemId: '7'
    };
  
    const response = await apiContext.post(CREATE_OFFICE_API, { headers, data: createData });
    expect(response.status()).toBe(500);
  
    const json = await response.json();
  
    // Step 2️⃣ — Verify API returned duplicate error
    expect(json.success).toBeFalsy();
    expect(json.error?.message).toMatch(/office name already exists/i);
    console.log('✅ Verified duplicate office name validation');
  });
  test.only('Advanced filter offices for all fields via API', async () => {
    const headers = { 'Content-Type': 'application/json' };
    if (xsrfToken) headers['X-XSRF-TOKEN'] = xsrfToken;
  
    // 1️⃣ Define all filter fields (use actual values for testing)
    const filters = {
      officeNameFilter: '',        // filter by office name
      maxOfficeStartTimeFilter: '09:00:00',
      minOfficeStartTimeFilter: '',
      maxOfficeEndTimeFilter: '',
      minOfficeEndTimeFilter: '',
      maxWorkingDaysPerMonthFilter: '',
      minWorkingDaysPerMonthFilter: '',
      maxWorkingHoursFilter: '',
      minWorkingHoursFilter: '',
      officeOfficeNameFilter: '',       // can be empty if not testing
      listItemListItemNameFilter: ''
    };
  
    // 2️⃣ Build query string dynamically
    const query = Object.entries(filters)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&');
    console.log("Query is: ",query);
  
    // 3️⃣ Call API
    const resp = await apiContext.get(`${GET_ALL_OFFICES_API}?${query}&skipCount=0&maxResultCount=50`, { headers });
    expect(resp.ok()).toBeTruthy();
  
    const data = await resp.json();
    const items = data.result.items;
    console.log(`🔍 Found ${items.length} offices matching advanced filter`);
  
    // 4️⃣ Verify each returned office against non-empty filters
    items.forEach(i => {
      const office = i.office;
  
      if (filters.officeNameFilter) 
        expect(office.officeName.toLowerCase()).toContain(filters.officeNameFilter.toLowerCase());
  
      if (filters.minOfficeStartTimeFilter)
        expect(office.officeStartTime >= filters.minOfficeStartTimeFilter).toBeTruthy();
  
      if (filters.maxOfficeStartTimeFilter)
        expect(office.officeStartTime <= filters.maxOfficeStartTimeFilter).toBeTruthy();
  
      if (filters.minOfficeEndTimeFilter)
        expect(office.officeEndTime >= filters.minOfficeEndTimeFilter).toBeTruthy();
  
      if (filters.maxOfficeEndTimeFilter)
        expect(office.officeEndTime <= filters.maxOfficeEndTimeFilter).toBeTruthy();
  
      if (filters.minWorkingDaysPerMonthFilter)
        expect(Number(office.workingDaysPerMonth) >= Number(filters.minWorkingDaysPerMonthFilter)).toBeTruthy();
  
      if (filters.maxWorkingDaysPerMonthFilter)
        expect(Number(office.workingDaysPerMonth) <= Number(filters.maxWorkingDaysPerMonthFilter)).toBeTruthy();
  
      if (filters.minWorkingHoursFilter)
        expect(Number(office.workingHours) >= Number(filters.minWorkingHoursFilter)).toBeTruthy();
  
      if (filters.maxWorkingHoursFilter)
        expect(Number(office.workingHours) <= Number(filters.maxWorkingHoursFilter)).toBeTruthy();
  
      if (filters.listItemListItemNameFilter)
        expect(office.status.toLowerCase()).toContain(filters.listItemListItemNameFilter.toLowerCase());
    });
  
    console.log('✅ Advanced filter verified for all columns');
  });
  
});


  
