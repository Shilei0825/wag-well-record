import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/contexts/LanguageContext';

interface TreatmentCode {
  code: string;
  name_zh: string;
  name_en: string;
  category_zh: string;
  category_en: string;
  cost_low_zh: string;
  cost_mid_zh: string;
  cost_high_zh: string;
  cost_low_en: string;
  cost_mid_en: string;
  cost_high_en: string;
}

const treatmentCodes: TreatmentCode[] = [
  {
    code: 'EXAM-001',
    name_zh: '基础体检',
    name_en: 'Basic Examination',
    category_zh: '检查',
    category_en: 'Examination',
    cost_low_zh: '¥50-100',
    cost_mid_zh: '¥100-200',
    cost_high_zh: '¥200-300',
    cost_low_en: '$20-40',
    cost_mid_en: '$40-80',
    cost_high_en: '$80-120',
  },
  {
    code: 'EXAM-002',
    name_zh: '全面体检',
    name_en: 'Comprehensive Examination',
    category_zh: '检查',
    category_en: 'Examination',
    cost_low_zh: '¥200-300',
    cost_mid_zh: '¥300-500',
    cost_high_zh: '¥500-800',
    cost_low_en: '$80-120',
    cost_mid_en: '$120-200',
    cost_high_en: '$200-320',
  },
  {
    code: 'BLOOD-001',
    name_zh: '血常规',
    name_en: 'Complete Blood Count',
    category_zh: '化验',
    category_en: 'Lab Tests',
    cost_low_zh: '¥80-150',
    cost_mid_zh: '¥150-250',
    cost_high_zh: '¥250-400',
    cost_low_en: '$30-60',
    cost_mid_en: '$60-100',
    cost_high_en: '$100-160',
  },
  {
    code: 'BLOOD-002',
    name_zh: '血液生化',
    name_en: 'Blood Chemistry Panel',
    category_zh: '化验',
    category_en: 'Lab Tests',
    cost_low_zh: '¥150-300',
    cost_mid_zh: '¥300-500',
    cost_high_zh: '¥500-800',
    cost_low_en: '$60-120',
    cost_mid_en: '$120-200',
    cost_high_en: '$200-320',
  },
  {
    code: 'XRAY-001',
    name_zh: 'X光',
    name_en: 'X-Ray',
    category_zh: '影像',
    category_en: 'Imaging',
    cost_low_zh: '¥100-200',
    cost_mid_zh: '¥200-400',
    cost_high_zh: '¥400-600',
    cost_low_en: '$40-80',
    cost_mid_en: '$80-160',
    cost_high_en: '$160-240',
  },
  {
    code: 'ULTRA-001',
    name_zh: 'B超',
    name_en: 'Ultrasound',
    category_zh: '影像',
    category_en: 'Imaging',
    cost_low_zh: '¥150-300',
    cost_mid_zh: '¥300-500',
    cost_high_zh: '¥500-800',
    cost_low_en: '$60-120',
    cost_mid_en: '$120-200',
    cost_high_en: '$200-320',
  },
  {
    code: 'VACC-001',
    name_zh: '常规疫苗',
    name_en: 'Routine Vaccination',
    category_zh: '预防',
    category_en: 'Prevention',
    cost_low_zh: '¥50-100',
    cost_mid_zh: '¥100-200',
    cost_high_zh: '¥200-400',
    cost_low_en: '$20-40',
    cost_mid_en: '$40-80',
    cost_high_en: '$80-160',
  },
  {
    code: 'DEWORM-001',
    name_zh: '体内驱虫',
    name_en: 'Internal Deworming',
    category_zh: '预防',
    category_en: 'Prevention',
    cost_low_zh: '¥30-60',
    cost_mid_zh: '¥60-120',
    cost_high_zh: '¥120-200',
    cost_low_en: '$15-25',
    cost_mid_en: '$25-50',
    cost_high_en: '$50-80',
  },
  {
    code: 'DEWORM-002',
    name_zh: '体外驱虫',
    name_en: 'External Deworming',
    category_zh: '预防',
    category_en: 'Prevention',
    cost_low_zh: '¥50-100',
    cost_mid_zh: '¥100-200',
    cost_high_zh: '¥200-350',
    cost_low_en: '$20-40',
    cost_mid_en: '$40-80',
    cost_high_en: '$80-140',
  },
  {
    code: 'DENTAL-001',
    name_zh: '洁牙',
    name_en: 'Dental Cleaning',
    category_zh: '牙科',
    category_en: 'Dental',
    cost_low_zh: '¥300-500',
    cost_mid_zh: '¥500-800',
    cost_high_zh: '¥800-1500',
    cost_low_en: '$120-200',
    cost_mid_en: '$200-320',
    cost_high_en: '$320-600',
  },
  {
    code: 'DENTAL-002',
    name_zh: '拔牙',
    name_en: 'Tooth Extraction',
    category_zh: '牙科',
    category_en: 'Dental',
    cost_low_zh: '¥200-400',
    cost_mid_zh: '¥400-800',
    cost_high_zh: '¥800-1500',
    cost_low_en: '$80-160',
    cost_mid_en: '$160-320',
    cost_high_en: '$320-600',
  },
  {
    code: 'SURG-001',
    name_zh: '绝育手术',
    name_en: 'Spay/Neuter Surgery',
    category_zh: '手术',
    category_en: 'Surgery',
    cost_low_zh: '¥500-800',
    cost_mid_zh: '¥800-1500',
    cost_high_zh: '¥1500-3000',
    cost_low_en: '$200-320',
    cost_mid_en: '$320-600',
    cost_high_en: '$600-1200',
  },
  {
    code: 'SURG-002',
    name_zh: '软组织手术',
    name_en: 'Soft Tissue Surgery',
    category_zh: '手术',
    category_en: 'Surgery',
    cost_low_zh: '¥1000-2000',
    cost_mid_zh: '¥2000-5000',
    cost_high_zh: '¥5000-10000',
    cost_low_en: '$400-800',
    cost_mid_en: '$800-2000',
    cost_high_en: '$2000-4000',
  },
  {
    code: 'HOSP-001',
    name_zh: '住院观察',
    name_en: 'Hospitalization',
    category_zh: '住院',
    category_en: 'Hospitalization',
    cost_low_zh: '¥200-400/天',
    cost_mid_zh: '¥400-800/天',
    cost_high_zh: '¥800-1500/天',
    cost_low_en: '$80-160/day',
    cost_mid_en: '$160-320/day',
    cost_high_en: '$320-600/day',
  },
  {
    code: 'IV-001',
    name_zh: '静脉输液',
    name_en: 'IV Fluids',
    category_zh: '治疗',
    category_en: 'Treatment',
    cost_low_zh: '¥100-200',
    cost_mid_zh: '¥200-400',
    cost_high_zh: '¥400-600',
    cost_low_en: '$40-80',
    cost_mid_en: '$80-160',
    cost_high_en: '$160-240',
  },
  {
    code: 'MED-001',
    name_zh: '口服药',
    name_en: 'Oral Medication',
    category_zh: '用药',
    category_en: 'Medication',
    cost_low_zh: '¥30-80',
    cost_mid_zh: '¥80-200',
    cost_high_zh: '¥200-500',
    cost_low_en: '$15-30',
    cost_mid_en: '$30-80',
    cost_high_en: '$80-200',
  },
  {
    code: 'MED-002',
    name_zh: '注射药物',
    name_en: 'Injectable Medication',
    category_zh: '用药',
    category_en: 'Medication',
    cost_low_zh: '¥50-150',
    cost_mid_zh: '¥150-300',
    cost_high_zh: '¥300-600',
    cost_low_en: '$20-60',
    cost_mid_en: '$60-120',
    cost_high_en: '$120-240',
  },
  {
    code: 'SKIN-001',
    name_zh: '皮肤刮片',
    name_en: 'Skin Scraping',
    category_zh: '化验',
    category_en: 'Lab Tests',
    cost_low_zh: '¥50-100',
    cost_mid_zh: '¥100-200',
    cost_high_zh: '¥200-300',
    cost_low_en: '$20-40',
    cost_mid_en: '$40-80',
    cost_high_en: '$80-120',
  },
  {
    code: 'FECAL-001',
    name_zh: '粪便检查',
    name_en: 'Fecal Examination',
    category_zh: '化验',
    category_en: 'Lab Tests',
    cost_low_zh: '¥50-100',
    cost_mid_zh: '¥100-150',
    cost_high_zh: '¥150-250',
    cost_low_en: '$20-40',
    cost_mid_en: '$40-60',
    cost_high_en: '$60-100',
  },
  {
    code: 'URINE-001',
    name_zh: '尿检',
    name_en: 'Urinalysis',
    category_zh: '化验',
    category_en: 'Lab Tests',
    cost_low_zh: '¥50-100',
    cost_mid_zh: '¥100-200',
    cost_high_zh: '¥200-300',
    cost_low_en: '$20-40',
    cost_mid_en: '$40-80',
    cost_high_en: '$80-120',
  },
];

