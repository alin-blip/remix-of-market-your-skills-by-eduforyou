import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClipboardCheck } from 'lucide-react';

export default function CVBuilder() {
  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <Badge variant="outline" className="mb-3 text-primary border-primary/30">
            <ClipboardCheck className="h-3 w-3 mr-1" /> D — DELIVER
          </Badge>
          <h1 className="text-3xl font-bold">CV & Personal Statement Builder</h1>
          <p className="text-muted-foreground mt-1">AI-assisted CV and personal statement creation</p>
        </div>
        
        <Card className="border-dashed border-primary/30">
          <CardContent className="p-12 text-center">
            <ClipboardCheck className="h-12 w-12 mx-auto mb-4 text-primary/50" />
            <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Build your CV and personal statement with AI guidance. Export both as professional PDF documents ready for university applications.
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
