# Dynamic Form Builder Platform

Full-stack MERN assignment implementation for a Google Forms / Typeform style builder. It includes JWT authentication, owner-protected form management, drag-and-drop field ordering, conditional logic, public share links, validated submissions, analytics, response management, and CSV export.

## Stack

- Frontend: React, TypeScript, Tailwind CSS, Zustand, dnd-kit, Recharts
- Backend: Node.js, Express, TypeScript, MongoDB, Mongoose, JWT
- Auth: JWT bearer tokens
- API style: REST

## Features

- Register, login, logout, protected routes
- Dashboard with search, create, delete, duplicate, publish status, and response counts
- Form builder for text, textarea, number, dropdown, checkbox, radio, date, and email fields
- Required toggle, placeholder, help text, default values, and validation rules
- Drag-and-drop field reordering
- Conditional field visibility, for example show "Company name" only when "Are you employed?" equals "Yes"
- Public form sharing at `/form/:slug`
- Anonymous public submissions with server-side validation
- Response list, response filtering, CSV export, and response deletion
- Analytics with total submissions, submission trends, and option charts
- Responsive Tailwind UI with loading, empty, and toast states

## Project Structure

```text
dynamic-form-builder/
  client/   React + TypeScript frontend
  server/   Express + MongoDB backend
```

## Local Setup

1. Install dependencies:

```bash
npm run install:all
```

On Windows PowerShell, if `npm` is blocked by execution policy, use `npm.cmd` for the same commands.

2. Create backend environment file:

```bash
cp server/.env.example server/.env
```

3. Create frontend environment file:

```bash
cp client/.env.example client/.env
```

4. Start MongoDB locally or use MongoDB Atlas and set `MONGODB_URI` in `server/.env`.

5. Start the backend:

```bash
npm run dev:server
```

6. Start the frontend in another terminal:

```bash
npm run dev:client
```

Frontend runs at `http://localhost:5173`. Backend runs at `http://localhost:5000`.

## Environment Variables

Backend `server/.env`:

```bash
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/dynamic_form_builder
JWT_SECRET=replace-with-a-long-random-secret
CLIENT_URL=http://localhost:5173
```

Frontend `client/.env`:

```bash
VITE_API_URL=/api
```

For local demos, `/api` is proxied by Vite to `http://127.0.0.1:5000`.

## API Documentation

Base URL: `/api`

### Auth

`POST /auth/register`

```json
{
  "name": "Jithesh",
  "email": "jithesh@example.com",
  "password": "secret123"
}
```

`POST /auth/login`

```json
{
  "email": "jithesh@example.com",
  "password": "secret123"
}
```

Both return:

```json
{
  "user": {
    "id": "user-id",
    "name": "Jithesh",
    "email": "jithesh@example.com"
  },
  "token": "jwt-token"
}
```

Use the token as:

```text
Authorization: Bearer jwt-token
```

### Forms

`GET /forms` - list forms for the logged-in user.

`POST /forms` - create a form.

```json
{
  "title": "Job application",
  "description": "Candidate intake form",
  "isPublished": false,
  "fields": []
}
```

`GET /forms/:id` - get one owned form.

`PUT /forms/:id` - update title, description, fields, and publish state.

`POST /forms/:id/duplicate` - duplicate a form as a draft.

`DELETE /forms/:id` - delete a form and its responses.

### Public Forms

`GET /public/forms/:slug` - fetch a published form without authentication.

Public frontend URL:

```text
/form/:slug
```

### Submissions

`POST /submit/:formId`

```json
{
  "answers": {
    "field-id-1": "Yes",
    "field-id-2": "Company name"
  }
}
```

The server validates required fields, field types, options, and conditional visibility before saving.

### Responses

`GET /responses/:formId` - list responses for an owned form.

`GET /responses/:formId/export.csv` - export responses as CSV.

`DELETE /responses/:formId/:responseId` - delete one response.

### Analytics

`GET /analytics/:formId`

Returns:

```json
{
  "totalSubmissions": 12,
  "trends": [{ "date": "2026-05-31", "count": 4 }],
  "optionCounts": [
    {
      "fieldId": "field-id",
      "label": "Are you employed?",
      "options": [{ "name": "Yes", "count": 9 }]
    }
  ]
}
```

