import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from '@phosphor-icons/react';

interface LandingPageProps {
  onGetStarted: () => void;
  onViewSpecs: () => void;
}

export function LandingPage({ onGetStarted, onViewSpecs }: LandingPageProps) {
  return (
    <div className="bg-slate-950 text-white font-sans selection:bg-slate-800 flex flex-col">
       <div className="relative min-h-[100dvh] flex flex-col overflow-hidden">
         {/* Video Background */}
         <div className="absolute inset-0 z-0">
           <video 
             autoPlay 
             loop 
             muted 
             playsInline 
             preload="auto"
             className="w-full h-full object-cover pointer-events-none"
           >
             <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_105406_16f4600d-7a92-4292-b96e-b19156c7830a.mp4" type="video/mp4" />
           </video>
           <div className="absolute inset-0 bg-slate-950/70" />
           <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-slate-950 to-transparent" />
         </div>

      {/* Navigation */}
      <nav className="w-full px-6 py-6 flex items-center justify-between z-10 max-w-[1400px] mx-auto relative">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
            <span className="text-slate-950 text-[10px] font-bold font-mono tracking-tighter">SP</span>
          </div>
          <span className="font-medium text-white tracking-tight text-sm">Command Centre</span>
        </div>
        <button 
          onClick={onGetStarted}
          className="group relative px-5 py-2 overflow-hidden rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium text-white transition-all hover:bg-white/20 active:scale-[0.98]"
        >
          <span className="relative z-10">Authenticate</span>
        </button>
      </nav>

      {/* Hero Section - Asymmetric, typographic focus */}
      <main className="max-w-[1400px] w-full mx-auto px-6 pt-12 pb-24 lg:pt-16 lg:pb-32 flex-1 flex flex-col justify-center relative z-10">
        <div className="space-y-8 lg:space-y-10 z-10 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-5xl sm:text-6xl md:text-[5.5rem] lg:text-[7.5rem] font-semibold tracking-tighter text-white leading-[1] md:leading-[0.9] md:-ml-1">
              Run academic<br />
              programs with<br />
              <span className="text-slate-400">zero guesswork.</span>
            </h1>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-[45ch] text-lg md:text-xl text-slate-300 leading-relaxed"
          >
            Replace scattered spreadsheets with a single, live view of your interventions, programs, and vendors.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-start gap-4 pt-4"
          >
            <button 
               onClick={onGetStarted}
               className="px-8 py-4 bg-white hover:bg-slate-200 text-slate-950 rounded-full font-semibold transition-all active:scale-[0.98] flex items-center gap-2 group text-base shadow-xl shadow-black/20"
            >
              Open dashboard
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={onViewSpecs}
              className="px-8 py-4 bg-white/5 backdrop-blur-sm hover:bg-white/10 text-white rounded-full font-semibold transition-colors text-base border border-white/20 active:scale-[0.98]"
            >
              See how it works
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="pt-10 lg:pt-16 mt-12 grid grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-8 lg:divide-x divide-white/20 border-t border-white/20"
          >
             <div className="flex flex-col items-start pr-4 group overflow-hidden">
                <motion.span initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="text-5xl md:text-6xl font-semibold text-white tracking-tighter tabular-nums">14</motion.span>
                <span className="text-xs text-slate-400 uppercase font-mono tracking-widest mt-2 group-hover:text-white transition-colors">Active Programs</span>
             </div>
             <div className="flex flex-col items-start lg:pl-8 pr-4 group overflow-hidden">
                <motion.span initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }} className="text-5xl md:text-6xl font-semibold text-white tracking-tighter tabular-nums">1,283</motion.span>
                <span className="text-xs text-slate-400 uppercase font-mono tracking-widest mt-2 group-hover:text-white transition-colors">Tracked Subjects</span>
             </div>
             <div className="flex flex-col items-start lg:pl-8 pr-4 group overflow-hidden">
                <motion.span initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }} className="text-5xl md:text-6xl font-semibold text-white tracking-tighter tabular-nums">84.2%</motion.span>
                <span className="text-xs text-slate-400 uppercase font-mono tracking-widest mt-2 group-hover:text-white transition-colors">Delivery Targets</span>
             </div>
             <div className="flex flex-col items-start lg:pl-8 group overflow-hidden">
                <motion.span initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.9 }} className="text-5xl md:text-6xl font-semibold text-white tracking-tighter tabular-nums">3.2<span className="text-xl font-normal text-slate-500 ml-1 tracking-normal">days</span></motion.span>
                <span className="text-xs text-slate-400 uppercase font-mono tracking-widest mt-2 group-hover:text-white transition-colors">Resolution SLA</span>
             </div>
          </motion.div>
        </div>
      </main>
      </div>
    </div>
  );
}

