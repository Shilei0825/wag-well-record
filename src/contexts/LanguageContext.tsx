import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'zh' | 'en';

interface Translations {
  [key: string]: {
    zh: string;
    en: string;
  };
}

const translations: Translations = {
  // App
  'app.name': { zh: '宠物健康', en: 'PetCare' },
  'app.tagline': { zh: '记录宠物健康与花费，未来一键保障', en: 'Track pet health & expenses, secure their future' },
  
  // Navigation
  'nav.home': { zh: '首页', en: 'Home' },
  'nav.pets': { zh: '宠物', en: 'Pets' },
  'nav.insights': { zh: '统计', en: 'Insights' },
  'nav.settings': { zh: '设置', en: 'Settings' },
  'nav.aivet': { zh: '宠博士', en: 'AI Vet' },
  
  // Auth
  'auth.login': { zh: '登录', en: 'Login' },
  'auth.register': { zh: '注册', en: 'Register' },
  'auth.logout': { zh: '退出登录', en: 'Logout' },
  'auth.email': { zh: '邮箱', en: 'Email' },
  'auth.password': { zh: '密码', en: 'Password' },
  'auth.confirmPassword': { zh: '确认密码', en: 'Confirm Password' },
  'auth.termsAgree': { zh: '我同意服务条款和隐私政策', en: 'I agree to the Terms of Service and Privacy Policy' },
  'auth.noAccount': { zh: '没有账号？', en: "Don't have an account?" },
  'auth.hasAccount': { zh: '已有账号？', en: 'Already have an account?' },
  'auth.welcome': { zh: '欢迎回来', en: 'Welcome Back' },
  'auth.createAccount': { zh: '创建账号', en: 'Create Account' },
  
  // Pet
  'pet.add': { zh: '添加宠物', en: 'Add Pet' },
  'pet.edit': { zh: '编辑宠物', en: 'Edit Pet' },
  'pet.name': { zh: '宠物名字', en: 'Pet Name' },
  'pet.species': { zh: '类型', en: 'Species' },
  'pet.dog': { zh: '狗', en: 'Dog' },
  'pet.cat': { zh: '猫', en: 'Cat' },
  'pet.breed': { zh: '品种', en: 'Breed' },
  'pet.sex': { zh: '性别', en: 'Sex' },
  'pet.male': { zh: '公', en: 'Male' },
  'pet.female': { zh: '母', en: 'Female' },
  'pet.birthdate': { zh: '出生日期', en: 'Birthdate' },
  'pet.weight': { zh: '体重 (kg)', en: 'Weight (kg)' },
  'pet.notes': { zh: '备注', en: 'Notes' },
  'pet.myPets': { zh: '我的宠物', en: 'My Pets' },
  'pet.profile': { zh: '宠物档案', en: 'Pet Profile' },
  'pet.noPets': { zh: '还没有添加宠物', en: 'No pets added yet' },
  'pet.addFirst': { zh: '添加您的第一只宠物', en: 'Add your first pet' },
  
  // Health
  'health.records': { zh: '健康记录', en: 'Health Records' },
  'health.add': { zh: '添加记录', en: 'Add Record' },
  'health.vaccine': { zh: '疫苗', en: 'Vaccine' },
  'health.deworming': { zh: '驱虫', en: 'Deworming' },
  'health.medication': { zh: '用药', en: 'Medication' },
  'health.type': { zh: '类型', en: 'Type' },
  'health.name': { zh: '名称', en: 'Name' },
  'health.date': { zh: '日期', en: 'Date' },
  'health.nextDue': { zh: '下次提醒', en: 'Next Due' },
  'health.noRecords': { zh: '暂无健康记录', en: 'No health records' },
  
  // Visit
  'visit.visits': { zh: '就诊记录', en: 'Vet Visits' },
  'visit.add': { zh: '添加就诊', en: 'Add Visit' },
  'visit.date': { zh: '就诊日期', en: 'Visit Date' },
  'visit.clinic': { zh: '医院名称', en: 'Clinic Name' },
  'visit.reason': { zh: '就诊原因', en: 'Reason' },
  'visit.diagnosis': { zh: '诊断结果', en: 'Diagnosis' },
  'visit.treatment': { zh: '治疗方案', en: 'Treatment' },
  'visit.cost': { zh: '费用', en: 'Cost' },
  'visit.noVisits': { zh: '暂无就诊记录', en: 'No visit records' },
  
  // Expense
  'expense.expenses': { zh: '花费记录', en: 'Expenses' },
  'expense.add': { zh: '添加花费', en: 'Add Expense' },
  'expense.category': { zh: '类别', en: 'Category' },
  'expense.medical': { zh: '医疗', en: 'Medical' },
  'expense.food': { zh: '食品', en: 'Food' },
  'expense.supplies': { zh: '用品', en: 'Supplies' },
  'expense.other': { zh: '其他', en: 'Other' },
  'expense.amount': { zh: '金额', en: 'Amount' },
  'expense.merchant': { zh: '商家', en: 'Merchant' },
  'expense.noExpenses': { zh: '暂无花费记录', en: 'No expense records' },
  'expense.thisMonth': { zh: '本月花费', en: 'This Month' },
  'expense.thisYear': { zh: '今年花费', en: 'This Year' },
  
  // Reminder
  'reminder.reminders': { zh: '提醒', en: 'Reminders' },
  'reminder.add': { zh: '添加提醒', en: 'Add Reminder' },
  'reminder.title': { zh: '提醒标题', en: 'Title' },
  'reminder.dueDate': { zh: '提醒日期', en: 'Due Date' },
  'reminder.markDone': { zh: '完成', en: 'Done' },
  'reminder.upcoming': { zh: '即将到来', en: 'Upcoming' },
  'reminder.noReminders': { zh: '暂无提醒', en: 'No reminders' },
  
  // Insights
  'insights.title': { zh: '数据统计', en: 'Insights' },
  'insights.totalExpenses': { zh: '总花费', en: 'Total Expenses' },
  'insights.byCategory': { zh: '按类别', en: 'By Category' },
  'insights.recentVisits': { zh: '近期就诊', en: 'Recent Visits' },
  
  // Settings
  'settings.title': { zh: '设置', en: 'Settings' },
  'settings.account': { zh: '账号信息', en: 'Account' },
  'settings.language': { zh: '语言', en: 'Language' },
  'settings.feedback': { zh: '意见反馈', en: 'Feedback' },
  'settings.privacy': { zh: '隐私政策', en: 'Privacy Policy' },
  'settings.terms': { zh: '服务条款', en: 'Terms of Service' },
  
  // Membership
  'membership.title': { zh: '会员服务', en: 'Membership' },
  'membership.free': { zh: '免费版', en: 'Free' },
  'membership.premium': { zh: '高级版', en: 'Premium' },
  'membership.notify': { zh: '上线通知', en: 'Notify Me' },
  'membership.comingSoon': { zh: '即将推出', en: 'Coming Soon' },
  
  // AI Vet
  'aivet.title': { zh: '宠博士', en: 'AI Vet' },
  'aivet.selectPet': { zh: '选择宠物', en: 'Select pet' },
  'aivet.welcome': { zh: '你好，我是宠博士！', en: "Hi, I'm Pet Doctor!" },
  'aivet.welcomeDesc': { zh: '描述您宠物的症状，我会帮您评估紧急程度并准备就诊建议。请注意：我不是兽医，无法做出诊断。', en: "Describe your pet's symptoms and I'll help assess urgency and prepare vet visit suggestions. Note: I'm not a veterinarian and cannot diagnose." },
  'aivet.inputPlaceholder': { zh: '描述宠物的症状...', en: "Describe your pet's symptoms..." },
  'aivet.disclaimer': { zh: '仅供参考，不构成医疗建议', en: 'For reference only, not medical advice' },
  
  // Common
  'common.save': { zh: '保存', en: 'Save' },
  'common.cancel': { zh: '取消', en: 'Cancel' },
  'common.delete': { zh: '删除', en: 'Delete' },
  'common.edit': { zh: '编辑', en: 'Edit' },
  'common.back': { zh: '返回', en: 'Back' },
  'common.loading': { zh: '加载中...', en: 'Loading...' },
  'common.error': { zh: '出错了', en: 'Error' },
  'common.success': { zh: '成功', en: 'Success' },
  'common.optional': { zh: '选填', en: 'Optional' },
  'common.required': { zh: '必填', en: 'Required' },
  'common.today': { zh: '今天', en: 'Today' },
  'common.yuan': { zh: '¥', en: '¥' },
  'common.lastVisit': { zh: '最近就诊', en: 'Last Visit' },
  'common.quickActions': { zh: '快捷操作', en: 'Quick Actions' },
  'common.recentActivity': { zh: '最近动态', en: 'Recent Activity' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('zh');

  useEffect(() => {
    const saved = localStorage.getItem('language') as Language;
    if (saved && (saved === 'zh' || saved === 'en')) {
      setLanguage(saved);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Missing translation: ${key}`);
      return key;
    }
    return translation[language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
