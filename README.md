# EnergyProphet

**EnergyProphet** helps you explore energy production in your country and experiment with predicting the best energy policies for 2050.  
It combines a **.NET 8 backend (ASP.NET Core Web API)** and a **React + Vite frontend**.

---

## 🚀 Getting Started

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/en-us/download)
- [Node.js (LTS)](https://nodejs.org/en/) + npm

---

## 📦 Installation

From the project root:

```bash
npm run install:all
```

This will:

- Install backend dependencies via `dotnet restore`
- Install frontend dependencies via `npm install` in `/frontend`

---

## ▶️ Running the App

From the project root:

```bash
npm run dev
```

This will run **both backend and frontend together** in the same terminal using hot reload.

- Backend: PORT 5000  
- Frontend: PORT 5173  

---

## 🪵 Separate Logs (Frontend + Backend)

If you prefer **separate terminals** for clearer logs:

```bash
# Terminal 1 - backend
cd backend/EnergyProphet.Api
dotnet watch run

# Terminal 2 - frontend
cd frontend
npm run dev
```

---

## 🧪 Running Tests

From the project root:

```bash
dotnet test
```

Or with hot reload while developing tests:

```bash
dotnet watch test --project backend/EnergyProphet.Tests
```

---

## 📂 Project Structure

```txt
EnergyProphet/
├── backend/                 # .NET 8 solution (API + tests)
│   ├── EnergyProphet.Api/   # ASP.NET Core Web API
│   └── EnergyProphet.Tests/ # xUnit integration/unit tests
│
├── frontend/                # React + Vite frontend
│   ├── src/
│   └── package.json
│
├── EnergyProphet.sln        # Solution file (links API + tests)
├── package.json             # Dev scripts (runs both backend + frontend)
└── README.md                # This file
```

---

## ✨ Development Workflow

- Use `npm run dev` during development to start both apps quickly.
- Use separate terminals when you need clearer logs.
- Tests are isolated under `/backend/EnergyProphet.Tests`.
