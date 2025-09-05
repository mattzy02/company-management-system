# Company Management API - Testing Suite

This folder contains comprehensive testing tools for the Company Management API.

## 📁 Structure

- `jmeter/` - Load testing and pressure testing with Apache JMeter
- `postman/` - API testing with Postman collections

## 🚀 Quick Start

### Prerequisites
- Node.js and npm installed
- Backend server running on `http://localhost:3000`
- JMeter installed (for load testing)
- Postman installed (for API testing)

### Running Tests

1. **Start the backend server:**
   ```bash
   cd backend
   npm run start:dev
   ```

2. **Run JMeter tests:**
   - Open `tests/jmeter/Company-Management-API-Test-Plan.jmx` in JMeter
   - Configure thread counts and run

3. **Run Postman tests:**
   - Import `tests/postman/Company-Management-API.postman_collection.json`
   - Run the collection (no environment file needed)

## 📊 Test Coverage

- **User Management**: Registration, Login, Profile Management, User Deletion
- **Company Management**: Company Listing, Filtering, Data Retrieval
- **Load Testing**: Concurrent user simulation, Performance metrics
- **API Testing**: All endpoints with various scenarios
