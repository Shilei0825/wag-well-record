import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/PageHeader';
import { PhoneInput } from '@/components/PhoneInput';
import { toast } from 'sonner';
import { Mail, Phone, Wand2, Lock, FlaskConical } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const { signIn, signInWithMagicLink, signInWithPhone, verifyOtp, signInBeta } = useAuth();
  
  // Email login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Magic link state
  const [magicEmail, setMagicEmail] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  
  // Phone login state
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  // Beta testing state
  const [betaUserId, setBetaUserId] = useState('');
  const [betaPassword, setBetaPassword] = useState('');
  
  const [loading, setLoading] = useState(false);

  const handleBetaLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signInBeta(betaUserId, betaPassword);
    
    if (error) {
      toast.error(language === 'zh' ? '用户ID或密码错误' : 'Invalid User ID or Password');
      setLoading(false);
      return;
    }

    toast.success(language === 'zh' ? 'Beta 测试登录成功！' : 'Beta test login successful!');
    navigate('/dashboard');
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);
    
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    navigate('/dashboard');
  };

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!magicEmail) {
      toast.error(language === 'zh' ? '请输入邮箱地址' : 'Please enter your email');
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
        ? '登录链接已发送到您的邮箱' 
        : 'Magic link sent to your email'
    );
  };

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      toast.error(language === 'zh' ? '请输入有效的手机号' : 'Please enter a valid phone number');
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

      <PageHeader title={t('auth.welcome')} showBack />

      <Tabs defaultValue="beta" className="mt-8">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="beta" className="flex items-center gap-1 text-xs sm:text-sm">
            <FlaskConical className="h-4 w-4" />
            <span className="hidden sm:inline">Beta</span>
            <span className="sm:hidden">Beta</span>
          </TabsTrigger>
          <TabsTrigger value="magic" className="flex items-center gap-1 text-xs sm:text-sm">
            <Wand2 className="h-4 w-4" />
            <span className="hidden sm:inline">{language === 'zh' ? '快捷登录' : 'Magic Link'}</span>
            <span className="sm:hidden">{language === 'zh' ? '快捷' : 'Magic'}</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-1 text-xs sm:text-sm">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">{language === 'zh' ? '密码登录' : 'Password'}</span>
            <span className="sm:hidden">{language === 'zh' ? '密码' : 'Pass'}</span>
          </TabsTrigger>
          <TabsTrigger value="phone" className="flex items-center gap-1 text-xs sm:text-sm">
            <Phone className="h-4 w-4" />
            <span className="hidden sm:inline">{language === 'zh' ? '手机登录' : 'Phone'}</span>
            <span className="sm:hidden">{language === 'zh' ? '手机' : 'SMS'}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="beta">
          <form onSubmit={handleBetaLogin} className="space-y-6">
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 text-primary mb-2">
                <FlaskConical className="h-4 w-4" />
                <span className="font-medium text-sm">
                  {language === 'zh' ? 'Beta 测试模式' : 'Beta Testing Mode'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {language === 'zh' 
                  ? '此登录方式仅供内部测试使用'
                  : 'This login method is for internal testing only'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="beta-user-id">
                {language === 'zh' ? '用户ID' : 'User ID'}
              </Label>
              <Input
                id="beta-user-id"
                type="text"
                value={betaUserId}
                onChange={(e) => setBetaUserId(e.target.value)}
                required
                className="input-mobile"
                placeholder={language === 'zh' ? '输入用户ID' : 'Enter User ID'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="beta-password">{t('auth.password')}</Label>
              <Input
                id="beta-password"
                type="password"
                value={betaPassword}
                onChange={(e) => setBetaPassword(e.target.value)}
                required
                className="input-mobile"
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full btn-mobile"
            >
              {loading ? t('common.loading') : (language === 'zh' ? 'Beta 登录' : 'Beta Login')}
            </Button>
          </form>
        </TabsContent>

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
                    ? `我们已向 ${magicEmail} 发送了登录链接` 
                    : `We sent a login link to ${magicEmail}`}
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
                    ? '我们将发送一个登录链接到您的邮箱，点击即可登录，无需密码。'
                    : "We'll send a login link to your email. Click to sign in - no password needed."}
                </p>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-mobile"
                >
                  {loading 
                    ? t('common.loading') 
                    : (language === 'zh' ? '发送登录链接' : 'Send Magic Link')
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
                className="input-mobile"
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full btn-mobile"
            >
              {loading ? t('common.loading') : t('auth.login')}
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
                <Label htmlFor="otp">{language === 'zh' ? '验证码' : 'Verification Code'}</Label>
                <Input
                  id="otp"
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

            <Button
              type="submit"
              disabled={loading}
              className="w-full btn-mobile"
            >
              {loading 
                ? t('common.loading') 
                : otpSent 
                  ? t('auth.login')
                  : (language === 'zh' ? '发送验证码' : 'Send Code')
              }
            </Button>
          </form>
        </TabsContent>
      </Tabs>

      <p className="text-center text-muted-foreground mt-6">
        {t('auth.noAccount')}{' '}
        <Link to="/register" className="text-primary font-medium">
          {t('auth.register')}
        </Link>
      </p>
    </div>
  );
}
