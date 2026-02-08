import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';

export default function Documents() {
  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <Badge variant="outline" className="mb-3 text-primary border-primary/30">
            <FileText className="h-3 w-3 mr-1" /> D — DELIVER
          </Badge>
          <h1 className="text-3xl font-bold">Document Collection</h1>
          <p className="text-muted-foreground mt-1">Submit your personal details and supporting documents</p>
        </div>
        
        <Card className="border-dashed border-primary/30">
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-primary/50" />
            <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              A guided form to collect your personal details, education history, work experience, and references. Upload supporting documents like passport and certificates.
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
