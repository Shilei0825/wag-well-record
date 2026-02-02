import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCreateVisit } from '@/hooks/useVisits';
import { PageHeader } from '@/components/PageHeader';
import { DocumentScanner } from '@/components/DocumentScanner';
import { toast } from 'sonner';

export default function AddVisit() {
  const { petId } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const createVisit = useCreateVisit();

  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [clinicName, setClinicName] = useState('');
  const [reason, setReason] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [totalCost, setTotalCost] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!petId) return;

    try {
      await createVisit.mutateAsync({
        pet_id: petId,
        visit_date: visitDate,
        clinic_name: clinicName,
        reason,
        diagnosis: diagnosis || undefined,
        treatment: treatment || undefined,
        total_cost: totalCost ? parseFloat(totalCost) : undefined,
        notes: notes || undefined,
      });

      toast.success(language === 'zh' ? '添加成功' : 'Visit added successfully');
      navigate(`/pet/${petId}/visits`);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleScanComplete = (data: any) => {
    if (data.visitDate) setVisitDate(data.visitDate);
    if (data.clinicName) setClinicName(data.clinicName);
    if (data.reason) setReason(data.reason);
    if (data.diagnosis) setDiagnosis(data.diagnosis);
    if (data.treatment) setTreatment(data.treatment);
    if (data.totalCost) setTotalCost(String(data.totalCost));
    if (data.notes) setNotes(data.notes);
  };

  return (
    <div className="page-container pb-6">
      <PageHeader title={t('visit.add')} showBack />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Document Scanner */}
        <DocumentScanner 
          documentType="visit" 
          onScanComplete={handleScanComplete} 
        />
        {/* Visit Date */}
        <div className="space-y-2">
          <Label htmlFor="visitDate">{t('visit.date')} *</Label>
          <Input
            id="visitDate"
            type="date"
            value={visitDate}
            onChange={(e) => setVisitDate(e.target.value)}
            required
            className="input-mobile"
          />
        </div>

        {/* Clinic Name */}
        <div className="space-y-2">
          <Label htmlFor="clinicName">{t('visit.clinic')} *</Label>
          <Input
            id="clinicName"
            value={clinicName}
            onChange={(e) => setClinicName(e.target.value)}
            required
            className="input-mobile"
            placeholder={language === 'zh' ? '医院名称' : 'Clinic name'}
          />
        </div>

        {/* Reason */}
        <div className="space-y-2">
          <Label htmlFor="reason">{t('visit.reason')} *</Label>
          <Input
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            className="input-mobile"
            placeholder={language === 'zh' ? '就诊原因' : 'Reason for visit'}
          />
        </div>

        {/* Diagnosis */}
        <div className="space-y-2">
          <Label htmlFor="diagnosis">
            {t('visit.diagnosis')} <span className="text-muted-foreground">({t('common.optional')})</span>
          </Label>
          <Textarea
            id="diagnosis"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            className="min-h-[80px]"
            placeholder={language === 'zh' ? '诊断结果' : 'Diagnosis'}
          />
        </div>

        {/* Treatment */}
        <div className="space-y-2">
          <Label htmlFor="treatment">
            {t('visit.treatment')} <span className="text-muted-foreground">({t('common.optional')})</span>
          </Label>
          <Textarea
            id="treatment"
            value={treatment}
            onChange={(e) => setTreatment(e.target.value)}
            className="min-h-[80px]"
            placeholder={language === 'zh' ? '治疗方案' : 'Treatment plan'}
          />
        </div>

        {/* Total Cost */}
        <div className="space-y-2">
          <Label htmlFor="totalCost">
            {t('visit.cost')} (¥) <span className="text-muted-foreground">({t('common.optional')})</span>
          </Label>
          <Input
            id="totalCost"
            type="number"
            step="0.01"
            value={totalCost}
            onChange={(e) => setTotalCost(e.target.value)}
            className="input-mobile"
            placeholder="0.00"
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">
            {t('pet.notes')} <span className="text-muted-foreground">({t('common.optional')})</span>
          </Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[80px]"
            placeholder={language === 'zh' ? '其他备注...' : 'Additional notes...'}
          />
        </div>

        <Button
          type="submit"
          disabled={createVisit.isPending || !clinicName || !reason}
          className="w-full btn-mobile"
        >
          {createVisit.isPending ? t('common.loading') : t('common.save')}
        </Button>
      </form>
    </div>
  );
}
