import React from 'react';
import { cn } from '../lib/utils';

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("bg-white rounded-xl border border-slate-200 shadow-none overflow-hidden", className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("px-6 py-4 border-b border-slate-100", className)}>{children}</div>;
}

export function CardTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return <h3 className={cn("text-lg font-semibold text-slate-900 font-sans tracking-tight", className)}>{children}</h3>;
}

export function CardContent({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("px-6 py-5", className)}>{children}</div>;
}

export function Badge({ className, variant = 'default', children }: { 
  className?: string; 
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  children: React.ReactNode 
}) {
  const variants = {
    default: "bg-slate-100 text-slate-900 border border-slate-200",
    success: "bg-emerald-100 text-emerald-800",
    warning: "bg-amber-100 text-amber-800",
    danger: "bg-rose-100 text-rose-800",
    info: "bg-blue-100 text-blue-800",
    purple: "bg-purple-100 text-purple-800"
  };
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", variants[variant], className)}>
      {children}
    </span>
  );
}

export function Button({ className, variant = 'primary', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' }) {
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-900 shadow-none border border-transparent",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-500 border border-transparent",
    outline: "bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-500 border border-slate-300 shadow-none",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-transparent"
  };
  return (
    <button className={cn("inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors", variants[variant], className)} {...props} />
  );
}

export function EmptyState({ title, description, icon: Icon, action }: { title: string; description: string; icon?: React.ElementType; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
      {Icon && (
        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-slate-500" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-900 font-sans mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">{description}</p>
      {action}
    </div>
  );
}

export function LoadingState({ message = 'Loading data...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-indigo-600 animate-spin mb-4"></div>
      <p className="text-sm font-medium text-slate-600">{message}</p>
    </div>
  );
}
