import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  Sparkles,
  Target,
  Package,
  User,
  MessageSquare,
  Briefcase,
  FileDown,
  Wallet,
  Calendar,
  ArrowRight,
  Rocket,
  Wrench,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';

const freedomLaunchpadItems = [
  { path: '/wizard/skill-scanner', label: 'Skill Scanner', icon: Sparkles, description: 'Discover your marketable skills with AI' },
  { path: '/wizard/ikigai', label: 'Ikigai Builder', icon: Target, description: 'Find your sweet spot: passion + skills + market' },
  { path: '/wizard/offer', label: 'Offer Builder', icon: Package, description: 'Create freelance service packages' },
  { path: '/wizard/profile', label: 'Profile Builder', icon: User, description: 'Generate optimized social media bios' },
  { path: '/wizard/outreach', label: 'Outreach Generator', icon: MessageSquare, description: 'AI outreach messages for clients' },
  { path: '/wizard/gig-job-builder', label: 'Gig Job Builder', icon: Briefcase, description: 'Create gig listings for platforms' },
  { path: '/wizard/export', label: 'Freedom Plan Export', icon: FileDown, description: 'Export your complete plan as PDF' },
];

const businessToolsItems = [
  { path: '/income-tracker', label: 'Income Tracker', icon: Wallet, description: 'Track freelance earnings and revenue' },
  { path: '/client-crm', label: 'Client CRM', icon: Users, description: 'Manage clients, projects, and follow-ups' },
  { path: '/life-os', label: 'Life OS', icon: Calendar, description: 'Goal setting, vision board, and weekly sprints' },
];

export default function FreedomCircle() {
  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <Badge variant="outline" className="mb-3 text-accent border-accent/30">
            <Users className="h-3 w-3 mr-1" /> U — UNLOCK
          </Badge>
          <h1 className="text-3xl font-bold">Freedom Circle™</h1>
          <p className="text-muted-foreground mt-1">
            Your lifetime access hub — courses, tools, networking, and career opportunities all in one place.
          </p>
        </div>

        {/* Freedom Launchpad Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-accent" />
            <h2 className="text-xl font-semibold">Freedom Launchpad</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Build your freelance career step by step — from discovering your skills to landing your first clients.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {freedomLaunchpadItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.path} to={item.path} className="block group">
                  <Card className="h-full transition-all hover:shadow-md hover:border-accent/40 group-hover:bg-accent/5">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center">
                          <Icon className="h-4 w-4 text-accent" />
                        </div>
                        <CardTitle className="text-base">{item.label}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{item.description}</CardDescription>
                      <div className="flex items-center gap-1 mt-3 text-xs text-accent font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Open <ArrowRight className="h-3 w-3" />
                      </div>
                    </CardContent>
                  </Card>
                </NavLink>
              );
            })}
          </div>
        </section>

        {/* Business Tools Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Business Tools</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage your income, clients, and life goals — everything you need to run your business.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {businessToolsItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.path} to={item.path} className="block group">
                  <Card className="h-full transition-all hover:shadow-md hover:border-primary/40 group-hover:bg-primary/5">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <CardTitle className="text-base">{item.label}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{item.description}</CardDescription>
                      <div className="flex items-center gap-1 mt-3 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Open <ArrowRight className="h-3 w-3" />
                      </div>
                    </CardContent>
                  </Card>
                </NavLink>
              );
            })}
          </div>
        </section>

        {/* Community Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            <h2 className="text-xl font-semibold">Community & Support</h2>
          </div>
          <Card className="border-dashed border-blue-500/30">
            <CardContent className="p-8 text-center">
              <Users className="h-10 w-10 mx-auto mb-3 text-blue-500/50" />
              <h3 className="text-lg font-semibold mb-2">Freedom Circle Network</h3>
              <p className="text-muted-foreground max-w-md mx-auto text-sm mb-4">
                Connect with fellow students, share opportunities, and access career matching via SwipeHire. Your lifetime community starts here.
              </p>
              <Button variant="outline" className="border-blue-500/30 text-blue-500 hover:bg-blue-500/10" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </MainLayout>
  );
}
