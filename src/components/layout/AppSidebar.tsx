import { useLocation } from 'react-router-dom';
import { useTheme } from 'next-themes';
import {
  LayoutDashboard,
  Sun,
  Moon,
  Settings,
  Shield,
  LogOut,
  GraduationCap,
  Globe,
  CheckSquare,
  BookOpen,
  FileText,
  PoundSterling,
  Gift,
  Users,
  ClipboardCheck,
  Briefcase,
  Sparkles,
  Target,
  Package,
  User,
  MessageSquare,
  FileDown,
  Wallet,
  Calendar,
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

export function AppSidebar() {
  const { state } = useSidebar();
  const { t, locale, setLocale } = useI18n();
  const { theme, setTheme } = useTheme();
  const { isAdmin } = useAdminRole();
  const { user, signOut } = useAuth();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const currentPath = location.pathname;

  const userInitials = user?.email?.slice(0, 2).toUpperCase() || 'U';

  // E.D.U navigation items
  const evaluateItems = [
    { path: '/edu/eligibility', label: 'Eligibility Check', icon: CheckSquare },
    { path: '/edu/course-match', label: 'Course Matching', icon: GraduationCap },
    { path: '/edu/test-prep', label: 'Test Preparation', icon: BookOpen },
  ];

  const deliverItems = [
    { path: '/edu/documents', label: 'Documents', icon: FileText },
    { path: '/edu/cv-builder', label: 'CV Builder', icon: ClipboardCheck },
  ];

  const unlockItems = [
    { path: '/edu/finance', label: 'Student Finance', icon: PoundSterling },
    { path: '/edu/bonuses', label: 'Bonuses (10)', icon: Gift },
    { path: '/edu/community', label: 'Freedom Circle', icon: Users },
  ];

  const freedomLaunchpadItems = [
    { path: '/wizard/skill-scanner', label: 'Skill Scanner', icon: Sparkles },
    { path: '/wizard/ikigai', label: 'Ikigai Builder', icon: Target },
    { path: '/wizard/offer', label: 'Offer Builder', icon: Package },
    { path: '/wizard/profile', label: 'Profile Builder', icon: User },
    { path: '/wizard/outreach', label: 'Outreach Generator', icon: MessageSquare },
    { path: '/wizard/gig-job-builder', label: 'Gig Job Builder', icon: Briefcase },
    { path: '/wizard/export', label: 'Freedom Plan Export', icon: FileDown },
  ];

  const businessToolsItems = [
    { path: '/income-tracker', label: 'Income Tracker', icon: Wallet },
    { path: '/client-crm', label: 'Client CRM', icon: Users },
    { path: '/life-os', label: 'Life OS', icon: Calendar },
  ];

  const renderNavItem = (item: { path: string; label: string; icon: React.ComponentType<{ className?: string }> }) => {
    const Icon = item.icon;
    const isActive = currentPath === item.path;
    return (
      <SidebarMenuItem key={item.path}>
        <SidebarMenuButton
          asChild
          isActive={isActive}
          tooltip={item.label}
          className="h-9 rounded-lg"
        >
          <NavLink
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-3 transition-all",
              isActive && "bg-primary/10 text-primary font-medium"
            )}
            activeClassName=""
          >
            <Icon className="h-4 w-4" />
            {!collapsed && <span className="text-sm">{item.label}</span>}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      {/* Header with E.D.U Method Logo */}
      <SidebarHeader className="p-4 pb-6">
        <NavLink to="/dashboard" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 via-primary to-accent flex items-center justify-center flex-shrink-0 shadow-md group-hover:shadow-lg transition-shadow">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg text-sidebar-foreground leading-tight">
                E.D.U Method
              </span>
              <span className="text-[10px] text-sidebar-foreground/50 uppercase tracking-wider">
                by Eduforyou
              </span>
            </div>
          )}
        </NavLink>
      </SidebarHeader>

      <SidebarContent className="px-3 flex flex-col gap-1">
        {/* Dashboard */}
        <SidebarGroup className="gap-1">
          <SidebarMenu className="gap-1">
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={currentPath === '/dashboard'}
                tooltip="Dashboard"
                className="h-10 rounded-lg"
              >
                <NavLink
                  to="/dashboard"
                  className={cn(
                    "flex items-center gap-3 px-3 transition-all",
                    currentPath === '/dashboard' && "bg-primary/10 text-primary font-medium"
                  )}
                  activeClassName=""
                >
                  <LayoutDashboard className="h-5 w-5" />
                  {!collapsed && <span>E.D.U Journey</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* E — EVALUATE */}
        <SidebarGroup className="gap-1">
          {!collapsed && (
            <SidebarGroupLabel className="text-xs text-blue-400/80 uppercase tracking-wider px-3 mb-1 font-bold">
              E — Evaluate
            </SidebarGroupLabel>
          )}
          <SidebarMenu className="gap-0.5">
            {evaluateItems.map(renderNavItem)}
          </SidebarMenu>
        </SidebarGroup>

        {/* D — DELIVER */}
        <SidebarGroup className="gap-1">
          {!collapsed && (
            <SidebarGroupLabel className="text-xs text-primary/80 uppercase tracking-wider px-3 mb-1 font-bold">
              D — Deliver
            </SidebarGroupLabel>
          )}
          <SidebarMenu className="gap-0.5">
            {deliverItems.map(renderNavItem)}
          </SidebarMenu>
        </SidebarGroup>

        {/* U — UNLOCK */}
        <SidebarGroup className="gap-1">
          {!collapsed && (
            <SidebarGroupLabel className="text-xs text-accent/80 uppercase tracking-wider px-3 mb-1 font-bold">
              U — Unlock
            </SidebarGroupLabel>
          )}
          <SidebarMenu className="gap-0.5">
            {unlockItems.map(renderNavItem)}
          </SidebarMenu>
        </SidebarGroup>

        {/* Freedom Launchpad */}
        <SidebarGroup className="gap-1">
          {!collapsed && (
            <SidebarGroupLabel className="text-xs text-sidebar-foreground/50 uppercase tracking-wider px-3 mb-1">
              Freedom Launchpad
            </SidebarGroupLabel>
          )}
          <SidebarMenu className="gap-0.5">
            {freedomLaunchpadItems.map(renderNavItem)}
          </SidebarMenu>
        </SidebarGroup>

        {/* Business Tools */}
        <SidebarGroup className="gap-1">
          {!collapsed && (
            <SidebarGroupLabel className="text-xs text-sidebar-foreground/50 uppercase tracking-wider px-3 mb-1">
              Business Tools
            </SidebarGroupLabel>
          )}
          <SidebarMenu className="gap-0.5">
            {businessToolsItems.map(renderNavItem)}
          </SidebarMenu>
        </SidebarGroup>

        {/* Spacer */}
        <div className="flex-1" />
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
              Settings
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
                Admin Panel
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
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 via-primary to-accent flex items-center justify-center flex-shrink-0 text-xs font-bold text-white">
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
                Settings
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => signOut()}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
