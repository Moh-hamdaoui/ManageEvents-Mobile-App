import { supabase } from './SupabaseClient';
import { AuthResult, User } from '@/src/types';

// ==============================================
// SOURCE DISTANTE : Auth (Supabase)
// Couche Data - Accès API
// Responsabilités :
// - Appels API Supabase uniquement
// - Transformation des données
// - Gestion des erreurs réseau
// ==============================================

class AuthRemoteSource {

  async login(email: string, password: string): Promise<AuthResult> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { 
        success: false, 
        error: this.translateError(error.message) 
      };
    }

    if (!data.user) {
      return { success: false, error: 'Utilisateur non trouvé' };
    }

    return {
      success: true,
      user: this.mapUser(data.user),
    };
  }

  async register(email: string, password: string): Promise<AuthResult> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return { 
        success: false, 
        error: this.translateError(error.message) 
      };
    }

    if (!data.user) {
      return { success: false, error: 'Erreur lors de l\'inscription' };
    }

    return {
      success: true,
      user: this.mapUser(data.user),
    };
  }

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }

    return this.mapUser(user);
  }

  // Transformer l'utilisateur Supabase en notre type User
  private mapUser(supabaseUser: any): User {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      created_at: supabaseUser.created_at,
    };
  }

  // Traduire les erreurs Supabase en français
  private translateError(message: string): string {
    const translations: Record<string, string> = {
      'Invalid login credentials': 'Email ou mot de passe incorrect',
      'Email not confirmed': 'Veuillez confirmer votre email',
      'User already registered': 'Cet email est déjà utilisé',
      'Password should be at least 6 characters': 'Le mot de passe doit contenir au moins 6 caractères',
    };

    return translations[message] || message;
  }
}

export const authRemoteSource = new AuthRemoteSource();