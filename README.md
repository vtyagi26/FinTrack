# 💹 FinTrack

**FinTrack** is a full-stack stock trading and portfolio management dashboard. It lets users sign up, log in, view real-time stock prices, place trades, and track their portfolios. The app is built using the MERN stack (MongoDB, Express, React, Node.js) and integrates with the Finnhub API for market data.

---

## 🚀 Tech Stack

| Layer         | Technology                            |
|---------------|----------------------------------------|
| Frontend      | React (Vite), Tailwind CSS, Bootstrap  |
| Backend       | Node.js, Express                       |
| Database      | MongoDB + Mongoose                     |
| Auth          | JWT + HTTP-only cookies + bcrypt       |
| API           | Finnhub API                            |

---

## 📁 Project Structure

```

fin\_track/
├── backend/         # Express API server
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── models/
│   └── index.js
├── frontend/        # Public-facing React app (signup/login)
│   └── ...
├── dashboard/       # Private user dashboard (portfolio etc.)
│   └── ...
├── screenshots/     # UI screenshots
└── README.md

````

---

## 🔐 Environment Variables

### ✅ `backend/.env.sample`

```env
PORT=3002
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/fintrack-db
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
````

---

### ✅ `frontend/.env.sample`

```env
REACT_APP_BACKEND_URL=http://localhost:3002
REACT_APP_API_KEY=your_finnhub_api_key
```

---

### ✅ `dashboard/.env.sample`

```env
REACT_APP_BACKEND_URL=http://localhost:3002
REACT_APP_DASHBOARD_URL=http://localhost:5174
REACT_APP_API_KEY=your_finnhub_api_key
```

> 🔁 Rename `.env.sample` to `.env` and update all placeholder values before running.

---

## 🛠️ Setup Guide

### 1️⃣ Clone the Repo

```bash
git clone https://github.com/<your-username>/fin_track.git
cd fin_track
```

---

### 2️⃣ Backend Setup

```bash
cd backend
npm install
cp .env.sample .env    # and update it
npm run dev
```

Server runs at `http://localhost:3002`

---

### 3️⃣ Frontend Setup

```bash
cd ../frontend
npm install
cp .env.sample .env
npm run dev
```

Runs on `http://localhost:5173`

---

### 4️⃣ Dashboard Setup

```bash
cd ../dashboard
npm install
cp .env.sample .env
npm run dev
```

Dashboard available at `http://localhost:5174`

---

## 🌐 API Endpoints

| Route        | Method | Description                       |
| ------------ | ------ | --------------------------------- |
| `/signup`    | POST   | Register new user                 |
| `/login`     | POST   | Login and set secure cookie       |
| `/logout`    | POST   | Log out user                      |
| `/verify`    | GET    | Check if user is authenticated    |
| `/holdings`  | GET    | Get user's current stock holdings |
| `/positions` | GET    | Fetch all trade positions         |
| `/orders`    | POST   | Place a buy/sell order            |



## 🙌 Acknowledgements

* 💰 Market data from [Finnhub](https://finnhub.io)
* 🎨 UI powered by Bootstrap + TailwindCSS

---

## 👤 Maintainer

**Vaibhav Tyagi**