import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, Loader2, Plus, AlertTriangle, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScannedCompany {
  name: string;
  industry: string;
  description: string;
  why_fit: string;
  linkedin_url?: string;
  website_url?: string;
  decision_maker_type: string;
  selected?: boolean;
}

export default function Dream100Scanner() {
  const { user } = useAuth();
  const { locale } = useI18n();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<ScannedCompany[]>([]);
  const [usedPerplexity, setUsedPerplexity] = useState(false);
  const [importing, setImporting] = useState(false);

  const [filters, setFilters] = useState({
    pathType: 'freelancer',
    industry: '',
    location: 'UK',
    companySize: 'small',
    values: '',
    budget: '',
  });

  // Pre-populate from ikigai if exists
  useEffect(() => {
    if (!user) return;
    supabase.from('ikigai_results').select('*').eq('user_id', user.id).limit(1).single().then(({ data }) => {
      if (data) {
        const interests = Array.isArray(data.what_you_love) ? (data.what_you_love as string[]).join(', ') : '';
        if (interests) setFilters(f => ({ ...f, values: interests }));
      }
    });
  }, [user]);

  const scan = async () => {
    setLoading(true);
    setCompanies([]);
    try {
      const { data, error } = await supabase.functions.invoke('dream100-scanner', {
        body: filters,
      });
      if (error) throw error;
      if (data?.companies) {
        setCompanies(data.companies.map((c: ScannedCompany) => ({ ...c, selected: false })));
        setUsedPerplexity(data.usedPerplexity || false);
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (index: number) => {
    setCompanies(prev => prev.map((c, i) => i === index ? { ...c, selected: !c.selected } : c));
  };

  const selectAll = () => {
    const allSelected = companies.every(c => c.selected);
    setCompanies(prev => prev.map(c => ({ ...c, selected: !allSelected })));
  };

  const importSelected = async () => {
    if (!user) return;
    const selected = companies.filter(c => c.selected);
    if (!selected.length) { toast({ title: locale === 'ro' ? 'Selectează companii' : 'Select companies', variant: 'destructive' }); return; }

    setImporting(true);
    try {
      const inserts = selected.map(c => ({
        user_id: user.id,
        name: c.name,
        industry: c.industry,
        linkedin_url: c.linkedin_url || null,
        website_url: c.website_url || null,
        decision_maker_role: c.decision_maker_type,
        path_type: filters.pathType,
        kanban_stage: 'identified',
        notes: c.why_fit,
      }));
      const { error } = await supabase.from('dream100_targets').insert(inserts);
      if (error) throw error;
      toast({ title: locale === 'ro' ? `${selected.length} companii adăugate în Dream 100!` : `${selected.length} companies added to Dream 100!` });
      setCompanies(prev => prev.filter(c => !c.selected));
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setImporting(false);
    }
  };

  const selectedCount = companies.filter(c => c.selected).length;

  return (
    <MainLayout>
      <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <Search className="h-7 w-7 text-primary" />
            Dream 100 Scanner
          </h1>
          <p className="text-muted-foreground mt-1">
            {locale === 'ro' 
              ? 'Găsește companii și clienți potriviți pentru profilul tău'
              : 'Find companies and clients that match your profile'}
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>{locale === 'ro' ? 'Tip cale' : 'Path type'}</Label>
                <Select value={filters.pathType} onValueChange={v => setFilters(f => ({ ...f, pathType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">{locale === 'ro' ? 'Angajat' : 'Employee'}</SelectItem>
                    <SelectItem value="freelancer">Freelancer</SelectItem>
                    <SelectItem value="startup">Startup</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{locale === 'ro' ? 'Industrie / Nișă' : 'Industry / Niche'}</Label>
                <Input value={filters.industry} onChange={e => setFilters(f => ({ ...f, industry: e.target.value }))} placeholder="FinTech, Marketing Digital..." />
              </div>
              <div>
                <Label>{locale === 'ro' ? 'Locație' : 'Location'}</Label>
                <Input value={filters.location} onChange={e => setFilters(f => ({ ...f, location: e.target.value }))} placeholder="London, Remote, UK..." />
              </div>
              <div>
                <Label>{locale === 'ro' ? 'Mărime companie' : 'Company size'}</Label>
                <Select value={filters.companySize} onValueChange={v => setFilters(f => ({ ...f, companySize: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="micro">Micro (1-10)</SelectItem>
                    <SelectItem value="small">{locale === 'ro' ? 'Mică' : 'Small'} (10-50)</SelectItem>
                    <SelectItem value="medium">{locale === 'ro' ? 'Medie' : 'Medium'} (50-200)</SelectItem>
                    <SelectItem value="large">{locale === 'ro' ? 'Mare' : 'Large'} (200+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{locale === 'ro' ? 'Valori importante' : 'Important values'}</Label>
                <Input value={filters.values} onChange={e => setFilters(f => ({ ...f, values: e.target.value }))} placeholder={locale === 'ro' ? 'Inovație, remote-first...' : 'Innovation, remote-first...'} />
              </div>
              {filters.pathType === 'freelancer' && (
                <div>
                  <Label>{locale === 'ro' ? 'Buget client estimat' : 'Estimated client budget'}</Label>
                  <Select value={filters.budget} onValueChange={v => setFilters(f => ({ ...f, budget: v }))}>
                    <SelectTrigger><SelectValue placeholder={locale === 'ro' ? 'Selectează' : 'Select'} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="under500">{`< £500/${locale === 'ro' ? 'lună' : 'month'}`}</SelectItem>
                      <SelectItem value="500-2000">£500-2000/{locale === 'ro' ? 'lună' : 'month'}</SelectItem>
                      <SelectItem value="2000plus">£2000+/{locale === 'ro' ? 'lună' : 'month'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <Button onClick={scan} disabled={loading} className="mt-4 w-full md:w-auto">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
              {locale === 'ro' ? 'Scanează' : 'Scan'}
            </Button>
          </CardContent>
        </Card>

        {/* Warning */}
        <Alert className="border-yellow-500/30 bg-yellow-500/5">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <AlertDescription className="text-sm text-muted-foreground">
            {locale === 'ro'
              ? '⚠️ Lista generată de AI este un punct de pornire. Verifică fiecare companie pe LinkedIn înainte de a o contacta.'
              : '⚠️ The AI-generated list is a starting point. Verify each company on LinkedIn before reaching out.'}
          </AlertDescription>
        </Alert>

        {/* Results */}
        {companies.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold">
                  {locale === 'ro' ? `${companies.length} companii găsite` : `${companies.length} companies found`}
                </h2>
                {usedPerplexity && <Badge variant="secondary" className="text-xs">🔍 Real-time data</Badge>}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={selectAll}>
                  {companies.every(c => c.selected) ? (locale === 'ro' ? 'Deselectează tot' : 'Deselect all') : (locale === 'ro' ? 'Selectează tot' : 'Select all')}
                </Button>
                <Button size="sm" disabled={!selectedCount || importing} onClick={importSelected}>
                  {importing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
                  {locale === 'ro' ? `Adaugă ${selectedCount} în Dream 100` : `Add ${selectedCount} to Dream 100`}
                </Button>
              </div>
            </div>

            <div className="grid gap-3">
              {companies.map((company, i) => (
                <Card
                  key={i}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md",
                    company.selected && "ring-2 ring-primary border-primary"
                  )}
                  onClick={() => toggleSelect(i)}
                >
                  <CardContent className="p-4 flex items-start gap-3">
                    <Checkbox checked={company.selected} className="mt-1" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">{company.name}</h3>
                        <Badge variant="outline" className="text-xs">{company.industry}</Badge>
                        <Badge variant="secondary" className="text-xs">{company.decision_maker_type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{company.description}</p>
                      <p className="text-xs text-primary mt-1">✨ {company.why_fit}</p>
                    </div>
                    <div className="flex gap-1">
                      {company.linkedin_url && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild onClick={e => e.stopPropagation()}>
                          <a href={company.linkedin_url} target="_blank" rel="noopener"><ExternalLink className="h-4 w-4" /></a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
