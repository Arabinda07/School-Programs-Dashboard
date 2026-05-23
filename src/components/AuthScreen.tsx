import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Card, CardHeader, CardTitle, CardContent, Button } from './ui';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export function AuthScreen() {
  const [email, setEmail] = useState('');
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
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        
        setIsLogin(true);
        setSignupSuccess(true);
        setPassword('');
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl text-center text-gray-900">{isLogin ? 'Command Centre Login' : 'Create Account'}</CardTitle>
          <p className="text-center text-sm text-gray-500 mt-1">
             Authenticate to securely sync data with Supabase and enable file uploads.
          </p>
        </CardHeader>
        <CardContent>
          {signupSuccess && isLogin && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm p-3 rounded-md flex items-start">
               <CheckCircle2 className="w-5 h-5 mr-2 flex-shrink-0 text-emerald-600" />
               <div>Your account has been created. Please check your email and verify your address before logging in.</div>
            </div>
          )}
          {errorMsg && (
            <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-800 text-sm p-3 rounded-md flex items-start">
               <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 text-rose-600" />
               <div>{errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full border border-gray-200 rounded-md p-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full border border-gray-200 rounded-md p-2 text-sm" />
            </div>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
            </Button>
            <div className="text-center text-xs text-gray-500 space-y-2 mt-4">
              <button type="button" onClick={() => {
                 setIsLogin(!isLogin);
                 setSignupSuccess(false);
                 setErrorMsg('');
                 setPassword('');
              }} className="text-indigo-600 hover:underline block w-full">
                {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
