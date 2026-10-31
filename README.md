# Rupee Radar

**Rupee Radar** is an AI-powered 3D financial management platform featuring seamless **Razorpay UPI & Card Payment Gateway** integration, instant automatic ledger tracking, and interactive digital bills/invoices.

---

## Key Features

1. **Razorpay Payment Gateway Integration**:
   - Secure UPI, QR, Credit/Debit card, and Net Banking payment checkout.
   - Built-in signature verification with HMAC-SHA256.
   - Automatic fallback simulation for offline/sandbox testing.

2. **Instant Auto-Track Ledger**:
   - When a user pays for groceries, shopping, dining, or bills via the payment gateway, the transaction is **automatically recorded** into the ledger without manual data entry.

3. **Interactive Online Bill / Receipt Generation**:
   - **Double-click** on any transaction row in the Recent Transactions table to generate and view the verified online invoice receipt.
   - Includes full timestamp (Date & Time), Merchant name, Location, payment method, tax/GST breakdown, and Print/Download options.

4. **3D Interactive Charts & Analytics**:
   - Real-time annual budget targets, spending donut charts, and interactive accounts grid.

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Set the following keys in `.env.local`:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
MONGODB_URI=your_mongodb_connection_string

# Razorpay Credentials
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
ENABLE_MOCK_PAYMENT=true
```

### 3. Start Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.
