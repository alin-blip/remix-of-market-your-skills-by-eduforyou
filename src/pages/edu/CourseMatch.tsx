import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GraduationCap } from 'lucide-react';

export default function CourseMatch() {
  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <Badge variant="outline" className="mb-3 text-blue-400 border-blue-400/30">
            <GraduationCap className="h-3 w-3 mr-1" /> E — EVALUATE
          </Badge>
          <h1 className="text-3xl font-bold">AI Course Matching</h1>
          <p className="text-muted-foreground mt-1">Find the perfect UK university course for you</p>
        </div>
        
        <Card className="border-dashed border-primary/30">
          <CardContent className="p-12 text-center">
            <GraduationCap className="h-12 w-12 mx-auto mb-4 text-primary/50" />
            <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              AI-powered course matching based on your interests, skills, and career goals. Get personalized recommendations from the Eduforyou portfolio.
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
