# Volunteer Yatra

A full-stack event management platform for volunteer organizations to create, manage, and track events along with participant registrations. Built with Next.js, Express.js, and Supabase.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Architecture Overview](#architecture-overview)
- [Database Design](#database-design)
- [API Endpoints](#api-endpoints)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)

---

## Overview

Volunteer Yatra enables organizations to manage the complete lifecycle of volunteer events. Organizers can create events with detailed information including dates, locations, categories, capacity limits, and cover images. Volunteers can discover events and register. The dashboard provides analytics, participant management, CSV export, and real-time statistics.

The application uses Supabase for both the PostgreSQL database and file storage (event cover images, avatar uploads). All file uploads are handled through Supabase Storage buckets, with the backend managing access and serving signed URLs.

---

## Key Features

**Authentication and User Management**
- Email and password registration with bcrypt password hashing
- JWT-based authentication with 7-day token expiry
- Password reset flow with email verification
- Profile management with avatar image upload via Supabase Storage

**Event Management**
- Create events with name, description, date, time, location, category, and cover image
- Set maximum participant limits and registration deadlines
- Edit or delete events (owner only)
- Track event status (backlog, in progress, completed)
- Search events by name, filter by date, location, and status
- Location search with OpenStreetMap autocomplete suggestions
- Interactive map display using Leaflet with geocoded coordinates

**Participant Management**
- Volunteers can register for events with name and email
- Duplicate registration prevention with clear error messages
- Re-activation of previously cancelled registrations
- Capacity checking prevents over-registration
- Registration deadline enforcement
- Event owners can view all participants, manually add participants, and cancel registrations
- Email confirmation sent on successful registration via Resend API
- CSV export of events and participant data

**Dashboard and Analytics**
- Overview statistics: total events, upcoming events, total participants, completion rate
- Monthly, daily, or yearly event trend charts based on date range
- Event status distribution pie chart
- Date range filtering for statistics
- Real-time dashboard updates via Supabase subscriptions
- Sortable and filterable data tables with column visibility controls

**File Storage**
- Event cover images uploaded to Supabase Storage bucket
- User avatar images stored in a dedicated Supabase Storage bucket
- Image type validation and size limits enforced at the API level

---

## Technology Stack

### Frontend

| Technology | Purpose |
|---|---|
| Next.js 15 | React framework with file-based routing and Turbopack |
| React 19 | UI component library |
| TypeScript | Type-safe code |
| Tailwind CSS 4 | Utility-first styling with dark/light mode |
| Redux Toolkit + RTK Query | State management and API caching |
| TanStack Table | Sortable, resizable data tables |
| Leaflet | Interactive maps with OpenStreetMap tiles |
| Recharts | Bar and pie chart visualizations |
| Framer Motion | Page transitions and animations |
| Sonner | Toast notification system |
| Zod | Client-side form validation |

### Backend

| Technology | Purpose |
|---|---|
| Express.js 5 | Web server and routing |
| TypeScript | Type-safe code |
| Supabase Client | PostgreSQL queries and Storage API |
| jsonwebtoken | JWT generation and verification |
| bcryptjs | Password hashing |
| Zod | Request body validation |
| Resend | Transactional email service |
| Multer | File upload processing |

### Infrastructure

| Technology | Purpose |
|---|---|
| Supabase | Managed PostgreSQL database, Storage buckets, real-time subscriptions |
| Vercel | Frontend deployment (Next.js) |
| Render / Railway | Backend deployment (Express.js) |

---

## Architecture Overview

### Frontend Layer Architecture

The frontend follows a strict layered architecture where each layer can only depend on layers below it. This ensures the codebase remains maintainable as it grows.

**Layer 1 - Pages:** Next.js App Router pages. These are thin entry points that import a single component from a feature module. No business logic, no API calls, no state.

**Layer 2 - Feature Components:** Pure rendering components that receive data and callbacks through props. They handle visual layout and user interactions only.

**Layer 3 - Feature Hooks:** Custom hooks that contain all business logic. They call RTK Query hooks, handle form submission, manage navigation, and trigger notifications.

**Layer 4 - Feature Services:** RTK Query endpoint definitions using `injectEndpoints`. Each service handles one domain (auth, events, participants) with query parameters, response transformations, and cache tag invalidation.

**Layer 5 - Common and Store:** Shared API client, route constants, TypeScript interfaces, utility functions, validation schemas, and Redux store configuration.

### Backend Module Structure

Each backend module follows a three-layer pattern:

- **Routes** (*.routes.ts): Define HTTP endpoints and attach middleware (authenticate, validate).
- **Controllers** (*.controller.ts): Parse requests, enforce authorization, call models, format responses.
- **Models** (*.model.ts): Execute database queries via the Supabase client, return typed data.

### Middleware Pipeline

Every API request passes through: authenticate (JWT verification) -> validate (Zod schema validation) -> controller (business logic) -> error-handler (consistent error responses).

---

## Database Design

### Entity Relationships

The database uses three tables with foreign key relationships:

- **users**: Stores account information including email, hashed password, name, and avatar URL.
- **events**: Stores event details including name, description, date, location, status, category, capacity, and cover image URL. Each event belongs to a user (owner).
- **participants**: Stores registrations linking volunteers to events. Tracks name, email, status (applied, cancelled), and cancellation reason.

### Key Constraints

- A unique constraint on (event_id, user_id) prevents duplicate registrations.
- Cascade deletes ensure participants are removed when the parent event or user is deleted.
- Status fields use CHECK constraints to restrict values to allowed options.

### Supabase Storage

Two storage buckets are configured:
- **event-covers**: Stores event cover images uploaded by organizers.
- **avatars**: Stores user profile avatar images.

Uploaded files are validated for type (JPEG, PNG, WebP, GIF) and size (max 5MB). The backend generates unique filenames to prevent collisions.

---

## API Endpoints

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | No | Create a new account |
| POST | /api/auth/login | No | Login and receive JWT |
| GET | /api/auth/me | Yes | Get current user profile |
| POST | /api/auth/forgot-password | No | Request password reset |
| POST | /api/auth/reset-password | No | Reset password with token |
| PATCH | /api/auth/profile | Yes | Update profile details |

### Events

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /api/events | Yes | List events with search, filter, sort, and pagination |
| GET | /api/events/stats | Yes | Dashboard statistics with date range filtering |
| GET | /api/events/export/csv | Yes | Export events as CSV |
| GET | /api/events/:eventId | Yes | Get event details with participant count |
| POST | /api/events | Yes | Create a new event |
| PUT | /api/events/:eventId | Yes | Update event (owner only) |
| PATCH | /api/events/:eventId/status | Yes | Update event status (owner only) |
| DELETE | /api/events/:eventId | Yes | Delete event (owner only) |

### Participants

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/events/:eventId/apply | Yes | Register for an event (with duplicate check) |
| POST | /api/events/:eventId/participants/add | Yes | Manually add participant (owner only) |
| GET | /api/events/:eventId/participants | Yes | List participants (owner only) |
| DELETE | /api/events/:eventId/participants/:participantId | Yes | Cancel registration with reason (owner only) |

### File Upload

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/upload | Yes | Upload event cover image to Supabase Storage |

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- A Supabase account (free tier works) with a project configured
- A Resend account for email (optional - app works without it)

### Setup Steps

1. Clone the repository and install dependencies:
   ```
   git clone <repository-url>
   cd volunteerYatra
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. Configure your Supabase project:
   - Create a new Supabase project
   - Run the migration files from the project to create tables (users, events, participants)
   - Create two Storage buckets: event-covers and avatars
   - Note your Supabase URL and anon key

3. Set environment variables (see table below)

4. Start the development servers:
   ```
   # Terminal 1 - Backend (port 4000)
   cd backend && npm run dev

   # Terminal 2 - Frontend (port 3000)
   cd frontend && npm run dev
   ```

5. Open http://localhost:3000, create an account, and start managing events.

---

## Environment Variables

### Backend (.env)

| Variable | Description |
|---|---|
| PORT | Server port (default: 4000) |
| SUPABASE_URL | Supabase project URL |
| SUPABASE_ANON_KEY | Supabase anonymous key |
| JWT_SECRET | Secret key for signing JWT tokens |
| RESEND_API_KEY | Resend API key for email (optional) |
| EMAIL_FROM | Sender email for notifications |
| FRONTEND_URL | Frontend URL for password reset links |

### Frontend (.env.local)

| Variable | Description |
|---|---|
| NEXT_PUBLIC_API_URL | Backend API base URL (default: http://localhost:4000/api) |
| NEXT_PUBLIC_SUPABASE_URL | Supabase project URL for real-time features |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase anon key for real-time features |

---

## License

MIT
