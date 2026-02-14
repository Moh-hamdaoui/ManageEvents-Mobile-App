import { EventsResult } from '@/src/types';
import { eventRepository } from '@/src/data/repositories/EventRepository';

// ==============================================
// USE CASE : Get Events
// 
// Responsabilités :
// - Récupérer tous les événements de l'utilisateur
// ==============================================

export async function getEventsUseCase(): Promise<EventsResult> {
  return eventRepository.getAll();
}