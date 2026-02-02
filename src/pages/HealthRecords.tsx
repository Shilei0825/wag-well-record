import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Syringe, Bug, Pill, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePet } from '@/hooks/usePets';
import { useHealthRecords, HealthRecord } from '@/hooks/useHealthRecords';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { BottomNav } from '@/components/BottomNav';
import { format, parseISO } from 'date-fns';

const typeIcons = {
  vaccine: Syringe,
  deworming: Bug,
  medication: Pill,
};

function RecordItem({ record }: { record: HealthRecord }) {
  const Icon = typeIcons[record.type];
  
  return (
    <div className="card-elevated p-4 flex items-start gap-4">
      <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
        <Icon className="h-5 w-5 text-success" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground">{record.name}</p>
        <p className="text-sm text-muted-foreground">
          {format(parseISO(record.date), 'yyyy-MM-dd')}
        </p>
        {record.next_due_date && (
          <p className="text-xs text-warning mt-1">
            Next: {format(parseISO(record.next_due_date), 'yyyy-MM-dd')}
          </p>
        )}
        {record.notes && (
          <p className="text-sm text-muted-foreground mt-1">{record.notes}</p>
        )}
      </div>
    </div>
  );
}

export default function HealthRecords() {
  const { petId } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { data: pet } = usePet(petId);
  const { data: records, isLoading } = useHealthRecords(petId);

  const vaccineRecords = records?.filter((r) => r.type === 'vaccine') || [];
  const dewormingRecords = records?.filter((r) => r.type === 'deworming') || [];
  const medicationRecords = records?.filter((r) => r.type === 'medication') || [];

  return (
    <div className="page-container">
      <PageHeader
        title={pet?.name ? `${pet.name} - ${t('health.records')}` : t('health.records')}
        showBack
        action={
          <Button
            size="icon"
            onClick={() => navigate(`/pet/${petId}/health/new`)}
          >
            <Plus className="h-5 w-5" />
          </Button>
        }
      />

      {isLoading ? (
        <p className="text-center text-muted-foreground">{t('common.loading')}</p>
      ) : records && records.length > 0 ? (
        <Tabs defaultValue="vaccine" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="vaccine">{t('health.vaccine')}</TabsTrigger>
            <TabsTrigger value="deworming">{t('health.deworming')}</TabsTrigger>
            <TabsTrigger value="medication">{t('health.medication')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="vaccine" className="space-y-3">
            {vaccineRecords.length > 0 ? (
              vaccineRecords.map((record) => (
                <RecordItem key={record.id} record={record} />
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                {t('health.noRecords')}
              </p>
            )}
          </TabsContent>
          
          <TabsContent value="deworming" className="space-y-3">
            {dewormingRecords.length > 0 ? (
              dewormingRecords.map((record) => (
                <RecordItem key={record.id} record={record} />
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                {t('health.noRecords')}
              </p>
            )}
          </TabsContent>
          
          <TabsContent value="medication" className="space-y-3">
            {medicationRecords.length > 0 ? (
              medicationRecords.map((record) => (
                <RecordItem key={record.id} record={record} />
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                {t('health.noRecords')}
              </p>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <EmptyState
          icon={Activity}
          title={t('health.noRecords')}
          action={{
            label: t('health.add'),
            onClick: () => navigate(`/pet/${petId}/health/new`),
          }}
        />
      )}

      <BottomNav />
    </div>
  );
}
