// src/domain/useCases/participation/cancelParticipationUseCase.ts

import { VoidResult } from '@/src/types';
import { eventParticipationRepository } from '@/src/data/repositories/EventParticipationRepository';

// ==============================================
// USE CASE : Annuler sa participation
// ==============================================

export async function cancelParticipationUseCase(
  eventId: string,
  userId: string
): Promise<VoidResult> {
  
  // 1. Vérifier si l'utilisateur participe
  const isParticipating = await eventParticipationRepository.isParticipating(eventId, userId);
  
  if (!isParticipating) {
    return { success: false, error: 'Vous ne participez pas à cet événement' };
  }

  // 2. Annuler la participation
  return eventParticipationRepository.cancel(eventId, userId);
}