import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import type { FreedomPlanData } from './FreedomPlanPDF';

interface HealthCheckItem {
  label: string;
  status: 'ok' | 'warning' | 'error';
  message: string;
}

interface Props {
  data: FreedomPlanData | null;
}

export const PdfHealthCheck: React.FC<Props> = ({ data }) => {
  if (!data) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-destructive">
            <XCircle className="h-5 w-5" />
            <span>Nu există date pentru export</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const checks: HealthCheckItem[] = [
    {
      label: 'Profil',
      status: data.profile.fullName && data.profile.fullName !== 'Freelancer' ? 'ok' : 'warning',
      message: data.profile.fullName && data.profile.fullName !== 'Freelancer' 
        ? `${data.profile.fullName}` 
        : 'Numele lipsește sau este implicit',
    },
    {
      label: 'Competențe',
      status: data.skills.length > 0 ? 'ok' : 'error',
      message: data.skills.length > 0 
        ? `${data.skills.length} competențe` 
        : 'Nicio competență găsită',
    },
    {
      label: 'Ikigai',
      status: data.ikigai ? 'ok' : 'error',
      message: data.ikigai 
        ? `${(data.ikigai.ikigaiStatements?.length || 0)} declarații` 
        : 'Ikigai negenerat',
    },
    {
      label: 'Ofertă',
      status: data.offer ? 'ok' : 'error',
      message: data.offer 
        ? 'Pachete definite' 
        : 'Oferta necompletată',
    },
    {
      label: 'Profiluri sociale',
      status: data.socialProfiles.length > 0 ? 'ok' : 'warning',
      message: data.socialProfiles.length > 0 
        ? `${data.socialProfiles.length} platforme` 
        : 'Niciun profil social',
    },
    {
      label: 'Template-uri outreach',
      status: data.outreachTemplates.length > 0 ? 'ok' : 'warning',
      message: data.outreachTemplates.length > 0 
        ? `${data.outreachTemplates.length} template-uri` 
        : 'Niciun template',
    },
  ];

  const hasErrors = checks.some(c => c.status === 'error');
  const hasWarnings = checks.some(c => c.status === 'warning');

  const getIcon = (status: HealthCheckItem['status']) => {
    switch (status) {
      case 'ok':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const getBadge = (status: HealthCheckItem['status']) => {
    switch (status) {
      case 'ok':
        return <Badge variant="outline" className="border-green-500/50 text-green-600">OK</Badge>;
      case 'warning':
        return <Badge variant="outline" className="border-amber-500/50 text-amber-600">Opțional</Badge>;
      case 'error':
        return <Badge variant="destructive">Lipsă</Badge>;
    }
  };

  return (
    <Card className={
      hasErrors 
        ? 'border-destructive/50 bg-destructive/5' 
        : hasWarnings 
          ? 'border-amber-500/50 bg-amber-500/5'
          : 'border-green-500/50 bg-green-500/5'
    }>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          {hasErrors ? (
            <>
              <XCircle className="h-4 w-4 text-destructive" />
              Date incomplete pentru export
            </>
          ) : hasWarnings ? (
            <>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              PDF poate fi generat (unele secțiuni opționale lipsesc)
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Toate datele sunt complete
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid gap-2">
          {checks.map((check, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {getIcon(check.status)}
                <span className="text-muted-foreground">{check.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{check.message}</span>
                {getBadge(check.status)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
