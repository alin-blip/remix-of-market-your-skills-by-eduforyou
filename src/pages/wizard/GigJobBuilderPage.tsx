import { MainLayout } from '@/components/layout/MainLayout';
import { GigJobBuilder } from '@/components/gigs/GigJobBuilder';
import { useI18n } from '@/lib/i18n';

export default function GigJobBuilderPage() {
  const { t } = useI18n();

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <GigJobBuilder />
      </div>
    </MainLayout>
  );
}
