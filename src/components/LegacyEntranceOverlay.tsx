import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Key, Crown, Shield } from 'lucide-react';
import { heirloomAudio } from '../utils/audioSynthesizer.ts';
import logoImg from '../assets/images/chinthala_family_logo_1790492255820.jpg';

interface LegacyEntranceOverlayProps {
  onUnlockComplete: () => void;
}

interface Particle {
  x: number;
  y: number;
  radius: number;
  speedY: number;
  speedX: number;
  opacity: number;
  fadeSpeed: number;
  color: string;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  color: string;
}

export const LegacyEntranceOverlay: React.FC<LegacyEntranceOverlayProps> = ({
  onUnlockComplete,
}) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isSealBroken, setIsSealBroken] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sparksRef = useRef<Spark[]>([]);

  // Canvas golden bokeh particles drifting upward
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Initial floating bokeh embers
    const particles: Particle[] = [];
    const particleCount = 45;
    const goldPalette = ['#E5B581', '#D4AF37', '#FFDF73', '#C89B67', '#FAD02C'];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.5 + 1,
        speedY: Math.random() * 0.6 + 0.2,
        speedX: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.7 + 0.2,
        fadeSpeed: Math.random() * 0.01 + 0.005,
        color: goldPalette[Math.floor(Math.random() * goldPalette.length)],
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw and update ambient floating embers
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y -= p.speedY;
        p.x += p.speedX;
        p.opacity += p.fadeSpeed;

        if (p.opacity > 0.9 || p.opacity < 0.2) {
          p.fadeSpeed = -p.fadeSpeed;
        }

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, Math.min(1, p.opacity));
        ctx.shadowBlur = 12;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.restore();
      }

      // Draw wax seal explosion sparks if active
      if (sparksRef.current.length > 0) {
        for (let i = sparksRef.current.length - 1; i >= 0; i--) {
          const s = sparksRef.current[i];
          s.x += s.vx;
          s.y += s.vy;
          s.vy += 0.08; // subtle gravity
          s.alpha -= 0.02;

          if (s.alpha <= 0) {
            sparksRef.current.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
          ctx.fillStyle = s.color;
          ctx.globalAlpha = Math.max(0, s.alpha);
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#FFDF73';
          ctx.fill();
          ctx.restore();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Trigger burst of sparks at chest wax seal location
  const createSealSparkBurst = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2 + 30;

    const goldColors = ['#FFF3A1', '#FFDF73', '#E5B581', '#D4AF37', '#FF8A00'];
    const newSparks: Spark[] = [];

    for (let i = 0; i < 70; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 7 + 2;
      newSparks.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        radius: Math.random() * 3 + 1.5,
        alpha: 1,
        color: goldColors[Math.floor(Math.random() * goldColors.length)],
      });
    }

    sparksRef.current = newSparks;
  };

  const handleUnlock = () => {
    if (isUnlocked) return;

    // 1. Play real Web Audio API synthesized brass latch click, piano music box chime & hearth crackle
    heirloomAudio.playUnlockSequence();

    // 2. Trigger wax seal shatter & spark burst
    setIsSealBroken(true);
    createSealSparkBurst();

    // 3. Open 3D Chest Lid & release light rays
    setIsUnlocked(true);

    // 4. Smooth scale and fade out after 1.85s
    setTimeout(() => {
      setIsFadingOut(true);
    }, 1850);

    // 5. Complete and unmount overlay
    setTimeout(() => {
      onUnlockComplete();
    }, 2500);
  };

  return (
    <div
      id="legacy-entrance-overlay"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center select-none overflow-hidden transition-all duration-700 ${
        isFadingOut
          ? 'opacity-0 scale-105 pointer-events-none'
          : 'opacity-100 scale-100 pointer-events-auto'
      }`}
      style={{
        background: 'radial-gradient(ellipse at center, #1b070d 0%, #120307 45%, #080204 100%)',
      }}
    >
      {/* Floating Golden Bokeh Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />

      {/* Decorative Golden Ambient Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#8B0000]/15 rounded-full blur-2xl pointer-events-none" />

      {/* Main Content Box */}
      <div className="relative z-10 flex flex-col items-center max-w-4xl px-4 text-center">
        {/* Top Regal Motto & Family Crest Banner */}
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#350b14]/70 border border-[#D4AF37]/40 text-[#E5B581] mb-4 shadow-lg backdrop-blur-xs animate-in fade-in slide-in-from-top-4 duration-700">
          <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span className="text-[10px] sm:text-xs tracking-[0.25em] uppercase font-semibold">
            Preserving Our Cherished Moments Across Generations
          </span>
          <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
        </div>

        {/* Regal Title */}
        <h2 className="font-cinzel text-xl sm:text-2xl tracking-[0.3em] uppercase text-[#D4AF37] font-bold mb-1 drop-shadow-md">
          The House of Chinthala
        </h2>

        <h1 className="font-playfair text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-2 drop-shadow-xl">
          <span className="bg-gradient-to-r from-[#FFF5D0] via-[#E5B581] to-[#D4AF37] bg-clip-text text-transparent">
            Our Legacy & Golden Heritage
          </span>
        </h1>

        <p className="font-serif text-sm sm:text-base text-[#D9C8B5] max-w-xl italic mb-6 sm:mb-8 drop-shadow-sm">
          &ldquo;A sacred sanctuary of memories, laughter, and unbreakable bonds, woven through time.&rdquo;
        </p>

        {/* 3D Hand-Carved Mahogany Keepsake Chest Container */}
        <div
          onClick={handleUnlock}
          className="relative perspective-1000 group cursor-pointer my-2 sm:my-4 transition-transform duration-300 hover:scale-[1.02]"
          title="Click to Unlock the Heirloom Chest"
        >
          {/* Internal Radiance / Light Rays when chest lid opens */}
          {isUnlocked && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              {/* Radial Golden Light Beam */}
              <div className="w-96 h-96 rounded-full bg-gradient-to-t from-[#FFDF73] via-[#E5B581]/70 to-transparent blur-2xl animate-pulse" />

              {/* Emerging Polaroid Heirloom Photos Floating Upward */}
              <div className="absolute -top-16 -left-8 w-24 h-28 bg-[#FAF8F5] p-1.5 shadow-2xl rounded-sm -rotate-12 border border-[#E5DDD0] animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="w-full h-20 bg-[#351C15] overflow-hidden rounded-xs">
                  <img src={logoImg} alt="Heirloom" className="w-full h-full object-cover" />
                </div>
                <span className="font-caveat text-[9px] text-[#554030] block text-center mt-1">1982 Heritage</span>
              </div>

              <div className="absolute -top-24 w-28 h-32 bg-[#FAF8F5] p-1.5 shadow-2xl rounded-sm rotate-3 border border-[#E5DDD0] animate-in fade-in slide-in-from-bottom-12 duration-1000">
                <div className="w-full h-22 bg-[#2B1B15] overflow-hidden rounded-xs">
                  <img src={logoImg} alt="Heirloom" className="w-full h-full object-cover" />
                </div>
                <span className="font-caveat text-[10px] text-[#554030] block text-center mt-1 font-bold">Chinthala Family</span>
              </div>

              <div className="absolute -top-16 -right-8 w-24 h-28 bg-[#FAF8F5] p-1.5 shadow-2xl rounded-sm rotate-12 border border-[#E5DDD0] animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="w-full h-20 bg-[#351C15] overflow-hidden rounded-xs">
                  <img src={logoImg} alt="Heirloom" className="w-full h-full object-cover" />
                </div>
                <span className="font-caveat text-[9px] text-[#554030] block text-center mt-1">Golden Era</span>
              </div>
            </div>
          )}

          {/* 3D Wooden Chest Body (Mahogany Velvet with Brass Brackets) */}
          <div className="relative w-72 sm:w-88 h-44 sm:h-52 rounded-2xl bg-gradient-to-b from-[#2E0F14] via-[#20080B] to-[#120306] border-2 border-[#D4AF37]/60 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(212,175,55,0.25)] flex flex-col justify-end p-4 overflow-hidden">
            {/* Wood Grain Texture Pattern */}
            <div
              className="absolute inset-0 opacity-25 pointer-events-none mix-blend-overlay"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(45deg, #000 0, #000 2px, transparent 2px, transparent 10px)',
              }}
            />

            {/* Brass Corner Reinforcements with Rivets */}
            {/* Top-Left Brass Corner */}
            <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-[#D4AF37] rounded-tl-xl pointer-events-none shadow-md">
              <div className="w-1.5 h-1.5 bg-[#FFDF73] rounded-full absolute top-1.5 left-1.5 shadow-xs" />
            </div>
            {/* Top-Right Brass Corner */}
            <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-[#D4AF37] rounded-tr-xl pointer-events-none shadow-md">
              <div className="w-1.5 h-1.5 bg-[#FFDF73] rounded-full absolute top-1.5 right-1.5 shadow-xs" />
            </div>
            {/* Bottom-Left Brass Corner */}
            <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-[#D4AF37] rounded-bl-xl pointer-events-none shadow-md">
              <div className="w-1.5 h-1.5 bg-[#FFDF73] rounded-full absolute bottom-1.5 left-1.5 shadow-xs" />
            </div>
            {/* Bottom-Right Brass Corner */}
            <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-[#D4AF37] rounded-br-xl pointer-events-none shadow-md">
              <div className="w-1.5 h-1.5 bg-[#FFDF73] rounded-full absolute bottom-1.5 right-1.5 shadow-xs" />
            </div>

            {/* Brass Filigree Engraved Band */}
            <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-8 bg-gradient-to-r from-[#94762E] via-[#E5B581] to-[#94762E] opacity-90 border-y border-[#FFDF73]/60 flex items-center justify-between px-3 shadow-inner">
              <div className="text-[9px] font-mono tracking-widest text-[#3B2609] uppercase font-bold">
                EST. GENERATIONS
              </div>
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#4A300A] shadow-xs" />
                <span className="w-2 h-2 rounded-full bg-[#4A300A] shadow-xs" />
                <span className="w-2 h-2 rounded-full bg-[#4A300A] shadow-xs" />
              </div>
              <div className="text-[9px] font-mono tracking-widest text-[#3B2609] uppercase font-bold">
                FAMILY ARCHIVE
              </div>
            </div>

            {/* 3D PIVOTING LID */}
            <div
              className={`absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-[#3D141B] via-[#2A0B10] to-[#1E060A] border-b-2 border-[#D4AF37] rounded-t-2xl origin-top transition-transform duration-1000 ease-out transform-style-3d z-10 ${
                isUnlocked ? '-rotate-x-110' : 'rotate-x-0'
              }`}
              style={{
                transformOrigin: 'top center',
              }}
            >
              {/* Lid Top Bevel */}
              <div className="absolute inset-x-3 top-2 h-1 bg-[#D4AF37]/40 rounded-full" />
              <div className="flex items-center justify-center h-full">
                <div className="px-4 py-1 rounded-full bg-[#180407]/70 border border-[#D4AF37]/50 flex items-center gap-1.5 text-[10px] text-[#E5B581] font-semibold tracking-widest uppercase">
                  <Shield className="w-3 h-3 text-[#D4AF37]" />
                  <span>Sacred Keepsake</span>
                </div>
              </div>
            </div>

            {/* Glowing Crimson Wax Seal with Brass Monogram Stamp */}
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex items-center justify-center transition-all duration-500 ${
                isSealBroken
                  ? 'scale-125 opacity-0 pointer-events-none'
                  : 'scale-100 opacity-100 seal-float-anim'
              }`}
            >
              {/* Wax Seal Outer Organic Edge */}
              <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-gradient-to-br from-[#A60F25] via-[#85081A] to-[#4A000A] border-2 border-[#C92A3E]/70 shadow-[0_0_30px_rgba(166,15,37,0.7),inset_0_0_12px_rgba(255,255,255,0.2)] flex items-center justify-center">
                {/* Wax Irregular Scallop Drops */}
                <div className="absolute -top-1 left-3 w-4 h-4 rounded-full bg-[#85081A]" />
                <div className="absolute -bottom-1 right-2 w-4 h-5 rounded-full bg-[#690514]" />
                <div className="absolute top-3 -right-1 w-4 h-4 rounded-full bg-[#85081A]" />
                <div className="absolute bottom-2 -left-1 w-3 h-4 rounded-full bg-[#690514]" />

                {/* Inner Gold Stamped Crest (Chinthala 'C' & 'M') */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-[#FFDF73]/50 bg-[#590410] flex flex-col items-center justify-center shadow-inner">
                  <span className="font-cinzel text-xl sm:text-2xl font-black text-[#FFDF73] drop-shadow-md leading-none">
                    C
                  </span>
                  <span className="text-[7px] font-mono tracking-widest text-[#E5B581] uppercase font-bold mt-0.5">
                    HEIRLOOM
                  </span>
                </div>
              </div>
            </div>

            {/* Chest Brass Keyhole / Hasp */}
            <div className="relative z-0 mx-auto w-10 h-10 rounded-full bg-[#180407] border-2 border-[#D4AF37] flex items-center justify-center shadow-inner mt-auto">
              <div className="w-2.5 h-4 bg-[#FFDF73] rounded-t-xs clip-keyhole" />
            </div>
          </div>
        </div>

        {/* Primary Action Button: Gold Gilded "Unlock Our Legacy" */}
        <div className="mt-6 flex flex-col items-center gap-3">
          <button
            onClick={handleUnlock}
            disabled={isUnlocked}
            className={`group relative px-8 py-3.5 sm:px-10 sm:py-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#FFDF73] to-[#C89B67] text-[#1E060A] font-semibold text-sm sm:text-base tracking-wider uppercase shadow-[0_0_35px_rgba(212,175,55,0.45)] hover:shadow-[0_0_50px_rgba(255,223,115,0.7)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer overflow-hidden ${
              isUnlocked ? 'opacity-80 scale-95 cursor-default' : 'gold-pulse-glow'
            }`}
          >
            {/* Button Shimmer Ray */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

            <div className="relative flex items-center gap-3">
              <Key className="w-5 h-5 text-[#350B14] group-hover:rotate-45 transition-transform duration-300" />
              <span className="font-bold tracking-widest">
                {isUnlocked ? 'Opening The Heirloom Chest...' : 'Unlock Our Legacy'}
              </span>
              <Sparkles className="w-5 h-5 text-[#350B14] animate-spin" />
            </div>
          </button>

          <span className="text-xs text-[#A89685] tracking-wide flex items-center gap-1.5">
            <span>Click the heirloom chest or button to break the wax seal</span>
          </span>
        </div>
      </div>
    </div>
  );
};
