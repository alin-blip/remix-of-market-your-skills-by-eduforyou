import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/lib/auth";
import { I18nProvider } from "@/lib/i18n";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import SkillScanner from "./pages/wizard/SkillScanner";
import IkigaiBuilder from "./pages/wizard/IkigaiBuilder";
import OfferBuilder from "./pages/wizard/OfferBuilder";
import ProfileBuilder from "./pages/wizard/ProfileBuilder";
import OutreachGenerator from "./pages/wizard/OutreachGenerator";
import FreedomPlanExport from "./pages/wizard/FreedomPlanExport";
import GigJobBuilderPage from "./pages/wizard/GigJobBuilderPage";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import VerificationsManager from "./pages/admin/VerificationsManager";
import UsersManager from "./pages/admin/UsersManager";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AuthProvider>
        <I18nProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/register" element={<Register />} />
              <Route 
                path="/onboard" 
                element={
                  <ProtectedRoute requireOnboarding={false}>
                    <Onboarding />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/wizard/skill-scanner" 
                element={
                  <ProtectedRoute>
                    <SkillScanner />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/wizard/ikigai" 
                element={
                  <ProtectedRoute>
                    <IkigaiBuilder />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/wizard/offer" 
                element={
                  <ProtectedRoute>
                    <OfferBuilder />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/offer-builder" 
                element={
                  <ProtectedRoute>
                    <OfferBuilder />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/wizard/profile" 
                element={
                  <ProtectedRoute>
                    <ProfileBuilder />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/wizard/outreach" 
                element={
                  <ProtectedRoute>
                    <OutreachGenerator />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/wizard/export" 
                element={
                  <ProtectedRoute>
                    <FreedomPlanExport />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/wizard/gig-job-builder" 
                element={
                  <ProtectedRoute>
                    <GigJobBuilderPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/outreach-generator" 
                element={
                  <ProtectedRoute>
                    <OutreachGenerator />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } 
              />
              {/* Admin Routes */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/verifications" 
                element={
                  <ProtectedRoute requireAdmin>
                    <VerificationsManager />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/users" 
                element={
                  <ProtectedRoute requireAdmin>
                    <UsersManager />
                  </ProtectedRoute>
                } 
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </I18nProvider>
    </AuthProvider>
  </ThemeProvider>
  </QueryClientProvider>
);

export default App;
