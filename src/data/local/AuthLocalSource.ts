import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/src/types';

// ==============================================
// SOURCE LOCALE : Auth
// Couche Data - Stockage local
// Responsabilités :
// - Cache de la session utilisateur
// - Fonctionne hors ligne
// ==============================================

const STORAGE_KEY = '@task_manager_user_session';

class AuthLocalSource {

  async saveSession(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Erreur sauvegarde session locale:', error);
    }
  }

  async getSession(): Promise<User | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data) as User;
      }
      return null;
    } catch (error) {
      console.error('Erreur lecture session locale:', error);
      return null;
    }
  }

  async clearSession(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Erreur suppression session locale:', error);
    }
  }
}

export const authLocalSource = new AuthLocalSource();