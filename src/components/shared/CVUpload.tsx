import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, FileText, Loader2, X, CheckCircle2 } from 'lucide-react';

interface CVUploadProps {
  onTextExtracted: (text: string) => void;
  className?: string;
}

export function CVUpload({ onTextExtracted, className }: CVUploadProps) {
  const { t } = useI18n();
  const [status, setStatus] = useState<'idle' | 'uploading' | 'parsed'>('idle');
  const [fileName, setFileName] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const processFile = useCallback(async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError(t.cvUpload?.onlyPdf || 'Only PDF files are accepted');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError(t.cvUpload?.tooLarge || 'File too large. Maximum 5MB.');
      return;
    }

    setError('');
    setStatus('uploading');
    setFileName(file.name);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/parse-cv`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to parse CV');
      }

      const data = await response.json();
      const text = data.text || '';
      setPreviewText(text.slice(0, 200) + (text.length > 200 ? '...' : ''));
      setStatus('parsed');
      onTextExtracted(text);
    } catch (e: any) {
      console.error('CV parse error:', e);
      setError(e.message || 'Error parsing CV');
      setStatus('idle');
    }
  }, [onTextExtracted, t]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleRemove = () => {
    setStatus('idle');
    setFileName('');
    setPreviewText('');
    setError('');
    onTextExtracted('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (status === 'parsed') {
    return (
      <Card className={`p-3 border-primary/30 bg-primary/5 ${className || ''}`}>
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground truncate">{fileName}</span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">{previewText}</p>
          </div>
          <Button variant="ghost" size="icon" className="shrink-0 h-7 w-7" onClick={handleRemove}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    );
  }

  if (status === 'uploading') {
    return (
      <Card className={`p-4 border-primary/20 ${className || ''}`}>
        <div className="flex items-center gap-3 justify-center">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
          <span className="text-sm text-muted-foreground">
            {t.cvUpload?.parsing || 'Extracting text from CV...'}
          </span>
        </div>
      </Card>
    );
  }

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleFileChange}
      />
      <Card
        className={`p-4 border-dashed border-2 cursor-pointer transition-colors ${
          dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/20 hover:border-primary/40'
        }`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <Upload className="w-6 h-6 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">
              {t.cvUpload?.dropzone || 'Upload your CV (optional)'}
            </p>
            <p className="text-xs text-muted-foreground">
              {t.cvUpload?.dropzoneHint || 'PDF, max 5MB • Drag & drop or click'}
            </p>
          </div>
        </div>
      </Card>
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}
