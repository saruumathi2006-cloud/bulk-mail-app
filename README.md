# PostPulse — Full Stack Bulk Mail Application (MERN)

A full-stack web application designed for composing, dispatching, tracking, and analyzing bulk emails with real-time logs and delivery statuses.

---

## 🌟 Key Features

1. **Frontend (React + Vite)**:
   - Modern, responsive UI with real-time status banners.
   - Dynamic recipient inputs supporting multiple delimiter formats (commas, newlines, semicolons) with deduplication.
   - Rich HTML / Plain Text composing switch.
   - Quick pre-built message templates (Newsletter, Welcome Onboarding, System Maintenance).
   - Live web inbox preview links for test broadcasts.
   - Comprehensive Mail History page with per-recipient delivery statuses and quick deletion.
   - Real-time Analytics & Delivery Metrics dashboard.
   - Built-in Admin Authentication modal with JWT session storage.

2. **Backend (Node.js + Express)**:
   - RESTful API endpoints for bulk mail dispatching, delivery logs, analytics, and admin authentication.
   - Robust Nodemailer integration:
     - Ready for real production SMTP servers (Gmail, Outlook, SendGrid, Amazon SES, etc.).
     - Built-in zero-config Ethereal test inbox fallback generating live preview links out of the box.
   - Strict validation, recipient email format checks, and error handling.

3. **Database (MongoDB + Mongoose)**:
   - Schema storing campaign subject, message body, status (`completed`, `partially_failed`, `failed`), timestamps, and individual recipient-level delivery logs.
   - Automatic fallback support: Connects to local MongoDB (`mongodb://127.0.0.1:27017/bulk_mail_app`) or in-memory MongoDB without requiring manual daemon setup.

---

## 🚀 How to Run the Project

### 1. Start the Backend Server
```bash
cd backend
npm run dev
# or npm start
```
The backend API will start at `http://localhost:5000`.

### 2. Start the Frontend Application
In a separate terminal:
```bash
cd frontend
npm run dev
```
Open your browser at the Vite URL shown (typically `http://localhost:5173`).

---

## 🔐 Admin Authentication Credentials
- **Username:** `admin`
- **Password:** `admin123`

---

## ⚙️ Environment Configuration (`backend/.env`)

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Backend server port | `5000` |
| `MONGODB_URI` | MongoDB Connection String | `mongodb://127.0.0.1:27017/bulk_mail_app` |
| `JWT_SECRET` | Secret key for admin JWT tokens | `super_secret_bulk_mail_jwt_key_2026` |
| `SMTP_HOST` | Custom SMTP host (optional, e.g., `smtp.gmail.com`) | *Ethereal sandbox* |
| `SMTP_PORT` | Custom SMTP port (`587` or `465`) | `587` |
| `SMTP_USER` | Custom SMTP username/email | *Ethereal sandbox* |
| `SMTP_PASS` | Custom SMTP App password | *Ethereal sandbox* |

---

## 📡 API Endpoints

- `GET  /api/health` — Check server & MongoDB connection health.
- `POST /api/auth/login` — Authenticate admin credentials and retrieve JWT.
- `POST /api/mail/send` — Send bulk email campaign.
- `GET  /api/mail/history` — Fetch paginated list of dispatched campaigns.
- `GET  /api/mail/history/:id` — Get detailed breakdown of a campaign.
- `DELETE /api/mail/history/:id` — Delete a campaign log record.
- `GET  /api/mail/stats` — Retrieve campaign and delivery statistics.

