# MPA Biometric Admin Panel - Complete Documentation

## 📋 Overview

The MPA Biometric Admin Panel is a comprehensive web-based administration system for managing the MPA (Multi-Purpose Assessment) Biometric Verification System. It provides complete control over exams, slots, centres, operators, candidates, and real-time biometric verification data.

---

## ✨ Features

### 🎯 Core Features

**Authentication & Security**
- Single admin user authentication (Mehul2026/Mehul@7300)
- Session-based login with localStorage
- Automatic logout after 30 minutes of inactivity
- Failed login lockout after 3 attempts (15 minutes)
- Secure token-based API communication

**Dashboard**
- Real-time statistics (Total Candidates, Biometric Captured, Operators Active, Centres Online)
- Centre-wise data table with status tracking
- Exam-wise filtering
- Export to Excel functionality
- Live data synchronization from backend

**Exam Management**
- Create, Read, Update, Delete (CRUD) operations
- Exam scheduling and date management
- Candidate capacity tracking
- Status management (Active, Inactive, Completed)
- Search and filter capabilities
- Excel export

**Slots Management**
- Create and manage exam slots
- Time-based scheduling
- Capacity management
- Exam association
- Bulk operations
- Excel export

**Centres Management**
- Centre registration and management
- Location and contact information
- Status tracking
- Operator assignment
- Centre-wise reporting
- Excel export

**Operators Management**
- Operator registration and assignment
- Centre-wise operator tracking
- Status management
- Logout all operators functionality
- Operator performance metrics
- Excel export

**Candidates Management**
- Candidate registration
- Roll number and email management
- Exam and centre assignment
- Biometric status tracking (Pending, Captured, Verified)
- Bulk candidate import
- Excel export

**Reports & Analytics**
- Comprehensive biometric verification reports
- Success rate calculations
- Centre-wise analytics
- Operator performance metrics
- PDF and Excel export
- Real-time data visualization

**Data Management**
- Search functionality across all modules
- Advanced filtering options
- Bulk operations
- Export to Excel (all modules)
- Export to PDF (reports)
- Data synchronization with backend

---

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- HTML5, CSS3, Vanilla JavaScript
- Chart.js for data visualization
- XLSX.js for Excel export
- html2pdf.js for PDF generation
- Font Awesome 6.4 for icons

**Backend Integration:**
- RESTful API at `http://13.204.65.158`
- Bearer token authentication
- JSON request/response format

**Deployment:**
- AWS S3 (sepl-admin-portal bucket)
- CloudFront CDN (optional)
- Region: ap-south-1

### API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/dashboard/stats` | Get dashboard statistics |
| GET | `/api/centres/data` | Get centre-wise data |
| GET | `/api/exams` | List all exams |
| POST | `/api/exams` | Create new exam |
| DELETE | `/api/exams/{id}` | Delete exam |
| GET | `/api/slots` | List all slots |
| POST | `/api/slots` | Create new slot |
| DELETE | `/api/slots/{id}` | Delete slot |
| GET | `/api/centres` | List all centres |
| POST | `/api/centres` | Create new centre |
| DELETE | `/api/centres/{id}` | Delete centre |
| GET | `/api/operators` | List all operators |
| POST | `/api/operators` | Create new operator |
| DELETE | `/api/operators/{id}` | Delete operator |
| POST | `/api/operators/logout-all` | Logout all operators |
| GET | `/api/candidates` | List all candidates |
| POST | `/api/candidates` | Create new candidate |
| DELETE | `/api/candidates/{id}` | Delete candidate |
| GET | `/api/reports` | Get analytics reports |
| POST | `/api/sync/trigger` | Trigger data synchronization |
| GET | `/api/centres/export` | Export centre data |

---

## 🚀 Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection
- Backend API running at `http://13.204.65.158`

### Installation

1. **Clone Repository**
```bash
git clone https://github.com/mehularora8385/mpa-admin-panel.git
cd mpa-admin-panel
```

2. **Open in Browser**
```bash
# Direct file access
open index.html

# Or use a local server
python3 -m http.server 8000
# Then visit http://localhost:8000
```

3. **Login**
- Username: `Mehul2026`
- Password: `Mehul@7300`

### Deployment to AWS S3

```bash
# Configure AWS CLI
aws configure

# Upload files to S3
aws s3 sync . s3://sepl-admin-portal/ --region ap-south-1

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id [DISTRIBUTION_ID] --paths "/*"
```

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions.

---

## 📖 Usage Guide

### Dashboard

1. **View Statistics**
   - Dashboard loads automatically on login
   - Shows 4 key metrics in stat cards
   - Updates in real-time from backend

2. **View Centre Data**
   - Scroll down to see centre-wise table
   - Shows centre code, name, candidates, status
   - Click "Export to Excel" to download data

3. **Filter by Exam**
   - Use "Exam-wise Filtering" dropdown
   - Dashboard updates with selected exam data

4. **Sync Data**
   - Click "🔄 Sync Data" button
   - Triggers backend synchronization
   - Refreshes all data

### Exam Management

1. **View Exams**
   - Click "📝 EXAMS" in sidebar
   - Table shows all exams with details

2. **Add Exam**
   - Click "➕ Add Exam" button
   - Fill in exam details
   - Click "Save"

3. **Edit Exam**
   - Click "Edit" button on exam row
   - Update details
   - Click "Save"

