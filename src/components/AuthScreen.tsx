import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Card, CardHeader, CardTitle, CardContent, Button } from './ui';
import { CheckCircle, WarningCircle, ArrowLeft } from '@phosphor-icons/react';

interface AuthScreenProps {
  onBack?: () => void;
}

export function AuthScreen({ onBack }: AuthScreenProps) {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('Teacher');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSignupSuccess(false);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              full_name: fullName,
              role: role,
            }
          }
        });
        if (error) throw error;
        
        setIsLogin(true);
        setSignupSuccess(true);
        setPassword('');
        setFullName('');
        setRole('Teacher');
      }
    } catch (err: any) {
      let msg = err.message;
      if (msg === 'Failed to fetch') {
         msg = "Failed to connect to Supabase. Please verify your Supabase URL and Anon Key are correct and that CORS is configured properly.";
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md relative border-slate-200 shadow-none bg-white">
        {onBack && (
          <button 
            onClick={onBack}
            className="absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <CardHeader className="pt-8">
          <CardTitle className="text-xl text-center text-slate-900 font-sans tracking-tight">{isLogin ? 'Command Centre Login' : 'Create Account'}</CardTitle>
          <p className="text-center text-sm text-slate-500 mt-1 font-light">
             Authenticate to access the program tracking and operations portal.
          </p>
        </CardHeader>
        <CardContent>
          {signupSuccess && isLogin && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm p-3 rounded-md flex items-start">
               <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0 text-emerald-600" />
               <div>Your account has been created. Please check your email and verify your address before logging in.</div>
            </div>
          )}
          {errorMsg && (
            <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-800 text-sm p-3 rounded-md flex items-start">
               <WarningCircle className="w-5 h-5 mr-2 flex-shrink-0 text-rose-600" />
               <div>{errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required className="w-full border border-slate-200 rounded-md p-2 text-sm focus:outline-none focus:border-slate-400 transition-colors" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Role</label>
                  <select value={role} onChange={e => setRole(e.target.value)} className="w-full border border-slate-200 rounded-md p-2 text-sm bg-white focus:outline-none focus:border-slate-400 transition-colors">
                    <option value="Teacher">Teacher</option>
                    <option value="Principal">Principal</option>
                    <option value="Academic Coordinator">Academic Coordinator</option>
                    <option value="Vendor Facilitator">Vendor Facilitator</option>
                  </select>
                </div>
              </>
            )}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full border border-slate-200 rounded-md p-2 text-sm focus:outline-none focus:border-slate-400 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full border border-slate-200 rounded-md p-2 text-sm focus:outline-none focus:border-slate-400 transition-colors" />
            </div>
            <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white shadow-none" type="submit" disabled={loading}>
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
            </Button>
            <div className="text-center text-xs text-slate-500 space-y-2 mt-4 font-medium">
              <button type="button" onClick={() => {
                 setIsLogin(!isLogin);
                 setSignupSuccess(false);
                 setErrorMsg('');
                 setPassword('');
                 setFullName('');
                 setRole('Teacher');
              }} className="text-slate-900 hover:underline block w-full underline-offset-4">
                {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
