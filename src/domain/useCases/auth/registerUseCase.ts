import { AuthResult } from '@/src/types';
import { authRepository } from '@/src/data/repositories/AuthRepository';

// ==============================================
// USE CASE : Register
// 
// Responsabilités :
// - Valider les entrées (règles métier)
// - Appeler le repository
// ==============================================

export async function registerUseCase(
  email: string,
  password: string
): Promise<AuthResult> {
  
  // Validation email
  if (!email || !email.trim()) {
    return { success: false, error: 'L\'email est requis' };
  }

  if (!isValidEmail(email)) {
    return { success: false, error: 'L\'email n\'est pas valide' };
  }

  // Validation mot de passe
  if (!password) {
    return { success: false, error: 'Le mot de passe est requis' };
  }

  if (password.length < 6) {
    return { success: false, error: 'Le mot de passe doit contenir au moins 6 caractères' };
  }

  // Appel au repository
  return authRepository.register(email.trim().toLowerCase(), password);
}

// Règle métier : validation format email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}