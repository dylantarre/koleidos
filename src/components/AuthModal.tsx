import React, { useState } from 'react';
import { X, Loader2, Mail, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { z } from 'zod';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const authSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const resetForm = () => {
    setFormData({ email: '', password: '' });
    setError(null);
    setShowPassword(false);
  };

  React.useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validate form data
      const result = authSchema.safeParse(formData);
      if (!result.success) {
        setError(result.error.errors[0].message);
        setIsLoading(false);
        return;
      }

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) {
          if (error.message === 'Invalid login credentials') {
            setError('The email or password you entered is incorrect');
          } else {
            setError(error.message);
          }
          return;
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });
        if (error) {
          if (error.message.includes('User already registered')) {
            setError('An account with this email already exists');
          } else {
            setError('There was an error creating your account. Please try again.');
          }
          setIsLoading(false);
          return;
        }
        
        // Show success message for sign up
        setError('Account created successfully! You can now sign in.');
        setIsLogin(true);
        resetForm();
        setIsLoading(false);
        return;
      }

      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-darker-blue max-w-md w-full rounded-2xl shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-custom opacity-5" />
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 relative">
          <h2 className="text-2xl font-bold text-center mb-6 dark:text-white">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, email: e.target.value.trim() }));
                    setError(null);
                  }}
                  className="w-full px-4 py-2 pl-10 bg-white/5 backdrop-blur-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black dark:text-white placeholder-gray-400"
                  placeholder="Enter your email"
                  required
                  autoComplete="email"
                />
                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, password: e.target.value }));
                    setError(null);
                  }}
                  className="w-full px-4 py-2 pl-10 bg-white/5 backdrop-blur-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black dark:text-white placeholder-gray-400"
                  placeholder="Enter your password"
                  required
                  autoComplete={isLogin ? "current-password" : "new-password"}
                />
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <p className={`text-sm ${error.includes('successfully') ? 'text-green-500' : 'text-red-500'}`}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-gradient-custom text-white rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-glow"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{isLogin ? 'Signing in...' : 'Creating account...'}</span>
                </div>
              ) : (
                <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
              )}
            </button>

            <p className="text-sm text-center text-gray-600 dark:text-gray-400">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                disabled={isLoading}
                className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}