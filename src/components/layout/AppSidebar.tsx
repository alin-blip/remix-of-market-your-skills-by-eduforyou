import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Sparkles,
  Target,
  Package,
  User,
  MessageSquare,
  ChevronDown,
  Compass,
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

const pathItems = [
  { title: 'Skill Scanner', url: '/wizard/skill-scanner', icon: Sparkles },
  { title: 'Ikigai Builder', url: '/wizard/ikigai', icon: Target },
  { title: 'Offer Builder', url: '/wizard/offer', icon: Package },
  { title: 'Profile Builder', url: '/wizard/profile', icon: User },
  { title: 'Outreach Generator', url: '/wizard/outreach', icon: MessageSquare },
];

interface AppSidebarProps {
  completedSteps?: number;
  totalSteps?: number;
}

export function AppSidebar({ completedSteps = 0, totalSteps = 5 }: AppSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const currentPath = location.pathname;

  // Check if any path item is active
  const isPathActive = pathItems.some((item) => currentPath.startsWith(item.url));
  const [pathOpen, setPathOpen] = useState(isPathActive);

  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      {/* Header with Logo */}
      <SidebarHeader className="p-4">
        <NavLink to="/dashboard" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg gradient-accent flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-5 w-5 text-accent-foreground" />
          </div>
          {!collapsed && (
            <span className="font-display font-bold text-lg text-sidebar-foreground">
              Student Freedom
            </span>
          )}
        </NavLink>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {/* Dashboard Link */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={currentPath === '/dashboard'}
                tooltip="Dashboard"
              >
                <NavLink
                  to="/dashboard"
                  className="flex items-center gap-3"
                  activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  {!collapsed && <span>Dashboard</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Define Your Path - Collapsible Group */}
        <SidebarGroup>
          <Collapsible open={pathOpen} onOpenChange={setPathOpen}>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel
                className={cn(
                  'flex items-center justify-between cursor-pointer hover:bg-sidebar-accent/50 rounded-md px-2 py-1.5 transition-colors',
                  isPathActive && 'text-sidebar-primary'
                )}
              >
                <div className="flex items-center gap-2">
                  <Compass className="h-4 w-4" />
                  {!collapsed && <span>Define Your Path</span>}
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
                <SidebarMenu>
                  {pathItems.map((item) => {
                    const isActive = currentPath.startsWith(item.url);
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.title}
                        >
                          <NavLink
                            to={item.url}
                            className={cn(
                              'flex items-center gap-3 ml-2',
                              isActive && 'text-sidebar-primary font-medium'
                            )}
                            activeClassName="bg-sidebar-accent"
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
      </SidebarContent>

      {/* Footer with Progress */}
      {!collapsed && (
        <SidebarFooter className="p-4 border-t border-sidebar-border">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-sidebar-foreground/70">
              <span>Progres Freedom Path</span>
              <span className="font-medium">{completedSteps}/{totalSteps}</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
