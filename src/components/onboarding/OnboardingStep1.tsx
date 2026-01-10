import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, GraduationCap, Calendar, Globe } from 'lucide-react';
import { useI18n, Locale } from '@/lib/i18n';

interface OnboardingData {
  full_name: string;
  date_of_birth: string;
  study_field: string;
  other_course?: string;
}

interface Props {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

const eduforyouCourses = [
  // Business & Management
  { category: 'Business & Management', name: 'Applied Business Psychology (BSc)' },
  { category: 'Business & Management', name: 'Global Business Management (BSc)' },
  { category: 'Business & Management', name: 'Project Management (BSc)' },
  { category: 'Business & Management', name: 'Accounting & Finance (BSc)' },
  { category: 'Business & Management', name: 'Business & Tourism (BSc)' },
  { category: 'Business & Management', name: 'Business (HND)' },
  { category: 'Business & Management', name: 'Global Business Entrepreneurship (BSc)' },
  { category: 'Business & Management', name: 'Business Administration (MBA)' },
  { category: 'Business & Management', name: 'Marketing Management (BSc)' },
  { category: 'Business & Management', name: 'International Business (BSc)' },
  { category: 'Business & Management', name: 'Human Resource Management (BSc)' },
  // Technology & Computing
  { category: 'Technology & Computing', name: 'Computing (BSc)' },
  { category: 'Technology & Computing', name: 'Computer Science (BSc)' },
  { category: 'Technology & Computing', name: 'Software Engineering (BSc)' },
  { category: 'Technology & Computing', name: 'Cyber Security (BSc)' },
  { category: 'Technology & Computing', name: 'Cyber Security (HND)' },
  { category: 'Technology & Computing', name: 'Data Science (BSc)' },
  { category: 'Technology & Computing', name: 'Artificial Intelligence (BSc)' },
  { category: 'Technology & Computing', name: 'Information Technology (BSc)' },
  { category: 'Technology & Computing', name: 'Web Development (BSc)' },
  // Healthcare & Social Sciences
  { category: 'Healthcare & Social Sciences', name: 'Psychology & Counselling (BSc)' },
  { category: 'Healthcare & Social Sciences', name: 'Healthcare Practice (HND)' },
  { category: 'Healthcare & Social Sciences', name: 'Nursing (BSc)' },
  { category: 'Healthcare & Social Sciences', name: 'Health & Social Care (BSc)' },
  { category: 'Healthcare & Social Sciences', name: 'Public Health (BSc)' },
  { category: 'Healthcare & Social Sciences', name: 'Social Work (BSc)' },
  { category: 'Healthcare & Social Sciences', name: 'Biomedical Science (BSc)' },
  // Construction & Engineering
  { category: 'Construction & Engineering', name: 'Construction Management (BSc)' },
  { category: 'Construction & Engineering', name: 'Construction Management (HND)' },
  { category: 'Construction & Engineering', name: 'Civil Engineering (BEng)' },
  { category: 'Construction & Engineering', name: 'Mechanical Engineering (BEng)' },
  { category: 'Construction & Engineering', name: 'Electrical Engineering (BEng)' },
  { category: 'Construction & Engineering', name: 'Architecture (BA)' },
  { category: 'Construction & Engineering', name: 'Quantity Surveying (BSc)' },
  // Creative & Media
  { category: 'Creative & Media', name: 'Graphic Design (BA)' },
  { category: 'Creative & Media', name: 'Digital Marketing (BSc)' },
  { category: 'Creative & Media', name: 'Media & Communications (BA)' },
  { category: 'Creative & Media', name: 'Film & Television Production (BA)' },
  { category: 'Creative & Media', name: 'Photography (BA)' },
  { category: 'Creative & Media', name: 'Fashion Design (BA)' },
  // Law & Humanities
  { category: 'Law & Humanities', name: 'Law (LLB)' },
  { category: 'Law & Humanities', name: 'Criminology (BSc)' },
  { category: 'Law & Humanities', name: 'Politics & International Relations (BA)' },
  { category: 'Law & Humanities', name: 'History (BA)' },
  { category: 'Law & Humanities', name: 'English Literature (BA)' },
];

// Group courses by category
const coursesByCategory = eduforyouCourses.reduce((acc, course) => {
  if (!acc[course.category]) {
    acc[course.category] = [];
  }
  acc[course.category].push(course.name);
  return acc;
}, {} as Record<string, string[]>);

export default function OnboardingStep1({ data, updateData }: Props) {
  const { locale, setLocale, t } = useI18n();
  const isOtherCourse = data.study_field === t.onboardingStep1.otherCourse;

  const handleLanguageChange = (value: string) => {
    setLocale(value as Locale);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="w-8 h-8 text-primary" />
        </div>
        <p className="text-muted-foreground">
          {t.onboardingStep1.description}
        </p>
      </div>

      <div className="space-y-4">
        {/* Language Selector */}
        <div className="space-y-2">
          <Label htmlFor="language" className="text-foreground flex items-center gap-2">
            <Globe className="w-4 h-4" />
            {t.onboardingStep1.languageLabel}
          </Label>
          <Select value={locale} onValueChange={handleLanguageChange}>
            <SelectTrigger className="bg-background/50 border-white/10 focus:border-primary">
              <SelectValue placeholder={t.onboardingStep1.languagePlaceholder} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ro">
                <span className="flex items-center gap-2">
                  🇷🇴 {t.languages.ro}
                </span>
              </SelectItem>
              <SelectItem value="en">
                <span className="flex items-center gap-2">
                  🇬🇧 {t.languages.en}
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="full_name" className="text-foreground flex items-center gap-2">
            <User className="w-4 h-4" />
            {t.onboardingStep1.fullNameLabel}
          </Label>
          <Input
            id="full_name"
            placeholder={t.onboardingStep1.fullNamePlaceholder}
            value={data.full_name}
            onChange={(e) => updateData({ full_name: e.target.value })}
            className="bg-background/50 border-white/10 focus:border-primary"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="date_of_birth" className="text-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {t.onboardingStep1.dateOfBirthLabel}
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
            {t.onboardingStep1.studyFieldLabel}
          </Label>
          <Select
            value={data.study_field}
            onValueChange={(value) => updateData({ 
              study_field: value, 
              other_course: value === t.onboardingStep1.otherCourse ? data.other_course : '' 
            })}
          >
            <SelectTrigger className="bg-background/50 border-white/10 focus:border-primary">
              <SelectValue placeholder={t.onboardingStep1.studyFieldPlaceholder} />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {Object.entries(coursesByCategory).map(([category, courses]) => (
                <SelectGroup key={category}>
                  <SelectLabel className="text-primary font-semibold">{category}</SelectLabel>
                  {courses.map((course) => (
                    <SelectItem key={course} value={course}>
                      {course}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
              <SelectGroup>
                <SelectLabel className="text-primary font-semibold">{t.onboardingStep1.otherCategory}</SelectLabel>
                <SelectItem value={t.onboardingStep1.otherCourse}>
                  {t.onboardingStep1.otherCourse}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {t.onboardingStep1.studyFieldHint}
          </p>
        </div>

        {isOtherCourse && (
          <div className="space-y-2">
            <Label htmlFor="other_course" className="text-foreground">
              {t.onboardingStep1.otherCourseLabel}
            </Label>
            <Input
              id="other_course"
              placeholder={t.onboardingStep1.otherCoursePlaceholder}
              value={data.other_course || ''}
              onChange={(e) => updateData({ other_course: e.target.value })}
              className="bg-background/50 border-white/10 focus:border-primary"
            />
          </div>
        )}
      </div>
    </div>
  );
}
