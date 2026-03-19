import { Toaster } from "@/components/ui/toaster";
import FiverrEbookSalesPage from "./pages/FiverrEbookSalesPage";
import FiverrCourseSalesPage from "./pages/FiverrCourseSalesPage";
import FounderAcceleratorUpgrade from "./pages/FounderAcceleratorUpgrade";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/lib/auth";
import { I18nProvider } from "@/lib/i18n";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import WaitlistForm from "./pages/WaitlistForm";
import WaitlistManager from "./pages/admin/WaitlistManager";

import Dashboard from "./pages/Dashboard";
import SkillScanner from "./pages/wizard/SkillScanner";
import IkigaiBuilder from "./pages/wizard/IkigaiBuilder";
import OfferBuilder from "./pages/wizard/OfferBuilder";
import ProfileBuilder from "./pages/wizard/ProfileBuilder";
import OutreachGenerator from "./pages/wizard/OutreachGenerator";
import FreedomPlanExport from "./pages/wizard/FreedomPlanExport";
import GigJobBuilderPage from "./pages/wizard/GigJobBuilderPage";
import DefineYourPath from "./pages/wizard/DefineYourPath";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import LifeOSDashboard from "./pages/life-os/LifeOSDashboard";
import LifeOSSetup from "./pages/life-os/LifeOSSetup";
import WeeklySprintPage from "./pages/life-os/WeeklySprintPage";
import VerificationsManager from "./pages/admin/VerificationsManager";
import UsersManager from "./pages/admin/UsersManager";
import CoursesManager from "./pages/admin/CoursesManager";
import CourseAnalytics from "./pages/admin/CourseAnalytics";
import Pricing from "./pages/Pricing";
import IncomeTracker from "./pages/IncomeTracker";
import LearningHub from "./pages/LearningHub";
import ClientCRM from "./pages/ClientCRM";
import ToolsHub from "./pages/ToolsHub";
import PaymentSuccess from "./pages/PaymentSuccess";
import CourseViewer from "./pages/CourseViewer";
import PartnerCourses from "./pages/PartnerCourses";
import PLRCourseImporter from "./pages/admin/PLRCourseImporter";
import BundlesManager from "./pages/admin/BundlesManager";
import FeedbackManager from "./pages/admin/FeedbackManager";
import AIOutputsManager from "./pages/admin/AIOutputsManager";
import CourseSalesPage from "./pages/CourseSalesPage";
import BundleSalesPage from "./pages/BundleSalesPage";
import SqueezePage from "./pages/SqueezePage";
import EbookSalesPage from "./pages/EbookSalesPage";
import Dream100Tracker from "./pages/dream100/Dream100Tracker";
import Dream100Scanner from "./pages/dream100/Dream100Scanner";
import CVBuilder from "./pages/dream100/CVBuilder";
import OutreachSequences from "./pages/dream100/OutreachSequences";
import SkillMarketLanding from "./pages/SkillMarketLanding";
const queryClient = new QueryClient();

// App component with providers
const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AuthProvider>
        <I18nProvider>
          <TooltipProvider>
            <BrowserRouter>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/" element={<SkillMarketLanding autoOpenLangPicker />} />
                <Route path="/ro" element={<SkillMarketLanding />} />
                <Route path="/en" element={<SkillMarketLanding />} />
                <Route path="/ua" element={<SkillMarketLanding />} />
                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/register" element={<Register />} />
                <Route path="/auth/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/waitlist" element={<WaitlistForm />} />
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
                  path="/wizard/path" 
                  element={
                    <ProtectedRoute>
                      <DefineYourPath />
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
                {/* Life OS Routes */}
                <Route 
                  path="/life-os" 
                  element={
                    <ProtectedRoute>
                      <LifeOSDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/life-os/setup" 
                  element={
                    <ProtectedRoute>
                      <LifeOSSetup />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/life-os/sprint" 
                  element={
                    <ProtectedRoute>
                      <WeeklySprintPage />
                    </ProtectedRoute>
                  } 
                />
                {/* New Feature Routes */}
                <Route 
                  path="/upgrade" 
                  element={
                    <ProtectedRoute>
                      <FounderAcceleratorUpgrade />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/pricing" 
                  element={
                    <ProtectedRoute>
                      <Pricing />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/income-tracker" 
                  element={
                    <ProtectedRoute>
                      <IncomeTracker />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/learning-hub" 
                  element={
                    <ProtectedRoute>
                      <LearningHub />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/client-crm" 
                  element={
                    <ProtectedRoute>
                      <ClientCRM />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/tools" 
                  element={
                    <ProtectedRoute>
                      <ToolsHub />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/payment-success" 
                  element={
                    <ProtectedRoute>
                      <PaymentSuccess />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/course/:courseId" 
                  element={
                    <ProtectedRoute>
                      <CourseViewer />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/courses" 
                  element={
                    <ProtectedRoute requireAdmin>
                      <CoursesManager />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/course-analytics" 
                  element={
                    <ProtectedRoute requireAdmin>
                      <CourseAnalytics />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/partners/:partnerId" 
                  element={
                    <ProtectedRoute>
                      <PartnerCourses />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/plr-import" 
                  element={
                    <ProtectedRoute requireAdmin>
                      <PLRCourseImporter />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/bundles" 
                  element={
                    <ProtectedRoute requireAdmin>
                      <BundlesManager />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/feedback" 
                  element={
                    <ProtectedRoute requireAdmin>
                      <FeedbackManager />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/ai-outputs" 
                  element={
                    <ProtectedRoute requireAdmin>
                      <AIOutputsManager />
                    </ProtectedRoute>
                  } 
                />
                {/* Dream 100 Routes */}
                <Route path="/dream100" element={<ProtectedRoute><Dream100Tracker /></ProtectedRoute>} />
                <Route path="/dream100-scanner" element={<ProtectedRoute><Dream100Scanner /></ProtectedRoute>} />
                <Route path="/cv-builder" element={<ProtectedRoute><CVBuilder /></ProtectedRoute>} />
                <Route path="/outreach-sequences" element={<ProtectedRoute><OutreachSequences /></ProtectedRoute>} />
                <Route path="/admin/waitlist" element={<ProtectedRoute requireAdmin><WaitlistManager /></ProtectedRoute>} />
                {/* Public Sales Pages */}
                <Route path="/courses/:slug" element={<CourseSalesPage />} />
                <Route path="/bundles/:slug" element={<BundleSalesPage />} />
                <Route path="/free/:slug" element={<SqueezePage />} />
                <Route path="/ebook/:slug" element={<EbookSalesPage />} />
                <Route path="/ebook/fiverr" element={<FiverrEbookSalesPage />} />
                <Route path="/course/fiverr" element={<FiverrCourseSalesPage />} />
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
