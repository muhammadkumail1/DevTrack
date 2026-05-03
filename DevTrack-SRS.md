# Software Requirements Specification (SRS)

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification describes the functional and non-functional requirements for DevTrack, a Software Project Management Information System (SPMIS) designed to support software development teams with project planning, execution, tracking, and reporting.

The document is intended for:
- project stakeholders and sponsors
- product owners and business analysts
- developers and QA engineers
- system integrators and maintainers

### 1.2 Scope

DevTrack provides a browser-based application that lets teams manage projects, tasks, bugs, sprints, milestones, requirements, team roles, and work logs through a secure web interface backed by a RESTful API.

Key capabilities include:
- secure user authentication and role-based access control
- project workspace creation and overview dashboards
- task workflow management and status updates
- bug reporting, triage, and closure
- sprint planning and tracking
- milestone planning and approval
- requirements capture and versioning
- work logging and productivity reporting
- AI-assisted suggestions and command support

### 1.3 Definitions, Acronyms, and Abbreviations

- SRS: Software Requirements Specification
- API: Application Programming Interface
- JWT: JSON Web Token
- UI: User Interface
- UX: User Experience
- CRUD: Create, Read, Update, Delete
- SPMIS: Software Project Management Information System
- REST: Representational State Transfer

### 1.4 References

- DevTrack repository documentation
- IEEE Std 830-1998: IEEE Recommended Practice for Software Requirements Specifications
- JWT RFC 7519
- MongoDB and Mongoose documentation

### 1.5 Overview

This document describes the overall product context, external interfaces, user characteristics, and detailed requirements. It defines how DevTrack should behave from a functional and quality perspective.

## 2. Overall Description

### 2.1 Product Perspective

DevTrack is a standalone web application with a decoupled architecture:
- Frontend: vanilla React application using `React.createElement`
- Backend: Express.js server exposing `/api/*` endpoints
- Database: MongoDB using Mongoose schemas
- Authentication: JWT tokens with login/register flows

The backend serves the frontend statically and performs API request handling, authentication, and business logic.

### 2.2 Product Functions

The product supports the following top-level functions:
- User authentication and session management
- Creation and management of projects
- Task creation, assignment, editing, and status transition
- Bug reporting, updating, and lifecycle control
- Sprint creation, editing, and deletion
- Milestone planning, approval, and progress tracking
- Requirement management with CRUD operations
- Team member and role management
- Work log entry creation and management
- Reporting dashboards for progress, velocity, and resource tracking
- AI assistant for command processing and project guidance

### 2.3 User Characteristics

Primary user roles:
- Admin: full access to all system functions and settings
- Manager: manage projects, teams, sprints, milestones, and reports
- Developer: manage and update assigned tasks, view projects and sprints
- Tester: report bugs, update bug status, and track test-related tasks

Users are expected to be familiar with software project workflows and use a modern browser.

### 2.4 Operating Environment

- Browser-based application accessible from modern browsers (Chrome, Edge, Firefox)
- Backend runs on Node.js 18+
- MongoDB 5.x or later
- Local or hosted deployment environment for backend and database

### 2.5 Design and Implementation Constraints

- API must be RESTful and stateless
- Authentication must use JWT and support secure storage in the client
- Role-based access control enforced on protected routes
- Frontend must be usable without a build step (vanilla JS and React)
- Database model must use MongoDB/Mongoose

### 2.6 User Documentation

User-facing documentation includes:
- basic application usage guide
- login and registration instructions
- project and task management workflows
- reporting and dashboard navigation
- role-based access and permissions overview

### 2.7 Assumptions and Dependencies

- Users have valid network access to the application server
- The MongoDB instance is reachable and authenticated correctly
- Browser clients support ES6 and modern DOM APIs
- JWT secret and environment variables are configured securely

## 3. Specific Requirements

### 3.1 External Interface Requirements

#### 3.1.1 User Interfaces

- Login and registration screens
- Dashboard with KPI cards and task summaries
- Project listing and project details pages
- Board view for kanban-style task movement
- Forms for tasks, sprints, milestones, requirements, and bugs
- Toast notifications in the top-right corner
- AI assistant overlay for prompts and suggestions

#### 3.1.2 Hardware Interfaces

- No direct hardware interfaces required beyond standard client devices running a web browser

#### 3.1.3 Software Interfaces

- Backend exposes REST API under `/api/*`
- Frontend uses `fetch` via `frontend/js/api.js`
- Database interface is provided by Mongoose models

#### 3.1.4 Communications Interfaces

- HTTP / HTTPS for browser-rest API communication
- Authorization header: `Authorization: Bearer <token>`

### 3.2 Functional Requirements

#### 3.2.1 Authentication and Authorization

- FR1: Users must register with name, email, password, and role
- FR2: Users must login with email and password
- FR3: Backend must issue JWT on successful login
- FR4: Protected API routes require valid JWT
- FR5: Role-based restrictions must prevent unauthorized CRUD actions

#### 3.2.2 Project Management

