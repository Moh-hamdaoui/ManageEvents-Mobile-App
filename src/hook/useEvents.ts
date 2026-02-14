import { useContext } from 'react';
import { EventsContext } from '@/src/domain/state/EventsContext';

// ==============================================
// HOOK : useEvents
// Rôle : Connecter la couche UI à la couche Domain
// 
// L'UI utilise CE HOOK, jamais les use cases directement
// ==============================================

export function useEvents() {
  const context = useContext(EventsContext);

  if (!context) {
    throw new Error('Erreur contexte useEvent');
  }

  return context;
}
