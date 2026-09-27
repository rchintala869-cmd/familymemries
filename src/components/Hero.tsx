import React from 'react';
import {
  Lock,
  Camera,
  HeartHandshake,
  Clock,
  ShieldCheck,
  ArrowRight,
  Plus,
} from 'lucide-react';
import heroBg from '../assets/images/cinematic_hero_family_1790492273343.jpg';

interface HeroProps {
  photoCount: number;
  albumCount: number;
  isAuthenticated: boolean;
  onOpenPasswordModal: () => void;
  onOpenAddPhotoModal: () => void;
  onSelectAlbum: (album: string) => void;
  selectedAlbum: string;
  albums: string[];
}

export const Hero: React.FC<HeroProps> = ({
  photoCount,
  isAuthenticated,
  onOpenPasswordModal,
  onOpenAddPhotoModal,
}) => {
  const scrollToGallery = () => {
    const el = document.getElementById('gallery-grid');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative">
      {/* SECTION 1: Cinematic Full-Bleed Hero */}
      <section className="relative min-h-[85vh] flex flex-col justify-between overflow-hidden bg-black text-white">
        {/* Full-bleed background image with dramatic golden hour overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroBg}
            alt="Chinthala Family Cinematic Background"
            className="w-full h-full object-cover object-center scale-102"
          />
          {/* Multi-layered cinematic gradient scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0E0D0C] via-black/55 to-black/75" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.65)_100%)]" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 pb-20 w-full my-auto">
          <div className="max-w-3xl">
            {/* Golden tracking category kicker */}
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[#D4A373] font-semibold mb-4">
              <span>CAPTURING MOMENTS</span>
              <span className="text-[#D4A373]/60">•</span>
              <span>CHINTHALA ARCHIVE</span>
            </div>

            {/* Editorial headline with script calligraphy */}
            <h1 className="font-serif-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-medium tracking-tight text-white leading-[1.08] mb-6">
              Turning Moments <br className="hidden sm:inline" />
              Into Timeless{' '}
              <span className="font-script text-[#E5B581] text-6xl sm:text-7xl md:text-8xl lg:text-9xl inline-block -rotate-2 ml-1 font-normal drop-shadow-lg">
                Memories
              </span>
            </h1>

            {/* Warm, elegant description */}
            <p className="text-base sm:text-lg text-neutral-300 font-light leading-relaxed mb-9 max-w-xl">
              An heirloom digital sanctuary preserving our family's genuine moments. Saved permanently in Firebase Cloud storage, securely held and visible to our loved ones worldwide.
            </p>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-5">
              {isAuthenticated ? (
                <button
                  onClick={onOpenAddPhotoModal}
                  className="px-6 py-3.5 bg-[#D4A373] hover:bg-[#E5B581] text-[#0E0D0C] text-xs sm:text-sm font-semibold rounded-xl shadow-xl transition-all flex items-center gap-2 cursor-pointer group"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add First Photo</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <button
                  onClick={onOpenPasswordModal}
                  className="px-6 py-3.5 bg-[#D4A373] hover:bg-[#E5B581] text-[#0E0D0C] text-xs sm:text-sm font-semibold rounded-xl shadow-xl transition-all flex items-center gap-2 cursor-pointer group"
                >
                  <Lock className="w-4 h-4" />
                  <span>Family Portal Login (SRBS)</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              )}

              <button
                onClick={scrollToGallery}
                className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs sm:text-sm font-medium rounded-xl backdrop-blur-md transition-all cursor-pointer"
              >
                <span>View Archive</span>
              </button>
            </div>
          </div>
        </div>

        {/* Global Access Notice Bar */}
        <div className="relative z-10 bg-black/60 backdrop-blur-md border-t border-white/10 py-3.5 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-neutral-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-neutral-200 font-medium">Firebase Firestore Permanent Storage Active</span>
              <span>— Synchronized live worldwide</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Passcode: <strong className="font-mono text-[#D4A373]">SRBS</strong></span>
              <span>•</span>
              <span className="text-neutral-300 font-medium">{photoCount} Photos In Cloud Archive</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: 4 Feature Highlights Cards */}
      <section className="bg-[#FAF7F2] text-[#2B2620] py-10 px-4 sm:px-6 lg:px-8 border-b border-[#E8DFC8]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="flex items-start gap-4 p-5 bg-white border border-[#E8DFC8] rounded-2xl shadow-xs hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-xl bg-[#F4EDE2] text-[#8C6D46] flex items-center justify-center shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-display text-base font-semibold text-[#2B2620]">
                Permanent Firebase Cloud
              </h3>
              <p className="text-xs text-[#6F6456] mt-1 leading-relaxed">
                Photos are stored permanently in Firebase Firestore so everyone in the world can see them.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="flex items-start gap-4 p-5 bg-white border border-[#E8DFC8] rounded-2xl shadow-xs hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-xl bg-[#F4EDE2] text-[#8C6D46] flex items-center justify-center shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-display text-base font-semibold text-[#2B2620]">
                Global Real-Time Sync
              </h3>
              <p className="text-xs text-[#6F6456] mt-1 leading-relaxed">
                When you post a photo from anywhere, it updates live for all family members worldwide.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="flex items-start gap-4 p-5 bg-white border border-[#E8DFC8] rounded-2xl shadow-xs hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-xl bg-[#F4EDE2] text-[#8C6D46] flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-display text-base font-semibold text-[#2B2620]">
                Timeless Preservation
              </h3>
              <p className="text-xs text-[#6F6456] mt-1 leading-relaxed">
                High-resolution photographs saved without expiration, kept safe across generations.
              </p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="flex items-start gap-4 p-5 bg-white border border-[#E8DFC8] rounded-2xl shadow-xs hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-xl bg-[#F4EDE2] text-[#8C6D46] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-display text-base font-semibold text-[#2B2620]">
                Protected by SRBS
              </h3>
              <p className="text-xs text-[#6F6456] mt-1 leading-relaxed">
                Verified family member passcode to upload and manage the permanent archive.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
