// src/domain/useCases/participation/getEventParticipantsUseCase.ts

import { ParticipationsResult } from '@/src/types';
import { eventParticipationRepository } from '@/src/data/repositories/EventParticipationRepository';

// ==============================================
// USE CASE : Récupérer les participants d'un événement
// ==============================================

export async function getEventParticipantsUseCase(
  eventId: string
): Promise<ParticipationsResult> {
  return eventParticipationRepository.getParticipantsByEvent(eventId);
}