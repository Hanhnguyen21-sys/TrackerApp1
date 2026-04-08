# 📌 Project Management Web App (Trello-like)

A Tracker App helps teams organize and track tasks using a **Kanban board system**.

---

## 🚀 Overview

This app allows users to:

- Create and manage projects
- Collaborate with team members
- Track tasks using a Kanban board
- Perform drag-and-drop task management

---

## 🧠 Core Concept

Each project contains:

- **Columns (lists)** → represent task status (To Do, In Progress, Done)
- **Tickets (tasks)** → represent work items

Users interact with tickets inside columns and move them across different stages.

---

## 👥 Role & Permission System

### 🔑 Role Model

Each user can have different roles depending on the project:

#### Admin (per project)

- Project creator
- Can:
  - Add/remove members
  - Manage columns
  - Manage project settings

#### Project Member

- Can:
  - Create/edit/move tickets
  - View project and board

> Note: A user can be **admin in one project** and **member in another**

---

## 🏗️ System Architecture

### Flow

1. User logs in → receives JWT token
2. User accesses assigned projects
3. Inside a project:
   - Load columns
   - Load tickets
4. User actions:
   - Create/edit/delete tickets
   - Drag & drop between columns
5. Backend updates database and ticket history

---

## 📊 Data Models

### User

```js
User {
  name,
  email,
  password,
  role
}
```

### Project

```js
Project {
  name,
  description,
  createdBy,
  members: [userId],
  createdDate
}
```

### Column

```js
Column {
  id,
  projectId,
  title,
  order
}
```

### Ticket

```js
Ticket {
  id,
  projectId,
  columnId,
  title,
  description,
  type,
  priority,
  status,
  assignee,
  order
}
```

## ⚙️ Setup Instructions

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- MongoDB local server or MongoDB Atlas account

### 1. Clone the repository

```bash
git clone https://github.com/Hanhnguyen21-sys/TrackerApp1.git
cd <your-project-folder>
```

### 2. Install dependencies

- Backend:
  cd backend
  npm install

- Frontend:
  cd ../frontend
  npm install

### 3. Environment variables

    create .env , and adding:
        PORT=5000
        MONGO_URI=your_mongodb_connection_string
        JWT_SECRET=your_jwt_secret

### 4. Run

- In backend terminal
  npm run dev

- In frontend terminal
  npm run dev
