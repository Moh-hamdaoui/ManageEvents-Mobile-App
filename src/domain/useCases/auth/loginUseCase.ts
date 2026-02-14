import { AuthResult } from '@/src/types';
import { authRepository } from '@/src/data/repositories/AuthRepository';

// ==============================================
// USE CASE : Login
// Couche Domain - Logique Applicative
// Responsabilités :
// - Valider les entrées
// - Appeler le repository (via interface)
// - Retourner un résultat typé
// ==============================================

export async function loginUseCase(
  email: string,
  password: string
): Promise<AuthResult> {
  // Validation des entrées (règle métier simple)
  if (!email || !email.trim()) {
    return { success: false, error: 'L\'email est requis' };
  }

  if (!password || password.length < 6) {
    return { success: false, error: 'Le mot de passe doit contenir au moins 6 caractères' };
  }

  // Appel au repository (couche Data)
  // Le use case ne sait PAS comment le repository fonctionne
  return authRepository.login(email.trim().toLowerCase(), password);
}