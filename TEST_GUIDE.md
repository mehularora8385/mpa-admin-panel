# MPA Admin Panel - Complete Test Guide

## ✅ Login & Session Management

### Test Case 1: Login
- **Steps:**
  1. Go to login.html
  2. Enter Username: `Mehul2026`
  3. Enter Password: `Mehul@7300`
  4. Click Login

- **Expected Result:** ✅ Redirects to dashboard with session active

### Test Case 2: Logout
- **Steps:**
  1. Click "🚪 Logout" button in header
  2. Confirm logout in modal

- **Expected Result:** ✅ Redirects to login.html, session cleared

### Test Case 3: Session Timeout
- **Expected:** Auto-logout after 30 minutes of inactivity

---

## 📊 Dashboard Page

### Test Case 4: Load Dashboard Stats
- **Steps:**
  1. Login successfully
  2. Dashboard page loads automatically

- **Expected Result:** ✅ Shows:
  - Total Candidates (from API)
  - Biometric Captured (from API)
  - Operators Active (from API)
  - Centres Online (from API)

### Test Case 5: Centre-wise Data Table
- **Expected:** ✅ Displays table with:
  - Centre Code
  - Centre Name
  - Candidates count
  - Biometric Status (badge)
  - Operator Status (badge)
  - Last Sync Time

### Test Case 6: Export Dashboard to Excel
- **Steps:**
  1. Click "📥 Export to Excel" button
  2. Check downloads folder

- **Expected Result:** ✅ Downloads `dashboard-data.xlsx` with centre data

### Test Case 7: Sync Data
- **Steps:**
  1. Click "🔄 Sync Data" button
  2. Confirm action

- **Expected Result:** ✅ API call to `/api/sync/trigger`, success message shown

### Test Case 8: Logout All Operators
- **Steps:**
  1. Click "🚪 Logout All" button
  2. Confirm action

- **Expected Result:** ✅ API call to `/api/operators/logout-all`, all operators logged out

---

## 📝 Exams Management Page

### Test Case 9: Load Exams List
- **Steps:**
  1. Click "📝 EXAMS" in sidebar
  2. Wait for data to load

- **Expected Result:** ✅ Shows table with:
  - Exam Name
  - Code
  - Date
  - Candidates
  - Status (badge)
  - Edit/Delete buttons

### Test Case 10: Add Exam
- **Steps:**
  1. Click "➕ Add Exam" button
  2. Fill form:
     - Exam Name: "Test Exam"
     - Exam Code: "TE001"
     - Exam Date: Select date
     - Total Candidates: 100
     - Status: Active
  3. Click "Save"

- **Expected Result:** ✅ 
  - Modal closes
  - Success message shown
  - New exam appears in table
  - API POST to `/api/exams`

### Test Case 11: Delete Exam
- **Steps:**
  1. Click "Delete" button on any exam
  2. Confirm deletion

- **Expected Result:** ✅ 
  - Exam removed from table
  - API DELETE to `/api/exams/{id}`

### Test Case 12: Export Exams
- **Steps:**
  1. Click "📥 Export" button
  2. Check downloads

- **Expected Result:** ✅ Downloads `exams-data.xlsx`

---

## ⏰ Slots Management Page

### Test Case 13: Load Slots List
- **Steps:**
  1. Click "⏰ SLOTS" in sidebar

- **Expected Result:** ✅ Shows table with:
  - Exam
  - Date
  - Start Time
  - End Time
  - Capacity
  - Edit/Delete buttons

### Test Case 14: Add Slot
- **Steps:**
  1. Click "➕ Add Slot"
  2. Fill form:
     - Exam: Select exam
     - Slot Date: Select date
     - Start Time: 09:00
     - End Time: 11:00
     - Capacity: 50
  3. Click "Save"

- **Expected Result:** ✅ 
  - Slot added to table
  - API POST to `/api/slots`

### Test Case 15: Export Slots
- **Expected Result:** ✅ Downloads `slots-data.xlsx`

---

## 🏢 Centres Management Page

### Test Case 16: Load Centres List
- **Steps:**
  1. Click "🏢 CENTRES" in sidebar

- **Expected Result:** ✅ Shows table with:
  - Code
  - Name
  - Location
  - Contact
  - Status
  - Edit/Delete buttons

### Test Case 17: Add Centre
- **Steps:**
  1. Click "➕ Add Centre"
  2. Fill form:
     - Centre Name: "Centre A"
     - Centre Code: "CA001"
     - Location: "City Name"
     - Contact: "9876543210"
     - Email: "centre@example.com"
     - Status: Active
  3. Click "Save"

- **Expected Result:** ✅ 
  - Centre added to table
  - API POST to `/api/centres`

### Test Case 18: Export Centres
- **Expected Result:** ✅ Downloads `centres-data.xlsx`

---

## 👤 Operators Management Page

