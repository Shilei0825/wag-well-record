import { PageHeader } from '@/components/PageHeader';
import { BottomNav } from '@/components/BottomNav';
import { TreatmentCodeLookup } from '@/components/TreatmentCodeLookup';
import { useLanguage } from '@/contexts/LanguageContext';

export default function TreatmentCodes() {
  const { t } = useLanguage();

  return (
    <div className="page-container">
      <PageHeader title={t('settings.treatmentCodes')} showBack />
      <TreatmentCodeLookup />
      <BottomNav />
    </div>
  );
}