# MPA Biometric Admin Panel

A comprehensive admin panel for the MPA (Mehul Project Application) Biometric Verification System built with JavaScript, HTML, and CSS.

## 📋 Features

### Dashboard
- **Exam-wise Filtering:** Filter statistics by selected exam
- **Statistics Cards:**
  - Total Candidates
  - Biometric Captured
  - Operators Active
  - Centres Online
- **Centre-wise Data Table:** View all centres with biometric and operator status

### Exams Management
- **Create Exam:** Add new exams to the system
- **Edit Exam:** Modify existing exam details
- **Exam Control:** Activate/Stop exams, Create/Edit/Upload exam data
- **Mock Control:** Manage mock exam settings
- **Dashboard:** View exam-specific dashboards

### Slots Management
- **Time-wise Slot Allocation:** View exam slots organized by time
- **Exam-wise Filtering:** Filter slots by selected exam
- **Slot Details:** See candidate count and slot status

### Centres Management
- **Centre-wise Data Distribution:** View all exam centres
- **Centre Information:** Code, Name, State, District, Exams, Candidates, Operators
- **Search & Filter:** Search centres and filter by exam
- **Export:** Download centre data to Excel

### Operators Management
- **Operator List:** View all operators with their details
- **Exam & Centre Filtering:** Filter operators by exam and centre
- **Operator Status:** See operator activity status and last check time
- **Search:** Search operators by name or ID

### Candidates Management
- **All 10 Fields Display:**
  - OMR No.
  - Roll No.
  - Candidate Name
  - Father Name
  - Date of Birth
  - Centre Code
  - Upload Photo (clickable link)
  - Verified Photo (clickable link)
  - Fingerprint (clickable link)
  - Face Match %
  - Status (Verified/Pending/Not Verified)

- **Advanced Filtering:**
  - Filter by Exam
  - Filter by Centre
  - Filter by Status (Present/Verification)
  - Search by candidate details

- **Export:** Download candidate data to Excel format

### Reports
- **Biometric Status Report:** Download biometric capture status
- **All Candidate Data:** Export complete candidate information
- **Multiple Formats:** Excel and CSV export options

## 🛠️ Technology Stack

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Data Export:** XLSX library (for Excel export)
- **Styling:** Custom CSS with responsive design
- **UI Components:** Interactive tables, modals, dropdowns, badges

## 📁 File Structure

```
mpa-admin-panel/
├── index.html          # Main admin panel HTML file
├── README.md           # This file
└── assets/             # (Optional) Images, icons, etc.
```

## 🚀 Deployment

### AWS S3 Static Hosting
The admin panel is deployed on AWS S3 and accessible at:
```
https://sepl-admin-portal.s3.ap-south-1.amazonaws.com/index.html
```

### Local Development
Simply open `index.html` in a web browser:
```bash
open index.html
# or
firefox index.html
# or
google-chrome index.html
```

## 📊 Data Structure

### Candidate Object
```javascript
{
  omr_number: "11000001",
  roll_number: "11000001",
  name: "Candidate 1",
  father_name: "Father 1",
  dob: "1995-05-15",
  exam_id: "exam_a",
  centre_id: "C0001",
  upload_photo: "yes",
  verified_photo: "yes",
  fingerprint: "yes",
  face_match: 98.5,
  status: "Verified"
}
```

### Exam Object
```javascript
{
  exam_id: "exam_a",
  exam_name: "Exam A",
  status: "Active",
  date: "2025-01-15",
  slots: 3,
  total_candidates: 260
}
```

## 🔧 Configuration

### Header Exam Selection
Select an exam from the header dropdown to filter all dashboard data by that exam:
```
Select Exam → Exam A / Exam B / Mock Exam 1
```

### Filters
Each section has specific filters:
- **Dashboard:** Exam-wise filtering
- **Candidates:** Exam, Centre, Status, Search
- **Operators:** Exam, Centre, Search
- **Centres:** Exam filtering
- **Slots:** Exam selection

## 📥 Export Functions

### Download Candidates
Export filtered candidate data to Excel with all 10 fields:
```
Button: 📥 Download Candidates
Format: .xlsx (Excel)
```

### Export Centre Data
Export centre information to Excel:
```
Button: 📥 Export to Excel
Format: .xlsx (Excel)
```

### Generate Reports
Download various reports:
- Biometric Status Report (.xlsx / .csv)
- All Candidate Data (.xlsx / .csv)

## 🔐 Security Features

- **Session Management:** Logout All / Logout buttons
- **Data Sync:** Real-time data synchronization with backend
- **Status Indicators:** Visual feedback for all operations

## 🎨 UI/UX Features

- **Responsive Design:** Works on desktop and tablet devices
- **Color-coded Status:** Visual indicators for candidate status
- **Interactive Tables:** Sortable and filterable data
- **Modal Dialogs:** For exam creation and editing
- **Search Functionality:** Quick search across all tables
- **Export Options:** Multiple format support (Excel, CSV)

## 📱 Browser Compatibility

- Chrome/Chromium (Latest)
- Firefox (Latest)
- Safari (Latest)
- Edge (Latest)

## 🐛 Known Issues

- Backend API connectivity may require CORS configuration
- Some features require backend API integration
- Offline functionality not yet implemented

## 📝 Version History

### v1.0.0 (January 8, 2026)
- Initial release
- All 10 candidate fields implemented
- Complete exam management
- Centre and operator management
- Advanced filtering and search
- Excel export functionality

## 👤 Author

**Mehul Arora**
- GitHub: [@mehularora8385](https://github.com/mehularora8385)
- Email: mehularora8385@gmail.com

## 📄 License

This project is part of the MPA (Mehul Project Application) system.

## 🔗 Related Repositories

- [mpa-mobile-app](https://github.com/mehularora8385/mpa-mobile-app) - React Native mobile application
- [mpa-backend](https://github.com/mehularora8385/mpa-backend) - Express.js backend API

## 📞 Support

For issues or questions, please contact the project owner or create an issue in the GitHub repository.

---

**Last Updated:** January 8, 2026
**Status:** Production Ready ✅
