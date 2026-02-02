import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/PageHeader';
import { toast } from 'sonner';

export default function Register() {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const { signUp } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error(language === 'zh' ? '密码不匹配' : 'Passwords do not match');
      return;
    }

    if (!termsAccepted) {
      toast.error(language === 'zh' ? '请同意服务条款' : 'Please accept the terms');
      return;
    }

    setLoading(true);

    const { error } = await signUp(email, password);
    
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success(
      language === 'zh' 
        ? '注册成功！请查收邮件验证您的账号' 
        : 'Registration successful! Please check your email to verify your account'
    );
    navigate('/login');
  };

  return (
    <div className="page-container">
      {/* Language Toggle */}
      <div className="absolute top-4 right-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
          className="text-sm"
        >
          {language === 'zh' ? 'EN' : '中文'}
        </Button>
      </div>

      <PageHeader title={t('auth.createAccount')} showBack />

      <form onSubmit={handleSubmit} className="space-y-6 mt-8">
        <div className="space-y-2">
          <Label htmlFor="email">{t('auth.email')}</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input-mobile"
            placeholder="your@email.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t('auth.password')}</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="input-mobile"
            placeholder="••••••••"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            className="input-mobile"
            placeholder="••••••••"
          />
        </div>

        <div className="flex items-center gap-3">
          <Checkbox
            id="terms"
            checked={termsAccepted}
            onCheckedChange={(checked) => setTermsAccepted(checked === true)}
          />
          <Label htmlFor="terms" className="text-sm text-muted-foreground">
            {t('auth.termsAgree')}
          </Label>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full btn-mobile"
        >
          {loading ? t('common.loading') : t('auth.register')}
        </Button>

        <p className="text-center text-muted-foreground">
          {t('auth.hasAccount')}{' '}
          <Link to="/login" className="text-primary font-medium">
            {t('auth.login')}
          </Link>
        </p>
      </form>
    </div>
  );
}
