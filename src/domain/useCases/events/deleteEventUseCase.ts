import { VoidResult } from '@/src/types';
import { eventRepository } from '@/src/data/repositories/EventRepository';

// ==============================================
// USE CASE : Delete Event
// 
// Responsabilités :
// - Valider l'ID
// - Supprimer l'événement via le repository
// ==============================================

export async function deleteEventUseCase(id: string): Promise<VoidResult> {
  // Validation
  if (!id || !id.trim()) {
    return { success: false, error: 'ID de l\'événement requis' };
  }

  return eventRepository.delete(id);
}