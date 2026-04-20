import { useNavigate } from 'react-router-dom';
import { 
  Wallet, 
  Users, 
  CreditCard,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import { MainLayout } from '@/components/layout/MainLayout';

const ToolsHub = () => {
  const navigate = useNavigate();
  const { t } = useI18n();

  const toolsHubT = (t as any).toolsHub || {};
  
  const tools = [
    {
      id: 'income-tracker',
      title: t.sidebar?.incomeTracker || 'Income Tracker',
      description: toolsHubT.incomeTrackerDesc || 'Track your freelance income, manage payments, and analyze your earnings over time.',
      icon: Wallet,
      path: '/income-tracker',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
    },
    {
      id: 'client-crm',
      title: t.sidebar?.clientCRM || 'Client CRM',
      description: toolsHubT.clientCRMDesc || 'Manage your clients, track projects, and never miss a follow-up.',
      icon: Users,
      path: '/client-crm',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
    },
    {
      id: 'pricing',
      title: t.sidebar?.pricing || 'Pricing',
      description: toolsHubT.pricingDesc || 'View and manage your subscription plans and billing.',
      icon: CreditCard,
      path: '/pricing',
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
    },
  ];

  return (
    <MainLayout>
      <div className="container max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {toolsHubT.title || 'Tools & Resources'}
          </h1>
          <p className="text-muted-foreground">
            {toolsHubT.subtitle || 'All the tools you need to build and grow your freelance business.'}
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {tools.map((tool) => (
            <Card 
              key={tool.id}
              className={`group cursor-pointer transition-all hover:shadow-lg border ${tool.borderColor} hover:border-primary/30`}
              onClick={() => navigate(tool.path)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-xl ${tool.bgColor}`}>
                    <tool.icon className={`h-6 w-6 ${tool.color}`} />
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <CardTitle className="text-xl mt-4">{tool.title}</CardTitle>
                <CardDescription className="text-sm">
                  {tool.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full justify-center group-hover:bg-primary/5">
                  {toolsHubT.openTool || 'Open Tool'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default ToolsHub;
