import React from 'react';
import { motion } from 'motion/react';
import { Target, ShieldCheck, Robot, ChartBar, ArrowLeft } from '@phosphor-icons/react';

interface Props {
  onBack: () => void;
}

export function ArchitectureSpecs({ onBack }: Props) {
  return (
    <div className="relative min-h-[100dvh] bg-slate-50 text-slate-900 font-sans selection:bg-slate-200 flex flex-col">
      <nav className="w-full px-6 py-6 flex items-center justify-between max-w-[1400px] mx-auto relative z-20">
        <button 
          onClick={onBack}
          className="group relative flex items-center gap-2 px-4 py-2 rounded-full hover:bg-slate-200/50 text-sm font-medium text-slate-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Return to overview
        </button>
      </nav>

      <main className="max-w-[1400px] w-full mx-auto px-6 pt-12 pb-24 lg:pt-20 lg:pb-32 flex-1 flex flex-col relative z-10">
         <div className="max-w-2xl mb-16 lg:mb-20">
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tighter text-slate-950 mb-6">
              Structural oversight.
            </h1>
            <p className="max-w-[45ch] text-lg md:text-xl text-slate-500 leading-relaxed">
              Bring extracurriculars, interventions, and vendors into one strict, auditable framework.
            </p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="md:col-span-2 group bg-white border border-slate-200 rounded-[2rem] p-8 lg:p-12 hover:border-slate-950 hover:shadow-xl shadow-sm transition-all duration-300 relative overflow-hidden">
              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-12 group-hover:bg-slate-950 group-hover:border-slate-950 transition-colors duration-300 relative z-10">
                <Target className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-950 mb-3 relative z-10 transition-colors duration-300 tracking-tight">Live tracking</h3>
              <p className="text-base text-slate-500 leading-relaxed max-w-md relative z-10">
                Monitor delivery rates, assessment variances, and vendor execution across all cohorts instantly.
              </p>
            </motion.div>
            
            <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="md:col-span-1 group bg-white border border-slate-200 rounded-[2rem] p-8 lg:p-12 hover:border-slate-950 hover:shadow-xl shadow-sm transition-all duration-300 relative overflow-hidden">
              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-12 group-hover:bg-slate-950 group-hover:border-slate-950 transition-colors duration-300 relative z-10">
                <ShieldCheck className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-950 mb-3 relative z-10 transition-colors duration-300 tracking-tight">Evidence vault</h3>
              <p className="text-base text-slate-500 leading-relaxed relative z-10">
                Capture and secure mandatory proofs for board inspections effortlessly in one central place.
              </p>
            </motion.div>

            <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="md:col-span-1 group bg-white border border-slate-200 rounded-[2rem] p-8 lg:p-12 hover:border-slate-950 hover:shadow-xl shadow-sm transition-all duration-300 relative overflow-hidden">
              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-12 group-hover:bg-slate-950 group-hover:border-slate-950 transition-colors duration-300 relative z-10">
                <Robot className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-950 mb-3 relative z-10 transition-colors duration-300 tracking-tight">Auto-alerts</h3>
              <p className="text-base text-slate-500 leading-relaxed relative z-10">
                Get notified instantly about delayed sessions, missing evidence, or poor vendor feedback.
              </p>
            </motion.div>

            <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="md:col-span-2 group bg-white border border-slate-200 rounded-[2rem] p-8 lg:p-12 hover:border-slate-950 hover:shadow-xl shadow-sm transition-all duration-300 relative overflow-hidden">
              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-12 group-hover:bg-slate-950 group-hover:border-slate-950 transition-colors duration-300 relative z-10">
                <ChartBar className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-950 mb-3 relative z-10 transition-colors duration-300 tracking-tight">Targeted help</h3>
              <p className="text-base text-slate-500 leading-relaxed max-w-md relative z-10">
                Turn diagnostic results into competency bands, instantly highlighting groups that need academic support.
              </p>
            </motion.div>
         </div>
      </main>
    </div>
  );
}