4. **Delete Exam**
   - Click "Delete" button on exam row
   - Confirm deletion

5. **Export Exams**
   - Click "📥 Export" button
   - Downloads Excel file with all exams

### Similar workflow for Slots, Centres, Operators, Candidates

---

## 🧪 Testing

See [TEST_GUIDE.md](TEST_GUIDE.md) for comprehensive testing documentation with 35 test cases covering:

- Login and session management
- All CRUD operations
- Export functionality
- Error handling
- Responsive design
- Performance metrics

---

## 🔐 Security Features

1. **Authentication**
   - Single admin user only
   - No signup functionality
   - Secure password storage

2. **Session Management**
   - Token-based authentication
   - 30-minute inactivity timeout
   - Automatic logout
   - Session validation on page load

3. **API Security**
   - Bearer token authentication
   - HTTPS support (when deployed)
   - CORS configuration
   - Input validation

4. **Data Protection**
   - No sensitive data in localStorage (only session ID)
   - Secure API communication
   - Server-side validation
   - SQL injection prevention

---

## 📊 Data Export

### Excel Export

All modules support Excel export:
- Dashboard data
- Exams list
- Slots list
- Centres list
- Operators list
- Candidates list
- Reports data

**Format:** XLSX (Excel 2007+)

### PDF Export

Reports can be exported as PDF with:
- Formatted tables
- Professional styling
- Page breaks
- Header and footer

**Format:** PDF

---

## 🛠️ Troubleshooting

### Login Issues

**Problem:** Cannot login
- **Solution:** Clear browser cache and localStorage
  ```javascript
  localStorage.clear()
  location.reload()
  ```

**Problem:** Session expires too quickly
- **Solution:** Check backend API connectivity
- Verify token generation on backend

### Data Loading Issues

**Problem:** Pages show "Loading..." indefinitely
- **Solution:** Check backend API status
- Verify network connectivity
- Check browser console for errors

**Problem:** Export button not working
- **Solution:** Check browser console for errors
- Verify data is loaded before export
- Try different browser

### API Connection Issues

**Problem:** "Error loading data from backend"
- **Solution:** Verify backend URL in code
- Check backend API is running
- Verify network connectivity
- Check CORS configuration

---

## 📈 Performance Optimization

1. **Caching**
   - Browser caching enabled
   - CloudFront CDN recommended
   - API response caching

2. **Lazy Loading**
   - Data loaded on page navigation
   - Pagination for large datasets (future)

3. **Compression**
   - GZIP compression enabled
   - Minified CSS and JavaScript (production)

4. **Optimization Tips**
   - Use CloudFront for faster delivery
   - Enable S3 versioning for rollback
   - Monitor CloudWatch metrics
   - Optimize database queries on backend

---

## 🔄 Continuous Integration/Deployment

### GitHub Actions Workflow

Automatic deployment on push to main branch:

1. **Trigger:** Push to GitHub main branch
2. **Build:** No build required (static files)
3. **Deploy:** Upload to S3
4. **Invalidate:** CloudFront cache invalidation
5. **Verify:** Health check

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for CI/CD setup.

---

## 📞 Support & Maintenance

### Monitoring

**CloudWatch Metrics:**
- S3 request count
- S3 data transfer
- CloudFront requests
- CloudFront errors

**Logs:**
- S3 access logs
- CloudFront logs
- Browser console logs

### Maintenance Tasks

1. **Weekly**
   - Check error logs
   - Monitor performance metrics
   - Verify data sync

2. **Monthly**
   - Review usage statistics
   - Update security patches
   - Backup database

3. **Quarterly**
   - Security audit
   - Performance review
   - Feature updates

---

## 📚 File Structure

```
mpa-admin-panel/
├── index.html                 # Main dashboard (all pages)
├── login.html                 # Login page
├── README.md                  # This file
├── TEST_GUIDE.md             # Testing documentation
├── DEPLOYMENT_GUIDE.md       # Deployment instructions
├── js/
│   ├── admin-auth.js        # Authentication logic
│   ├── dashboard-features.js # Dashboard functionality
│   ├── exam-management.js   # Exam CRUD operations
│   └── websocket-sync.js    # Real-time synchronization
├── css/
│   └── styles.css           # Custom styling
└── public/
    └── assets/              # Images and icons
```

---

## 🔄 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-09 | Initial release with all features |
| 0.9.0 | 2026-01-08 | Beta release |
| 0.5.0 | 2026-01-01 | Alpha release |

---

## 📝 License

Proprietary - All rights reserved

---

## 👥 Contributors

- Mehul Arora (@mehularora8385)
- Development Team

---

## 📧 Contact

For support or inquiries:
- Email: mehul@example.com
- GitHub: https://github.com/mehularora8385/mpa-admin-panel
- Issues: https://github.com/mehularora8385/mpa-admin-panel/issues

---

## 🎯 Roadmap

**Upcoming Features:**
- [ ] Multi-admin support
- [ ] Role-based access control (RBAC)
- [ ] Advanced analytics dashboard
- [ ] Real-time notifications
- [ ] Mobile app for operators
- [ ] Biometric data visualization
- [ ] Automated reporting
- [ ] API rate limiting
- [ ] Two-factor authentication (2FA)
- [ ] Audit trail logging

---

**Last Updated:** 2026-01-09  
**Status:** Production Ready  
**Maintenance:** Active
