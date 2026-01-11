import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from 'next-themes';
import {
  LayoutDashboard,
  Sparkles,
  Target,
  Package,
  User,
  MessageSquare,
  FileDown,
  ChevronDown,
  Compass,
  Globe,
  Sun,
  Moon,
  Monitor,
  Settings,
  Briefcase,
  Shield,
  LogOut,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
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

  const pathItems = [
    { title: t.sidebar.skillScanner, url: '/wizard/skill-scanner', icon: Sparkles },
    { title: t.sidebar.ikigaiBuilder, url: '/wizard/ikigai', icon: Target },
    { title: t.sidebar.offerBuilder, url: '/wizard/offer', icon: Package },
    { title: t.sidebar.profileBuilder, url: '/wizard/profile', icon: User },
    { title: t.sidebar.outreachGenerator, url: '/wizard/outreach', icon: MessageSquare },
    { title: t.sidebar.freedomPlanExport, url: '/wizard/export', icon: FileDown },
  ];

  // Check if any path item is active
  const isPathActive = pathItems.some((item) => currentPath.startsWith(item.url));
  const [pathOpen, setPathOpen] = useState(isPathActive);

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
              <span className="font-display font-bold text-lg text-sidebar-foreground leading-tight">
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
                    currentPath === '/dashboard' && "bg-primary/10 text-primary font-medium"
                  )}
                  activeClassName=""
                >
                  <LayoutDashboard className="h-5 w-5" />
                  {!collapsed && <span>{t.sidebar.dashboard}</span>}
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
                    currentPath.startsWith('/life-os') && "bg-primary/10 text-primary font-medium"
                  )}
                  activeClassName=""
                >
                  <Target className="h-5 w-5" />
                  {!collapsed && <span>{t.lifeOS?.title || "Life OS"}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Gig & Job Builder */}
        <SidebarGroup className="gap-1">
          <SidebarMenu className="gap-1">
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
                    currentPath === '/wizard/gig-job-builder' && "bg-primary/10 text-primary font-medium"
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

        {/* Define Your Path - Collapsible Group */}
        <SidebarGroup className="mt-2">
          <Collapsible open={pathOpen} onOpenChange={setPathOpen}>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel
                className={cn(
                  'flex items-center justify-between cursor-pointer hover:bg-sidebar-accent/50 rounded-lg px-3 py-2.5 transition-colors text-xs uppercase tracking-wider font-semibold',
                  isPathActive && 'text-primary'
                )}
              >
                <div className="flex items-center gap-2">
                  <Compass className="h-4 w-4" />
                  {!collapsed && <span>{t.sidebar.defineYourPath}</span>}
                </div>
                {!collapsed && (
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform duration-200',
                      pathOpen && 'rotate-180'
                    )}
                  />
                )}
              </SidebarGroupLabel>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <SidebarGroupContent className="mt-1">
                <SidebarMenu className="gap-0.5">
                  {pathItems.map((item) => {
                    const isActive = currentPath.startsWith(item.url);
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.title}
                          className="h-9 rounded-lg"
                        >
                          <NavLink
                            to={item.url}
                            className={cn(
                              'flex items-center gap-3 pl-5 pr-3 text-sm transition-all',
                              isActive && 'bg-primary/10 text-primary font-medium'
                            )}
                            activeClassName=""
                          >
                            <item.icon className="h-4 w-4" />
                            {!collapsed && <span>{item.title}</span>}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Progress Card */}
        {!collapsed && (
          <div className={cn(
            "mx-1 p-3 rounded-xl border transition-colors",
            isComplete 
              ? "bg-green-500/10 border-green-500/20" 
              : "bg-sidebar-accent/30 border-sidebar-border"
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