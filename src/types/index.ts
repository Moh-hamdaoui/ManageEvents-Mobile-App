// ==============================================
// TYPES - Authentification & Événements
// ==============================================

// ==================== ENTITÉS ====================

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Event {
  id: string;
  creator_id: string;
  name: string;
  created_at: string;
  event_date: string;
  event_adress: string;
  image_url?: string;
  places: number;
  description: string;

  creator?: {
    id: string;
    username?: string
  };
}

export interface EventParticipation {
  id: string;
  event_id: string;
  user_id: string;
  participated_at: string;
}

export interface ParticipationsResult {
  success: boolean;
  error?: string;
  participations?: EventParticipation[];
}

export interface ParticipationResult {
  success: boolean;
  error?: string;
  participation?: EventParticipation;
}

export interface EventFormData {
  name: string;
  event_date: Date;
  event_adress: string;
  places: string;
  image_uri?: string;
  description?: string;
}

// ==================== ÉTATS ====================

export type AuthState =
  | { status: 'loading' }
  | { status: 'unauthenticated' }
  | { status: 'authenticated'; user: User }
  | { status: 'error'; error: string };

// ==================== RÉSULTATS ====================

export type AuthResult =
  | { success: true; user: User }
  | { success: false; error: string };

export type EventResult =
  | { success: true; event: Event }
  | { success: false; error: string };

export type EventsResult =
  | { success: true; events: Event[] }
  | { success: false; error: string };

export type VoidResult =
  | { success: true }
  | { success: false; error: string };
