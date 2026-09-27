import React from 'react';
import { Lock, Heart, Shield, Globe, Camera } from 'lucide-react';
import logoImg from '../assets/images/chinthala_family_logo_1790492255820.jpg';

interface FooterProps {
  isAuthenticated: boolean;
  onOpenPasswordModal: () => void;
  onLockPortal: () => void;
  onResetDefaults?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  isAuthenticated,
  onOpenPasswordModal,
  onLockPortal,
  onResetDefaults,
}) => {
  return (
    <footer className="bg-[#0A0908] text-neutral-400 pt-16 pb-10 px-4 sm:px-6 lg:px-8 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Col 1: Brand Logo & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#D4A373]/80 bg-black shrink-0">
                <img
                  src={logoImg}
                  alt="Chinthala's Family Memories"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="font-serif-display text-xl font-bold tracking-wider text-white uppercase block">
                  CHINTHALA'S
                </span>
                <span className="text-[10px] tracking-[0.25em] text-[#C89B67] uppercase font-semibold">
                  Family Memories
                </span>
              </div>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
              A private digital heirloom dedicated to preserving our family’s shared heritage, milestones, and unrepeatable laughter for future generations.
            </p>

            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-[#D4A373]">
                <Globe className="w-3 h-3" />
                <span>Shared Worldwide • Securely Held</span>
              </span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-white font-semibold mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="#gallery-grid" className="hover:text-white transition-colors">
                  Public Gallery
                </a>
              </li>
              <li>
                <a href="#albums-section" className="hover:text-white transition-colors">
                  Curated Chapters
                </a>
              </li>
              <li>
                {isAuthenticated ? (
                  <button
                    onClick={onLockPortal}
                    className="text-red-400 hover:text-red-300 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Lock className="w-3 h-3" />
                    <span>Lock Portal</span>
                  </button>
                ) : (
                  <button
                    onClick={onOpenPasswordModal}
                    className="text-[#D4A373] hover:underline transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Lock className="w-3 h-3" />
                    <span>Family Login (SRBS)</span>
                  </button>
                )}
              </li>
              {onResetDefaults && (
                <li>
                  <button
                    onClick={onResetDefaults}
                    className="text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
                  >
                    Restore Defaults
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Col 3: Chapters & Albums */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-white font-semibold mb-4">
              Cloud Archive
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li>Firebase Firestore Storage</li>
              <li>Permanent Global Access</li>
              <li>Full-Resolution Photographs</li>
              <li>Protected by SRBS Passcode</li>
              <li>Heirloom Family Preservation</li>
            </ul>
          </div>

          {/* Col 4: Archive Guarantee */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-white font-semibold mb-4">
              Vault Guarantee
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5 text-neutral-300">
                <Shield className="w-3.5 h-3.5 text-[#D4A373]" />
                <span>SRBS Passcode Lock</span>
              </li>
              <li className="flex items-center gap-1.5 text-neutral-300">
                <Globe className="w-3.5 h-3.5 text-[#D4A373]" />
                <span>Permanent Cloud Storage</span>
              </li>
              <li className="flex items-center gap-1.5 text-neutral-300">
                <Camera className="w-3.5 h-3.5 text-[#D4A373]" />
                <span>Full-Resolution Archive</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div>
            © 2026 Chintala's Family Memories. Preserved in perpetuity.
          </div>

          <div className="flex items-center gap-1 text-neutral-400">
            <span>Preserved with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-current" />
            <span>for the Chintala family</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
