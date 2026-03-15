import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Camera, Loader2, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AvatarUploadProps {
  currentUrl?: string | null;
  onUploaded: (url: string) => void;
  className?: string;
}

export function AvatarUpload({ currentUrl, onUploaded, className }: AvatarUploadProps) {
  const { user } = useAuth();
  const { t } = useI18n();
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: t.cvUpload?.onlyImages || 'Only image files are accepted', variant: 'destructive' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: t.cvUpload?.tooLarge || 'File too large. Maximum 5MB.', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const filePath = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('profile-avatars')
        .getPublicUrl(filePath);

      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      // Save to profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl } as any)
        .eq('id', user.id);

      if (profileError) throw profileError;

      setPreviewUrl(publicUrl);
      onUploaded(publicUrl);
      toast({ title: t.cvUpload?.avatarSaved || 'Profile photo saved!' });
    } catch (e: any) {
      console.error('Avatar upload error:', e);
      toast({ title: e.message || 'Upload error', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!user) return;
    try {
      await supabase.from('profiles').update({ avatar_url: null } as any).eq('id', user.id);
      setPreviewUrl(null);
      onUploaded('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (e) {
      console.error('Remove avatar error:', e);
    }
  };

  return (
    <div className={`flex items-center gap-4 ${className || ''}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <div className="relative">
        <div
          className="w-20 h-20 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary/50 transition-colors bg-muted/30"
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          ) : previewUrl ? (
            <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <Camera className="w-6 h-6 text-muted-foreground" />
          )}
        </div>
        {previewUrl && !uploading && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-destructive/80 hover:bg-destructive text-destructive-foreground"
            onClick={handleRemove}
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">
          {t.cvUpload?.profilePhoto || 'Profile Photo'}
        </p>
        <p className="text-xs text-muted-foreground">
          {t.cvUpload?.photoHint || 'Will be included in your CV'}
        </p>
      </div>
    </div>
  );
}
