# 💎 FinTrack 3D — Next-Gen Personal Wealth & Financial Analytics Dashboard

A modern, high-performance financial management platform built with **React.js (JSX)**, **Three.js**, **Chart.js**, and **Tailwind CSS**. Features interactive 3D spatial particle animations, dynamic multi-account switching (Personal & Work), real-time multi-currency conversions, and mobile glassmorphism UI.

---

## 🚀 Key Features

- **🌐 100% React.js (JSX) & Vite Architecture**: Clean component modularity with Context API state management and client-side hash routing (`#/`, `#/add-transaction`, `#/account/:id`).
- **🔮 Interactive 3D Ambient Canvas**: High-performance Three.js WebGL particle mesh and interactive card 3D tilt physics.
- **📊 Real-time Financial Analytics**:
  - **Category Expense Donut Chart**: Dynamic breakdown with custom legends.
  - **Income vs Expense Comparison**: Grouped dual-bar charts with custom time-range filtering (1W, 1M, 6M, 1Y, ALL).
- **💼 Multi-Account & Workspace Support**: Seamlessly manage and toggle between **Personal** and **Work** accounts with dedicated analytics and live transaction logs.
- **💱 Multi-Currency Engine**: Live conversions across USD ($), EUR (€), GBP (£), INR (₹), JPY (¥), and CAD (C$).
- **📱 Fully Mobile Responsive**: Dedicated glassmorphism bottom navigation dock (`Home`, `Accounts`, `Add (+)`, `Profile`) optimized for all viewport sizes.
- **🌗 Theme Switcher**: Adaptive Dark, Light, and System theme modes with persistent preferences in `localStorage`.
- **⚡ Zero Starting Baseline**: Clean zero defaults with real-time updates as transactions and accounts are created.

---

## 📂 Project Directory Structure

```text
FinalYP/
├── index.html                   # HTML entrypoint & React mount root
├── vite.config.js               # Vite + React plugin configuration
├── package.json                 # Project dependencies & scripts
├── README.md                    # Project documentation
└── src/
    ├── main.jsx                 # Application entrypoint
    ├── App.jsx                  # Main router & layout orchestrator
    │
    ├── context/
    │   └── FinTrackContext.jsx  # Context API (Accounts, Transactions, Currency, Theme)
    │
    ├── components/
    │   ├── Background3D.jsx     # Three.js 3D background canvas & 3D tilt engine
    │   ├── Navbar.jsx           # Top header with live date/clock & profile trigger
    │   ├── MobileBottomNav.jsx  # Mobile glassmorphic bottom navigation dock
    │   ├── Toast.jsx            # Dynamic toast notification alerts
    │   ├── charts/
    │   │   ├── ExpenseDonutChart.jsx # Category breakdown donut chart
    │   │   └── AccountBarChart.jsx   # Income vs Expense grouped comparison chart
    │   └── modals/
    │       ├── CreateAccountModal.jsx # 3D animated account creation sheet
    │       ├── ProfileModal.jsx       # Multi-tab settings, theme & currency modal
    │       └── BudgetModal.jsx        # Annual budget target planner
    │
    ├── pages/
    │   ├── DashboardPage.jsx      # Metrics overview, chart, account cards & history
    │   ├── AddTransactionPage.jsx # 2-column transaction form with 3D card preview
    │   └── AccountDetailsPage.jsx # Dedicated account analytics overview
    │
    └── styles/
        └── custom.css             # Glassmorphism, 3D tilt effects & responsive styles
```

---

## 🛠️ Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/Arghac2004/FinalYP.git
cd FinalYP
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Local Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 4. Build for Production
```bash
npm run build
```

---

## 📦 Tech Stack

- **Frontend Library**: React 18+ (JSX)
- **Bundler & Dev Server**: Vite 5
- **3D Graphics & Physics**: Three.js
- **Charts & Visualizations**: Chart.js
- **Styling**: Tailwind CSS & Glassmorphic Custom CSS
- **Icons**: FontAwesome 6
