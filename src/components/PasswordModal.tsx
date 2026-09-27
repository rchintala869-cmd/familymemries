import React, { useState, useEffect, useRef } from 'react';
import { Lock, Eye, EyeOff, X, KeyRound, ShieldAlert } from 'lucide-react';
import { REQUIRED_PASSWORD } from '../services/storage.ts';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  targetPhotoTitle?: string;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  targetPhotoTitle,
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError(null);
      setShowPassword(false);
      // Autofocus input
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Exact verification requirement: Check if the entered password matches SRBS (case-sensitive).
    if (password === REQUIRED_PASSWORD) {
      // Seamlessly redirect / open Family Portal
      setTimeout(() => {
        setIsSubmitting(false);
        onSuccess();
      }, 250);
    } else {
      setIsSubmitting(false);
      // Exact requirement: "Incorrect password. Access denied."
      setError('Incorrect password. Access denied.');
      inputRef.current?.select();
    }
  };

  const handleFillDemoPassword = () => {
    setPassword(REQUIRED_PASSWORD);
    setError(null);
    inputRef.current?.focus();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="password-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-[#FAF8F5] border border-[#E0D7C9] rounded-2xl shadow-2xl p-6 sm:p-8 text-[#2B2620] overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[#7F7466] hover:text-[#2B2620] hover:bg-[#EFE9DF] rounded-lg transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-[#EFE4D6] text-[#8C6D46] flex items-center justify-center mb-4 shadow-xs">
            <Lock className="w-6 h-6" />
          </div>

          <h2
            id="password-modal-title"
            className="font-serif-display text-2xl sm:text-3xl font-semibold tracking-tight text-[#2B2620]"
          >
            Family Portal Lock
          </h2>

          <p className="mt-2 text-sm text-[#6A6054] leading-relaxed max-w-sm">
            {targetPhotoTitle ? (
              <span>
                To view <strong className="text-[#2B2620]">"{targetPhotoTitle}"</strong> in high resolution and access private heirloom stories, please verify your family password.
              </span>
            ) : (
              <span>
                Enter the secret family passcode to access the private Family Portal, view high-res archives, and upload new memories.
              </span>
            )}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="family-portal-password"
              className="block text-xs font-semibold text-[#50473D] uppercase tracking-wider mb-1.5"
            >
              Passcode
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                id="family-portal-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Enter password (e.g. SRBS)"
                autoComplete="current-password"
                className={`w-full px-4 py-3 pr-11 bg-white border rounded-xl text-sm font-medium text-[#2B2620] placeholder-[#A69C8E] focus:outline-none focus:ring-2 transition-all ${
                  error
                    ? 'border-red-400 focus:ring-red-200'
                    : 'border-[#D9CFBF] focus:border-[#8C6D46] focus:ring-[#8C6D46]/20'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#8C7E6D] hover:text-[#2B2620] transition-colors cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Inline Error Message */}
            {error && (
              <div 
                role="alert"
                className="mt-2 flex items-center gap-1.5 text-xs text-red-600 font-medium animate-in fade-in"
              >
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSubmitting || !password.trim()}
            className="w-full py-3 px-4 bg-[#2B2620] hover:bg-[#403930] disabled:bg-[#8A8175] text-white text-sm font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            <KeyRound className="w-4 h-4" />
            <span>{isSubmitting ? 'Verifying...' : 'Unlock Family Portal'}</span>
          </button>
        </form>

        {/* Quick Helper / Demo access info */}
        <div className="mt-5 pt-4 border-t border-[#E8DFD3] flex items-center justify-between text-xs text-[#7F7466]">
          <span>Family Member Passcode: <strong className="font-mono text-[#2B2620]">SRBS</strong></span>
          <button
            type="button"
            onClick={handleFillDemoPassword}
            className="text-[#8C6D46] hover:text-[#5E482C] font-medium underline cursor-pointer"
          >
            Auto-fill
          </button>
        </div>
      </div>
    </div>
  );
};
