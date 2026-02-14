// src/data/remote/ImageUploadService.ts

import { supabase } from './SupabaseClient';

class ImageUploadService {
  
  // Upload une image vers Supabase Storage
  async uploadEventImage(imageUri: string, userId: string): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const fileName = `${userId}/${Date.now()}.jpg`;
      
      // Méthode simple : utiliser fetch pour lire l'image
      const response = await fetch(imageUri);
      const arrayBuffer = await response.arrayBuffer();

      const { data, error } = await supabase.storage
        .from('event-images')
        .upload(fileName, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (error) {
        console.error('Upload error:', error);
        return { success: false, error: 'Erreur lors de l\'upload de l\'image' };
      }

      // Récupérer l'URL publique
      const { data: urlData } = supabase.storage
        .from('event-images')
        .getPublicUrl(fileName);

      return { success: true, url: urlData.publicUrl };
    } catch (error) {
      console.error('Upload error:', error);
      return { success: false, error: 'Erreur lors de l\'upload de l\'image' };
    }
  }

  // Supprimer une image
  async deleteEventImage(imageUrl: string): Promise<void> {
    try {
      const urlParts = imageUrl.split('/event-images/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from('event-images').remove([filePath]);
      }
    } catch (error) {
      console.error('Delete image error:', error);
    }
  }
}

export const imageUploadService = new ImageUploadService();