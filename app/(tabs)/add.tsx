// app/(tabs)/add.tsx

import { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useEvents } from '@/src/hook/useEvents';
import { ImagePickerComponent } from '@/components/imagePickerComponent';

export default function AddEventScreen() {
  const router = useRouter();
  const { addEvent, state } = useEvents();

  // État du formulaire
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [address, setAddress] = useState('');
  const [places, setPlaces] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  // État local pour les erreurs de validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isLoading = state.status === 'loading';

  // Validation du formulaire
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Le nom est requis';
    } else if (name.trim().length < 3) {
      newErrors.name = 'Le nom doit contenir au moins 3 caractères';
    }

    if (!eventDate.trim()) {
      newErrors.eventDate = 'La date est requise';
    } else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(eventDate)) {
      newErrors.eventDate = 'Format: JJ/MM/AAAA';
    }

    if (!eventTime.trim()) {
      newErrors.eventTime = 'L\'heure est requise';
    } else if (!/^\d{2}:\d{2}$/.test(eventTime)) {
      newErrors.eventTime = 'Format: HH:MM';
    }

    if (!address.trim()) {
      newErrors.address = 'L\'adresse est requise';
    }

    if (!places.trim()) {
      newErrors.places = 'Le nombre de places est requis';
    } else if (isNaN(Number(places)) || Number(places) <= 0) {
      newErrors.places = 'Entrez un nombre valide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Convertir date et heure en objet Date
  const parseDateTime = (): Date | null => {
    try {
      const [day, month, year] = eventDate.split('/').map(Number);
      const [hours, minutes] = eventTime.split(':').map(Number);
      return new Date(year, month - 1, day, hours, minutes);
    } catch {
      return null;
    }
  };

  // Soumettre le formulaire
  const handleSubmit = async () => {
    if (!validateForm()) return;

    const dateTime = parseDateTime();
    if (!dateTime) {
      Alert.alert('Erreur', 'Date ou heure invalide');
      return;
    }

    // Vérifier que la date est dans le futur
    if (dateTime < new Date()) {
      Alert.alert('Erreur', 'La date doit être dans le futur');
      return;
    }

    const success = await addEvent({
      name: name.trim(),
      description: description.trim(),
      event_date: dateTime,
      event_adress: address.trim(),
      places: places.trim(),
      image_uri: imageUri || undefined,
    });

    if (success) {
      Alert.alert('Succès', 'Événement créé avec succès', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } else {
      Alert.alert('Erreur', state.error || 'Impossible de créer l\'événement');
    }
  };

  // Annuler
  const handleCancel = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Annuler</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouvel événement</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Picker */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Image de l'événement</Text>
          <ImagePickerComponent
            imageUri={imageUri}
            onImageSelected={setImageUri}
            onImageRemoved={() => setImageUri(null)}
            disabled={isLoading}
          />
        </View>

        {/* Nom */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nom de l'événement *</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            placeholder="Ex: Conférence Tech 2025"
            placeholderTextColor="#9CA3AF"
            value={name}
            onChangeText={setName}
            editable={!isLoading}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Décrivez votre événement..."
            placeholderTextColor="#9CA3AF"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            editable={!isLoading}
          />
        </View>

        {/* Date et Heure */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Date *</Text>
            <TextInput
              style={[styles.input, errors.eventDate && styles.inputError]}
              placeholder="JJ/MM/AAAA"
              placeholderTextColor="#9CA3AF"
              value={eventDate}
              onChangeText={setEventDate}
              maxLength={10}
              editable={!isLoading}
            />
            {errors.eventDate && <Text style={styles.errorText}>{errors.eventDate}</Text>}
          </View>

          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Heure *</Text>
            <TextInput
              style={[styles.input, errors.eventTime && styles.inputError]}
              placeholder="HH:MM"
              placeholderTextColor="#9CA3AF"
              value={eventTime}
              onChangeText={setEventTime}
              maxLength={5}
              editable={!isLoading}
            />
            {errors.eventTime && <Text style={styles.errorText}>{errors.eventTime}</Text>}
          </View>
        </View>

        {/* Adresse */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Adresse *</Text>
          <TextInput
            style={[styles.input, errors.address && styles.inputError]}
            placeholder="Ex: 123 Rue de Paris, 75001 Paris"
            placeholderTextColor="#9CA3AF"
            value={address}
            onChangeText={setAddress}
            editable={!isLoading}
          />
          {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
        </View>

        {/* Nombre de places */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre de places *</Text>
          <TextInput
            style={[styles.input, errors.places && styles.inputError]}
            placeholder="Ex: 50"
            placeholderTextColor="#9CA3AF"
            value={places}
            onChangeText={setPlaces}
            keyboardType="numeric"
            editable={!isLoading}
          />
          {errors.places && <Text style={styles.errorText}>{errors.places}</Text>}
        </View>

        {/* Bouton Créer */}
        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#FFFFFF" />
              <Text style={styles.loadingText}>Création en cours...</Text>
            </View>
          ) : (
            <Text style={styles.submitButtonText}>Créer l'événement</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  cancelButton: {
    padding: 8,
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  placeholder: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  textArea: {
    height: 100,
    paddingTop: 14,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfWidth: {
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  submitButtonDisabled: {
    backgroundColor: '#93C5FD',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});