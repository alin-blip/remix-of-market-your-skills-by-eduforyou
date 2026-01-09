import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
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
              path="/outreach-generator" 
              element={
                <ProtectedRoute>
                  <OutreachGenerator />
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
