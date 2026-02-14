import { useContext } from 'react';
import { AuthContext } from '@/src/domain/state/AuthContext';

// ==============================================
// HOOK : useAuth
// Rôle : Connecter la couche UI à la couche Domain
// 
// L'UI utilise CE HOOK, jamais les use cases directement
// ==============================================

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }

  return context;
}

// ==============================================
// UTILISATION DANS L'UI :
// 
// const { state, login, register, logout } = useAuth();
// 
// state.status === 'loading'        → Afficher spinner
// state.status === 'authenticated'  → state.user disponible
// state.status === 'unauthenticated'→ Afficher login
// state.status === 'error'          → state.error disponible
// 
// login(email, password)   → Déclenche connexion
// register(email, password)→ Déclenche inscription
// logout()                 → Déclenche déconnexion
// ==============================================