import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { SEOHead } from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Globe, AlertTriangle, CheckCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CrawlResult {
  url: string;
  title?: string;
  description?: string;
  hasH1?: boolean;
  hasCanonical?: boolean;
  statusCode?: number;
}

export default function SeoAudit() {
  const [crawling, setCrawling] = useState(false);
  const [searching, setSearching] = useState(false);
  const [crawlResults, setCrawlResults] = useState<CrawlResult[]>([]);
  const [keywordResults, setKeywordResults] = useState<string>('');
  const siteUrl = 'https://venture-stride-kit.lovable.app';

  const runCrawl = async () => {
    setCrawling(true);
    try {
      const { data, error } = await supabase.functions.invoke('firecrawl-map', {
        body: { url: siteUrl, options: { limit: 50 } },
      });

      if (error) throw error;

      const links: string[] = data?.links || [];
      
      // Scrape first 10 pages for meta analysis
      const scrapePromises = links.slice(0, 10).map(async (url: string) => {
        try {
          const { data: scrapeData } = await supabase.functions.invoke('firecrawl-scrape', {
            body: { url, options: { formats: ['html'], onlyMainContent: false } },
          });
          
          const html = scrapeData?.data?.html || scrapeData?.html || '';
          const titleMatch = html.match(/<title>(.*?)<\/title>/i);
          const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["']/i);
          const h1Match = html.match(/<h1/i);
          const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["']/i);
          
          return {
            url,
            title: titleMatch?.[1] || '❌ Missing',
            description: descMatch?.[1] || '❌ Missing',
            hasH1: !!h1Match,
            hasCanonical: !!canonicalMatch,
            statusCode: 200,
          };
        } catch {
          return { url, statusCode: 0 };
        }
      });

      const results = await Promise.all(scrapePromises);
      setCrawlResults(results);
      toast.success(`Crawled ${links.length} URLs, analysed ${results.length} pages`);
    } catch (err) {
      console.error('Crawl error:', err);
      toast.error('Crawl failed — check Firecrawl connector');
    } finally {
      setCrawling(false);
    }
  };

  const runKeywordResearch = async () => {
    setSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('perplexity-research', {
        body: {
          query: 'What are the top 20 SEO keywords for a career coaching AI platform targeting UK university students who want to freelance, monetise skills, and find graduate jobs? Include search volume estimates and competition level.',
        },
      });

      if (error) throw error;
      setKeywordResults(data?.content || data?.choices?.[0]?.message?.content || 'No results');
      toast.success('Keyword research complete');
    } catch (err) {
      console.error('Keyword research error:', err);
      toast.error('Research failed — check Perplexity connector');
    } finally {
      setSearching(false);
    }
  };

  const issues = crawlResults.filter(r => !r.title || r.title === '❌ Missing' || !r.hasH1 || !r.hasCanonical);

  return (
    <MainLayout>
      <SEOHead title="SEO Audit" description="Admin SEO audit" noindex />
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">SEO Audit</h1>
            <p className="text-muted-foreground">Crawl site & research UK keywords</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={runCrawl} disabled={crawling} variant="outline">
              {crawling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Globe className="h-4 w-4 mr-2" />}
              Crawl Site
            </Button>
            <Button onClick={runKeywordResearch} disabled={searching}>
              {searching ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
              UK Keyword Research
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        {crawlResults.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-foreground">{crawlResults.length}</div>
                <p className="text-sm text-muted-foreground">Pages Analysed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-green-500">{crawlResults.length - issues.length}</div>
                <p className="text-sm text-muted-foreground">Pages OK</p>
              </CardContent>
            </Card>
            <Card className={issues.length > 0 ? 'border-destructive' : ''}>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-destructive">{issues.length}</div>
                <p className="text-sm text-muted-foreground">Issues Found</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Crawl Results */}
        {crawlResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Page Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-2 text-muted-foreground">URL</th>
                      <th className="text-left p-2 text-muted-foreground">Title</th>
                      <th className="text-center p-2 text-muted-foreground">H1</th>
                      <th className="text-center p-2 text-muted-foreground">Canonical</th>
                    </tr>
                  </thead>
                  <tbody>
                    {crawlResults.map((r, i) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="p-2">
                          <a href={r.url} target="_blank" rel="noopener noreferrer"
                             className="text-primary hover:underline flex items-center gap-1 max-w-[300px] truncate">
                            {r.url.replace(siteUrl, '')} <ExternalLink className="h-3 w-3 shrink-0" />
                          </a>
                        </td>
                        <td className="p-2 max-w-[250px] truncate text-foreground">
                          {r.title || '—'}
                        </td>
                        <td className="p-2 text-center">
                          {r.hasH1 ? <CheckCircle className="h-4 w-4 text-green-500 mx-auto" /> : <AlertTriangle className="h-4 w-4 text-destructive mx-auto" />}
                        </td>
                        <td className="p-2 text-center">
                          {r.hasCanonical ? <CheckCircle className="h-4 w-4 text-green-500 mx-auto" /> : <AlertTriangle className="h-4 w-4 text-destructive mx-auto" />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Keyword Research */}
        {keywordResults && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                UK Keyword Research
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-foreground">
                {keywordResults}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
