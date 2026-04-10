// DetailsScreen.tsx

import { useAuth } from "@/src/hook/useAuth";
import { useEventParticipation } from "@/src/hook/useEventParticipation";
import { useEvents } from "@/src/hook/useEvents";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function DetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const { state: authState } = useAuth();
  const { state: eventsState, loadEvent, removeEvent } = useEvents();
  const {
    state: participationState,
    participate,
    cancelParticipation,
    checkParticipation,
  } = useEventParticipation();

  // Données utiles
  const userId = authState.status === "authenticated" ? authState.user.id : null;
  const event = eventsState.currentEvent;
  const isCreator = event?.creator_id === userId;
  const isLoading = eventsState.status === "loading";
  const isParticipationLoading = participationState.status === "loading";
  
  // Gestion des places (avec trigger, places = places restantes)
  const availablePlaces = event?.places ?? 0;
  const isFull = availablePlaces <= 0;

  // Charger l'événement au montage
  useEffect(() => {
    if (id) {
      loadEvent(id);
    }
  }, [id]);

  // Vérifier si l'utilisateur participe déjà
  useEffect(() => {
    if (id && userId) {
      checkParticipation(id, userId);
    }
  }, [id, userId]);

  // Handler pour participer / annuler
  const handleParticipation = async () => {
    if (!id || !userId) {
      Alert.alert("Erreur", "Vous devez être connecté pour participer");
      return;
    }

    if (participationState.isParticipating) {
      const success = await cancelParticipation(id, userId);
      if (success) {
        Alert.alert("Succès", "Votre participation a été annulée");
        loadEvent(id);
      } else {
        Alert.alert("Erreur", participationState.error || "Impossible d'annuler");
      }
    } else {
      const success = await participate(id, userId);
      if (success) {
        Alert.alert("Succès", "Vous participez à cet événement !");
        loadEvent(id);
      } else {
        Alert.alert("Erreur", participationState.error || "Impossible de participer");
      }
    }
  };

  // Handler pour supprimer l'événement
  const handleDelete = () => {
    Alert.alert(
      'Supprimer l\'événement',
      'Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: async () => {
          const success = await removeEvent(id);
          if (success) {
            Alert.alert('Succès', 'Événement supprimé');
            router.push('/(tabs)');
          } else {
            Alert.alert('Erreur', eventsState.error || 'Impossible de supprimer l\'événement');
          }
        }},
      ]
    );
  };

  const handleEdit = () => {
    if (!id) return;
    router.push({ pathname: '/event/[id]/edit', params: { id } });
  };

  const handleReturnToEventsList = () => {
    router.push("/(tabs)");
  };

  // État de chargement
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4B9EF7" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  // Événement non trouvé
  if (!event) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Événement non trouvé.</Text>
        <TouchableOpacity onPress={handleReturnToEventsList} style={styles.button}>
          <Text style={styles.buttonText}>Retour à la liste</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Badge COMPLET si plus de places */}
      {isFull && (
        <View style={styles.fullBanner}>
          <Text style={styles.fullBannerText}>🚫 ÉVÉNEMENT COMPLET</Text>
        </View>
      )}

      {/* Titre */}
      <Text style={styles.title}>{event.name}</Text>

      {/* Créateur */}
      <Text style={styles.label}>Créé par :</Text>
      <Text style={styles.value}>
        {event.creator?.username ?? "Utilisateur inconnu"}
      </Text>

      {/* Date */}
      <Text style={styles.label}>Date :</Text>
      <Text style={styles.value}>
        {new Date(event.event_date).toLocaleDateString("fr-FR", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>

      {/* Adresse */}
      <Text style={styles.label}>Adresse :</Text>
      <Text style={styles.value}>{event.event_adress}</Text>

      {/* Places avec indicateur visuel */}
      <Text style={styles.label}>Places disponibles :</Text>
      <View style={styles.placesContainer}>
        <View style={[styles.placesBadge, isFull ? styles.placesBadgeFull : styles.placesBadgeAvailable]}>
          <Text style={[styles.placesNumber, isFull && styles.placesNumberFull]}>
            {availablePlaces}
          </Text>
          <Text style={[styles.placesLabel, isFull && styles.placesLabelFull]}>
            {isFull ? "Complet" : availablePlaces === 1 ? "place" : "places"}
          </Text>
        </View>
      </View>

      {/* Description */}
      <Text style={styles.label}>Description :</Text>
      <Text style={styles.value}>
        {event.description || "Aucune description"}
      </Text>

      {/* Bouton Participation */}
      {!isCreator && userId && (
        <TouchableOpacity
          onPress={handleParticipation}
          style={[
            styles.participateButton,
            participationState.isParticipating && styles.cancelButton,
            (isFull && !participationState.isParticipating) && styles.disabledButton,
          ]}
          disabled={isParticipationLoading || (isFull && !participationState.isParticipating)}
        >
          {isParticipationLoading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.buttonText}>
              {participationState.isParticipating
                ? "❌ Annuler ma participation"
                : isFull
                  ? "🚫 Complet"
                  : "Participer"}
            </Text>
          )}
        </TouchableOpacity>
      )}

      {/* Message si créateur */}
      {isCreator && (
        <View style={styles.creatorBadge}>
          <Text style={styles.creatorText}>
            Vous êtes le créateur de cet événement
          </Text>
        </View>
      )}

      {/* Bouton Modifier si créateur */}
      {isCreator && (
        <TouchableOpacity
          onPress={handleEdit}
          style={styles.editButton}
          disabled={isLoading}
        >
          <Text style={styles.editButtonText}>Modifier l'événement</Text>
        </TouchableOpacity>
      )}

      {/* Bouton Supprimer si créateur */}
      {isCreator && (
        <TouchableOpacity
          onPress={handleDelete}
          style={styles.deleteButton}
          disabled={isLoading}
        >
          <Text style={styles.deleteButtonText}>Supprimer l'événement</Text>
        </TouchableOpacity>
      )}

      {/* Message si non connecté */}
      {!userId && (
        <View style={styles.warningBadge}>
          <Text style={styles.warningText}>
            🔒 Connectez-vous pour participer
          </Text>
        </View>
      )}

      {/* Statut de participation */}
      {participationState.isParticipating && !isCreator && (
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>✓ Vous participez à cet événement</Text>
        </View>
      )}

      {/* Bouton Retour */}
      <TouchableOpacity
        onPress={handleReturnToEventsList}
        style={styles.backButton}
      >
        <Text style={styles.buttonText}>← Retour à la liste</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  // Banner complet
  fullBanner: {
    backgroundColor: "#dc3545",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 35,
    marginBottom: 10,
    alignItems: "center",
  },
  fullBannerText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 20,
    color: "#333",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 16,
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 16,
    marginTop: 4,
    color: "#333",
    lineHeight: 22,
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  // Places
  placesContainer: {
    marginTop: 8,
  },
  placesBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  placesBadgeAvailable: {
    backgroundColor: "#d4edda",
  },
  placesBadgeFull: {
    backgroundColor: "#f8d7da",
  },
  placesNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#28a745",
    marginRight: 8,
  },
  placesNumberFull: {
    color: "#dc3545",
  },
  placesLabel: {
    fontSize: 16,
    color: "#28a745",
    fontWeight: "500",
  },
  placesLabelFull: {
    color: "#dc3545",
  },
  // Boutons
  button: {
    backgroundColor: "#4B9EF7",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  backButton: {
    marginTop: 20,
    backgroundColor: "#6c757d",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  participateButton: {
    marginTop: 30,
    backgroundColor: "#28a745",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#dc3545",
  },
  editButton: {
    marginTop: 20,
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  editButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  deleteButton: {
    marginTop: 20,
    backgroundColor: "#dc3545",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: "#adb5bd",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  // Badges
  creatorBadge: {
    marginTop: 24,
    backgroundColor: "#e3f2fd",
    padding: 14,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#2196f3",
  },
  creatorText: {
    color: "#1565c0",
    fontWeight: "500",
    fontSize: 15,
  },
  warningBadge: {
    marginTop: 24,
    backgroundColor: "#fff3e0",
    padding: 14,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#ff9800",
  },
  warningText: {
    color: "#e65100",
    fontWeight: "500",
    fontSize: 15,
  },
  statusBadge: {
    marginTop: 16,
    backgroundColor: "#e8f5e9",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  statusText: {
    color: "#2e7d32",
    fontWeight: "600",
    fontSize: 15,
  },
});