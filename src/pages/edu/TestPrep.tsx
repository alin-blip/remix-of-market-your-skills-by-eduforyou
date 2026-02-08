import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen } from 'lucide-react';

export default function TestPrep() {
  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <Badge variant="outline" className="mb-3 text-blue-400 border-blue-400/30">
            <BookOpen className="h-3 w-3 mr-1" /> E — EVALUATE
          </Badge>
          <h1 className="text-3xl font-bold">Test Preparation</h1>
          <p className="text-muted-foreground mt-1">AI-powered practice for oral and written interviews</p>
        </div>
        
        <Card className="border-dashed border-primary/30">
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-primary/50" />
            <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Practice for university interviews with AI-generated questions. Track your scores and readiness level across English proficiency, subject knowledge, and personal statement prep.
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
