# SubDub — Subscription Tracking API

A Node.js and Express backend for managing user accounts and recurring subscriptions. The project uses MongoDB for persistence and Upstash Workflow to schedule renewal reminders, with email notifications sent through Nodemailer.

> **Project scope:** This repository contains the backend API only. A frontend application is not included in the supplied source archive.

---

## Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running the Server](#running-the-server)
- [API Reference](#api-reference)
- [Subscription Data Model](#subscription-data-model)
- [Renewal Reminder Workflow](#renewal-reminder-workflow)
- [Security Notes](#security-notes)
- [Current Implementation Notes](#current-implementation-notes)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

SubDub is a subscription-tracking backend designed to keep track of recurring services and their renewal dates. Users can create accounts, authenticate with a JSON Web Token (JWT), and create and retrieve subscription records.

When a subscription is created, the API triggers an Upstash Workflow. The workflow checks the renewal date and schedules reminder emails for **7, 5, 2, and 1 day before renewal**.

## Features

- **User authentication**
  - User registration and sign-in
  - Password hashing with `bcryptjs`
  - JWT-based authentication
- **Subscription management**
  - Create a subscription
  - Retrieve subscription details
  - Retrieve subscriptions belonging to a user
  - Store price, currency, frequency, category, status, start date, and renewal date
- **Automated renewal reminders**
  - Upstash Workflow integration
  - Scheduled reminders at 7, 5, 2, and 1 day before renewal
  - HTML email templates
- **Request protection**
  - Arcjet Shield protection
  - Bot detection
  - Token-bucket rate limiting
- **Database**
  - MongoDB connection through Mongoose
  - Mongoose schema validation and timestamps
- **Centralized error handling**
  - Express error middleware for common database and validation errors

## Tech Stack

| Category | Technology |
|---|---|
| Runtime | Node.js (20 or later) |
| Server | Express 5 |
| Database | MongoDB |
| ODM | Mongoose |
| Authentication | JSON Web Token (`jsonwebtoken`) |
| Password hashing | `bcryptjs` |
| Workflow scheduling | Upstash Workflow |
| Email delivery | Nodemailer (Gmail transport) |
| Date handling | Day.js |
| Security and rate limiting | Arcjet |
| Configuration | dotenv |

---

## Architecture

The application follows a modular, controller-based Express structure:

```text
Client
  |
  v
Express API (index.js)
  |
  +--> Routes
  |      +--> Authentication
  |      +--> Users
  |      +--> Subscriptions
  |      +--> Workflow callback
  |
  v
Middleware
  +--> Arcjet request protection
  +--> JWT authorization (protected routes)
  +--> Centralized error handling
  |
  v
Controllers
  +--> Authentication logic
  +--> User queries
  +--> Subscription operations
  +--> Renewal reminder workflow
  |
  +--------------------+
  |                    |
  v                    v
MongoDB             Upstash Workflow
                       |
                       v
                 Scheduled reminders
                       |
                       v
                 Nodemailer / Gmail
                       |
                       v
                  User's inbox
```

## Project Structure

```text
subscription-tracking-main/
│
├── config/
│   ├── arcjet.js                 # Arcjet security and rate-limit rules
│   ├── nodemailer.js             # Gmail SMTP transport configuration
│   └── upstash.js                # Upstash Workflow client
│
├── controller/
│   ├── authController.js         # Sign-up, sign-in, sign-out handlers
│   ├── subscriptionController.js # Subscription create and read handlers
│   ├── userContoller.js          # User read handlers
│   └── workflowController.js     # Scheduled renewal reminder workflow
│
├── database/
│   └── mognoDB.js                # MongoDB connection
│
├── middleware/
│   ├── arcjetMiddleware.js       # Arcjet request protection
│   ├── authMiddleware.js         # JWT verification and user authorization
│   └── errorMiiddleware.js       # Centralized error responses
│
├── models/
│   ├── subscripitionModel.js     # Subscription Mongoose schema
│   └── userModel.js              # User Mongoose schema
│
├── routes/
│   ├── authRoute.js              # /api/v1/auth
│   ├── subscriptionRouter.js     # /api/v1/subscriptions
│   ├── userRouter.js             # /api/v1/users
│   └── workflowRoute.js          # /api/v1/workflow
│
├── utils/
│   ├── emailsTemplate.js         # Renewal reminder email templates
│   └── send-email.js             # Email generation and delivery
│
├── .env                          # Local environment variables (create this)
├── .gitignore
├── index.js                      # Express app and server entry point
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

Install or arrange the following before running the project:

- [Node.js](https://nodejs.org/) **20 or later**
- npm (included with Node.js)
- A MongoDB database (local MongoDB or MongoDB Atlas)
- An Arcjet API key
- An Upstash Workflow/QStash URL and token
- A Gmail account configured with an app password for email delivery

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd subscription-tracking-main
```

Replace `<your-repository-url>` with your Git repository URL.

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root. Add the variables listed in the next section and provide your own credentials.

### 4. Start the server

```bash
node index.js
```

For automatic restarts during development, run:

```bash
npx nodemon index.js
```

The application uses port `5000` by default. Set `PORT` in `.env` to use another port.

---

## Environment Variables

Create `.env` in the root directory:

```env
# Server
PORT=5000
SERVER_URL=http://localhost:5000

# MongoDB
DB_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET=replace_with_a_long_random_secret

# Arcjet
ARCJET_KEY=your_arcjet_key

# Upstash Workflow / QStash
QSTASH_URL=your_upstash_workflow_url
QSTASH_TOKEN=your_upstash_token

# Email (Gmail app password)
EMAIL_PASSWORD=your_gmail_app_password
```

| Variable | Purpose |
|---|---|
| `PORT` | Port on which the Express server listens |
| `SERVER_URL` | Publicly reachable base URL used when triggering the reminder workflow |
| `DB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign and verify JWTs |
| `ARCJET_KEY` | Arcjet site/API key |
| `QSTASH_URL` | Upstash Workflow/QStash base URL |
| `QSTASH_TOKEN` | Upstash authentication token |
| `EMAIL_PASSWORD` | Gmail app password used by Nodemailer |

**Important configuration notes**

- `SERVER_URL` must point to an address that Upstash can reach when it calls the workflow endpoint. `localhost` is suitable only for local development and is not reachable by the hosted workflow service.
- The email transport uses a Gmail account configured in `config/nodemailer.js`; `EMAIL_PASSWORD` is the app password for that configured account, not the normal Gmail login password.
- Never commit `.env` or expose API keys, database credentials, JWT secrets, or email app passwords.
- The sender email address is currently defined directly in `config/nodemailer.js`.

---

## Running the Server

Start the API:

```bash
node index.js
```

When the database connection succeeds, the server logs the port it is listening on.

Check the root route:

```http
GET /
```

Expected response:

```text
Welcome to backend setup
```

The API routes are mounted under `/api/v1`.

---

## API Reference

Base URL for local development:

```text
http://localhost:5000/api/v1
```

Requests that use protected routes must include a JWT in the `Authorization` header:

```http
Authorization: Bearer <your_jwt_token>
```

### Authentication

Base path: `/auth`

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| POST | `/sign_up` | Register a user | No |
| POST | `/sign_in` | Sign in a user | No |
| POST | `/sign_out` | Sign out | No |

**Sign-up example**

```http
POST /api/v1/auth/sign_up
Content-Type: application/json
```

```json
{
  "name": "Alex Morgan",
  "email": "alex@example.com",
  "password": "your-password"
}
```

**Sign-in example**

```http
POST /api/v1/auth/sign_in
Content-Type: application/json
```

```json
{
  "email": "alex@example.com",
  "password": "your-password"
}
```

The sign-up and sign-in handlers return a JWT in the response. Use that token as a Bearer token for protected endpoints.

### Users

Base path: `/users`

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| GET | `/` | Retrieve all users | No |
| GET | `/:id` | Retrieve a user by ID (password excluded) | Yes |

### Subscriptions

Base path: `/subscriptions`

| Method | Endpoint | Description | Authentication / implementation |
|---|---|---|---|
| GET | `/` | Subscription route placeholder | No |
| GET | `/:id` | Retrieve subscription details | Yes |
| POST | `/` | Create a subscription and trigger its reminder workflow | Yes |
| PUT | `/:id` | Update subscription route placeholder | Not implemented |
| DELETE | `/:id` | Delete subscription route placeholder | Not implemented |
| GET | `/user/:id` | Retrieve subscriptions for a user | Yes; user ID must match authenticated user |
| PUT | `/:id/cancel` | Cancel subscription route placeholder | Not implemented |
| GET | `/upcomming-renewals` | Upcoming-renewals route placeholder | Not implemented |

**Create subscription example**

```http
POST /api/v1/subscriptions
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

```json
{
  "name": "Streaming Service",
  "price": 499,
  "currency": "INR",
  "frequency": "monthly",
  "category": "entertainment",
  "PaymentMethod": "Credit Card",
  "startDate": "2026-11-01T00:00:00.000Z"
}
```

The `user` field is assigned by the API from the authenticated user; it should not be supplied by the client. If `renewalDate` is omitted, the subscription model calculates it from `startDate` and `frequency`.

**Retrieve a user's subscriptions**

```http
GET /api/v1/subscriptions/user/<user_id>
Authorization: Bearer <your_jwt_token>
```

The authenticated user's ID must match the ID in the URL.

### Workflow

Base path: `/workflow`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/subscriptions/reminder` | Upstash Workflow callback for subscription reminders |

This endpoint is intended to be invoked by the configured Upstash Workflow integration after a subscription is created.

> **Implementation status:** The API reference reflects the routes present in the supplied source. Routes labelled as placeholders return placeholder responses; they are not complete CRUD operations yet.

---

## Subscription Data Model

The subscription schema currently defines these fields:

| Field | Type | Notes |
|---|---|---|
| `name` | String | Required; trimmed |
| `price` | Number | Required |
| `currency` | String | `INR` or `USD`; defaults to `INR` |
| `frequency` | String | `daily`, `weekly`, `monthly`, or `yearly` |
| `category` | String | `sports`, `entertainment`, `lifestyle`, `technology`, `finance`, `polictics`, or `others` |
| `PaymentMethod` | String | Required; trimmed |
| `status` | String | `Active`, `Cancelled`, or `Expired`; defaults to `Active` |
| `startDate` | Date | Required; must not be in the future |
| `renewalDate` | Date | Validated to be after `startDate`; calculated if omitted |
| `user` | ObjectId | Required reference to the owning user |

Mongoose timestamps (`createdAt` and `updatedAt`) are enabled.

### Renewal date calculation

When `renewalDate` is not provided, the model calculates it using the subscription frequency:

| Frequency | Days added |
|---|---:|
| Daily | 1 |
| Weekly | 7 |
| Monthly | 30 |
| Yearly | 365 |

The model also sets the status to `Expired` when the renewal date is earlier than the current date; otherwise, it sets it to `Active`.

---

## Renewal Reminder Workflow

After a subscription is created:

1. The subscription controller stores the subscription in MongoDB.
2. The controller triggers an Upstash Workflow and sends the new subscription ID in the workflow payload.
3. The workflow fetches the subscription and populates its user's name and email.
4. It checks whether the renewal date has already passed.
5. It schedules reminder steps for 7, 5, 2, and 1 day before renewal.
6. When a reminder is due, the matching HTML email template is generated and sent through Nodemailer.

The reminder email includes the user's name, subscription name, renewal date, plan, price, and payment method.

For hosted use, configure the workflow callback URL using the deployed server's public `SERVER_URL`.

---

## Security Notes

- Passwords are hashed with `bcryptjs` before being stored.
- Protected endpoints use JWT verification.
- Arcjet is configured with Shield, bot detection, and token-bucket rate limiting.
- User lookup by ID excludes the password field from its response.
- Keep secrets in environment variables and out of source control.

Before using this project in production, review the implementation notes below and complete the unfinished handlers and validation.

---

## Current Implementation Notes

The supplied repository is a backend in progress. The following points are intentionally documented rather than presented as completed functionality:

- Subscription update, delete, cancellation, and upcoming-renewal routes currently return placeholder responses.
- The sign-out controller is currently empty.
- The all-users endpoint is currently unauthenticated; restrict it before production use.
- Add request validation for authentication and subscription payloads, and ensure all error paths return or throw consistently.
- Review authentication controller handling for missing users and invalid passwords so execution stops immediately after sending an error response.
- Review ownership checks and authorization on subscription detail routes so users cannot access another user's records.
- Confirm the workflow callback is protected/verified according to the Upstash deployment configuration.
- Verify the email configuration and reminder delivery behavior in a deployed environment.
- The package currently defines no `start`, `dev`, or automated test script. The commands in this README run the existing entry point directly.

These are code-review observations from the supplied project files, not claims that the features are already fixed.

---

## Contributing

Contributions and improvements are welcome.

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Make and test your changes.
4. Commit with a descriptive message.
5. Push the branch and open a Pull Request.

For larger changes, consider opening an issue first to discuss the proposed implementation.

## License

The supplied `package.json` declares the project license as **ISC**. Add a repository-level `LICENSE` file if you intend to distribute the project under that license.
