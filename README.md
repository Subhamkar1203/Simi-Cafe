<div align="center">
  <h1>☕ Simi Café</h1>
  <p><strong>A Modern, Full-Stack Restaurant Management & Customer Experience Platform</strong></p>
  <p>
    <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white" alt="MySQL" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  </p>
</div>

---

## 📖 Project Overview

Simi Café is a comprehensive web application designed to elevate the dining experience. It features a **Ghibli-inspired responsive UI** for customers to browse menus and make reservations, paired with a robust **Admin Dashboard** for restaurant staff to manage operations seamlessly.

### 🌟 Resume-Worthy Highlights
- **Monorepo Architecture**: Clean separation of concerns with dedicated packages for Client Frontend, Admin Dashboard, and API Backend.
- **Production-Ready Security**: Implemented JWT-based authentication, password hashing, and rate-limiting to prevent brute-force attacks.
- **Optimized Media Management**: Integrated **Cloudinary** for scalable, high-performance image hosting.
- **Dynamic UI/UX**: Built with React Server Components in Next.js 16, utilizing advanced Tailwind CSS for a highly responsive, animated design.
- **Relational Data Integrity**: Engineered a robust MySQL database schema with transaction management for order and reservation accuracy.

---

## 📸 Screenshots

*(Replace these placeholders with actual screenshots of your deployed app)*

| Customer Interface | Admin Dashboard |
|:---:|:---:|
| ![Customer UI Placeholder](https://via.placeholder.com/600x400?text=Customer+App+Screenshot) | ![Admin UI Placeholder](https://via.placeholder.com/600x400?text=Admin+Dashboard+Screenshot) |
| *Ghibli-inspired responsive design* | *Comprehensive management interface* |

---

## ✨ Key Features

### 🧑‍🍳 Customer Portal
- **Interactive Menu**: Browse categories, filter dietary preferences, and view detailed item pages.
- **Secure Authentication**: User registration and login flow.
- **Table Reservations**: Real-time availability checking and booking system.
- **Order Management**: Cart system and order history tracking.

### 💼 Admin Dashboard
- **Analytics Overview**: Dashboard metrics for daily orders, revenue, and active reservations.
- **Menu Management**: Full CRUD capabilities for menu items, categories, and dietary tags.
- **Order Fulfillment**: Update order statuses in real-time.
- **Media Uploads**: Direct integration with Cloudinary for fast image processing.

---

## 🛠️ Architecture & Tech Stack

This project is structured as a monorepo containing three distinct applications:

1. **`/simi-cafe` (Customer Frontend)**
   - **Framework**: Next.js 16 (App Router)
   - **Styling**: Tailwind CSS + Custom Animations
   - **Data Fetching**: React Server Components & Client Hooks

2. **`/simi-cafe-admin` (Staff Dashboard)**
   - **Framework**: Next.js 16 (App Router)
   - **State Management**: React Context / Hooks
   - **Security**: Protected routes with session verification

3. **`/simi-cafe-backend` (REST API)**
   - **Runtime**: Node.js + Express.js
   - **Language**: TypeScript
   - **Database**: MySQL2 (with connection pooling)
   - **Validation**: Zod
   - **Storage**: Cloudinary + Multer

---

## 🚀 Deployment Instructions

The repository is structured to be easily deployed to modern cloud providers. 

### 1. Database (e.g., Aiven, PlanetScale, AWS RDS)
- Provision a MySQL database.
- Run the initialization scripts found in your backend to generate the schema.
- Obtain the connection URI.

### 2. Backend (Render / Railway)
1. Connect your GitHub repository to your Render/Railway dashboard.
2. Select the `/simi-cafe-backend` directory as the root.
3. Set the build command: `npm install && npm run build`
4. Set the start command: `npm start`
5. **Environment Variables**:
   ```env
   PORT=9092
   DB_HOST=your_db_host
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=simi_cafe
   JWT_SECRET=your_secure_random_string
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ALLOWED_ORIGINS=https://simi-cafe.vercel.app,https://admin.simi-cafe.vercel.app
   ```

### 3. Frontend Apps (Vercel)
For both the **Customer App** and **Admin App**:
1. Import the repository into Vercel.
2. Set the Root Directory to `/simi-cafe` (for customer) and `/simi-cafe-admin` (for admin).
3. Vercel will automatically detect Next.js and configure build settings.
4. **Environment Variables**:
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   ```

---

## 💻 Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/Subhamkar1203/Simi-Cafe.git
   cd Simi-Cafe
   ```
2. **Setup Database**
   Create a local MySQL database named `simi_cafe`.
3. **Configure Environment**
   Copy `.env.example` to `.env` in all three application directories and update with your local credentials.
4. **Install & Run**
   Open three separate terminal windows:
   - **Backend**: `cd simi-cafe-backend && npm install && npm run dev`
   - **Customer UI**: `cd simi-cafe && npm install && npm run dev`
   - **Admin UI**: `cd simi-cafe-admin && npm install && npm run dev`

---
*Built with ❤️ for a seamless café experience.*
