import { useContext } from 'react';
import { EventParticipationContext } from '@/src/domain/state/EventParticipationContext';

// ==============================================
// HOOK : useEventParticipation
// Rôle : Connecter la couche UI à la couche Domain
// 
// L'UI utilise CE HOOK, jamais les use cases directement
// ==============================================

export function useEventParticipation() {
  const context = useContext(EventParticipationContext);

  if (!context) {
    throw new Error('Erreur contexte useEventParticipation');
  }

  return context;
}
