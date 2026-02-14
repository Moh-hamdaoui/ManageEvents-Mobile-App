import { eventLocalSource } from '@/src/data/local/EventLocalSource';
import { eventRemoteSource } from '@/src/data/remote/EventRemoteSource';
import { EventFormData, EventResult, EventsResult, VoidResult } from '@/src/types';

// ==============================================
// REPOSITORY : Events
// Couche Data - Point d'entrée unique
// 
// Responsabilités :
// - Coordonner sources locale et distante
// - Implémenter la stratégie offline-first
// - Gérer le cache
// ==============================================

class EventRepository {

  // Récupérer tous les événements
  async getAll(): Promise<EventsResult> {
    try {
      // 1. Essayer de récupérer depuis Supabase
      const result = await eventRemoteSource.getAll();

      if (result.success) {
        // 2. Mettre à jour le cache local
        await eventLocalSource.saveAll(result.events);
        return result;
      }

      // 3. En cas d'erreur, utiliser le cache
      const cachedEvents = await eventLocalSource.getAll();
      if (cachedEvents.length > 0) {
        return { success: true, events: cachedEvents };
      }

      return result; // Retourner l'erreur originale
    } catch (error) {
      // 4. Erreur réseau → utiliser le cache
      const cachedEvents = await eventLocalSource.getAll();
      if (cachedEvents.length > 0) {
        return { success: true, events: cachedEvents };
      }
      return { success: false, error: 'Erreur de connexion. Vérifiez votre réseau.' };
    }
  }

  // Récupérer un événement par ID
  async getById(id: string): Promise<EventResult> {
    try {
      // 1. Essayer depuis Supabase
      const result = await eventRemoteSource.getById(id);

      if (result.success) {
        // 2. Mettre à jour le cache
        await eventLocalSource.update(result.event);
        return result;
      }

      // 3. En cas d'erreur, chercher dans le cache
      const cachedEvent = await eventLocalSource.getById(id);
      if (cachedEvent) {
        return { success: true, event: cachedEvent };
      }

      return result;
    } catch (error) {
      // 4. Erreur réseau → utiliser le cache
      const cachedEvent = await eventLocalSource.getById(id);
      if (cachedEvent) {
        return { success: true, event: cachedEvent };
      }
      return { success: false, error: 'Erreur de connexion. Vérifiez votre réseau.' };
    }
  }

  // Créer un événement
  async create(data: EventFormData): Promise<EventResult> {
    try {
      // 1. Créer sur Supabase
      const result = await eventRemoteSource.create(data);

      if (result.success) {
        // 2. Ajouter au cache local
        await eventLocalSource.add(result.event);
      }

      return result;
    } catch (error) {
      return { success: false, error: 'Erreur de connexion. Impossible de créer l\'événement.' };
    }
  }

  // Modifier un événement
  async update(id: string, data: EventFormData): Promise<EventResult> {
    try {
      // 1. Modifier sur Supabase
      const result = await eventRemoteSource.update(id, data);

      if (result.success) {
        // 2. Mettre à jour le cache local
        await eventLocalSource.update(result.event);
      }

      return result;
    } catch (error) {
      return { success: false, error: 'Erreur de connexion. Impossible de modifier l\'événement.' };
    }
  }

  // Supprimer un événement
  async delete(id: string): Promise<VoidResult> {
    try {
      // 1. Supprimer sur Supabase
      const result = await eventRemoteSource.delete(id);

      if (result.success) {
        // 2. Supprimer du cache local
        await eventLocalSource.delete(id);
      }

      return result;
    } catch (error) {
      return { success: false, error: 'Erreur de connexion. Impossible de supprimer l\'événement.' };
    }
  }
}

// Export singleton
export const eventRepository = new EventRepository();