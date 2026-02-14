// src/data/repositories/EventParticipationRepository.ts

import { eventParticipationLocalSource } from '@/src/data/local/EventParticipationLocalSource';
import { eventParticipationRemoteSource } from '@/src/data/remote/EventParticipationRemoteSource';
import { ParticipationResult, ParticipationsResult, VoidResult } from '@/src/types';

// ==============================================
// REPOSITORY : Event Participation
// Couche Data - Point d'entrée unique
// ==============================================

class EventParticipationRepository {

  // Participer à un événement
  async participate(eventId: string, userId: string): Promise<ParticipationResult> {
    try {
      const result = await eventParticipationRemoteSource.participate(eventId, userId);

      if (result.success && result.participation) {
        await eventParticipationLocalSource.add(result.participation);
      }

      return result;
    } catch (error) {
      return { success: false, error: 'Erreur de connexion. Impossible de participer.' };
    }
  }

  // Annuler sa participation
  async cancel(eventId: string, userId: string): Promise<VoidResult> {
    try {
      const result = await eventParticipationRemoteSource.cancel(eventId, userId);

      if (result.success) {
        await eventParticipationLocalSource.delete(eventId, userId);
      }

      return result;
    } catch (error) {
      return { success: false, error: 'Erreur de connexion. Impossible d\'annuler.' };
    }
  }

  // Vérifier si l'utilisateur participe
  async isParticipating(eventId: string, userId: string): Promise<boolean> {
    try {
      return await eventParticipationRemoteSource.isParticipating(eventId, userId);
    } catch (error) {
      // Fallback sur le cache en cas d'erreur réseau
      return await eventParticipationLocalSource.exists(eventId, userId);
    }
  }

  // Récupérer les participants d'un événement
  async getParticipantsByEvent(eventId: string): Promise<ParticipationsResult> {
    try {
      const result = await eventParticipationRemoteSource.getParticipantsByEvent(eventId);

      if (result.success && result.participations) {
        // Mettre à jour le cache pour cet événement
        const all = await eventParticipationLocalSource.getAll();
        const others = all.filter((p) => p.event_id !== eventId);
        await eventParticipationLocalSource.saveAll([...others, ...result.participations]);
      }

      return result;
    } catch (error) {
      // Fallback sur le cache
      const cached = await eventParticipationLocalSource.getByEvent(eventId);
      if (cached.length > 0) {
        return { success: true, participations: cached };
      }
      return { success: false, error: 'Erreur de connexion.' };
    }
  }

  // Récupérer les participations d'un utilisateur
  async getParticipationsByUser(userId: string): Promise<ParticipationsResult> {
    try {
      const result = await eventParticipationRemoteSource.getParticipationsByUser(userId);

      if (result.success && result.participations) {
        const all = await eventParticipationLocalSource.getAll();
        const others = all.filter((p) => p.user_id !== userId);
        await eventParticipationLocalSource.saveAll([...others, ...result.participations]);
      }

      return result;
    } catch (error) {
      const cached = await eventParticipationLocalSource.getByUser(userId);
      if (cached.length > 0) {
        return { success: true, participations: cached };
      }
      return { success: false, error: 'Erreur de connexion.' };
    }
  }
}

export const eventParticipationRepository = new EventParticipationRepository();