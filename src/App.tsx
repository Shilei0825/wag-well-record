import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Pages
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Pets from "./pages/Pets";
import AddPet from "./pages/AddPet";
import PetProfile from "./pages/PetProfile";
import HealthRecords from "./pages/HealthRecords";
import AddHealthRecord from "./pages/AddHealthRecord";
import Visits from "./pages/Visits";
import AddVisit from "./pages/AddVisit";
import Expenses from "./pages/Expenses";
import AddExpense from "./pages/AddExpense";
import Reminders from "./pages/Reminders";
import AddReminder from "./pages/AddReminder";
import Insights from "./pages/Insights";
import Settings from "./pages/Settings";
import MyPage from "./pages/MyPage";
import Membership from "./pages/Membership";
import TreatmentCodes from "./pages/TreatmentCodes";
import AIVet from "./pages/AIVet";
import RecoveryCheckin from "./pages/RecoveryCheckin";
import RecoverySummary from "./pages/RecoverySummary";
import RecoveryDetail from "./pages/RecoveryDetail";
import NotFound from "./pages/NotFound";
import { FloatingAIVetBubble } from "./components/FloatingAIVetBubble";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, betaUser } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Allow access if user is authenticated OR if beta user is logged in
  if (!user && !betaUser?.loggedIn) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, betaUser } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Redirect to dashboard if user is authenticated OR beta user is logged in
  if (user || betaUser?.loggedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PublicRoute><Welcome /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Protected Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/pets" element={<ProtectedRoute><Pets /></ProtectedRoute>} />
      <Route path="/pet/new" element={<ProtectedRoute><AddPet /></ProtectedRoute>} />
      <Route path="/pet/:petId" element={<ProtectedRoute><PetProfile /></ProtectedRoute>} />
      <Route path="/pet/:petId/health" element={<ProtectedRoute><HealthRecords /></ProtectedRoute>} />
      <Route path="/pet/:petId/health/new" element={<ProtectedRoute><AddHealthRecord /></ProtectedRoute>} />
      <Route path="/pet/:petId/visits" element={<ProtectedRoute><Visits /></ProtectedRoute>} />
      <Route path="/pet/:petId/visit/new" element={<ProtectedRoute><AddVisit /></ProtectedRoute>} />
      <Route path="/pet/:petId/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
      <Route path="/pet/:petId/expense/new" element={<ProtectedRoute><AddExpense /></ProtectedRoute>} />
      <Route path="/reminders" element={<ProtectedRoute><Reminders /></ProtectedRoute>} />
      <Route path="/reminder/new" element={<ProtectedRoute><AddReminder /></ProtectedRoute>} />
      <Route path="/insights" element={<ProtectedRoute><Insights /></ProtectedRoute>} />
      <Route path="/my" element={<ProtectedRoute><MyPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/membership" element={<ProtectedRoute><Membership /></ProtectedRoute>} />
      <Route path="/treatment-codes" element={<ProtectedRoute><TreatmentCodes /></ProtectedRoute>} />
      <Route path="/ai-vet" element={<ProtectedRoute><AIVet /></ProtectedRoute>} />
      <Route path="/recovery/:planId" element={<ProtectedRoute><RecoveryDetail /></ProtectedRoute>} />
      <Route path="/recovery/:planId/checkin" element={<ProtectedRoute><RecoveryCheckin /></ProtectedRoute>} />
      <Route path="/recovery/:planId/summary" element={<ProtectedRoute><RecoverySummary /></ProtectedRoute>} />

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
            <FloatingAIVetBubble />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
