import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PoundSterling } from 'lucide-react';

export default function StudentFinance() {
  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <Badge variant="outline" className="mb-3 text-accent border-accent/30">
            <PoundSterling className="h-3 w-3 mr-1" /> U — UNLOCK
          </Badge>
          <h1 className="text-3xl font-bold">Student Finance Application</h1>
          <p className="text-muted-foreground mt-1">Apply for up to £18,000/year in student finance</p>
        </div>
        
        <Card className="border-dashed border-accent/30">
          <CardContent className="p-12 text-center">
            <PoundSterling className="h-12 w-12 mx-auto mb-4 text-accent/50" />
            <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Guided Student Finance application with a checklist of requirements and status tracking. Our consultants will help you apply for the maximum amount.
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
