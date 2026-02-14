import { User } from '@/src/types';
import { authRepository } from '@/src/data/repositories/AuthRepository';

// ==============================================
// USE CASE : Check Auth
// 
// Responsabilités :
// - Vérifier si une session existe au démarrage
// - Retourner l'utilisateur connecté ou null
// ==============================================

type CheckAuthResult =
  | { success: true; user: User }
  | { success: false };

export async function checkAuthUseCase(): Promise<CheckAuthResult> {
  const user = await authRepository.getCurrentUser();

  if (user) {
    return { success: true, user };
  }

  return { success: false };
}