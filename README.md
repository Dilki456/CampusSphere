# CampusSphere – University Management System

## Project Description

CampusSphere is a web-based university management system designed to help students and university staff access and manage academic information through a user-friendly interface.

## Features

### Student Portal
- Student registration and login
- Student dashboard
- View courses and assignments
- View timetable and examination results
- View university announcements
- Student profile management

### Staff Portal
- Staff login for Admin and Lecturers
- Staff dashboard
- Add, edit, and delete university announcements

## Technologies Used

- **Frontend:** React, Vite, JavaScript, HTML, CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Authentication:** bcryptjs, JSON Web Token (JWT)
- **Tools:** Visual Studio Code, Git, GitHub

## Application Hosts

- **Frontend (Local Host):** http://localhost:5173
- **Backend API (Local Host):** http://localhost:5000
- **GitHub Repository:** https://github.com/Dilki456/CampusSphere

> Note: The local host URLs are accessible when the frontend and backend servers are running on your computer. These are not public deployment URLs.

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Dilki456/CampusSphere.git
cd CampusSphere
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Install Backend Dependencies

```bash
cd server
npm install
```

### 4. Configure Environment Variables

Create a `.env` file inside the `server` directory and configure the required staff account details and JWT secret.

Do not upload `.env` files or sensitive credentials to GitHub.

### 5. Run the Backend

Inside the `server` directory, run:

```bash
node server.js
```

### 6. Run the Frontend

Open a separate terminal in the main project directory and run:

```bash
npm run dev
```

Open the frontend URL displayed in the terminal.

## Author

**Dilki Ishari**

GitHub: [Dilki456](https://github.com/Dilki456/CampusSphere)
