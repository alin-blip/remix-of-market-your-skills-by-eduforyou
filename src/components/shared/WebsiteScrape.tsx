import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Globe, Loader2, X, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface WebsiteScrapeProps {
  onTextExtracted: (text: string) => void;
  className?: string;
  label?: string;
  placeholder?: string;
  hint?: string;
}

export function WebsiteScrape({
  onTextExtracted,
  className,
  label = 'Company website (optional)',
  placeholder = 'https://yourcompany.com',
  hint = 'We will read your homepage to detect assets, offers and audience.',
}: WebsiteScrapeProps) {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');
  const [scrapedUrl, setScrapedUrl] = useState('');
  const [preview, setPreview] = useState('');

  const handleScrape = async () => {
    if (!url.trim()) return;
    setStatus('loading');
    try {
      const { data, error } = await supabase.functions.invoke('firecrawl-scrape', {
        body: { url: url.trim(), options: { formats: ['markdown'], onlyMainContent: true } },
      });
      if (error) throw error;
      if (data?.success === false) throw new Error(data.error || 'Scrape failed');

      const md: string = data?.data?.markdown || data?.markdown || '';
      if (!md) throw new Error('No content extracted from this URL');

      const trimmed = md.slice(0, 8000);
      setPreview(trimmed.slice(0, 220) + (trimmed.length > 220 ? '...' : ''));
      setScrapedUrl(url.trim());
      setStatus('done');
      onTextExtracted(trimmed);
      toast.success('Website analyzed successfully');
    } catch (e: any) {
      console.error('Scrape error:', e);
      toast.error(e.message || 'Could not read website');
      setStatus('idle');
    }
  };

  const handleRemove = () => {
    setUrl('');
    setScrapedUrl('');
    setPreview('');
    setStatus('idle');
    onTextExtracted('');
  };

  if (status === 'done') {
    return (
      <Card className={`p-3 border-primary/30 bg-primary/5 ${className || ''}`}>
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground truncate">{scrapedUrl}</span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">{preview}</p>
          </div>
          <Button variant="ghost" size="icon" className="shrink-0 h-7 w-7" onClick={handleRemove}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-4 border-dashed border-2 border-muted-foreground/20 ${className || ''}`}>
      <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
        <Globe className="w-4 h-4 text-muted-foreground" />
        {label}
      </label>
      <div className="flex gap-2">
        <Input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={placeholder}
          disabled={status === 'loading'}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleScrape(); } }}
        />
        <Button
          type="button"
          onClick={handleScrape}
          disabled={!url.trim() || status === 'loading'}
          variant="secondary"
        >
          {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Analyze'}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-2">{hint}</p>
    </Card>
  );
}