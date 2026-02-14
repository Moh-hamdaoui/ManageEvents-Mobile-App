// src/domain/useCases/events/createEventUseCase.ts

import { EventResult, EventFormData } from '@/src/types';
import { eventRepository } from '@/src/data/repositories/EventRepository';

// ==============================================
// USE CASE : Create Event
// 
// Responsabilités :
// - Valider les données du formulaire
// - Créer l'événement via le repository
// ==============================================

export async function createEventUseCase(data: EventFormData): Promise<EventResult> {
  // Validation du nom
  if (!data.name || !data.name.trim()) {
    return { success: false, error: 'Le nom de l\'événement est requis' };
  }

  if (data.name.trim().length < 3) {
    return { success: false, error: 'Le nom doit contenir au moins 3 caractères' };
  }

  // Validation de la date
  if (!data.event_date) {
    return { success: false, error: 'La date de l\'événement est requise' };
  }

  const eventDate = new Date(data.event_date);
  const now = new Date();

  if (eventDate < now) {
    return { success: false, error: 'La date doit être dans le futur' };
  }

  // Validation de l'adresse
  if (!data.event_adress || !data.event_adress.trim()) {
    return { success: false, error: 'L\'adresse est requise' };
  }

  // Validation des places
  if (!data.places || parseInt(data.places) <= 0) {
    return { success: false, error: 'Le nombre de places doit être supérieur à 0' };
  }

  // Validation de l'image (optionnelle mais si présente, vérifier le format)
  if (data.image_uri) {
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const hasValidExtension = validExtensions.some(ext => 
      data.image_uri!.toLowerCase().includes(ext)
    );
    
    // Vérifier aussi les URIs de type content:// ou file://
    const isValidUri = data.image_uri.startsWith('file://') || 
                       data.image_uri.startsWith('content://') ||
                       data.image_uri.startsWith('ph://') || // iOS Photos
                       hasValidExtension;

    if (!isValidUri) {
      return { success: false, error: 'Format d\'image non supporté' };
    }
  }

  // Appel au repository
  return eventRepository.create({
    name: data.name.trim(),
    event_date: data.event_date,
    event_adress: data.event_adress.trim(),
    places: data.places,
    description: data.description?.trim() || '',
    image_uri: data.image_uri,
  });
}