- FR6: Managers/Admins can create, edit, archive, and delete projects
- FR7: Projects must include title, description, status, members, and dates
- FR8: Project overview endpoint must return project health, progress, and active sprint data
- FR9: Project dashboards should auto-refresh while open and when switching tabs

#### 3.2.3 Task Management

- FR10: Users can create tasks with title, description, priority, assigned user, due date, and status
- FR11: Users can update task details and status
- FR12: Task board must support moving tasks between `To Do`, `In Progress`, and `Done`
- FR13: Task updates must reflect immediately in project overview and dashboard metrics

#### 3.2.4 Bug Tracking

- FR14: Users can report bugs with severity, status, project association, and description
- FR15: Bugs can be updated, closed, and deleted
- FR16: Bug status and critical counts appear in project and global reports

#### 3.2.5 Sprint Planning

- FR17: Managers/Admins can create, update, and remove sprints
- FR18: Sprints must record name, start date, end date, status, and project association
- FR19: Active sprint details display on project overview

#### 3.2.6 Milestone Tracking

- FR20: Users can create milestones with title, description, due date, and status
- FR21: Managers/Admins can approve milestones
- FR22: Completed milestone counts appear in project progress reports

#### 3.2.7 Requirement Management

- FR23: Users can create, update, and list requirements
- FR24: Requirements are linked to projects and can be tracked in reports

#### 3.2.8 Reporting and Dashboards

- FR25: System provides dashboard summary endpoint with project, task, and bug KPIs
- FR26: Progress endpoint returns project progress data for manager dashboards
- FR27: Project-specific overview endpoint returns health, statistics, recent tasks, and active sprint data

#### 3.2.9 AI Assistant

- FR28: AI assistant endpoint accepts command input and returns suggestions
- FR29: AI assistant may provide project-specific guidance or task prompts

#### 3.2.10 Notifications

- FR30: User actions produce toast notifications visible in the top-right corner
- FR31: Notifications should not be obscured by floating UI elements

### 3.3 Performance Requirements

- PR1: API response time should be under 500ms for standard list and summary endpoints under normal load
- PR2: Frontend should update critical dashboard views within 1 second after data changes
- PR3: Periodic auto-refresh should not exceed a 30-second interval for active dashboards

### 3.4 Design Constraints

- DC1: Must support desktop and responsive tablet browsers
- DC2: No client-side build tool required for deployment
- DC3: Data persistence must use MongoDB with Mongoose schemas
- DC4: API design must follow REST conventions

### 3.5 Software System Attributes

#### 3.5.1 Reliability

- The backend should recover cleanly from transient errors and preserve data integrity.
- JWT validation must reject expired or tampered tokens.

#### 3.5.2 Availability

- The system should be accessible during normal business hours with minimal planned downtime.

#### 3.5.3 Security

- Passwords must be hashed securely using bcrypt
- JWT secrets must be stored in environment variables
- Sensitive routes require authentication and appropriate role checks
- Client should not expose raw credentials or secret data

#### 3.5.4 Maintainability

- Code should separate concerns across frontend pages, components, backend controllers, routes, and models
- Error handling should return clear messages for debugging and UX
- Documentation should describe setup, API usage, and environment requirements

#### 3.5.5 Portability

- Solution must run on Windows and Unix-like systems with Node.js support
- Database connectivity should work with local MongoDB or hosted MongoDB Atlas

## 4. Appendices

### 4.1 API Summary

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/projects`
- `GET /api/projects/:id`
- `GET /api/projects/:id/overview`
- `POST /api/projects`
- `PUT /api/projects/:id`
- `PATCH /api/projects/:id/archive`
- `DELETE /api/projects/:id`
- `GET /api/tasks`
- `GET /api/tasks/:id`
- `POST /api/tasks`
- `PUT /api/tasks/:id`
- `PATCH /api/tasks/:id/status`
- `DELETE /api/tasks/:id`
- `GET /api/bugs`
- `GET /api/bugs/:id`
- `POST /api/bugs`
- `PUT /api/bugs/:id`
- `PATCH /api/bugs/:id/close`
- `DELETE /api/bugs/:id`
- `GET /api/sprints`
- `GET /api/sprints/:id`
- `POST /api/sprints`
- `PUT /api/sprints/:id`
- `DELETE /api/sprints/:id`
- `GET /api/milestones`
- `POST /api/milestones`
- `PUT /api/milestones/:id`
- `PATCH /api/milestones/:id/approve`
- `GET /api/requirements`
- `POST /api/requirements`
- `PUT /api/requirements/:id`
- `GET /api/roles`
- `POST /api/roles`
- `PUT /api/roles/:id`
- `DELETE /api/roles/:id`
- `GET /api/worklogs`
- `POST /api/worklogs`
- `PUT /api/worklogs/:id`
- `DELETE /api/worklogs/:id`
- `GET /api/reports/dashboard`
- `GET /api/reports/progress`
- `GET /api/reports/project/:projectId`
- `GET /api/reports/velocity`
- `GET /api/reports/team`
- `POST /api/ai/command`
- `GET /api/ai/suggestions/:projectId`

### 4.2 Technology Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- dotenv
- cors
- React (vanilla)
- Fetch API
