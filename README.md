# SecureNotes Pro

SecureNotes Pro is a production-ready, full-stack, modular note management application built with a Flask backend and a React (Vite) frontend.

This repository hosts the **foundation architecture** phase. The core codebase establishes clean architectural layers, styling frameworks, database engines, configuration loaders, and a placeholder UI.

---

## Directory Structure

```text
secure-notes-pro/
├── backend/
│   ├── app/
│   │   ├── middleware/        # Authentication, rate limiting & session guards
│   │   │   └── __init__.py    # Pluggable session validation wrapper shell
│   │   ├── models/            # SQLAlchemy DB models (empty structure for this phase)
│   │   │   └── __init__.py
│   │   ├── routes/            # Flask Route Blueprints
│   │   │   ├── auth_routes.py # Auth blueprint placeholders (register, login, me)
│   │   │   ├── main_routes.py # Common utilities & Health Check (/api/health)
│   │   │   └── notes_routes.py# CRUD Note blueprint placeholders
│   │   ├── services/          # Isolated service layers for core business logic
│   │   │   └── __init__.py    # BaseService, AuthService, NoteService skeletons
│   │   ├── utils/             # JSON builders & response formatter helpers
│   │   │   └── helpers.py
│   │   └── __init__.py        # App Factory, DB, CORS & extension binding
│   ├── config.py              # Environment configurations (Dev, Test, Prod)
│   ├── run.py                 # Backend entry point
│   ├── requirements.txt       # Python backend dependencies list
│   └── .env                   # Backend environment variables configuration
│
├── frontend/
│   ├── src/
│   │   ├── assets/            # Global UI assets
│   │   ├── components/        # Reusable presentation components
│   │   │   ├── Navbar.jsx     # SaaS landing header component
│   │   │   └── Sidebar.jsx    # Responsive collapsible sidebar navigation
│   │   ├── constants/         # UI Constants, Categories and Priorities
│   │   │   └── index.js
│   │   ├── context/           # State context wrappers
│   │   │   └── AuthContext.jsx# AuthContext structure (no mock logic)
│   │   ├── hooks/             # Custom hook libraries
│   │   │   └── useAuth.js     # Auth Context consumer hook
│   │   ├── layouts/           # Page structural layouts
│   │   │   ├── AuthLayout.jsx # Glassmorphic centered grid card container
│   │   │   └── DashboardLayout.jsx# Sidebar and content canvas split container
│   │   ├── pages/             # Page route endpoints
│   │   │   ├── Dashboard.jsx  # Metrics and stats dashboards
│   │   │   ├── Home.jsx       # SaaS Product Landing Page
│   │   │   ├── Login.jsx      # Login access forms
│   │   │   └── Register.jsx   # Register workspace accounts
│   │   ├── routes/            # React Router configurations
│   │   │   └── AppRoutes.jsx  # Page routes definition
│   │   ├── services/          # API connection layers
│   │   │   └── api.js         # Axios client (credentials & base url config)
│   │   ├── App.css            # Base styles container
│   │   ├── App.jsx            # Application root wrapping contexts
│   │   ├── index.css          # Tailwind CSS v4, animations & theme definitions
│   │   └── main.jsx           # App entry mounting DOM with BrowserRouter
│   ├── vite.config.js         # Vite configuration with @tailwindcss/vite
│   ├── .env                   # Frontend Vite environment variables config
│   └── package.json           # Frontend package manifests
```

---

## Backend (API) Setup

The backend utilizes **Flask Application Factory**, **SQLAlchemy ORM** targeting **SQLite**, and is prepared for **Flask-Login session-based authentication**.

### Prerequisite
- Python 3.9 or higher

### Steps

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - **Windows (Command Prompt):**
     ```cmd
     venv\Scripts\activate.bat
     ```
   - **Windows (PowerShell):**
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   - **macOS/Linux:**
     ```bash
     source venv/bin/activate
     ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Run the Flask development server:
   ```bash
   python run.py
   ```
   The backend will start on **`http://localhost:5000`**.

6. Verify the health status API:
   - Query: `GET http://localhost:5000/api/health`
   - Response:
     ```json
     {
       "status": "healthy",
       "service": "SecureNotes Pro API"
     }
     ```

---

## Frontend Setup

The frontend is bootstrapped with **Vite**, **React**, and **Tailwind CSS v4** (using `@tailwindcss/vite`).

### Prerequisite
- Node.js 18 or higher (LTS recommended)
- npm 9 or higher

### Steps

1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```

2. Install packages:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```
   The frontend application will start on **`http://localhost:5173`**.

4. Verify page builds:
   To run a production check build:
   ```bash
   npm run build
   ```
   Static files are compiled cleanly in `dist/`.

---

## Core Architectural Boundaries

1. **Routing and Layout Separation**: Layout structures are isolated in `frontend/src/layouts` and mapped within `frontend/src/routes/AppRoutes.jsx` to maximize reusability.
2. **Session-based Security**: Ready for Flask-Login, Axios uses `withCredentials: true` globally inside `api.js` to transfer cookie identifiers automatically.
3. **Isolation of Services**: Blueprints act as routers, delegating execution logic to subclasses in `backend/app/services`.
4. **Tailwind v4 Theme Engine**: Customized properties (shadow overlays, gradients, and custom colors) are handled via CSS `@theme` variables directly inside `index.css`.
