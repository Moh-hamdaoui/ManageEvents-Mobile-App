// src/data/remote/EventRemoteSource.ts

import { supabase } from './SupabaseClient';
import { Event, EventFormData, EventResult, EventsResult, VoidResult } from '@/src/types';
import { imageUploadService } from './ImageUploadService';

class EventRemoteSource {

  async getAll(): Promise<EventsResult> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Utilisateur non connecté' };
    }

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });

    if (error) {
      return { success: false, error: this.translateError(error.message) };
    }

    return { success: true, events: data as Event[] };
  }

  async getById(id: string): Promise<EventResult> {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        creator:profiles!creator_id (
          id,
          username
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      return { success: false, error: this.translateError(error.message) };
    }

    if (!data) {
      return { success: false, error: 'Événement non trouvé' };
    }

    return { success: true, event: data as Event };
  }

  // Créer un événement avec image
  async create(data: EventFormData): Promise<EventResult> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Utilisateur non connecté' };
    }

    let imageUrl: string | null = null;

    // Upload de l'image si présente
    if (data.image_uri) {
      const uploadResult = await imageUploadService.uploadEventImage(data.image_uri, user.id);
      if (uploadResult.success && uploadResult.url) {
        imageUrl = uploadResult.url;
      } else {
        return { success: false, error: uploadResult.error || 'Erreur upload image' };
      }
    }

    const { data: newEvent, error } = await supabase
      .from('events')
      .insert({
        creator_id: user.id,
        name: data.name,
        event_date: data.event_date.toISOString(),
        event_adress: data.event_adress,
        places: data.places,
        description: data.description || '',
        image_url: imageUrl,
      })
      .select()
      .single();

    if (error) {
      // Supprimer l'image uploadée en cas d'erreur
      if (imageUrl) {
        await imageUploadService.deleteEventImage(imageUrl);
      }
      return { success: false, error: this.translateError(error.message) };
    }

    return { success: true, event: newEvent as Event };
  }

  // Modifier un événement avec image
  async update(id: string, data: EventFormData): Promise<EventResult> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Utilisateur non connecté' };
    }

    let imageUrl: string | undefined = undefined;

    // Upload de la nouvelle image si présente
    if (data.image_uri) {
      // Récupérer l'ancienne image pour la supprimer après
      const { data: oldEvent } = await supabase
        .from('events')
        .select('image_url')
        .eq('id', id)
        .single();

      const uploadResult = await imageUploadService.uploadEventImage(data.image_uri, user.id);
      if (uploadResult.success && uploadResult.url) {
        imageUrl = uploadResult.url;
        
        // Supprimer l'ancienne image
        if (oldEvent?.image_url) {
          await imageUploadService.deleteEventImage(oldEvent.image_url);
        }
      } else {
        return { success: false, error: uploadResult.error || 'Erreur upload image' };
      }
    }

    const updateData: any = {
      name: data.name,
      event_date: data.event_date.toISOString(),
      event_adress: data.event_adress,
      places: data.places,
      description: data.description || '',
    };

    // Ajouter l'image seulement si elle a été mise à jour
    if (imageUrl !== undefined) {
      updateData.image_url = imageUrl;
    }

    const { data: updatedEvent, error } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { success: false, error: this.translateError(error.message) };
    }

    return { success: true, event: updatedEvent as Event };
  }

  async delete(id: string): Promise<VoidResult> {
    // Récupérer l'image avant suppression
    const { data: event } = await supabase
      .from('events')
      .select('image_url')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) {
      return { success: false, error: this.translateError(error.message) };
    }

    // Supprimer l'image associée
    if (event?.image_url) {
      await imageUploadService.deleteEventImage(event.image_url);
    }

    return { success: true };
  }

  private translateError(message: string): string {
    const translations: Record<string, string> = {
      'JWT expired': 'Session expirée, veuillez vous reconnecter',
      'No rows found': 'Événement non trouvé',
      'duplicate key value': 'Cet événement existe déjà',
      'Failed to fetch': 'Erreur de connexion réseau',
    };

    for (const [key, value] of Object.entries(translations)) {
      if (message.includes(key)) {
        return value;
      }
    }

    return message;
  }
}

export const eventRemoteSource = new EventRemoteSource();