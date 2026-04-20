import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Building2, Globe, Briefcase, MapPin } from 'lucide-react';

export interface CompanyData {
  company_name?: string;
  company_industry?: string;
  company_size?: string;
  company_country?: string;
  company_website?: string;
  company_sells?: string;
}

interface Props {
  data: CompanyData;
  updateData: (updates: Partial<CompanyData>) => void;
}

const INDUSTRIES = [
  'Education / EdTech', 'Recruitment / HR', 'SaaS / Software', 'E-commerce', 'Marketing / Agency',
  'Consulting', 'Finance / Fintech', 'Healthcare', 'Real Estate', 'Legal', 'Manufacturing',
  'Hospitality', 'Logistics', 'Media / Content', 'Other',
];

const SIZES = [
  { v: 'solo', l: 'Solo / Founder only' },
  { v: 'micro', l: '2-10 people' },
  { v: 'small', l: '11-50 people' },
  { v: 'medium', l: '51-200 people' },
  { v: 'large', l: '200+ people' },
];

export default function OnboardingStepCompany({ data, updateData }: Props) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <Building2 className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-1">Tell us about your company</h3>
        <p className="text-sm text-muted-foreground">
          We use this to identify the right Dream 100 partners and tailor every AI output to your business.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2"><Building2 className="w-4 h-4" /> Company name</Label>
          <Input
            placeholder="e.g. Edu4You Ltd"
            value={data.company_name || ''}
            onChange={(e) => updateData({ company_name: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Briefcase className="w-4 h-4" /> Industry</Label>
            <Select value={data.company_industry || ''} onValueChange={(v) => updateData({ company_industry: v })}>
              <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
              <SelectContent>{INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Company size</Label>
            <Select value={data.company_size || ''} onValueChange={(v) => updateData({ company_size: v })}>
              <SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger>
              <SelectContent>{SIZES.map(s => <SelectItem key={s.v} value={s.v}>{s.l}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Country</Label>
            <Input
              placeholder="e.g. United Kingdom"
              value={data.company_country || ''}
              onChange={(e) => updateData({ company_country: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Globe className="w-4 h-4" /> Website</Label>
            <Input
              placeholder="https://yourcompany.com"
              value={data.company_website || ''}
              onChange={(e) => updateData({ company_website: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>What does your company sell or deliver?</Label>
          <Textarea
            rows={3}
            placeholder="e.g. We recruit international students for UK universities and offer affiliate commissions to agencies who refer them."
            value={data.company_sells || ''}
            onChange={(e) => updateData({ company_sells: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Be specific — this powers your Partnership Offer Builder, ICP/IPP and Dream 100 scanner.
          </p>
        </div>
      </div>
    </div>
  );
}
