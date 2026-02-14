import AsyncStorage from '@react-native-async-storage/async-storage';
import { Event } from '@/src/types';

// ==============================================
// SOURCE LOCALE : Events
// Couche Data - Stockage local (cache)
// 
// Responsabilités :
// - Cache des événements
// - Fonctionne hors ligne
// - Stockage temporaire
// ==============================================

const STORAGE_KEY = '@events_cache';

class EventLocalSource {

  // Sauvegarder tous les événements en cache
  async saveAll(events: Event[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch (error) {
      console.error('Erreur sauvegarde cache events:', error);
    }
  }

  // Récupérer tous les événements du cache
  async getAll(): Promise<Event[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data) as Event[];
      }
      return [];
    } catch (error) {
      console.error('Erreur lecture cache events:', error);
      return [];
    }
  }

  // Récupérer un événement par ID du cache
  async getById(id: string): Promise<Event | null> {
    try {
      const events = await this.getAll();
      return events.find((e) => e.id === id) || null;
    } catch (error) {
      console.error('Erreur lecture cache event:', error);
      return null;
    }
  }

  // Ajouter un événement au cache
  async add(event: Event): Promise<void> {
    try {
      const events = await this.getAll();
      events.unshift(event); // Ajouter au début
      await this.saveAll(events);
    } catch (error) {
      console.error('Erreur ajout cache event:', error);
    }
  }

  // Mettre à jour un événement dans le cache
  async update(updatedEvent: Event): Promise<void> {
    try {
      const events = await this.getAll();
      const index = events.findIndex((e) => e.id === updatedEvent.id);
      if (index !== -1) {
        events[index] = updatedEvent;
        await this.saveAll(events);
      }
    } catch (error) {
      console.error('Erreur update cache event:', error);
    }
  }

  // Supprimer un événement du cache
  async delete(id: string): Promise<void> {
    try {
      const events = await this.getAll();
      const filtered = events.filter((e) => e.id !== id);
      await this.saveAll(filtered);
    } catch (error) {
      console.error('Erreur suppression cache event:', error);
    }
  }

  // Vider tout le cache
  async clear(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Erreur clear cache events:', error);
    }
  }
}

export const eventLocalSource = new EventLocalSource();