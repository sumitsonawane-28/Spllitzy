# FairSplit - Simple Group Expense Manager

A modern, fully functional expense-sharing app built for students. Manage shared expenses with friends, split costs dynamically, and settle up easily.

## 🚀 Features

### Authentication
- **Phone-based Login**: Enter a 10-digit phone number
- **OTP Verification**: Dummy OTP system (use `123456` for demo)
- **Secure Session State**: User data stored in app state

### Core Features

#### 1. Dashboard
- View all your groups at a glance
- Quick stats for each group (members, total expenses)
- Create new groups or access existing ones
- Modern card-based UI

#### 2. Group Management
- **Create Groups**: Add group name, description, members with UPI IDs
- **Dynamic Members**: Add/remove members while creating groups
- **Multi-currency Support**: INR, USD, EUR, GBP

#### 3. Expense Tracking
- **Add Expenses**: Title, amount, category, description
- **Smart Split Options**:
  - Equal split across all members
  - Custom split with individual amounts
- **Real-time Calculations**: See splits update as you enter amounts
- **Expense Details**: View full expense history with splits

#### 4. Balance Management
- **Instant Calculations**: Automatic balance updates
- **Who Owes Whom**: Clear settlement suggestions
- **Member Details**: Quick access to phone and UPI info
- **Color-coded Balances**: Green for credits, red for debits

#### 5. Settlement System
- **Auto-generated Settlements**: Smart algorithm to minimize transactions
- **Settlement Tracking**: Mark transactions as settled
- **Activity Log**: Full history of all transactions and adjustments

#### 6. Manual Adjustments
- **Custom Adjustments**: Record payments outside of expenses
- **Flexible**: Adjust for different payment methods
- **Activity Tracking**: All adjustments logged

## 🎮 How to Use

### Login
1. Enter your 10-digit phone number (e.g., 9876543210)
2. Click "Send OTP"
3. Enter the demo OTP: **123456**
4. You're logged in!

### Create a Group
1. Click "Create New Group" on dashboard
2. Enter group details (name, description, currency)
3. Add members (name, mobile, UPI ID)
4. Click "Create Group"

### Add an Expense
1. Click on a group
2. Go to "Expenses" tab
3. Click "Add Expense"
4. Fill in expense details
5. Choose split type (equal or custom)
6. Click "Save Expense"

### View Balances
1. Click on a group
2. Go to "Balances" tab
3. See who owes whom and settlement suggestions
4. Click "Settle Up" to mark payments

### Activity Log
1. Click on a group
2. Go to "Activity" tab
3. See all expenses, adjustments, and settlements

## 🛠️ Technical Stack

- **Frontend**: React 18 + React Router 6
- **State Management**: Zustand (lightweight, fast)
- **Styling**: Tailwind CSS 3 + custom themes
- **UI Components**: Radix UI + Lucide React icons
- **Type Safety**: TypeScript
- **Build**: Vite + SWC
- **Testing**: Vitest ready

## 📁 Project Structure

```
client/
├── pages/              # All app screens
│   ├── PhoneLogin.tsx
│   ├── OtpVerify.tsx
│   ├── Dashboard.tsx
│   ├── CreateGroup.tsx
│   ├── GroupDetails.tsx
│   ├── AddExpense.tsx
│   ├── ManualAdjustment.tsx
│   ├── SettleUp.tsx
│   └── Profile.tsx
├── components/
│   ├── Layout.tsx      # Main app layout
│   └── ui/             # Radix UI components
├── store/
│   └── expenseStore.ts # Zustand store
└── App.tsx             # Routing & setup
```

## 🔑 Key Components

### Zustand Store (expenseStore.ts)
- User authentication state
- Groups with members
- Expenses with dynamic splits
- Adjustments and activities
- Balance calculations
- Real-time updates

### Layout Component
- Header with navigation
- Mobile-responsive menu
- Logout button
- Protected routes for logged-in users

### Pages
All pages are fully functional with:
- Form validation
- Error handling
- Real-time calculations
- Responsive design (mobile-first)

## ✨ Highlights

### Smart Expense Splitting
- Automatically calculates equal splits
- Custom split validation
- Real-time total verification

### Settlement Algorithm
- Minimizes number of transactions needed
- Smart debtor/creditor matching
- Visual settlement flow

### Responsive Design
- Mobile (375px): Touch-friendly, full-width forms
- Tablet (768px): Optimized grid layouts
- Desktop (1280px+): Multi-column views

### Modern UI/UX
- Smooth transitions
- Intuitive navigation
- Color-coded status indicators
- Clear visual hierarchy
- Accessible form inputs

## 🎯 Demo Data

The app works entirely with frontend state. No backend required:
- Create groups and add members instantly
- All calculations happen in real-time
- Data persists during session
- Data clears on logout (as designed)

## 🚀 Getting Started

The app is already running! Just:
1. Visit the app in your browser
2. Click "Send OTP" on login page
3. Enter demo OTP: **123456**
4. Start creating groups and managing expenses!

## 📱 Responsive Breakpoints

- **Mobile**: 375px (tested)
- **Tablet**: 768px (responsive design)
- **Desktop**: 1024px+ (full-width layouts)

All screens scale beautifully from mobile to desktop!

## 🎨 Design System

- **Primary Color**: Blue (#2563eb)
- **Secondary Color**: Gray (#4b5563)
- **Status Colors**: Green (positive), Red (negative)
- **Typography**: Inter font, clean and modern
- **Spacing**: Consistent padding/margins
- **Shadows**: Subtle elevation for depth

## 💾 State Management

Everything is stored in Zustand:
- No external database calls
- Real-time updates
- Type-safe with TypeScript
- Fast and responsive

## 🔐 Security Notes

This is a frontend-only demo:
- No real authentication backend
- OTP is simulated (hardcoded: 123456)
- Data stored in app memory
- Perfect for testing and prototyping

For production, add:
- Real authentication API
- Backend validation
- Database storage
- API endpoints

## ✅ Features Checklist

- [x] Phone login with OTP
- [x] Dashboard with groups
- [x] Create groups with members
- [x] Add expenses with splits
- [x] Equal and custom split options
- [x] Balance calculations
- [x] Settlement suggestions
- [x] Activity logging
- [x] Manual adjustments
- [x] Profile page
- [x] Responsive design
- [x] Modern UI
- [x] Full state management
- [x] Navigation between screens
- [x] Form validation
- [x] Error handling

## 🎓 Built for Students

This app is designed specifically for:
- Roommates sharing rent and utilities
- Group trips and outings
- Class project expenses
- Shared household costs
- Friend group hangouts

Simple. Fair. Transparent.

---

**FairSplit** - Making expense sharing simple and fair! ✨
