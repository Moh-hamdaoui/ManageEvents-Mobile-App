import { EventResult } from '@/src/types';
import { eventRepository } from '@/src/data/repositories/EventRepository';

// ==============================================
// USE CASE : Get Event by ID
// 
// Responsabilités :
// - Valider l'ID
// - Récupérer un événement spécifique
// ==============================================

export async function getEventUseCase(id: string): Promise<EventResult> {
  
  if (!id || !id.trim()) {
    return { success: false, error: 'ID de l\'événement requis' };
  }

  return eventRepository.getById(id);
}