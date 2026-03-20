# 📚 Study Portal - Notes, PYQs & Study Materials

Link : https://study-portal-app.vercel.app/

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://study-portal-app.vercel.app)
[![Render](https://img.shields.io/badge/Deployed%20on-Render-blue)](https://study-portal-ill8.onrender.com)


A full-stack study materials platform where students can upload, view, and download notes, previous year questions, syllabus, and lab manuals. Features include user authentication, admin panel, universal counters (views/downloads/ratings), and Cloudinary integration for file storage.

## ✨ Features

### 👤 User Features
- 🔐 User Registration & Login with Email Verification
- 📄 Browse and Search Study Materials
- 👁️ View and Download Materials
- ⭐ Rate Materials
- 📱 Fully Responsive Design (Mobile Friendly)

### 👑 Admin Features
- 📊 Dashboard with Analytics
- 📤 Direct Upload (Auto-Approved)
- ✅ Approve/Reject User Uploads
- 👥 User Management (View, Edit, Delete)
- 🗑️ Bulk Delete Options (by semester/subject/date)

### 🚀 Technical Features
- 🌐 **Universal Counters** - Views, Downloads, Ratings sync across all pages
- ☁️ **Cloudinary Integration** - Fast, optimized file delivery
- 📧 **Email Service** - Verification and Password Reset via Resend
- 🗄️ **PostgreSQL Database** - Hosted on Render
- 🔄 **Real-time Updates** - No refresh needed

## 🛠️ Tech Stack

### Frontend
- React 18
- React Router v6
- React Icons
- Axios
- CSS3 (Custom)

### Backend
- Flask 2.3.3
- Flask-SQLAlchemy
- Flask-JWT-Extended
- PostgreSQL
- Cloudinary SDK
- Resend (Email API)

### Deployment
- **Frontend:** Vercel
- **Backend:** Render
- **Database:** Render PostgreSQL

## 📋 Prerequisites

- Node.js (v16+)
- Python (v3.10+)
- PostgreSQL (for local development)
- Cloudinary Account
- Resend Account (for emails)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/karansuyal/Study-Portal.git
cd Study-Portal