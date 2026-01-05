📌 Features

- 🔐 Secure user authentication using JWT
- 🧾 Add, edit, and delete income & expense records
- 📊 Interactive dashboard with charts (Income vs Expense, Category-wise)
- 📩 Gmail integration (OAuth 2.0) to auto-detect transactions from emails
- 🔁 Auto-refresh dashboard (every 1 minute)
- 📤 Export transaction reports as CSV
- 🧠 Duplicate transaction prevention
- ☁️ Cloud-based database using MongoDB Atlas



🛠️ Technology Stack

Frontend
- React.js (Vite)
- Tailwind CSS
- Chart.js
- Lucide Icons

Backend
- Node.js
- Express.js
- JWT Authentication
- Node-Cron

Database
- MongoDB Atlas

External APIs
- Google Gmail API (OAuth 2.0)

🏗️ System Architecture

- Frontend: React-based UI for authentication, dashboard, expenses & reports  
- Backend: REST APIs for authentication, transactions & Gmail scanning  
- Database: MongoDB stores users, transactions & OAuth tokens  
- Scheduler: Cron job scans Gmail periodically for new transactions  

---

🔐 Authentication & Security

- Password hashing using bcrypt
- JWT-based secure session handling
- Protected backend routes with middleware
- OAuth tokens stored securely on backend
- No Gmail passwords are stored

📩 Gmail Transaction Detection

- Reads transaction-related emails only
- Uses keyword detection (debit, credit, spent, received)
- Extracts:
  - Amount
  - Transaction type (Credit/Debit)
  - Merchant/Description
- Prevents duplicate entries using compound indexes

> ⚠️ Gmail API is currently in testing mode – only whitelisted email IDs can be used.
