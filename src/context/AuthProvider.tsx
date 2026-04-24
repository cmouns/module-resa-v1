import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { AuthContext } from './AuthContext';
import type { Profil } from '../types/database';
import type { User } from '@supabase/supabase-js';

/**
 * Enveloppe l'application pour rendre l'état de session et les données
 * du profil accessibles depuis n'importe quel composant enfant.
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profil, setProfil] = useState<Profil | null>(null);
  const [loading, setLoading] = useState(true);
  const [networkError, setNetworkError] = useState(false);

  useEffect(() => {
    // Si Supabase ne répond pas en 8 secondes,
    // c'est qu'il y a un problème de connexion. On affiche une erreur explicite
    // plutôt que de laisser l'app figée sur un loader.
    const networkTimeout = setTimeout(() => {
      setNetworkError(true);
      setLoading(false);
    }, 8000);

    // On écoute les changements d'état auth.
    // Supabase émet automatiquement un événement INITIAL_SESSION au démarrage.
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // Dès qu'on reçoit le premier événement, on annule le timeout réseau.
      clearTimeout(networkTimeout);

      // Pas de session (déconnecté ou jamais connecté)
      if (!session) {
        setUser(null);
        setProfil(null);
        setLoading(false);
        return;
      }

      // Session active, on récupère le profil
      setUser(session.user);

      try {
        const { data: profilData, error } = await supabase
          .from('profils')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error("Erreur récupération profil :", error);
          setProfil(null);
        } else {
          setProfil(profilData as Profil);
        }
      } catch (err) {
        console.error("Erreur inattendue :", err);
        setProfil(null);
      } finally {
        setLoading(false);
      }
    });

    // On coupe l'écouteur et le timeout quand le composant disparaît
    return () => {
      clearTimeout(networkTimeout);
      authListener.subscription.unsubscribe();
    };
  }, []);

  /**
   * Déconnecte l'utilisateur. Le listener onAuthStateChange capte
   * l'événement SIGNED_OUT et remet l'état à null automatiquement.
   */
  const logout = async () => {
    await supabase.auth.signOut();
  };

  // Affichage du loader pendant la vérification initiale
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" aria-busy="true">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Affichage d'une erreur explicite si on n'a pas pu joindre le serveur
  if (networkError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Impossible de joindre le serveur</h1>
        <p className="text-gray-600 mb-6">Vérifiez votre connexion internet et réessayez.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, profil, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};