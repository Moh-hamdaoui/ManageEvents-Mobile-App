// src/domain/state/EventParticipationContext.tsx

import React, { createContext, useReducer, useCallback } from 'react';
import { EventParticipation } from '@/src/types';

import { participateToEventUseCase } from '@/src/domain/useCases/participation/participateToEventUseCase';
import { cancelParticipationUseCase } from '@/src/domain/useCases/participation/cancelParticipationUseCase';
import { checkParticipationUseCase } from '@/src/domain/useCases/participation/checkParticipationUseCase';
import { getEventParticipantsUseCase } from '@/src/domain/useCases/participation/getEventParticipantsUseCase';

// ==============================================
// COUCHE DOMAIN - Gestion de l'état Participation
// ==============================================

// ==================== TYPES ====================

type ParticipationStatus = 'idle' | 'loading' | 'success' | 'error';

interface ParticipationState {
  isParticipating: boolean;
  participants: EventParticipation[];
  status: ParticipationStatus;
  error: string | null;
}

type ParticipationAction =
  | { type: 'LOADING' }
  | { type: 'SET_PARTICIPATING'; value: boolean }
  | { type: 'SET_PARTICIPANTS'; participants: EventParticipation[] }
  | { type: 'PARTICIPATE_SUCCESS'; participation: EventParticipation }
  | { type: 'CANCEL_SUCCESS' }
  | { type: 'ERROR'; error: string }
  | { type: 'RESET' };

// ==================== REDUCER ====================

const initialState: ParticipationState = {
  isParticipating: false,
  participants: [],
  status: 'idle',
  error: null,
};

function participationReducer(
  state: ParticipationState,
  action: ParticipationAction
): ParticipationState {
  switch (action.type) {
    case 'LOADING':
      return { ...state, status: 'loading', error: null };

    case 'SET_PARTICIPATING':
      return { ...state, status: 'success', isParticipating: action.value };

    case 'SET_PARTICIPANTS':
      return { ...state, status: 'success', participants: action.participants };

    case 'PARTICIPATE_SUCCESS':
      return {
        ...state,
        status: 'success',
        isParticipating: true,
        participants: [...state.participants, action.participation],
        error: null,
      };

    case 'CANCEL_SUCCESS':
      return {
        ...state,
        status: 'success',
        isParticipating: false,
        error: null,
      };

    case 'ERROR':
      return { ...state, status: 'error', error: action.error };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

// ==================== CONTEXT ====================

interface ParticipationContextType {
  state: ParticipationState;
  participate: (eventId: string, userId: string) => Promise<boolean>;
  cancelParticipation: (eventId: string, userId: string) => Promise<boolean>;
  checkParticipation: (eventId: string, userId: string) => Promise<void>;
  loadParticipants: (eventId: string) => Promise<void>;
  reset: () => void;
}

export const EventParticipationContext = createContext<ParticipationContextType | null>(null);

// ==================== PROVIDER ====================

interface ParticipationProviderProps {
  children: React.ReactNode;
}

export function EventParticipationProvider({ children }: ParticipationProviderProps) {
  const [state, dispatch] = useReducer(participationReducer, initialState);

  // Participer à un événement
  const participate = useCallback(async (eventId: string, userId: string): Promise<boolean> => {
    dispatch({ type: 'LOADING' });

    const result = await participateToEventUseCase(eventId, userId);

    if (result.success && result.participation) {
      dispatch({ type: 'PARTICIPATE_SUCCESS', participation: result.participation });
      return true;
    } else {
      dispatch({ type: 'ERROR', error: result.error || 'Erreur inconnue' });
      return false;
    }
  }, []);

  // Annuler sa participation
  const cancelParticipation = useCallback(async (eventId: string, userId: string): Promise<boolean> => {
    dispatch({ type: 'LOADING' });

    const result = await cancelParticipationUseCase(eventId, userId);

    if (result.success) {
      dispatch({ type: 'CANCEL_SUCCESS' });
      return true;
    } else {
      dispatch({ type: 'ERROR', error: result.error || 'Erreur inconnue' });
      return false;
    }
  }, []);

  // Vérifier si l'utilisateur participe
  const checkParticipation = useCallback(async (eventId: string, userId: string): Promise<void> => {
    dispatch({ type: 'LOADING' });

    const isParticipating = await checkParticipationUseCase(eventId, userId);
    dispatch({ type: 'SET_PARTICIPATING', value: isParticipating });
  }, []);

  // Charger les participants d'un événement
  const loadParticipants = useCallback(async (eventId: string): Promise<void> => {
    dispatch({ type: 'LOADING' });

    const result = await getEventParticipantsUseCase(eventId);

    if (result.success && result.participations) {
      dispatch({ type: 'SET_PARTICIPANTS', participants: result.participations });
    } else {
      dispatch({ type: 'ERROR', error: result.error || 'Erreur inconnue' });
    }
  }, []);

  // Reset
  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const value: ParticipationContextType = {
    state,
    participate,
    cancelParticipation,
    checkParticipation,
    loadParticipants,
    reset,
  };

  return (
    <EventParticipationContext.Provider value={value}>
      {children}
    </EventParticipationContext.Provider>
  );
}