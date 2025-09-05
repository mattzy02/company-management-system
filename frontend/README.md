# Company Management Frontend

Modern dashboard built with Next.js and Material-UI for managing companies and users.

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Open in browser**
   - http://localhost:3001

## 📋 Requirements

- Node.js 18+
- Backend API running on port 3000
- npm

## 🔧 Scripts

- `npm run dev` - Development mode
- `npm run build` - Build for production
- `npm run start` - Production mode
- `npm run lint` - Run linting

## 🎯 Features

- **Dashboard** - Overview with charts and statistics
- **Company Management** - View, create, edit, and delete companies
- **User Management** - Manage user accounts and profiles
- **Authentication** - Login, register, and profile management
- **Responsive Design** - Works on desktop, tablet, and mobile

## 🔐 Demo User

You can test with the demo account:
- **Email**: demo@demo.com
- **Password**: demo

## 📁 Key Pages

- `/` - Dashboard with charts and stats
- `/companies` - Company management table
- `/users` - User management table
- `/accounts` - Account/profile management
- `/auth/login` - Login page
- `/auth/register` - Registration page

## ⚙️ Configuration

The app connects to the backend at `http://localhost:3000` by default.

To change this, update the API calls in:
- `src/app/services/api.ts`
- `src/app/UserContext.tsx`

## 🐛 Common Issues

- **Connection errors**: Make sure the backend is running on port 3000
- **Login issues**: Check if backend auth endpoints are working
- **Build errors**: Run `npm run lint` to check for code issues

The frontend automatically handles JWT tokens and user sessions.