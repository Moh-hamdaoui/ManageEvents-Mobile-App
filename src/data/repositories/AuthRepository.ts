import { AuthResult, VoidResult, User } from '@/src/types';
import { authRemoteSource } from '@/src/data/remote/AuthRemoteSource';
import { authLocalSource } from '@/src/data/local/AuthLocalSource';

// ==============================================
// REPOSITORY : Auth
// Couche Data - Point d'entrée unique
// Responsabilités :
// - Coordonner sources locale et distante
// - Implémenter la stratégie de données
// - Gérer le cache de session
// ==============================================

class AuthRepository {
  
  async login(email: string, password: string): Promise<AuthResult> {
    try {
      // 1. Appel API distant
      const result = await authRemoteSource.login(email, password);
      
      if (result.success) {
        // 2. Sauvegarder la session localement
        await authLocalSource.saveSession(result.user);
      }
      
      return result;
    } catch (error) {
      return { 
        success: false, 
        error: 'Erreur de connexion. Vérifiez votre connexion internet.' 
      };
    }
  }

  async register(email: string, password: string): Promise<AuthResult> {
    try {
      const result = await authRemoteSource.register(email, password);
      
      if (result.success) {
        await authLocalSource.saveSession(result.user);
      }
      
      return result;
    } catch (error) {
      return { 
        success: false, 
        error: 'Erreur d\'inscription. Vérifiez votre connexion internet.' 
      };
    }
  }

  async logout(): Promise<VoidResult> {
    try {
      // 1. Déconnexion distante
      await authRemoteSource.logout();
      
      // 2. Supprimer session locale
      await authLocalSource.clearSession();
      
      return { success: true };
    } catch (error) {
      // Même en cas d'erreur, on supprime la session locale
      await authLocalSource.clearSession();
      return { success: true };
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      // 1. D'abord vérifier la session distante
      const remoteUser = await authRemoteSource.getCurrentUser();
      
      if (remoteUser) {
        // Mettre à jour le cache local
        await authLocalSource.saveSession(remoteUser);
        return remoteUser;
      }
      
      // 2. Si pas de session distante, effacer le local
      await authLocalSource.clearSession();
      return null;
    } catch (error) {
      // En cas d'erreur réseau, utiliser le cache local
      return authLocalSource.getSession();
    }
  }
}

// Export singleton
export const authRepository = new AuthRepository();