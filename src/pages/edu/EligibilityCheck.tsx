import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Clock } from 'lucide-react';

export default function EligibilityCheck() {
  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <Badge variant="outline" className="mb-3 text-blue-400 border-blue-400/30">
            <Shield className="h-3 w-3 mr-1" /> E — EVALUATE
          </Badge>
          <h1 className="text-3xl font-bold">Eligibility Check</h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <Clock className="h-4 w-4" /> 2-minute AI-powered assessment
          </p>
        </div>
        
        <Card className="border-dashed border-primary/30">
          <CardContent className="p-12 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-primary/50" />
            <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              The AI-powered eligibility assessment will be available shortly. This will check your eligibility for UK university study in just 2 minutes.
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