export function TreatmentCodeLookup() {
  const { language } = useLanguage();
  const [search, setSearch] = useState('');

  const isZh = language === 'zh';

  const filteredCodes = treatmentCodes.filter((code) => {
    const searchLower = search.toLowerCase();
    return (
      code.code.toLowerCase().includes(searchLower) ||
      code.name_zh.includes(search) ||
      code.name_en.toLowerCase().includes(searchLower) ||
      code.category_zh.includes(search) ||
      code.category_en.toLowerCase().includes(searchLower)
    );
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      '检查': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      'Examination': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      '化验': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      'Lab Tests': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      '影像': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
      'Imaging': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
      '预防': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      'Prevention': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      '牙科': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
      'Dental': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
      '手术': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      'Surgery': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      '住院': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
      'Hospitalization': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
      '治疗': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
      'Treatment': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
      '用药': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
      'Medication': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
    };
    return colors[category] || 'bg-muted text-muted-foreground';
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={isZh ? '搜索代码或名称...' : 'Search code or name...'}
          className="pl-10 pr-10"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <ScrollArea className="h-[60vh]">
        <div className="space-y-3 pr-4">
          {filteredCodes.map((code) => (
            <div
              key={code.code}
              className="card-elevated p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-semibold text-primary">
                      {code.code}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(isZh ? code.category_zh : code.category_en)}`}>
                      {isZh ? code.category_zh : code.category_en}
                    </span>
                  </div>
                  <p className="font-medium text-foreground mt-1">
                    {isZh ? code.name_zh : code.name_en}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2 text-center">
                  <div className="text-muted-foreground mb-0.5">
                    {isZh ? '低档' : 'Low'}
                  </div>
                  <div className="font-semibold text-green-700 dark:text-green-400">
                    {isZh ? code.cost_low_zh : code.cost_low_en}
                  </div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-2 text-center">
                  <div className="text-muted-foreground mb-0.5">
                    {isZh ? '中档' : 'Mid'}
                  </div>
                  <div className="font-semibold text-yellow-700 dark:text-yellow-400">
                    {isZh ? code.cost_mid_zh : code.cost_mid_en}
                  </div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2 text-center">
                  <div className="text-muted-foreground mb-0.5">
                    {isZh ? '高档' : 'High'}
                  </div>
                  <div className="font-semibold text-red-700 dark:text-red-400">
                    {isZh ? code.cost_high_zh : code.cost_high_en}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredCodes.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {isZh ? '未找到匹配的治疗项目' : 'No matching treatments found'}
            </div>
          )}
        </div>
      </ScrollArea>

      <p className="text-xs text-muted-foreground text-center">
        {isZh 
          ? '* 费用仅供参考，实际价格因地区和医院而异' 
          : '* Costs are estimates only. Actual prices vary by location and clinic.'}
      </p>
    </div>
  );
}