### Test Case 19: Load Operators List
- **Steps:**
  1. Click "👤 OPERATORS" in sidebar

- **Expected Result:** ✅ Shows table with:
  - Name
  - ID
  - Email
  - Centre
  - Status
  - Edit/Delete buttons

### Test Case 20: Add Operator
- **Steps:**
  1. Click "➕ Add Operator"
  2. Fill form:
     - Operator Name: "John Doe"
     - Operator ID: "OP001"
     - Email: "john@example.com"
     - Phone: "9876543210"
     - Centre: Select centre
     - Status: Active
  3. Click "Save"

- **Expected Result:** ✅ 
  - Operator added to table
  - API POST to `/api/operators`

### Test Case 21: Export Operators
- **Expected Result:** ✅ Downloads `operators-data.xlsx`

---

## 👥 Candidates Management Page

### Test Case 22: Load Candidates List
- **Steps:**
  1. Click "👥 CANDIDATES" in sidebar

- **Expected Result:** ✅ Shows table with:
  - Name
  - Roll Number
  - Email
  - Exam
  - Biometric Status
  - Edit/Delete buttons

### Test Case 23: Add Candidate
- **Steps:**
  1. Click "➕ Add Candidate"
  2. Fill form:
     - Candidate Name: "Jane Smith"
     - Roll Number: "12345"
     - Email: "jane@example.com"
     - Exam: Select exam
     - Centre: Select centre
     - Biometric Status: Pending
  3. Click "Save"

- **Expected Result:** ✅ 
  - Candidate added to table
  - API POST to `/api/candidates`

### Test Case 24: Export Candidates
- **Expected Result:** ✅ Downloads `candidates-data.xlsx`

---

## 📋 Reports Page

### Test Case 25: Load Reports
- **Steps:**
  1. Click "📋 REPORTS" in sidebar

- **Expected Result:** ✅ Shows:
  - Total Candidates
  - Biometric Captured
  - Biometric Verified
  - Pending Verification
  - Success Rate (%)

### Test Case 26: Export Reports as PDF
- **Steps:**
  1. Click "📄 Export as PDF"
  2. Check downloads

- **Expected Result:** ✅ Downloads PDF file with reports data

### Test Case 27: Export Reports as Excel
- **Steps:**
  1. Click "📥 Export as Excel"
  2. Check downloads

- **Expected Result:** ✅ Downloads `reports-data.xlsx`

---

## 🔍 Search & Filter Functionality

### Test Case 28: Search in Exams
- **Steps:**
  1. Go to Exams page
  2. Type in search box: "Exam A"

- **Expected Result:** ✅ Table filters to show matching exams

### Test Case 29: Filter Dashboard by Exam
- **Steps:**
  1. Go to Dashboard
  2. Select exam from "Exam-wise Filtering" dropdown

- **Expected Result:** ✅ Dashboard data updates for selected exam

---

## 🛡️ Error Handling

### Test Case 30: Backend Connection Error
- **Steps:**
  1. Stop backend API
  2. Try to load any page

- **Expected Result:** ✅ Shows error message: "Error loading data from backend"

### Test Case 31: Invalid Session
- **Steps:**
  1. Clear localStorage
  2. Refresh page

- **Expected Result:** ✅ Redirects to login.html

---

## 📱 Responsive Design

### Test Case 32: Mobile View
- **Steps:**
  1. Open DevTools (F12)
  2. Toggle device toolbar (mobile view)
  3. Navigate all pages

- **Expected Result:** ✅ All pages responsive and usable on mobile

### Test Case 33: Tablet View
- **Steps:**
  1. Set viewport to tablet size
  2. Check all pages

- **Expected Result:** ✅ All pages properly formatted for tablet

---

## ⚡ Performance

### Test Case 34: Page Load Time
- **Expected:** ✅ Dashboard loads in < 3 seconds

### Test Case 35: Export Performance
- **Expected:** ✅ Excel export completes in < 5 seconds

---

## 🎯 Summary

**Total Test Cases:** 35

**Categories:**
- Login/Session: 3 tests
- Dashboard: 8 tests
- Exams: 4 tests
- Slots: 3 tests
- Centres: 3 tests
- Operators: 3 tests
- Candidates: 3 tests
- Reports: 3 tests
- Search/Filter: 2 tests
- Error Handling: 2 tests
- Responsive: 2 tests
- Performance: 2 tests

**Status:** ✅ All tests ready for execution

---

## 🚀 Deployment Checklist

- [ ] All pages tested locally
- [ ] Backend API endpoints verified
- [ ] Export functionality working
- [ ] Session management working
- [ ] Error handling implemented
- [ ] Mobile responsive verified
- [ ] Files pushed to GitHub
- [ ] Deployed to AWS S3
- [ ] CloudFront cache invalidated
- [ ] Live URL tested

---

**Last Updated:** 2026-01-09  
**Version:** 1.0.0  
**Status:** Ready for Production
