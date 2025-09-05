# Company Management API

REST API built with NestJS for managing companies, users, and accounts.

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Setup environment**
   ```bash
   cp env.example .env
   # Edit .env with your database settings
   ```

3. **Setup MySQL database**
   ```sql
   # Connect to MySQL
   mysql -u root -p
   
   # Create database
   CREATE DATABASE company_management;
   ```

4. **Load sample data** (Important!)
   ```bash
   # Import companies data (required for dashboard to show data)
   npm run seed:companies
   
   # Import company relationships (for hierarchy features)
   npm run seed:relationships
   ```
   
   *Note: Without this step, the frontend dashboard will show 0 for all statistics*

5. **Start the server**
   ```bash
   npm run start:dev
   ```

6. **Visit API docs**
   - http://localhost:3000/api/docs

## 📋 Requirements

- Node.js 18+
- MySQL 8.0+
- npm


## 🔐 Authentication

**Register:**
```bash
POST /auth/register
{
  "name": "John Doe",
  "email": "john@example.com", 
  "password": "password123"
}
```

**Login:**
```bash
POST /auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

Use the returned JWT token in headers: `Authorization: Bearer <token>`

## 📊 Main Endpoints

### Companies
- `GET /company` - List all companies
- `POST /company` - Create company
- `PUT /company/:id` - Update company
- `DELETE /company/:id` - Delete company
- `POST /company/filter` - Filter companies

### Users
- `GET /user` - List all users
- `PUT /user/:id` - Update user
- `DELETE /user/:id` - Delete user

### Accounts
- `GET /account` - List all accounts
- `POST /account` - Create account
- `PUT /account/:id` - Update account
- `DELETE /account/:id` - Delete account

## ⚙️ Environment Setup

Copy `env.example` to `.env` and set:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=company_management
JWT_SECRET=your-secret-key
```
