import React from 'react';
import { Lock, Plus, ShieldCheck, Eye, KeyRound, Sparkles } from 'lucide-react';
import logoImg from '../assets/images/chinthala_family_logo_1790492255820.jpg';

interface HeaderProps {
  isAuthenticated: boolean;
  activeView: 'gallery' | 'portal';
  onNavigate: (view: 'gallery' | 'portal') => void;
  onOpenPasswordModal: () => void;
  onOpenAddPhotoModal: () => void;
  onLockPortal: () => void;
  onReplayEntrance?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isAuthenticated,
  activeView,
  onNavigate,
  onOpenPasswordModal,
  onOpenAddPhotoModal,
  onLockPortal,
  onReplayEntrance,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0E0D0C]/90 backdrop-blur-md border-b border-white/10 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo & Wordmark (Matching uploaded emblem design) */}
        <button
          onClick={() => onNavigate('gallery')}
          className="text-left group cursor-pointer focus:outline-none flex items-center gap-3.5"
        >
          <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#D4A373]/80 shadow-md shrink-0 bg-black group-hover:scale-105 transition-transform">
            <img
              src={logoImg}
              alt="Chinthala's Family Memories Logo"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col">
            <span className="font-serif-display text-xl sm:text-2xl font-bold tracking-wider text-white uppercase group-hover:text-[#D4A373] transition-colors leading-none">
              CHINTHALA'S
            </span>
            <span className="text-[10px] tracking-[0.25em] text-[#C89B67] uppercase font-medium mt-1">
              Family Memories
            </span>
          </div>
        </button>

        {/* Right Action Area */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Replay Royal Heirloom Entrance Button */}
          {onReplayEntrance && (
            <button
              onClick={onReplayEntrance}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#E5B581] hover:text-[#FFF5EA] bg-[#2E0F14]/75 hover:bg-[#4A161E] border border-[#D4AF37]/50 rounded-xl transition-all shadow-xs cursor-pointer whitespace-nowrap"
              title="Replay Royal Heirloom Chest Entrance Effect"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="hidden sm:inline">Replay Entrance</span>
            </button>
          )}

          {isAuthenticated ? (
            <>
              {activeView === 'portal' ? (
                <button
                  onClick={() => onNavigate('gallery')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-neutral-300 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl transition-colors cursor-pointer"
                  title="View Public Gallery"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Public View</span>
                </button>
              ) : (
                <button
                  onClick={() => onNavigate('portal')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-white/10 hover:bg-white/20 border border-[#D4A373]/40 rounded-xl transition-colors cursor-pointer"
                  title="Switch to Family Portal"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D4A373]" />
                  <span>Portal</span>
                </button>
              )}

              <button
                onClick={onOpenAddPhotoModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#0E0D0C] bg-[#D4A373] hover:bg-[#E5B581] rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Add Photos</span>
              </button>

              <button
                onClick={onLockPortal}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-300 hover:text-red-200 bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                title="Lock Family Portal"
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Lock Portal</span>
              </button>
            </>
          ) : (
            <button
              onClick={onOpenPasswordModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#0E0D0C] bg-[#D4A373] hover:bg-[#E5B581] rounded-xl shadow-lg transition-all cursor-pointer whitespace-nowrap"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Family Login (SRBS)</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
