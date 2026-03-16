import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { FileText, Loader2, Copy, RefreshCw, Download, ChevronDown } from 'lucide-react';
import { CVUpload } from '@/components/shared/CVUpload';
import { AvatarUpload } from '@/components/shared/AvatarUpload';
import { OutputLanguageSelect } from '@/components/shared/OutputLanguageSelect';

export default function CVBuilder() {
  const { user } = useAuth();
  const { locale } = useI18n();
  const [targets, setTargets] = useState<any[]>([]);
  const [selectedTargetId, setSelectedTargetId] = useState<string>('');
  const [experience, setExperience] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [activeTab, setActiveTab] = useState('ats_cv');
  const [documents, setDocuments] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [outputLang, setOutputLang] = useState(locale === 'en' ? 'en' : 'ro');

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from('dream100_targets').select('id, name, industry').order('name'),
      supabase.from('profiles').select('avatar_url').eq('id', user.id).single(),
    ]).then(([targetsRes, profileRes]) => {
      setTargets((targetsRes.data as any[]) || []);
      if (profileRes.data && (profileRes.data as any).avatar_url) {
        setAvatarUrl((profileRes.data as any).avatar_url);
      }
    });
  }, [user]);

  const generate = async (docType: string) => {
    setGenerating(docType);
    try {
      const { data, error } = await supabase.functions.invoke('cv-generator', {
        body: {
          targetId: selectedTargetId || null,
          documentType: docType,
          experience,
          targetRole,
          additionalInstructions,
          avatarUrl: avatarUrl || null,
        },
      });
      if (error) throw error;
      if (data?.content) {
        setDocuments(prev => ({ ...prev, [docType]: data.content }));
        toast({ title: locale === 'ro' ? 'Document generat!' : 'Document generated!' });
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setGenerating(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: locale === 'ro' ? 'Copiat!' : 'Copied!' });
  };

  const wrapForExport = (content: string) => {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:'Segoe UI',Arial,sans-serif;color:#1a1a1a;line-height:1.6;padding:40px;max-width:800px;margin:0 auto;background:#fff;}h1,h2,h3{color:#1a1a1a;}a{color:#2563eb;}img{max-width:100%;}</style></head><body>${content}</body></html>`;
  };

  const downloadAsPdf = async (content: string, filename: string) => {
    const html2pdf = (await import('html2pdf.js')).default;
    const container = document.createElement('div');
    container.innerHTML = content;
    container.style.padding = '30px';
    container.style.fontFamily = "'Segoe UI', Arial, sans-serif";
    container.style.color = '#1a1a1a';
    container.style.lineHeight = '1.6';
    container.style.background = '#fff';
    document.body.appendChild(container);

    await html2pdf().set({
      margin: 10,
      filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    }).from(container).save();

    document.body.removeChild(container);
  };

  const downloadAsHtml = (content: string, filename: string) => {
    const blob = new Blob([wrapForExport(content)], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAsDocx = async (content: string, filename: string) => {
    // Convert HTML to simple DOCX using mhtml trick
    const docContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"><style>body{font-family:'Segoe UI',Arial,sans-serif;color:#1a1a1a;line-height:1.6;}h1,h2,h3{color:#1a1a1a;}</style></head>
      <body>${content}</body></html>`;
    const blob = new Blob(['\ufeff', docContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCvTextExtracted = (text: string) => {
    if (text) {
      setExperience(prev => prev ? `${prev}\n\n--- Extras din CV ---\n${text}` : text);
    }
  };

  const docTypes = [
    { id: 'ats_cv', label: locale === 'ro' ? 'CV ATS-Friendly' : 'ATS-Friendly CV', desc: locale === 'ro' ? 'Optimizat pentru roboții de recrutare' : 'Optimized for applicant tracking systems' },
    { id: 'sales_cv', label: locale === 'ro' ? 'CV Sales Page' : 'CV Sales Page', desc: locale === 'ro' ? 'CV vizual non-tradițional' : 'Non-traditional visual CV' },
    { id: 'cover_letter', label: locale === 'ro' ? 'Cover Letter' : 'Cover Letter', desc: locale === 'ro' ? 'Scrisoare de intenție ca Sales Letter' : 'Cover Letter as Sales Letter' },
  ];

  return (
    <MainLayout>
      <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-7 w-7 text-primary" />
            {locale === 'ro' ? 'CV ca Ofertă Irezistibilă' : 'CV as Irresistible Offer'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {locale === 'ro'
              ? 'Transformă CV-ul clasic într-o Sales Page personalizată per companie'
              : 'Transform your classic CV into a personalized Sales Page per company'}
          </p>
        </div>

        {/* Configuration */}
        <Card>
          <CardContent className="p-4 md:p-6 space-y-4">
            <AvatarUpload
              currentUrl={avatarUrl || null}
              onUploaded={(url) => setAvatarUrl(url)}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>{locale === 'ro' ? 'Companie din Dream 100' : 'Company from Dream 100'}</Label>
                <Select value={selectedTargetId} onValueChange={setSelectedTargetId}>
                  <SelectTrigger>
                    <SelectValue placeholder={locale === 'ro' ? 'Selectează compania...' : 'Select company...'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{locale === 'ro' ? 'Fără companie specifică' : 'No specific company'}</SelectItem>
                    {targets.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name} {t.industry ? `(${t.industry})` : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{locale === 'ro' ? 'Rolul vizat' : 'Target role'}</Label>
                <Input value={targetRole} onChange={e => setTargetRole(e.target.value)} placeholder={locale === 'ro' ? 'ex: Marketing Manager' : 'e.g. Marketing Manager'} />
              </div>
            </div>
            <div>
              <Label>{locale === 'ro' ? 'Experiențe anterioare' : 'Previous experience'}</Label>
              <Textarea value={experience} onChange={e => setExperience(e.target.value)} rows={3} placeholder={locale === 'ro' ? 'Job-uri, voluntariat, proiecte, cursuri...' : 'Jobs, volunteering, projects, courses...'} />
            </div>
            <CVUpload onTextExtracted={handleCvTextExtracted} />
            <div>
              <Label>{locale === 'ro' ? 'Instrucțiuni suplimentare (opțional)' : 'Additional instructions (optional)'}</Label>
              <Input value={additionalInstructions} onChange={e => setAdditionalInstructions(e.target.value)} placeholder={locale === 'ro' ? 'ex: Accent pe leadership, menționează proiectul X...' : 'e.g. Emphasize leadership, mention project X...'} />
            </div>
          </CardContent>
        </Card>

        {/* Document Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            {docTypes.map(dt => (
              <TabsTrigger key={dt.id} value={dt.id} className="flex-1 text-xs md:text-sm">{dt.label}</TabsTrigger>
            ))}
          </TabsList>

          {docTypes.map(dt => (
            <TabsContent key={dt.id} value={dt.id}>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{dt.label}</CardTitle>
                      <p className="text-xs text-muted-foreground">{dt.desc}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => generate(dt.id)} disabled={generating === dt.id}>
                        {generating === dt.id ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <RefreshCw className="h-4 w-4 mr-1" />}
                        {documents[dt.id] ? (locale === 'ro' ? 'Regenerează' : 'Regenerate') : (locale === 'ro' ? 'Generează' : 'Generate')}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {documents[dt.id] ? (
                    <div className="space-y-3">
                      {/* White background preview for readability */}
                      <div className="bg-white rounded-lg p-6 max-h-[500px] overflow-y-auto border border-border shadow-inner">
                        <div
                          className="prose prose-sm max-w-none text-gray-900 [&_h1]:text-gray-900 [&_h2]:text-gray-900 [&_h3]:text-gray-900 [&_p]:text-gray-800 [&_li]:text-gray-800 [&_a]:text-blue-600 [&_button]:pointer-events-none [&_button]:opacity-60 [&_a[href]]:pointer-events-none"
                          dangerouslySetInnerHTML={{ __html: documents[dt.id] }}
                        />
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Button variant="outline" size="sm" onClick={() => copyToClipboard(documents[dt.id])}>
                          <Copy className="h-4 w-4 mr-1" />{locale === 'ro' ? 'Copiază' : 'Copy'}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              {locale === 'ro' ? 'Descarcă' : 'Download'}
                              <ChevronDown className="h-3 w-3 ml-1" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => downloadAsPdf(documents[dt.id], `${dt.id}.pdf`)}>
                              📄 PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => downloadAsDocx(documents[dt.id], `${dt.id}.doc`)}>
                              📝 DOCX (Word)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => downloadAsHtml(documents[dt.id], `${dt.id}.html`)}>
                              🌐 HTML
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">{locale === 'ro' ? 'Apasă "Generează" pentru a crea documentul' : 'Click "Generate" to create the document'}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </MainLayout>
  );
}