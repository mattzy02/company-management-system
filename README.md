# Company Management System

Full-stack application for managing companies and users, built with NestJS and Next.js.

## 🚀 Quick Start

### 1. Backend Setup
```bash
cd backend
npm install
cp env.example .env
# Edit .env with your MySQL settings

# Create database
mysql -u root -p
CREATE DATABASE company_management;

# Load sample data
npm run seed:companies
npm run seed:relationships

# Start server
npm run start:dev
```

### 2. Frontend Setup
```bash
cd frontend  
npm install
npm run dev
```

### 3. Access the App
- **Frontend**: http://localhost:3001
- **API**: http://localhost:3000
- **API Docs**: http://localhost:3000/api/docs

## 📋 Requirements

- Node.js 18+
- MySQL 8.0+
- npm

## 🎯 Features

- **Company Management** - Create, view, edit, delete companies
- **User Management** - User accounts and profiles  
- **Authentication** - JWT login/register system
- **Dashboard** - Charts and statistics
- **API Documentation** - Interactive Swagger docs

## 📁 Structure

```
├── backend/                    # NestJS API Server
│   ├── src/                   # Source code
│   │   ├── modules/          # Feature modules (auth, company, user, account)
│   │   ├── config/           # Database and app configuration
│   │   └── scripts/          # Data import scripts
│   ├── data/                 # CSV data files (companies, relationships)
│   └── env.example           # Environment template
├── frontend/                  # Next.js Dashboard
│   ├── src/app/              # Pages and components
│   │   ├── (app)/           # Protected pages (dashboard, companies, users)
│   │   ├── auth/            # Login/register pages
│   │   └── services/        # API communication
│   └── src/types/           # TypeScript interfaces
└── tests/                    # Testing Suite
    ├── postman/             # API testing collection
    └── jmeter/              # Load testing plans
```

## 🧪 Testing

### API Testing (Postman)
1. Import `tests/postman/Company-Management-API.postman_collection.json`
2. Run the collection (no setup needed)

### Load Testing (JMeter)  
1. Open `tests/jmeter/Company-Management-Test-Plan.jmx` in JMeter
2. Run the test plan
