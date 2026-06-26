# TaskFlow — Task Management Application

A full-stack task management application built with **Next.js** (frontend) and **Spring Boot + PostgreSQL** (backend).

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Running Spring Boot backend on port `8081`

### Setup

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd task-management-frontend

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local with your backend URL

# 4. Start development server
npm run dev
```

Visit **http://localhost:3000**

---

## 🌍 Environment Variables

Copy `.env.example` to `.env.local`:

```env
# Backend API base URL (no trailing slash)
NEXT_PUBLIC_API_URL=http://localhost:8081
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.js                 # Root layout with providers
│   ├── page.js                   # Redirects to /dashboard
│   ├── (auth)/
│   │   ├── login/page.js         # Login page
│   │   └── register/page.js      # Registration page
│   └── (dashboard)/
│       ├── layout.js             # Sidebar + Header layout
│       ├── dashboard/page.js     # Overview with stats
│       └── tasks/page.js         # Full task list with filters
├── components/
│   ├── TaskCard.js               # Individual task card
│   ├── TaskForm.js               # Create/edit form with validation
│   ├── TaskModal.js              # Modal wrapper for task form
│   ├── ConfirmModal.js           # Delete confirmation dialog
│   ├── Sidebar.js                # Navigation sidebar
│   ├── Header.js                 # Top header with theme toggle
│   ├── StatusBadge.js            # Status pill badge
│   ├── PriorityBadge.js          # Priority pill badge
│   ├── LoadingSkeleton.js        # Shimmer loading placeholders
│   ├── EmptyState.js             # Empty list state
│   ├── Pagination.js             # Page navigation
│   ├── Icons.js                  # SVG icon components
│   └── Providers.js              # Context providers wrapper
├── context/
│   ├── AuthContext.js            # JWT auth state management
│   └── ThemeContext.js           # Dark/light theme management
├── lib/
│   ├── api.js                    # Axios instance with JWT interceptor
│   └── utils.js                  # Date, status, priority helpers
└── styles/
    └── globals.css               # Full design system (CSS variables)
```

---

## 🔌 Backend API Contract

The frontend expects the following Spring Boot API endpoints:

### Auth
| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | `/auth/login` | `{ email, password }` | `{ status, message, data: { token, ... } }` |
| POST | `/auth/signup` | `{ username, email, password }` | `{ status, message, data: { ... } }` |

**Login response shape** (any of these are accepted inside `data`):
```json
{
  "status": "SUCCESS",
  "message": "Login successful",
  "data": { "token": "eyJ...", "user": { "id": 1, "username": "john", "email": "john@example.com" } }
}
```

### Tasks (all require `Authorization: Bearer <token>`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/tasks/getAll` | Paginated list |
| GET | `/tasks/get/:id` | Single task |
| POST | `/tasks/create` | Create task |
| PATCH | `/tasks/update/:id` | Update task (partial) |
| DELETE | `/tasks/delete/:id` | Delete task |

**Query parameters for GET /tasks/getAll:**
| Param | Values | Description |
|-------|--------|-------------|
| `page` | 0-indexed integer | Page number |
| `size` | integer | Items per page (default: 10) |
| `status` | `TODO`, `IN_PROGRESS`, `DONE` | Filter by status |
| `search` | string | Search by title |
| `sortBy` | `createdAt`, `dueDate`, `priority`, `title` | Sort field |
| `sortOrder` | `asc`, `desc` | Sort direction |

**Paginated response shape:**
```json
{
  "content": [...],
  "totalElements": 25,
  "totalPages": 3,
  "size": 10,
  "number": 0
}
```

**Task object:**
```json
{
  "id": 1,
  "title": "Fix login bug",
  "description": "...",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "dueDate": "2024-12-31",
  "createdAt": "2024-01-01T10:00:00Z",
  "userId": 1
}
```

---

## ✨ Features

- **Authentication** — JWT-based login/register, persisted across page refreshes (localStorage + cookie)
- **Task CRUD** — Create, read, update, delete tasks via modal forms
- **Status Filter** — Filter by All / To Do / In Progress / Done
- **Search** — Debounced title search (350ms delay)
- **Sort** — Sort by created date, due date, priority, or title; toggle ASC/DESC
- **Pagination** — Server-side pagination with ellipsis for large page counts
- **Optimistic UI** — Status toggle updates instantly, rolls back on error
- **Dark Mode** — Default dark theme; toggle persisted to localStorage
- **Responsive** — Sidebar becomes a drawer on mobile; full mobile-first layout
- **Loading States** — Shimmer skeleton cards while fetching
- **Empty States** — Friendly messages with action buttons
- **Error States** — Inline error messages with retry option
- **Form Validation** — Client-side validation with touched/error state on all forms

---

## 🧪 Running Tests

```bash
npm test
```

Tests cover:
1. **`utils.test.js`** — Date formatting, status helpers, initials, error extraction (6 test suites)
2. **`StatusBadge.test.js`** — Badge label rendering for all status/priority values
3. **`TaskCard.test.js`** — Task card rendering, click interactions, DONE state styling

---

## 🎨 Design System

The app uses CSS custom properties for theming:

- **Dark mode** (default): `--bg-body: #0c0c12`, `--primary: #818cf8`
- **Light mode**: `--bg-body: #f1f5f9`, `--primary: #6366f1`
- **Font**: Inter (Google Fonts)
- **Radius**: 10px default, 14px cards, 20px modals
- Toggle via the sun/moon icon in the header

---

## ⚙️ CORS (Spring Boot)

Add this to your Spring Boot backend to allow the Next.js dev server:

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:3000")
            .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true);
    }
}
```

---

## 📝 Assumptions & Trade-offs

- **JWT in localStorage**: Simple to implement; for production consider `httpOnly` cookies for XSS protection.
- **Middleware uses cookies**: The auth cookie is set alongside localStorage so Next.js middleware can protect routes server-side.
- **0-indexed pagination**: Spring Boot uses 0-based page indexing; the UI uses 1-based for display.
- **No TypeScript**: Used plain JS for simplicity as noted in requirements. Can be migrated to TS.
- **API flexibility**: The auth response parser handles multiple common Spring Boot JWT response shapes automatically.
- **Simple array fallback**: If the backend returns a plain array instead of a Spring Page object, the app handles both.

---

## 📦 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 3000) |
| `npm run build` | Build production bundle |
| `npm start` | Start production server |
| `npm test` | Run all tests |
| `npm run lint` | ESLint check |
