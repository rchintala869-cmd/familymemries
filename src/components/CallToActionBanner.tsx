import React from 'react';
import { Camera, Plus, Lock, ArrowRight } from 'lucide-react';

interface CallToActionBannerProps {
  onOpenAddPhotoModal: () => void;
  onOpenPasswordModal: () => void;
  isAuthenticated: boolean;
}

export const CallToActionBanner: React.FC<CallToActionBannerProps> = ({
  onOpenAddPhotoModal,
  onOpenPasswordModal,
  isAuthenticated,
}) => {
  return (
    <section className="bg-[#FAF7F2] py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white border border-[#E8DFC8] rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Left badge & title */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#0E0D0C] text-[#D4A373] flex items-center justify-center shrink-0 shadow-md">
              <Camera className="w-7 h-7" />
            </div>

            <div>
              <h3 className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#2B2620]">
                Let's Preserve Your Special Moments
              </h3>
              <p className="text-xs sm:text-sm text-[#736859] mt-0.5">
                Ready to add photographs that last a lifetime? Our family archive welcomes every story.
              </p>
            </div>
          </div>

          {/* Action button */}
          <div className="shrink-0">
            {isAuthenticated ? (
              <button
                onClick={onOpenAddPhotoModal}
                className="w-full sm:w-auto px-6 py-3 bg-[#0E0D0C] hover:bg-[#2B2620] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#D4A373]" />
                <span>Add Photos To Archive</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onOpenPasswordModal}
                className="w-full sm:w-auto px-6 py-3 bg-[#0E0D0C] hover:bg-[#2B2620] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock className="w-4 h-4 text-[#D4A373]" />
                <span>Family Portal Login (SRBS)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
