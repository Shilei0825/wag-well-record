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
import { Mail, Phone, Wand2, Lock } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const { signUp, signInWithMagicLink, signInWithPhone, verifyOtp } = useAuth();
  
  // Email registration state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Magic link state
  const [magicEmail, setMagicEmail] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  
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

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!magicEmail) {
      toast.error(language === 'zh' ? '请输入邮箱地址' : 'Please enter your email');
      return;
    }

    if (!termsAccepted) {
      toast.error(language === 'zh' ? '请同意服务条款' : 'Please accept the terms');
      return;
    }

    setLoading(true);
    const { error } = await signInWithMagicLink(magicEmail);
    
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    setMagicLinkSent(true);
    setLoading(false);
    toast.success(
      language === 'zh' 
        ? '注册链接已发送到您的邮箱' 
        : 'Sign up link sent to your email'
    );
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

      <Tabs defaultValue="magic" className="mt-8">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="magic" className="flex items-center gap-1 text-xs sm:text-sm">
            <Wand2 className="h-4 w-4" />
            <span className="hidden sm:inline">{language === 'zh' ? '快捷注册' : 'Magic Link'}</span>
            <span className="sm:hidden">{language === 'zh' ? '快捷' : 'Magic'}</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-1 text-xs sm:text-sm">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">{language === 'zh' ? '邮箱注册' : 'Password'}</span>
            <span className="sm:hidden">{language === 'zh' ? '邮箱' : 'Email'}</span>
          </TabsTrigger>
          <TabsTrigger value="phone" className="flex items-center gap-1 text-xs sm:text-sm">
            <Phone className="h-4 w-4" />
            <span className="hidden sm:inline">{language === 'zh' ? '手机注册' : 'Phone'}</span>
            <span className="sm:hidden">{language === 'zh' ? '手机' : 'SMS'}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="magic">
          <form onSubmit={handleMagicLinkSubmit} className="space-y-6">
            {magicLinkSent ? (
              <div className="text-center space-y-4 py-8">
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">
                  {language === 'zh' ? '查看您的邮箱' : 'Check your email'}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {language === 'zh' 
                    ? `我们已向 ${magicEmail} 发送了注册链接` 
                    : `We sent a sign up link to ${magicEmail}`}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setMagicLinkSent(false)}
                  className="mt-4"
                >
                  {language === 'zh' ? '使用其他邮箱' : 'Use a different email'}
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="magic-email">{t('auth.email')}</Label>
                  <Input
                    id="magic-email"
                    type="email"
                    value={magicEmail}
                    onChange={(e) => setMagicEmail(e.target.value)}
                    required
                    className="input-mobile"
                    placeholder="your@email.com"
                  />
                </div>

                <p className="text-sm text-muted-foreground">
                  {language === 'zh' 
                    ? '我们将发送一个注册链接到您的邮箱，点击即可完成注册，无需设置密码。'
                    : "We'll send a sign up link to your email. Click to register - no password needed."}
                </p>

                <div className="flex items-center gap-3">
                  <Checkbox
                    id="terms-magic"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                  />
                  <Label htmlFor="terms-magic" className="text-sm text-muted-foreground">
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
                    : (language === 'zh' ? '发送注册链接' : 'Send Magic Link')
                  }
                </Button>
              </>
            )}
          </form>
        </TabsContent>

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
