import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, GraduationCap, Calendar } from 'lucide-react';

interface OnboardingData {
  full_name: string;
  date_of_birth: string;
  study_field: string;
}

interface Props {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

const studyFields = [
  'Informatică & IT',
  'Economie & Business',
  'Drept',
  'Medicină & Farmacie',
  'Inginerie',
  'Arhitectură',
  'Design & Arte',
  'Comunicare & Jurnalism',
  'Psihologie',
  'Limbi străine',
  'Științe exacte',
  'Științe sociale',
  'Sport & Educație fizică',
  'Altele',
];

export default function OnboardingStep1({ data, updateData }: Props) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="w-8 h-8 text-primary" />
        </div>
        <p className="text-muted-foreground">
          Completează câteva detalii despre tine pentru a personaliza experiența ta.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="full_name" className="text-foreground flex items-center gap-2">
            <User className="w-4 h-4" />
            Numele tău complet *
          </Label>
          <Input
            id="full_name"
            placeholder="ex: Alexandru Popescu"
            value={data.full_name}
            onChange={(e) => updateData({ full_name: e.target.value })}
            className="bg-background/50 border-white/10 focus:border-primary"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="date_of_birth" className="text-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Data nașterii (opțional)
          </Label>
          <Input
            id="date_of_birth"
            type="date"
            value={data.date_of_birth}
            onChange={(e) => updateData({ date_of_birth: e.target.value })}
            className="bg-background/50 border-white/10 focus:border-primary"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="study_field" className="text-foreground flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            Domeniul de studii *
          </Label>
          <Select
            value={data.study_field}
            onValueChange={(value) => updateData({ study_field: value })}
          >
            <SelectTrigger className="bg-background/50 border-white/10 focus:border-primary">
              <SelectValue placeholder="Alege domeniul tău" />
            </SelectTrigger>
            <SelectContent>
              {studyFields.map((field) => (
                <SelectItem key={field} value={field}>
                  {field}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
