# Simi Café

Full-stack application for Simi Café, built with Next.js (frontend) and Node.js/TypeScript (backend).

## Project Structure

- `simi-cafe`: Next.js frontend application
- `simi-cafe-backend`: Node.js Express backend API

## Prerequisites

- Node.js (v18 or higher recommended)
- MySQL database

## Environment Setup

### 1. Database Setup
Create a MySQL database named `simi_cafe` (or your preferred name).
Update the backend `.env` file with your database credentials.

### 2. Backend Environment Variables
1. Navigate to the backend directory: `cd simi-cafe-backend`
2. Copy the example env file: `cp .env.example .env` (or rename `.env.example` to `.env`)
3. Update the `.env` file with your actual values:
   - Database credentials
   - JWT Secret (generate a secure random string)
   - SMTP credentials for email notifications (if applicable)

### 3. Frontend Environment Variables
1. Navigate to the frontend directory: `cd simi-cafe`
2. Copy the example env file: `cp .env.local.example .env.local` (or rename `.env.local.example` to `.env.local`)
3. Update `.env.local` if your backend is running on a different port or domain.

## Installation & Running Locally

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd simi-cafe-backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   *(The backend server will typically run on `http://localhost:9092`)*

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd simi-cafe
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   *(The frontend will typically run on `http://localhost:3000`)*

## Building for Production

### Build Backend
```bash
cd simi-cafe-backend
npm run build
npm start
```

### Build Frontend
```bash
cd simi-cafe
npm run build
npm start
```

## Security Note
Make sure you **never** commit `.env` or `.env.local` files to version control. These are already included in `.gitignore` by default. Use the provided `.env.example` and `.env.local.example` files as templates for deployment.
