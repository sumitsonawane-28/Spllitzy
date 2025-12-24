import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useExpenseStore } from "@/store/expenseStore";
import PhoneLogin from "./pages/PhoneLogin";
import OtpVerify from "./pages/OtpVerify";
import Dashboard from "./pages/Dashboard";
import Groups from "./pages/Groups";
import CreateGroup from "./pages/CreateGroup";
import GroupDetails from "./pages/GroupDetails";
import AddExpense from "./pages/AddExpense";
import ManualAdjustment from "./pages/ManualAdjustment";
import SettleUp from "./pages/SettleUp";
import Profile from "./pages/Profile";
import History from "./pages/History";
import SplitzyAI from "./pages/SplitzyAI";
import NotFound from "./pages/NotFound";
import { MainLayout } from "./components/MainLayout";
import BudgetPage from "./pages/BudgetPage";

const queryClient = new QueryClient();

const ProtectedRoute = () => {
  const { user } = useExpenseStore();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<PhoneLogin />} />
          <Route path="/otp" element={<OtpVerify />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/groups/:groupId/budget" element={<BudgetPage />} />
            <Route path="/create-group" element={<CreateGroup />} />
            <Route path="/group/:groupId" element={<GroupDetails />} />
            <Route path="/group/:groupId/add-expense" element={<AddExpense />} />
            <Route path="/group/:groupId/manual-adjustment" element={<ManualAdjustment />} />
            <Route path="/group/:groupId/settle-up" element={<SettleUp />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/history" element={<History />} />
            <Route path="/splitzy-ai" element={<SplitzyAI />} />
          </Route>

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/add-expense" element={<Navigate to="/groups" replace />} />
          <Route path="/settlements" element={<Navigate to="/dashboard" replace />} />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
