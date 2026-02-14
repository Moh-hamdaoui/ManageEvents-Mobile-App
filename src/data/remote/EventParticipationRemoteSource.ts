// src/data/remote/EventParticipationRemoteSource.ts

import { supabase } from './SupabaseClient';
import { ParticipationResult, ParticipationsResult, VoidResult } from '@/src/types';

// ==============================================
// SOURCE DISTANTE : Event Participation (Supabase)
// Couche Data - Accès API
// ==============================================

class EventParticipationRemoteSource {

  // Participer à un événement
  async participate(eventId: string, userId: string): Promise<ParticipationResult> {
    const { data, error } = await supabase
      .from('event_participants')
      .insert({
        event_id: eventId,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: this.translateError(error.message) };
    }

    return { success: true, participation: data };
  }

  // Annuler sa participation
  async cancel(eventId: string, userId: string): Promise<VoidResult> {
    const { error } = await supabase
      .from('event_participants')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId);

    if (error) {
      return { success: false, error: this.translateError(error.message) };
    }

    return { success: true };
  }

  // Vérifier si l'utilisateur participe
  async isParticipating(eventId: string, userId: string): Promise<boolean> {
    const { data } = await supabase
      .from('event_participants')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single();

    return !!data;
  }

  // Récupérer les participants d'un événement
  async getParticipantsByEvent(eventId: string): Promise<ParticipationsResult> {
    const { data, error } = await supabase
      .from('event_participants')
      .select(`
        *,
        user:profiles!user_id (
          id,
          username
        )
      `)
      .eq('event_id', eventId);

    if (error) {
      return { success: false, error: this.translateError(error.message) };
    }

    return { success: true, participations: data };
  }

  // Récupérer les participations d'un utilisateur
  async getParticipationsByUser(userId: string): Promise<ParticipationsResult> {
    const { data, error } = await supabase
      .from('event_participations')
      .select(`
        *,
        event:events!event_id (
          id,
          name,
          event_date
        )
      `)
      .eq('user_id', userId);

    if (error) {
      return { success: false, error: this.translateError(error.message) };
    }

    return { success: true, participations: data };
  }

  private translateError(message: string): string {
    const translations: Record<string, string> = {
      'JWT expired': 'Session expirée, veuillez vous reconnecter',
      'duplicate key value': 'Vous participez déjà à cet événement',
      'Failed to fetch': 'Erreur de connexion réseau',
      'violates foreign key constraint': 'Événement ou utilisateur invalide',
    };

    for (const [key, value] of Object.entries(translations)) {
      if (message.includes(key)) {
        return value;
      }
    }

    return message;
  }
}

export const eventParticipationRemoteSource = new EventParticipationRemoteSource();