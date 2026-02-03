import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';

interface PhoneInputProps {
  value: string;
  onChange: (fullPhone: string) => void;
  disabled?: boolean;
}

const COUNTRY_CODES = [
  { code: '+86', country: 'CN', label: '🇨🇳 +86', placeholder: '13812345678' },
  { code: '+1', country: 'US', label: '🇺🇸 +1', placeholder: '2025551234' },
];

export function PhoneInput({ value, onChange, disabled }: PhoneInputProps) {
  const { language } = useLanguage();
  const [countryCode, setCountryCode] = useState('+86');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleCountryChange = (code: string) => {
    setCountryCode(code);
    if (phoneNumber) {
      onChange(`${code}${phoneNumber}`);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits
    const cleaned = e.target.value.replace(/\D/g, '');
    setPhoneNumber(cleaned);
    if (cleaned) {
      onChange(`${countryCode}${cleaned}`);
    } else {
      onChange('');
    }
  };

  const selectedCountry = COUNTRY_CODES.find(c => c.code === countryCode);

  return (
    <div className="flex gap-2">
      <Select value={countryCode} onValueChange={handleCountryChange} disabled={disabled}>
        <SelectTrigger className="w-28 shrink-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {COUNTRY_CODES.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              {country.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="tel"
        inputMode="numeric"
        pattern="[0-9]*"
        value={phoneNumber}
        onChange={handlePhoneChange}
        disabled={disabled}
        className="input-mobile flex-1"
        placeholder={selectedCountry?.placeholder || (language === 'zh' ? '输入手机号' : 'Phone number')}
      />
    </div>
  );
}
