# JMeter Load Testing

## 🎯 Test Plan Overview

This JMeter test plan provides comprehensive load testing for the Company Management API.

## 🚀 Test Scenarios

### 1. User Lifecycle Test
- **Register User** → **Login** → **Get Profile** → **Update Profile** → **Delete User**
- **Threads**: 20 (configurable)
- **Ramp-up**: 30 seconds

### 2. Public API Test
- **Get Users** → **Get Companies** → **Filter Companies**
- **Threads**: 50 (configurable)
- **Ramp-up**: 15 seconds

## 🚀 Running the Tests

1. **Start the backend server:**
   ```bash
   cd backend
   npm run start:dev
   ```

2. **Open JMeter and load the test plan:**
   - File → Open → `Company-Management-API-Test-Plan.jmx`

3. **Configure test parameters:**
   - Update thread counts in Thread Groups
   - Verify CSV data file path
   - Check API endpoint URLs

4. **Run the test:**
   - Click the "Start" button
   - Monitor results in View Results Tree and Summary Report

## 📊 Expected Results

- **Response Times**: < 100ms for most requests
- **Success Rate**: 100%
- **Throughput**: 50+ requests/second
- **Error Rate**: 0%
