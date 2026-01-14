# AWS S3 Deployment Guide

## 📋 Prerequisites

- AWS Account with S3 access
- AWS CLI configured with credentials
- S3 Bucket: `sepl-admin-portal`
- Region: `ap-south-1`
- CloudFront distribution configured (optional but recommended)

---

## 🚀 Deployment Steps

### Option 1: Using AWS CLI (Recommended)

#### Step 1: Configure AWS Credentials

```bash
aws configure
```

Enter your AWS credentials:
- AWS Access Key ID: [Your Access Key]
- AWS Secret Access Key: [Your Secret Key]
- Default region: ap-south-1
- Default output format: json

#### Step 2: Upload Files to S3

```bash
# Upload all files to S3 bucket
aws s3 sync . s3://sepl-admin-portal/ --region ap-south-1 --exclude ".git*" --exclude "node_modules/*" --exclude "*.md"

# Or upload specific files
aws s3 cp index.html s3://sepl-admin-portal/index.html --region ap-south-1
aws s3 cp login.html s3://sepl-admin-portal/login.html --region ap-south-1
```

#### Step 3: Set Public Access (if needed)

```bash
# Make files publicly readable
aws s3api put-object-acl --bucket sepl-admin-portal --key index.html --acl public-read --region ap-south-1
aws s3api put-object-acl --bucket sepl-admin-portal --key login.html --acl public-read --region ap-south-1
```

#### Step 4: Invalidate CloudFront Cache (if using CloudFront)

```bash
# Get distribution ID
aws cloudfront list-distributions --query "DistributionList.Items[?DomainName=='sepl-admin-portal.s3.ap-south-1.amazonaws.com'].Id" --output text

# Invalidate cache
aws cloudfront create-invalidation --distribution-id [DISTRIBUTION_ID] --paths "/*" --region ap-south-1
```

---

### Option 2: Using AWS Console (Manual)

1. **Go to AWS S3 Console**
   - URL: https://console.aws.amazon.com/s3/

2. **Select Bucket**
   - Click on `sepl-admin-portal` bucket

3. **Upload Files**
   - Click "Upload"
   - Select `index.html` and `login.html`
   - Click "Upload"

4. **Set Permissions**
   - Select uploaded files
   - Click "Actions" → "Make public"

5. **Invalidate CloudFront**
   - Go to CloudFront console
   - Select your distribution
   - Click "Create Invalidation"
   - Enter `/*` as path
   - Click "Create"

---

## 📝 File Structure

```
sepl-admin-portal/
├── index.html              # Main dashboard (all pages)
├── login.html              # Login page
├── TEST_GUIDE.md          # Test documentation
└── DEPLOYMENT_GUIDE.md    # This file
```

---

## 🌐 Access URLs

### Direct S3 Access
```
https://sepl-admin-portal.s3.ap-south-1.amazonaws.com/index.html
https://sepl-admin-portal.s3.ap-south-1.amazonaws.com/login.html
```

### Via CloudFront (if configured)
```
https://[CloudFront-Domain]/index.html
https://[CloudFront-Domain]/login.html
```

---

## ✅ Verification Steps

### 1. Test Login Page
- Go to: https://sepl-admin-portal.s3.ap-south-1.amazonaws.com/login.html
- Enter credentials:
  - Username: `Mehul2026`
  - Password: `Mehul@7300`
- Expected: Redirects to dashboard

### 2. Test Dashboard
- Verify all stat cards load
- Check centre data table
- Test export button
- Test sync button

### 3. Test All Pages
- Click each sidebar item
- Verify page loads with data
- Test Add/Edit/Delete buttons
- Test export functionality

### 4. Test Logout
- Click "🚪 Logout"
- Confirm logout
- Verify redirects to login page

---

## 🔧 Troubleshooting

### Issue: Files Not Accessible

**Solution:**
```bash
# Check bucket policy
aws s3api get-bucket-policy --bucket sepl-admin-portal

# Set public read policy
aws s3api put-bucket-policy --bucket sepl-admin-portal --policy '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::sepl-admin-portal/*"
    }
  ]
}'
```

### Issue: CloudFront Cache Not Updated

**Solution:**
```bash
# Invalidate all files
aws cloudfront create-invalidation --distribution-id [DISTRIBUTION_ID] --paths "/*"

# Wait for invalidation to complete (usually 5-10 minutes)
```

### Issue: CORS Errors

**Solution:** Configure CORS in S3 bucket:

```bash
aws s3api put-bucket-cors --bucket sepl-admin-portal --cors-configuration '{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "POST"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3000
    }
  ]
}'
```

---

## 📊 S3 Bucket Settings

### Recommended Settings

**Versioning:** Enabled (for rollback capability)
```bash
aws s3api put-bucket-versioning --bucket sepl-admin-portal --versioning-configuration Status=Enabled
```

**Server-side Encryption:** Enabled
```bash
aws s3api put-bucket-encryption --bucket sepl-admin-portal --server-side-encryption-configuration '{
  "Rules": [
    {
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }
  ]
}'
```

**Logging:** Enable access logs
```bash
aws s3api put-bucket-logging --bucket sepl-admin-portal --bucket-logging-status '{
  "LoggingEnabled": {
    "TargetBucket": "sepl-admin-portal-logs",
    "TargetPrefix": "logs/"
  }
}'
```

---

## 🔐 Security Best Practices

1. **Use IAM Roles** instead of root credentials
2. **Enable MFA Delete** for production
3. **Use CloudFront** for distribution (DDoS protection)
4. **Enable Access Logging** for audit trail
5. **Set Object Expiration** policies
6. **Use Bucket Encryption** for sensitive data
7. **Restrict Public Access** to necessary files only

---

## 📈 Monitoring

### CloudWatch Metrics

```bash
# Get S3 request metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/S3 \
  --metric-name NumberOfObjects \
  --dimensions Name=BucketName,Value=sepl-admin-portal \
  --start-time 2026-01-01T00:00:00Z \
  --end-time 2026-01-09T23:59:59Z \
  --period 86400 \
  --statistics Average
```

### CloudFront Metrics

```bash
# Get CloudFront request metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/CloudFront \
  --metric-name Requests \
  --dimensions Name=DistributionId,Value=[DISTRIBUTION_ID] \
  --start-time 2026-01-01T00:00:00Z \
  --end-time 2026-01-09T23:59:59Z \
  --period 3600 \
  --statistics Sum
```

---

## 🔄 Continuous Deployment

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS S3

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-south-1
      
      - name: Deploy to S3
        run: |
          aws s3 sync . s3://sepl-admin-portal/ --exclude ".git*" --exclude "node_modules/*" --exclude "*.md"
      
      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation --distribution-id ${{ secrets.CF_DISTRIBUTION_ID }} --paths "/*"
```

---

## 📞 Support

For issues or questions:
1. Check AWS S3 documentation: https://docs.aws.amazon.com/s3/
2. Check CloudFront documentation: https://docs.aws.amazon.com/cloudfront/
3. Contact AWS Support: https://console.aws.amazon.com/support/

---

**Last Updated:** 2026-01-09  
**Version:** 1.0.0  
**Status:** Ready for Deployment
