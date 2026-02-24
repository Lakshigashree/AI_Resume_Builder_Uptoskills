# AI Resume Builder – Uptoskills

A production-grade, full-stack resume building platform designed to help users create professional resumes and optimize them for Applicant Tracking Systems (ATS).

**Repository:** [https://github.com/Lakshigashree/AI_Resume_Builder_Uptoskills](https://github.com/Lakshigashree/AI_Resume_Builder_Uptoskills)

---

## 1. Project Overview

AI Resume Builder – Uptoskills is built using a modular React frontend and an Express-based backend powered by PostgreSQL. The system is structured to support scalable resume management, structured data handling, and secure authentication.

The application follows a layered architecture:

* Presentation Layer (React)
* API Layer (Express REST APIs)
* Business Logic Layer (Controllers & Services)
* Data Layer (PostgreSQL)

---

## 2. Core Features

### 🚀 Resume Creation & Customization

* **30+ Professional Templates** — Industry-standard resume designs structured for clarity and impact.
* **Live Editing Preview** — Real-time visual updates while editing content.
* **Structured Section Management** — Modular sections (Experience, Education, Skills, Projects, Certifications, etc.).
* **Undo / Redo Support** — Controlled editing state management.
* **Rich Text Formatting** — Font emphasis, spacing control, structured alignment.
* **Multi-Resume Support** — Manage multiple resumes under a single account.

---

### 🎨 Design & Formatting System

* **Template-Based Layout Architecture** — Consistent alignment, spacing, and typography rules.
* **Responsive Rendering Engine** — Maintains structural integrity across screen sizes.
* **Print-Optimized PDF Export** — Clean page breaks and professional formatting.
* **Visual Hierarchy Control** — Balanced section spacing and readable typography.

---

### 📊 ATS Optimization Engine

* **Resume vs Job Description Matching** — Measures alignment with specific job roles.
* **Keyword Gap Detection** — Identifies missing or weak keywords.
* **Category-Based Scoring** — Structured evaluation across Skills, Experience, Content Quality, and Structure.
* **Actionable Feedback** — Clear, formatted analysis results for improvements.

---

### 🔐 Security & Platform Architecture

* **JWT-Based Authentication** — Secure login and protected routes.
* **Role-Based Access Control** — Database-level user role handling.
* **Modular Backend Architecture** — Routes → Controllers → Services → Database.
* **Environment-Based Configuration** — Secure management of secrets via environment variables.

---

## 3. Technology Stack

### Frontend

* React (Vite)
* Tailwind CSS
* Axios
* React Router

### Backend

* Node.js
* Express.js
* PostgreSQL
* JWT Authentication

### AI Integration

* Google Gemini API
* OpenAI API (optional)

---

## 4. System Architecture

```
[ React Client ]
        │
        ▼
[ Express REST API ]
        │
        ▼
[ Controllers & Services ]
        │
        ▼
[ PostgreSQL Database ]
```

The backend maintains separation of responsibilities:

* Routes handle request mapping
* Controllers manage request-response lifecycle
* Services encapsulate business logic
* Database layer manages persistence

---

## 5. Entity Relationship Diagram

The core data model is structured around users and resumes.

```
┌──────────────┐        1 ──────────── ∞       ┌──────────────┐
│    users     │───────────────────────────────│    resumes   │
├──────────────┤                               ├──────────────┤
│ id (PK)      │                               │ id (PK)      │
│ name         │                               │ user_id (FK) │
│ email        │                               │ title        │
│ password     │                               │ template_id  │
│ role         │                               │ content_json │
│ created_at   │                               │ created_at   │
└──────────────┘                               └──────────────┘
```

**Relationship:**

* One user can create multiple resumes.
* Each resume belongs to exactly one user.

The `content_json` column enables structured storage of resume sections while maintaining relational consistency.

---

## 6. Getting Started

### Clone Repository

```bash
git clone https://github.com/Lakshigashree/AI_Resume_Builder_Uptoskills.git
cd AI_Resume_Builder_Uptoskills
```

---

### Backend Setup

```bash
cd server
npm install
```

Create `server/.env`:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/ai_resume_builder
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
GOOGLE_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

Run backend:

```bash
npm run dev
```

---

### Frontend Setup

```bash
cd ../client
npm install
npm run dev
```

---

## 7. PostgreSQL Setup

Using pgAdmin or psql:

```sql
CREATE DATABASE ai_resume_builder;
```

Ensure PostgreSQL is running on port 5432 and update the `DATABASE_URL` accordingly.

---

## 8. Project Structure

```
AI_Resume_Builder_Uptoskills/
├── client/
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── server.js
└── README.md
```

---

## 9. API Overview

### Authentication

* POST /api/auth/register
* POST /api/auth/login
* GET /api/auth/profile

### Resume Management

* GET /api/resumes
* POST /api/resumes
* PUT /api/resumes/:id
* DELETE /api/resumes/:id

### AI Services

* POST /api/ai/enhance

---

## 10. Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Submit a pull request

Maintain clean architecture and modular design principles.

---

## License

Refer to the `LICENSE` file for licensing information.
