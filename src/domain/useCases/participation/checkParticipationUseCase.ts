// src/domain/useCases/participation/checkParticipationUseCase.ts

import { eventParticipationRepository } from '@/src/data/repositories/EventParticipationRepository';

// ==============================================
// USE CASE : Vérifier si l'utilisateur participe
// ==============================================

export async function checkParticipationUseCase(
  eventId: string,
  userId: string
): Promise<boolean> {
  return eventParticipationRepository.isParticipating(eventId, userId);
}