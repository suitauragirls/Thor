import React from 'react';
import { motion } from 'motion/react';

export const ShimmerCard: React.FC = () => {
  return (
    <div className="group relative flex flex-col bg-[#FAF7F2] rounded-2xl overflow-hidden border border-[#F3C5D1] shadow-2xs h-full justify-between">
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#D8C8B8]/10">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D8C8B8]/20 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        />
      </div>
      <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between bg-gradient-to-b from-[#FFFDFB] to-[#FFF0F4]/30 space-y-2.5">
        <div className="space-y-1.5">
          <div className="h-4 w-1/3 bg-[#D8C8B8]/20 rounded-md" />
          <div className="h-4 w-full bg-[#D8C8B8]/20 rounded-md" />
          <div className="h-4 w-2/3 bg-[#D8C8B8]/20 rounded-md" />
        </div>
        <div className="pt-2">
          <div className="h-5 w-1/2 bg-[#D8C8B8]/20 rounded-md" />
        </div>
        <div className="flex flex-col gap-1.5 pt-1">
          <div className="h-9 w-full bg-[#D8C8B8]/20 rounded-xl" />
          <div className="h-9 w-full bg-[#D8C8B8]/20 rounded-xl" />
        </div>
      </div>
    </div>
  );
};
