import { Globe } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/lib/i18n';

interface OutputLanguageSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const languages = [
  { value: 'ro', label: '🇷🇴 Română' },
  { value: 'en', label: '🇬🇧 English' },
  { value: 'ua', label: '🇺🇦 Українська' },
];

export function OutputLanguageSelect({ value, onChange, className }: OutputLanguageSelectProps) {
  const { locale } = useI18n();

  return (
    <div className={className}>
      <Label className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
        <Globe className="h-3.5 w-3.5" />
        {locale === 'ro' ? 'Limba conținutului' : 'Output language'}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9 w-[160px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {languages.map(lang => (
            <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
