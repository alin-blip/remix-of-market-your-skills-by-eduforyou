import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

export default function FreedomCircle() {
  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <Badge variant="outline" className="mb-3 text-accent border-accent/30">
            <Users className="h-3 w-3 mr-1" /> U — UNLOCK
          </Badge>
          <h1 className="text-3xl font-bold">Freedom Circle™ Community</h1>
          <p className="text-muted-foreground mt-1">Lifetime access to courses, networking, and career opportunities</p>
        </div>
        
        <Card className="border-dashed border-accent/30">
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-accent/50" />
            <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Join the Freedom Circle community for lifetime access to courses, networking opportunities, job and gig matching via SwipeHire, and ongoing support from your consultant.
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
