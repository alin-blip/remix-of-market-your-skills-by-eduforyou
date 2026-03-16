import { useLocation } from 'react-router-dom';
import { useTheme } from 'next-themes';
import {
  LayoutDashboard,
  Sparkles,
  Compass,
  Globe,
  Sun,
  Moon,
  Settings,
  Briefcase,
  Shield,
  LogOut,
  Target,
  GraduationCap,
  DollarSign,
  Users,
  BookOpen,
  Crosshair,
  Search,
  FileText,
  Send,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import { useAdminRole } from '@/hooks/useAdminRole';
import { useAuth } from '@/lib/auth';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface AppSidebarProps {
  completedSteps?: number;
  totalSteps?: number;
}

export function AppSidebar({ completedSteps = 0, totalSteps = 6 }: AppSidebarProps) {
  const { state } = useSidebar();
  const { t, locale, setLocale } = useI18n();
  const { theme, setTheme } = useTheme();
  const { isAdmin } = useAdminRole();
  const { user, signOut } = useAuth();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const currentPath = location.pathname;

  // Check if user is on any wizard path
  const isOnWizardPath = currentPath.startsWith('/wizard');
  const isOnLearnPath = currentPath === '/learning-hub' || currentPath === '/upgrade';
  const isOnBusinessPath = currentPath === '/income-tracker' || currentPath === '/client-crm';

  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
  const isComplete = completedSteps >= totalSteps;

  const userInitials = user?.email?.slice(0, 2).toUpperCase() || 'U';

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      {/* Header with Logo */}
      <SidebarHeader className="p-4 pb-6">
        <NavLink to="/dashboard" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 shadow-md group-hover:shadow-lg transition-shadow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg text-sidebar-foreground leading-tight italic">
                Student Freedom
              </span>
              <span className="text-[10px] text-sidebar-foreground/50 uppercase tracking-wider">
                Path Planner
              </span>
            </div>
          )}
        </NavLink>
      </SidebarHeader>

      <SidebarContent className="px-3 flex flex-col gap-1">
        {/* Main Navigation */}
        <SidebarGroup className="gap-1">
          <SidebarMenu className="gap-1">
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={currentPath === '/dashboard'}
                tooltip={t.sidebar.dashboard}
                className="h-10 rounded-lg"
              >
                <NavLink
                  to="/dashboard"
                  className={cn(
                    "flex items-center gap-3 px-3 transition-all",
                    currentPath === '/dashboard' && "bg-primary/15 text-primary font-medium rounded-xl"
                  )}
                  activeClassName=""
                >
                  <LayoutDashboard className="h-5 w-5" />
                  {!collapsed && <span>{t.sidebar.dashboard}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Define Your Path - Main entry point */}
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isOnWizardPath}
                tooltip={t.sidebar.defineYourPath}
                className="h-10 rounded-lg"
              >
                <NavLink
                  to="/wizard/path"
                  className={cn(
                    "flex items-center gap-3 px-3 transition-all",
                    isOnWizardPath && "bg-primary/15 text-primary font-medium rounded-xl"
                  )}
                  activeClassName=""
                >
                  <Compass className="h-5 w-5" />
                  {!collapsed && <span>{t.sidebar.defineYourPath}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={currentPath.startsWith('/life-os')}
                tooltip={t.lifeOS?.title || "Life OS"}
                className="h-10 rounded-lg"
              >
                <NavLink
                  to="/life-os"
                  className={cn(
                    "flex items-center gap-3 px-3 transition-all",
                    currentPath.startsWith('/life-os') && "bg-primary/15 text-primary font-medium rounded-xl"
                  )}
                  activeClassName=""
                >
                  <Target className="h-5 w-5" />
                  {!collapsed && <span>{t.lifeOS?.title || "Life OS"}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Gig & Job Builder */}
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={currentPath === '/wizard/gig-job-builder'}
                tooltip={t.sidebar?.gigJobBuilder || 'Gig & Job Builder'}
                className="h-10 rounded-lg"
              >
                <NavLink
                  to="/wizard/gig-job-builder"
                  className={cn(
                    "flex items-center gap-3 px-3 transition-all",
                    currentPath === '/wizard/gig-job-builder' && "bg-primary/15 text-primary font-medium rounded-xl"
                  )}
                  activeClassName=""
                >
                  <Briefcase className="h-5 w-5" />
                  {!collapsed && <span>{t.sidebar?.gigJobBuilder || 'Gig & Job Builder'}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Dream 100 Section */}
        <SidebarGroup className="gap-1">
          {!collapsed && (
            <SidebarGroupLabel className="text-xs text-primary/60 uppercase tracking-wider px-3 mb-1 font-semibold">
              Dream 100
            </SidebarGroupLabel>
          )}
          <SidebarMenu className="gap-1">
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={currentPath === '/dream100-scanner'}
                tooltip={t.sidebar?.dream100Scanner || 'Scanner'}
                className="h-10 rounded-lg"
              >
                <NavLink
                  to="/dream100-scanner"
                  className={cn(
                    "flex items-center gap-3 px-3 transition-all",
                    currentPath === '/dream100-scanner' && "bg-primary/15 text-primary font-medium rounded-xl"
                  )}
                  activeClassName=""
                >
                  <Search className="h-5 w-5" />
                  {!collapsed && <span>{t.sidebar?.dream100Scanner || 'Scanner'}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={currentPath === '/dream100'}
                tooltip={t.sidebar?.dream100Tracker || 'Dream 100 Tracker'}
                className="h-10 rounded-lg"
              >
                <NavLink
                  to="/dream100"
                  className={cn(
                    "flex items-center gap-3 px-3 transition-all",
                    currentPath === '/dream100' && "bg-primary/15 text-primary font-medium rounded-xl"
                  )}
                  activeClassName=""
                >
                  <Crosshair className="h-5 w-5" />
                  {!collapsed && <span>{t.sidebar?.dream100Tracker || 'Dream 100 Tracker'}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={currentPath === '/cv-builder'}
                tooltip={t.sidebar?.cvBuilder || 'CV Builder'}
                className="h-10 rounded-lg"
              >
                <NavLink
                  to="/cv-builder"
                  className={cn(
                    "flex items-center gap-3 px-3 transition-all",
                    currentPath === '/cv-builder' && "bg-primary/10 text-primary font-medium"
                  )}
                  activeClassName=""
                >
                  <FileText className="h-5 w-5" />
                  {!collapsed && <span>{t.sidebar?.cvBuilder || 'CV Builder'}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={currentPath === '/outreach-sequences'}
                tooltip={t.sidebar?.outreachSequences || 'Outreach'}
                className="h-10 rounded-lg"
              >
                <NavLink
                  to="/outreach-sequences"
                  className={cn(
                    "flex items-center gap-3 px-3 transition-all",
                    currentPath === '/outreach-sequences' && "bg-primary/10 text-primary font-medium"
                  )}
                  activeClassName=""
                >
                  <Send className="h-5 w-5" />
                  {!collapsed && <span>{t.sidebar?.outreachSequences || 'Outreach'}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Learn Section */}
        <SidebarGroup className="gap-1">
          {!collapsed && (
            <SidebarGroupLabel className="text-xs text-primary/60 uppercase tracking-wider px-3 mb-1 font-semibold">
              {t.sidebar?.learn || 'Learn'}
            </SidebarGroupLabel>
          )}
          <SidebarMenu className="gap-1">
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={currentPath === '/learning-hub'}
                tooltip={t.sidebar?.learningHub || 'Learning Hub'}
                className="h-10 rounded-lg"
              >
                <NavLink
                  to="/learning-hub"
                  className={cn(
                    "flex items-center gap-3 px-3 transition-all",
                    currentPath === '/learning-hub' && "bg-primary/10 text-primary font-medium"
                  )}
                  activeClassName=""
                >
                  <BookOpen className="h-5 w-5" />
                  {!collapsed && <span>{t.sidebar?.learningHub || 'Learning Hub'}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Founder Accelerator - Premium */}
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={currentPath === '/upgrade'}
                tooltip={t.sidebar?.founderAccelerator || 'Founder Accelerator'}
                className="h-10 rounded-lg"
              >
                <NavLink
                  to="/upgrade"
                  className={cn(
                    "flex items-center gap-3 px-3 transition-all",
                    currentPath === '/upgrade' 
                      ? "bg-orange-500/10 text-orange-500 font-medium" 
                      : "text-orange-500 hover:bg-orange-500/10"
                  )}
                  activeClassName=""
                >
                  <GraduationCap className="h-5 w-5" />
                  {!collapsed && <span>{t.sidebar?.founderAccelerator || 'Founder Accelerator'}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Business Tools Section */}
        <SidebarGroup className="gap-1">
          {!collapsed && (
            <SidebarGroupLabel className="text-xs text-primary/60 uppercase tracking-wider px-3 mb-1 font-semibold">
              {t.sidebar?.businessTools || 'Business'}
            </SidebarGroupLabel>
          )}
          <SidebarMenu className="gap-1">
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={currentPath === '/income-tracker'}
                tooltip={t.sidebar?.incomeTracker || 'Income Tracker'}
                className="h-10 rounded-lg"
              >
                <NavLink
                  to="/income-tracker"
                  className={cn(
                    "flex items-center gap-3 px-3 transition-all",
                    currentPath === '/income-tracker' && "bg-primary/10 text-primary font-medium"
                  )}
                  activeClassName=""
                >
                  <DollarSign className="h-5 w-5" />
                  {!collapsed && <span>{t.sidebar?.incomeTracker || 'Income Tracker'}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={currentPath === '/client-crm'}
                tooltip={t.sidebar?.clientCRM || 'Client CRM'}
                className="h-10 rounded-lg"
              >
                <NavLink
                  to="/client-crm"
                  className={cn(
                    "flex items-center gap-3 px-3 transition-all",
                    currentPath === '/client-crm' && "bg-primary/10 text-primary font-medium"
                  )}
                  activeClassName=""
                >
                  <Users className="h-5 w-5" />
                  {!collapsed && <span>{t.sidebar?.clientCRM || 'Client CRM'}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Progress Card */}
        {!collapsed && (
          <div className={cn(
            "mx-1 p-3 rounded-xl border transition-colors",
            isComplete 
              ? "bg-green-500/10 border-green-500/20" 
              : "bg-sidebar-accent/30 border-primary/15"
          )}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-sidebar-foreground/70">
                {t.sidebar.progressLabel}
              </span>
              <span className={cn(
                "text-xs font-bold",
                isComplete ? "text-green-500" : "text-primary"
              )}>
                {completedSteps}/{totalSteps}
              </span>
            </div>
            <Progress 
              value={progressPercentage} 
              className={cn(
                "h-1.5",
                isComplete && "[&>div]:bg-green-500"
              )} 
            />
            {isComplete && (
              <p className="text-[10px] text-green-500 mt-1.5 font-medium">
                ✓ Freedom Path Complete!
              </p>
            )}
          </div>
        )}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-3 border-t border-sidebar-border">
        {/* Quick Actions Row */}
        <div className={cn(
          "flex items-center gap-1 mb-3",
          collapsed ? "flex-col" : "justify-center"
        )}>
          {/* Language Selector */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setLocale(locale === 'ro' ? 'en' : 'ro')}
                className="h-8 w-8 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              >
                <Globe className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              {locale === 'ro' ? 'Switch to English' : 'Schimbă în Română'}
            </TooltipContent>
          </Tooltip>

          {/* Theme Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="h-8 w-8 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </TooltipContent>
          </Tooltip>

          {/* Settings */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                asChild
                className="h-8 w-8 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              >
                <NavLink to="/settings">
                  <Settings className="h-4 w-4" />
                </NavLink>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              {t.sidebar?.settings || "Settings"}
            </TooltipContent>
          </Tooltip>

          {/* Admin */}
          {isAdmin && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  asChild
                  className={cn(
                    "h-8 w-8 hover:bg-sidebar-accent/50",
                    currentPath.startsWith('/admin') 
                      ? "text-primary" 
                      : "text-sidebar-foreground/60 hover:text-sidebar-foreground"
                  )}
                >
                  <NavLink to="/admin">
                    <Shield className="h-4 w-4" />
                  </NavLink>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                {t.admin?.title || 'Admin Panel'}
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className={cn(
                "w-full justify-start gap-3 h-11 px-2 hover:bg-sidebar-accent/50",
                collapsed && "justify-center px-0"
              )}
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary-foreground">
                {userInitials}
              </div>
              {!collapsed && (
                <div className="flex flex-col items-start text-left overflow-hidden">
                  <span className="text-sm font-medium text-sidebar-foreground truncate max-w-[140px]">
                    {user?.email?.split('@')[0] || 'User'}
                  </span>
                  <span className="text-[10px] text-sidebar-foreground/50 truncate max-w-[140px]">
                    {user?.email || ''}
                  </span>
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-48">
            <DropdownMenuItem asChild>
              <NavLink to="/settings" className="cursor-pointer">
                <Settings className="h-4 w-4 mr-2" />
                {t.sidebar?.settings || "Settings"}
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => signOut()}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="h-4 w-4 mr-2" />
              {t.auth?.logout || "Sign Out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
