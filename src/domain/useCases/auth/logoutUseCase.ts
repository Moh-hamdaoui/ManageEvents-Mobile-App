import { VoidResult } from '@/src/types';
import { authRepository } from '@/src/data/repositories/AuthRepository';

// ==============================================
// USE CASE : Logout
// 
// Responsabilités :
// - Appeler le repository pour déconnecter
// ==============================================

export async function logoutUseCase(): Promise<VoidResult> {
  return authRepository.logout();
}