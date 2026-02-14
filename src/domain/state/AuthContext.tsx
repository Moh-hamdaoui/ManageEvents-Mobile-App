import React, { createContext, useReducer, useCallback, useEffect } from 'react';
import { AuthState, User } from '@/src/types';

// Import des use cases
import { loginUseCase } from '@/src/domain/useCases/auth/loginUseCase';
import { registerUseCase } from '@/src/domain/useCases/auth/registerUseCase';
import { logoutUseCase } from '@/src/domain/useCases/auth/logoutUseCase';
import { checkAuthUseCase } from '@/src/domain/useCases/auth/checkAuthUseCase';

// ==============================================
// COUCHE DOMAIN - Gestion de l'état Auth
// 
// Responsabilités :
// - Gérer l'état (loading, error, authenticated)
// - Orchestrer les use cases
// - Fournir les actions à l'UI
// ==============================================

// ==================== ACTIONS ====================

type AuthAction =
  | { type: 'AUTH_LOADING' }
  | { type: 'AUTH_SUCCESS'; user: User }
  | { type: 'AUTH_ERROR'; error: string }
  | { type: 'AUTH_LOGOUT' };

// ==================== REDUCER ====================

const initialState: AuthState = {
  status: 'loading',
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_LOADING':
      return { status: 'loading' };
    case 'AUTH_SUCCESS':
      return { status: 'authenticated', user: action.user };
    case 'AUTH_ERROR':
      return { status: 'error', error: action.error };
    case 'AUTH_LOGOUT':
      return { status: 'unauthenticated' };
    default:
      return state;
  }
}

// ==================== CONTEXT ====================

interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

// ==================== PROVIDER ====================

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Vérifier la session au démarrage
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    dispatch({ type: 'AUTH_LOADING' });

    const result = await checkAuthUseCase();

    if (result.success && result.user) {
      dispatch({ type: 'AUTH_SUCCESS', user: result.user });
    } else {
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  // Action : Connexion
  const login = useCallback(async (email: string, password: string) => {
    dispatch({ type: 'AUTH_LOADING' });

    const result = await loginUseCase(email, password);

    if (result.success) {
      dispatch({ type: 'AUTH_SUCCESS', user: result.user });
    } else {
      dispatch({ type: 'AUTH_ERROR', error: result.error });
    }
  }, []);

  // Action : Inscription
  const register = useCallback(async (email: string, password: string) => {
    dispatch({ type: 'AUTH_LOADING' });

    const result = await registerUseCase(email, password);

    if (result.success) {
      dispatch({ type: 'AUTH_SUCCESS', user: result.user });
    } else {
      dispatch({ type: 'AUTH_ERROR', error: result.error });
    }
  }, []);

  // Action : Déconnexion
  const logout = useCallback(async () => {
    dispatch({ type: 'AUTH_LOADING' });

    const result = await logoutUseCase();

    if (result.success) {
      dispatch({ type: 'AUTH_LOGOUT' });
    } else {
      dispatch({ type: 'AUTH_ERROR', error: result.error });
    }
  }, []);

  // Valeur fournie à l'UI
  const value: AuthContextType = {
    state,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}