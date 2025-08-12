# Raasta Sathi

Raasta Sathi is a real-time traffic tracking and reporting application that empowers users to share and view live traffic updates.  
It integrates Google Maps for precise location tracking, allows filtering of reports by type, and rewards users for contributing verified traffic updates.

## 🚀 Features

- **Real-Time Traffic Reports**  
  Submit and view live traffic updates including incidents, congestion, and road closures.
- **Google Maps Integration**  
  Interactive maps to view reported locations with markers.
- **Quick Report Modal**  
  Fast submission of traffic reports with optional photo uploads.
- **Report Filtering & Sorting**  
  Filter by type (accident, roadblock, weather, etc.) and sort by date or severity.
- **User Authentication**  
  Secure sign-up and login using JWT authentication.
- **Gamification**  
  Earn points and streaks for verified reports, with leaderboard rankings.
- **Notifications**  
  Get alerts for incidents near your current location.
- **Multilingual Support**  
  Language selection for better accessibility.

## 🛠 Tech Stack

- **Frontend:** React.js, Tailwind CSS, Lucide Icons, Framer Motion
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** JWT (JSON Web Tokens)
- **Maps API:** Google Maps JavaScript API
- **File Uploads:** Multer
- **Real-Time Updates:** WebSockets (optional) or periodic polling
- **Notifications:** Custom proximity-based logic

## 📂 Project Structure
Raasta-Sathi/
├── client/               # React frontend
│   ├── contexts/          # Auth & Language providers
│   ├── components/        # UI components
│   ├── pages/             # App pages
│   └── services/          # API service layer
├── server/               # Express backend
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API routes
│   ├── middleware/        # Auth & validation middleware
│   └── controllers/       # Business logic
└── README.md
