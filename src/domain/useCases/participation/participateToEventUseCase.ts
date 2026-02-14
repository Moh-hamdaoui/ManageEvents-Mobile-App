// src/domain/useCases/participation/participateToEventUseCase.ts

import { ParticipationResult } from '@/src/types';
import { eventParticipationRepository } from '@/src/data/repositories/EventParticipationRepository';
import { eventRepository } from '@/src/data/repositories/EventRepository';

export async function participateToEventUseCase(
  eventId: string,
  userId: string
): Promise<ParticipationResult> {
  
  // 1. Vérifier que l'événement existe
  const eventResult = await eventRepository.getById(eventId);
  
  if (!eventResult.success || !eventResult.event) {
    return { success: false, error: 'Événement non trouvé' };
  }

  const event = eventResult.event;

  // 2. Vérifier que l'utilisateur n'est pas le créateur
  if (event.creator_id === userId) {
    return { success: false, error: 'Vous ne pouvez pas participer à votre propre événement' };
  }

  // 3. Vérifier s'il reste des places (places est maintenant directement le nombre restant)
  if (event.places <= 0) {
    return { success: false, error: 'Plus de places disponibles pour cet événement' };
  }

  // 4. Vérifier si déjà participant
  const isAlreadyParticipating = await eventParticipationRepository.isParticipating(eventId, userId);
  
  if (isAlreadyParticipating) {
    return { success: false, error: 'Vous participez déjà à cet événement' };
  }

  // 5. Créer la participation (le trigger décrémente automatiquement places)
  return eventParticipationRepository.participate(eventId, userId);
}