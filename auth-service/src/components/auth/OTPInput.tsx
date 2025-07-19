
'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
}

export default function OTPInput({ 
  length = 6, 
  value, 
  onChange, 
  disabled = false,
  error = false 
}: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Initialize refs array
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  useEffect(() => {
    // Update local state when value prop changes
    if (value !== otp.join('')) {
      const newOtp = value.split('').concat(new Array(length).fill('')).slice(0, length);
      setOtp(newOtp);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, length]);

  const handleChange = (index: number, digit: string) => {
    // Only allow digits
    if (!/^\d*$/.test(digit)) return;

    const newOtp = [...otp];
    newOtp[index] = digit.slice(-1); // Take only the last digit
    setOtp(newOtp);
    onChange(newOtp.join(''));

    // Auto-focus next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Focus previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain');
    const digits = pastedData.replace(/\D/g, '').slice(0, length);
    
    if (digits.length > 0) {
      const newOtp = digits.split('').concat(new Array(length).fill('')).slice(0, length);
      setOtp(newOtp);
      onChange(newOtp.join(''));
      
      // Focus the next empty input or the last input
      const nextEmptyIndex = newOtp.findIndex(digit => !digit);
      const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : length - 1;
      inputRefs.current[focusIndex]?.focus();
    }
  };

  return (
    <div className="flex justify-center space-x-2">
      {otp.map((digit, index) => (
        <Input
          key={index}
          ref={el => inputRefs.current[index] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={e => handleChange(index, e.target.value)}
          onKeyDown={e => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={cn(`w-12 h-12 text-center text-lg font-semibold`,
            error ? 'border-destructive' : 'border-input',
            disabled ? 'bg-muted' : ''
          )}
        />
      ))}
    </div>
  );
}
