import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { AuthContext } from './AuthContext';
import type { Profil } from '../types/database';
import type { User } from '@supabase/supabase-js';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profil, setProfil] = useState<Profil | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProfil = async (userId: string) => {
    try {
      const { data, error } = await supabase.from('profils').select('*').eq('id', userId).single();
      if (error) throw error;
      setProfil(data as Profil);
    } catch (error) {
      console.error(error);
      setProfil(null);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session?.user) {
          setUser(session.user);
          await fetchProfil(session.user.id);
        }
      } catch (error) {
        console.error(error);
        await supabase.auth.signOut();
        setUser(null);
        setProfil(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchProfil(session.user.id);
      } else {
        setUser(null);
        setProfil(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => { 
    await supabase.auth.signOut(); 
    setUser(null);
    setProfil(null);
  };

  return (
    <AuthContext.Provider value={{ user, profil, loading, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};