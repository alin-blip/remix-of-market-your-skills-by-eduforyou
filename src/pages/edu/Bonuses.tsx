import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gift } from 'lucide-react';

export default function Bonuses() {
  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <Badge variant="outline" className="mb-3 text-accent border-accent/30">
            <Gift className="h-3 w-3 mr-1" /> U — UNLOCK
          </Badge>
          <h1 className="text-3xl font-bold">10 Bonuses (£9,000 Value)</h1>
          <p className="text-muted-foreground mt-1">Exclusive bonuses activated upon enrollment</p>
        </div>
        
        <Card className="border-dashed border-accent/30">
          <CardContent className="p-12 text-center">
            <Gift className="h-12 w-12 mx-auto mb-4 text-accent/50" />
            <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Access 10 exclusive bonuses including courses, ebooks, resources, and tools designed to help you save money, learn, and start freelancing.
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
