// src/data/local/EventParticipationLocalSource.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { EventParticipation } from '@/src/types';

// ==============================================
// SOURCE LOCALE : Event Participation
// Couche Data - Stockage local (cache)
// ==============================================

const STORAGE_KEY = '@event_participations_cache';

class EventParticipationLocalSource {

  // Sauvegarder toutes les participations
  async saveAll(participations: EventParticipation[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(participations));
    } catch (error) {
      console.error('Erreur sauvegarde cache participations:', error);
    }
  }

  // Récupérer toutes les participations
  async getAll(): Promise<EventParticipation[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erreur lecture cache participations:', error);
      return [];
    }
  }

  // Vérifier si une participation existe en cache
  async exists(eventId: string, userId: string): Promise<boolean> {
    const participations = await this.getAll();
    return participations.some(
      (p) => p.event_id === eventId && p.user_id === userId
    );
  }

  // Ajouter une participation
  async add(participation: EventParticipation): Promise<void> {
    try {
      const participations = await this.getAll();
      participations.push(participation);
      await this.saveAll(participations);
    } catch (error) {
      console.error('Erreur ajout cache participation:', error);
    }
  }

  // Supprimer une participation
  async delete(eventId: string, userId: string): Promise<void> {
    try {
      const participations = await this.getAll();
      const filtered = participations.filter(
        (p) => !(p.event_id === eventId && p.user_id === userId)
      );
      await this.saveAll(filtered);
    } catch (error) {
      console.error('Erreur suppression cache participation:', error);
    }
  }

  // Récupérer les participations par événement
  async getByEvent(eventId: string): Promise<EventParticipation[]> {
    const participations = await this.getAll();
    return participations.filter((p) => p.event_id === eventId);
  }

  // Récupérer les participations par utilisateur
  async getByUser(userId: string): Promise<EventParticipation[]> {
    const participations = await this.getAll();
    return participations.filter((p) => p.user_id === userId);
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Erreur clear cache participations:', error);
    }
  }
}

export const eventParticipationLocalSource = new EventParticipationLocalSource();