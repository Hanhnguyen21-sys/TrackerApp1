# Project Management Web App (Trello-like)

A modern, high-performance Tracker App that helps teams organize and track tasks using a **Kanban board system** with advanced AI-powered automation and visualization.

---

## Key Features

### AI-Powered Project Generation
- **Intelligent Board Creation**: Instantly generate a full project board by providing just a name and description.
- **Refinement Context**: The AI automatically polishes project names and expands descriptions into professional briefs.
- **Smart Scheduling**: Automatically assigns realistic due dates for the current year (2026) within sequentially generated project phases.
- **Automated Estimation**: Tasks are intelligently assigned effort points (1, 2, 3, 5, 8) based on complexity.
- **Workflow Automation**: AI categorizes tasks into project-relevant statuses (Grooming, To-Do, Testing, etc.) from the start.

### Advanced Progress Tracking
- **Interactive Dashboards**: Real-time visualization of project health via the **Progress Modal**.
- **Effort vs. Tasks**: Track progress not just by task count, but by total effort points completed.
- **Status-Based Insights**: Specialized charts visualizing task distribution across workflow stages (Grooming, In Progress, Done).
- **Velocity Tracking**: Monitor team efficiency with real-time percentage calculations of completed effort.

### Professional Kanban Experience
- **Fluid Drag & Drop**: Seamless task reorganization powered by `@dnd-kit`.
- **Workflow Statuses**: Granular task control with statuses like `Grooming`, `To-Do`, `In Progress`, `Testing`, `Done`, and `Cancelled`.
- **Spill Protection**: Visual "Spill" indicators and custom tooltips alert you when a task's due date has been pushed more than 3 times.
- **Activity Stream**: Detailed audit logs for every project, tracking creation, edits, moves, and comments.

---

## Role & Permission System

### Admin (per project)
- **Ownership**: Project creator.
- **Controls**: Add/remove members, manage columns, and project settings.

### Project Member
- **Collaboration**: Create, edit, and move tickets.
- **Visibility**: Full access to the project board and progress visualizations.

---

## Technical Stack

- **Frontend**: React, Vite, TailwindCSS (for custom utility), Recharts (for visualizations), Lucide-React (icons).
- **Backend**: Node.js, Express.
- **Database**: MongoDB with Mongoose.
- **AI**: OpenRouter SDK (using Google Gemma-3 model).
- **Auth**: JWT-based authentication.

---

## Data Models

### Project
```js
Project {
  name,                // Refined by AI
  description,         // Expanded by AI
  createdBy,
  members: [userId],
  thumbnail,
  tagline
}
```

### Ticket
```js
Ticket {
  title,
  description,
  type: ['Task', 'Bug', 'Feature'],
  priority: ['Low', 'Medium', 'High'],
  status: ['Grooming', 'To-Do', 'In Progress', 'Testing', 'Done', 'Cancelled'],
  effortPoints: Number (Fibonacci-based),
  dueDate,
  dueDateUpdateCount,  // Tracks "Spill"
  completed: Boolean   // Synced with status === 'Done'
}
```

---

## Setup Instructions

### 1. Clone & Install
```bash
git clone https://github.com/Hanhnguyen21-sys/TrackerApp1.git
cd TrackerApp1

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2. Configuration
Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
OPENROUTER_API_KEY=your_openrouter_key
```

### 3. Run Development
- **Backend**: `npm run dev` (inside /backend)
- **Frontend**: `npm run dev` (inside /frontend)
