// HomeScreen.tsx

import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  ScrollView,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/hook/useAuth';
import { useEvents } from '@/src/hook/useEvents';
import { Event } from '@/src/types';
import { useState, useMemo } from 'react';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 48;

// Images par défaut pour les événements (tu peux les remplacer par tes propres images)
const DEFAULT_IMAGES = [
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
  'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
  'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
  'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800',
];

export default function HomeScreen() {
  const router = useRouter();
  const { state: authState } = useAuth();
  const { state, loadEvents } = useEvents();
  const [searchQuery, setSearchQuery] = useState('');

  const userName = authState.status === 'authenticated'
    ? authState.user.email.split('@')[0]
    : 'Utilisateur';

  const isLoading = state.status === 'loading';
  const events = state.events;
  const error = state.error;

  // Filtrer les événements
  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) {
      return events;
    }
    
    const query = searchQuery.toLowerCase().trim();
    
    return events.filter(event => {
      const matchesName = event.name?.toLowerCase().includes(query);
      const matchesDescription = event.description?.toLowerCase().includes(query);
      const matchesAddress = event.event_adress?.toLowerCase().includes(query);
      
      return matchesName || matchesDescription || matchesAddress;
    });
  }, [events, searchQuery]);

  const onRefresh = () => {
    loadEvents();
  };

  const handleEventPress = (event_id: string) => {
    router.push({
      pathname: "../event/[id]/page",
      params: { id: event_id },
    });
  };

  const handleAddEvent = () => {
    router.push('/(tabs)/add');
  };

  // Obtenir une image aléatoire pour un événement
  const getEventImage = (index: number) => {
    return DEFAULT_IMAGES[index % DEFAULT_IMAGES.length];
  };

  // Formater la date en badge
  const formatDateBadge = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase(),
    };
  };

  // Rendu d'un événement
  const renderEvent = ({ item, index }: { item: Event; index: number }) => {
    const isFull = item.places <= 0;
    const dateBadge = formatDateBadge(item.event_date);

     const imageSource = item.image_url 
    ? { uri: item.image_url }
    : { uri: DEFAULT_IMAGES[index % DEFAULT_IMAGES.length] };
    
    return (
      <TouchableOpacity
        style={styles.eventCard}
        onPress={() => handleEventPress(item.id)}
        activeOpacity={0.9}
      >
        <ImageBackground
          source={imageSource}
          style={styles.eventImage}
          imageStyle={styles.eventImageStyle}
        >
          {/* Overlay gradient */}
          <View style={styles.imageOverlay} />
          
          {/* Badge date */}
          <View style={styles.dateBadge}>
            <Text style={styles.dateBadgeDay}>{dateBadge.day}</Text>
            <Text style={styles.dateBadgeMonth}>{dateBadge.month}</Text>
          </View>

          {/* Badge COMPLET */}
          {isFull && (
            <View style={styles.fullBadge}>
              <Text style={styles.fullBadgeText}>COMPLET</Text>
            </View>
          )}
        </ImageBackground>

        {/* Contenu */}
        <View style={styles.eventContent}>
          <View style={styles.eventHeader}>
            <Text style={styles.eventTitle} numberOfLines={1}>
              {item.name}
            </Text>
          </View>

          <View style={styles.eventLocation}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText} numberOfLines={1}>
              {item.event_adress || 'Adresse non spécifiée'}
            </Text>
          </View>

          <View style={styles.eventFooter}>
            {/* Avatars participants (simulé) */}
            <View style={styles.participantsRow}>
              <View style={styles.avatarStack}>
                <View style={[styles.avatar, { backgroundColor: '#FF6B6B' }]} />
                <View style={[styles.avatar, styles.avatarOverlap, { backgroundColor: '#4ECDC4' }]} />
                <View style={[styles.avatar, styles.avatarOverlap2, { backgroundColor: '#45B7D1' }]} />
              </View>
              <Text style={styles.participantsText}>
                {isFull ? 'Complet' : `${item.places} places`}
              </Text>
            </View>

            {/* Bouton réserver */}
            <TouchableOpacity
              style={[
                styles.bookButton,
                isFull && styles.bookButtonDisabled
              ]}
              disabled={isFull}
              onPress={() => handleEventPress(item.id)}
            >
              <Text style={[styles.bookButtonText, isFull && styles.bookButtonTextDisabled]}>
                {isFull ? 'Complet' : 'Réserver'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Liste vide
  const renderEmptyList = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>⚠️</Text>
          <Text style={styles.emptyTitle}>Erreur</Text>
          <Text style={styles.emptySubtitle}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📅</Text>
        <Text style={styles.emptyTitle}>Aucun événement</Text>
        <Text style={styles.emptySubtitle}>
          Créez votre premier événement en appuyant sur le bouton +
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.userInfo}>
            <View style={styles.userAvatar}>
              <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
                <Text style={styles.userAvatarText}>
                  {userName.charAt(0).toUpperCase()}
                </Text>
              </TouchableOpacity> 
            </View>
            <View>
              <Text style={styles.welcomeText}>Bienvenue 👋</Text>
              <Text style={styles.userName}>{userName}</Text>
            </View>
          </View>
        </View>

        {/* Barre de recherche */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un événement..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Section événements */}
      <View style={styles.eventsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Événements populaires</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>Voir tout</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredEvents}
          renderItem={renderEvent}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyList}
          refreshControl={
            <RefreshControl
              refreshing={isLoading && events.length > 0}
              onRefresh={onRefresh}
              colors={['#3B82F6']}
              tintColor="#3B82F6"
            />
          }
        />
      </View>

      {/* Bouton Ajouter */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAddEvent}
        activeOpacity={0.8}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  // Header
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  welcomeText: {
    fontSize: 14,
    color: '#6B7280',
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationIcon: {
    fontSize: 20,
  },
  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 50,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Events Section
  eventsSection: {
    flex: 1,
    paddingTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  seeAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  // Event Card
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
  },
  eventImage: {
    height: 180,
    justifyContent: 'flex-start',
    padding: 16,
  },
  eventImageStyle: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  dateBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    alignItems: 'center',
  },
  dateBadgeDay: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  dateBadgeMonth: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  fullBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  fullBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Event Content
  eventContent: {
    padding: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginRight: 12,
  },
  favoriteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  locationText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarStack: {
    flexDirection: 'row',
    marginRight: 8,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarOverlap: {
    marginLeft: -10,
  },
  avatarOverlap2: {
    marginLeft: -10,
  },
  participantsText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  bookButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  bookButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  bookButtonTextDisabled: {
    color: '#9CA3AF',
  },
  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    flex: 1,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // Add Button
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  addButtonText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
    marginTop: -2,
  },
});