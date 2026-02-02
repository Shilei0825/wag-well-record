import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePet } from '@/hooks/usePets';
import { useVisits, Visit } from '@/hooks/useVisits';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { BottomNav } from '@/components/BottomNav';
import { format, parseISO } from 'date-fns';

function VisitItem({ visit }: { visit: Visit }) {
  const { t } = useLanguage();
  
  return (
    <div className="card-elevated p-4">
      <div className="flex items-start gap-4">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Stethoscope className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-medium text-foreground">{visit.clinic_name}</p>
              <p className="text-sm text-muted-foreground">
                {format(parseISO(visit.visit_date), 'yyyy-MM-dd')}
              </p>
            </div>
            {visit.total_cost && (
              <span className="text-sm font-medium text-foreground">
                ¥{visit.total_cost}
              </span>
            )}
          </div>
          <p className="text-sm text-foreground mt-2">{visit.reason}</p>
          {visit.diagnosis && (
            <p className="text-sm text-muted-foreground mt-1">
              {t('visit.diagnosis')}: {visit.diagnosis}
            </p>
          )}
          {visit.notes && (
            <p className="text-sm text-muted-foreground mt-1">{visit.notes}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Visits() {
  const { petId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { data: pet } = usePet(petId);
  const { data: visits, isLoading } = useVisits(petId);

  return (
    <div className="page-container">
      <PageHeader
        title={pet?.name ? `${pet.name} - ${t('visit.visits')}` : t('visit.visits')}
        showBack
        action={
          <Button
            size="icon"
            onClick={() => navigate(`/pet/${petId}/visit/new`)}
          >
            <Plus className="h-5 w-5" />
          </Button>
        }
      />

      {isLoading ? (
        <p className="text-center text-muted-foreground">{t('common.loading')}</p>
      ) : visits && visits.length > 0 ? (
        <div className="space-y-3">
          {visits.map((visit) => (
            <VisitItem key={visit.id} visit={visit} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Stethoscope}
          title={t('visit.noVisits')}
          action={{
            label: t('visit.add'),
            onClick: () => navigate(`/pet/${petId}/visit/new`),
          }}
        />
      )}

      <BottomNav />
    </div>
  );
}
