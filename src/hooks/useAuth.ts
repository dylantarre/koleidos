import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

type Profile = Database['public']['Tables']['user_profiles']['Row'];
type Preferences = Database['public']['Tables']['user_preferences']['Row'];

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setProfile(null);
        setPreferences(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      // Add timeout to the fetch requests
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 5000)
      );

      const [profileResponse, preferencesResponse] = await Promise.race([
        Promise.all([
          supabase
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .single(),
          supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', userId)
            .single()
        ]),
        timeout
      ]);

      if (profileResponse?.error) throw profileResponse.error;
      if (preferencesResponse?.error) throw preferencesResponse.error;

      if (profileResponse?.data) setProfile(profileResponse.data);
      if (preferencesResponse?.data) setPreferences(preferencesResponse.data);
    } catch (error) {
      // Handle the error silently - the user can still use the app without being logged in
      setUser(null);
      setProfile(null);
      setPreferences(null);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const updatePreferences = async (updates: Partial<Preferences>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_preferences')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;

      setPreferences(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  };

  return {
    user,
    profile,
    preferences,
    loading,
    updateProfile,
    updatePreferences
  };
}