import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/PageHeader';
import { PhoneInput } from '@/components/PhoneInput';
import { toast } from 'sonner';
import { Mail, Phone } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const { signUp, signInWithPhone, verifyOtp } = useAuth();
  
  // Email registration state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Phone registration state
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
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

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      toast.error(language === 'zh' ? '请输入有效的手机号' : 'Please enter a valid phone number');
      return;
    }

    if (!termsAccepted) {
      toast.error(language === 'zh' ? '请同意服务条款' : 'Please accept the terms');
      return;
    }

    setLoading(true);
    const { error } = await signInWithPhone(phone);
    
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    setOtpSent(true);
    setLoading(false);
    toast.success(language === 'zh' ? '验证码已发送' : 'Verification code sent');
    
    // Start countdown
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otpSent) {
      await handleSendOtp();
      return;
    }

    if (!otpCode || otpCode.length !== 6) {
      toast.error(language === 'zh' ? '请输入6位验证码' : 'Please enter 6-digit code');
      return;
    }

    setLoading(true);
    const { error } = await verifyOtp(phone, otpCode);
    
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success(language === 'zh' ? '注册成功！' : 'Registration successful!');
    navigate('/dashboard');
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

      <Tabs defaultValue="email" className="mt-8">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            {language === 'zh' ? '邮箱注册' : 'Email'}
          </TabsTrigger>
          <TabsTrigger value="phone" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            {language === 'zh' ? '手机注册' : 'Phone'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="email">
          <form onSubmit={handleEmailSubmit} className="space-y-6">
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
                id="terms-email"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked === true)}
              />
              <Label htmlFor="terms-email" className="text-sm text-muted-foreground">
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
          </form>
        </TabsContent>

        <TabsContent value="phone">
          <form onSubmit={handlePhoneSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>{language === 'zh' ? '手机号' : 'Phone Number'}</Label>
              <PhoneInput
                value={phone}
                onChange={setPhone}
                disabled={otpSent && loading}
              />
            </div>

            {otpSent && (
              <div className="space-y-2">
                <Label htmlFor="otp-register">{language === 'zh' ? '验证码' : 'Verification Code'}</Label>
                <Input
                  id="otp-register"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  required
                  className="input-mobile text-center text-lg tracking-widest"
                  placeholder="000000"
                />
                {countdown > 0 ? (
                  <p className="text-sm text-muted-foreground text-center">
                    {language === 'zh' ? `${countdown}秒后可重新发送` : `Resend in ${countdown}s`}
                  </p>
                ) : (
                  <Button
                    type="button"
                    variant="link"
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="w-full"
                  >
                    {language === 'zh' ? '重新发送验证码' : 'Resend Code'}
                  </Button>
                )}
              </div>
            )}

            <div className="flex items-center gap-3">
              <Checkbox
                id="terms-phone"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked === true)}
              />
              <Label htmlFor="terms-phone" className="text-sm text-muted-foreground">
                {t('auth.termsAgree')}
              </Label>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full btn-mobile"
            >
              {loading 
                ? t('common.loading') 
                : otpSent 
                  ? t('auth.register')
                  : (language === 'zh' ? '发送验证码' : 'Send Code')
              }
            </Button>
          </form>
        </TabsContent>
      </Tabs>

      <p className="text-center text-muted-foreground mt-6">
        {t('auth.hasAccount')}{' '}
        <Link to="/login" className="text-primary font-medium">
          {t('auth.login')}
        </Link>
      </p>
    </div>
  );
}
