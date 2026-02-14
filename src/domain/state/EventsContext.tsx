import React, { createContext, useReducer, useCallback, useEffect } from 'react';
import { Event, EventFormData } from '@/src/types';

// Import des use cases
import { getEventsUseCase } from '@/src/domain/useCases/events/getEventsUseCase';
import { getEventUseCase } from '@/src/domain/useCases/events/getEventUseCase';
import { createEventUseCase } from '@/src/domain/useCases/events/createEventUseCase';
import { updateEventUseCase } from '@/src/domain/useCases/events/updateEventUseCase';
import { deleteEventUseCase } from '@/src/domain/useCases/events/deleteEventUseCase';

// ==============================================
// COUCHE DOMAIN - Gestion de l'état Events
// 
// Responsabilités :
// - Gérer l'état (loading, error, success)
// - Orchestrer les use cases
// - Fournir les actions à l'UI
// ==============================================

// ==================== TYPES ====================

type EventsState = {
  events: Event[];
  currentEvent: Event | null;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
};

type EventsAction =
  | { type: 'EVENTS_LOADING' }
  | { type: 'EVENTS_SUCCESS'; events: Event[] }
  | { type: 'EVENTS_ERROR'; error: string }
  | { type: 'EVENT_LOADED'; event: Event }
  | { type: 'EVENT_ADDED'; event: Event }
  | { type: 'EVENT_UPDATED'; event: Event }
  | { type: 'EVENT_DELETED'; eventId: string }
  | { type: 'CLEAR_CURRENT_EVENT' };

// ==================== REDUCER ====================

const initialState: EventsState = {
  events: [],
  currentEvent: null,
  status: 'idle',
  error: null,
};

function eventsReducer(state: EventsState, action: EventsAction): EventsState {
  switch (action.type) {
    case 'EVENTS_LOADING':
      return { ...state, status: 'loading', error: null };

    case 'EVENTS_SUCCESS':
      return { ...state, status: 'success', events: action.events, error: null };

    case 'EVENTS_ERROR':
      return { ...state, status: 'error', error: action.error };

    case 'EVENT_LOADED':
      return { ...state, status: 'success', currentEvent: action.event, error: null };

    case 'EVENT_ADDED':
      return {
        ...state,
        status: 'success',
        events: [action.event, ...state.events],
        error: null,
      };

    case 'EVENT_UPDATED':
      return {
        ...state,
        status: 'success',
        events: state.events.map((e) =>
          e.id === action.event.id ? action.event : e
        ),
        currentEvent: action.event,
        error: null,
      };

    case 'EVENT_DELETED':
      return {
        ...state,
        status: 'success',
        events: state.events.filter((e) => e.id !== action.eventId),
        currentEvent: null,
        error: null,
      };

    case 'CLEAR_CURRENT_EVENT':
      return { ...state, currentEvent: null };

    default:
      return state;
  }
}

// ==================== CONTEXT ====================

interface EventsContextType {
  // État
  state: EventsState;

  // Actions
  loadEvents: () => Promise<void>;
  loadEvent: (id: string) => Promise<void>;
  addEvent: (data: EventFormData) => Promise<boolean>;
  editEvent: (id: string, data: EventFormData) => Promise<boolean>;
  removeEvent: (id: string) => Promise<boolean>;
  clearCurrentEvent: () => void;
}

export const EventsContext = createContext<EventsContextType | null>(null);

// ==================== PROVIDER ====================

interface EventsProviderProps {
  children: React.ReactNode;
}

export function EventsProvider({ children }: EventsProviderProps) {
  const [state, dispatch] = useReducer(eventsReducer, initialState);

  // Charger les événements au démarrage
  useEffect(() => {
    loadEvents();
  }, []);

  // Action : Charger tous les événements
  const loadEvents = useCallback(async () => {
    dispatch({ type: 'EVENTS_LOADING' });

    const result = await getEventsUseCase();

    if (result.success) {
      dispatch({ type: 'EVENTS_SUCCESS', events: result.events });
    } else {
      dispatch({ type: 'EVENTS_ERROR', error: result.error });
    }
  }, []);

  // Action : Charger un événement par ID
  const loadEvent = useCallback(async (id: string) => {
    dispatch({ type: 'EVENTS_LOADING' });

    const result = await getEventUseCase(id);

    if (result.success) {
      dispatch({ type: 'EVENT_LOADED', event: result.event });
    } else {
      dispatch({ type: 'EVENTS_ERROR', error: result.error });
    }
  }, []);

  // Action : Ajouter un événement
  const addEvent = useCallback(async (data: EventFormData): Promise<boolean> => {
    dispatch({ type: 'EVENTS_LOADING' });

    const result = await createEventUseCase(data);

    if (result.success) {
      dispatch({ type: 'EVENT_ADDED', event: result.event });
      return true;
    } else {
      dispatch({ type: 'EVENTS_ERROR', error: result.error });
      return false;
    }
  }, []);

  // Action : Modifier un événement
  const editEvent = useCallback(async (id: string, data: EventFormData): Promise<boolean> => {
    dispatch({ type: 'EVENTS_LOADING' });

    const result = await updateEventUseCase(id, data);

    if (result.success) {
      dispatch({ type: 'EVENT_UPDATED', event: result.event });
      return true;
    } else {
      dispatch({ type: 'EVENTS_ERROR', error: result.error });
      return false;
    }
  }, []);

  // Action : Supprimer un événement
  const removeEvent = useCallback(async (id: string): Promise<boolean> => {
    dispatch({ type: 'EVENTS_LOADING' });

    const result = await deleteEventUseCase(id);

    if (result.success) {
      dispatch({ type: 'EVENT_DELETED', eventId: id });
      return true;
    } else {
      dispatch({ type: 'EVENTS_ERROR', error: result.error });
      return false;
    }
  }, []);

  // Action : Vider l'événement courant
  const clearCurrentEvent = useCallback(() => {
    dispatch({ type: 'CLEAR_CURRENT_EVENT' });
  }, []);

  // Valeur fournie à l'UI
  const value: EventsContextType = {
    state,
    loadEvents,
    loadEvent,
    addEvent,
    editEvent,
    removeEvent,
    clearCurrentEvent,
  };

  return (
    <EventsContext.Provider value={value}>
      {children}
    </EventsContext.Provider>
  );
}