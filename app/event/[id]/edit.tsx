import { ImagePickerComponent } from '@/components/imagePickerComponent';
import { useAuth } from '@/src/hook/useAuth';
import { useEvents } from '@/src/hook/useEvents';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

export default function EditEventScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, loadEvent, editEvent } = useEvents();
  const { state: authState } = useAuth();

  const event = state.currentEvent;
  const userId = authState.status === 'authenticated' ? authState.user.id : null;
  const isCreator = event?.creator_id === userId;
  const isLoading = state.status === 'loading';

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [address, setAddress] = useState('');
  const [places, setPlaces] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isInitialized, setIsInitialized] = useState(false);

  const formatDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  useEffect(() => {
    if (id) {
      loadEvent(id);
    }
  }, [id]);

  useEffect(() => {
    if (event && !isInitialized) {
      const eventDateObj = new Date(event.event_date);
      setName(event.name);
      setDescription(event.description || '');
      setSelectedDate(eventDateObj);
      setEventDate(formatDate(eventDateObj));
      setEventTime(formatTime(eventDateObj));
      setAddress(event.event_adress);
      setPlaces(event.places.toString());
      setImageUri(event.image_url || null);
      setIsInitialized(true);
    }
  }, [event, isInitialized]);

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

  const parseDateTime = (): Date | null => {
    try {
      const [day, month, year] = eventDate.split('/').map(Number);
      const [hours, minutes] = eventTime.split(':').map(Number);
      return new Date(year, month - 1, day, hours, minutes);
    } catch {
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!validateForm() || !id) return;

    const dateTime = parseDateTime();
    if (!dateTime) {
      Alert.alert('Erreur', 'Date ou heure invalide');
      return;
    }

    if (dateTime < new Date()) {
      Alert.alert('Erreur', 'La date doit être dans le futur');
      return;
    }

    const success = await editEvent(id, {
      name: name.trim(),
      description: description.trim(),
      event_date: dateTime,
      event_adress: address.trim(),
      places: places.trim(),
      image_uri: imageUri || undefined,
    });

    if (success) {
      Alert.alert('Succès', 'Événement modifié avec succès', [
        { text: 'OK', onPress: () => router.push({ pathname: '/event/[id]/page', params: { id } }) },
      ]);
    } else {
      Alert.alert('Erreur', state.error || 'Impossible de modifier l\'événement');
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoading && !event) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4B9EF7" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Événement introuvable.</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)')} style={styles.button}>
          <Text style={styles.buttonText}>Retour à la liste</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!isCreator) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Vous n'êtes pas autorisé à modifier cet événement.</Text>
        <TouchableOpacity onPress={() => router.push({ pathname: '/event/[id]/page', params: { id } })} style={styles.button}>
          <Text style={styles.buttonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Annuler</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Modifier l'événement</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Image de l'événement</Text>
          <ImagePickerComponent
            imageUri={imageUri}
            onImageSelected={setImageUri}
            onImageRemoved={() => setImageUri(null)}
            disabled={isLoading}
          />
        </View>

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

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Date *</Text>
            <TouchableOpacity
              style={[styles.input, errors.eventDate && styles.inputError]}
              onPress={() => setShowDatePicker(true)}
              disabled={isLoading}
            >
              <Text style={{ color: eventDate ? '#000' : '#9CA3AF' }}>
                {eventDate || 'JJ/MM/AAAA'}
              </Text>
            </TouchableOpacity>
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

        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#FFFFFF" />
              <Text style={styles.loadingText}>Enregistrement...</Text>
            </View>
          ) : (
            <Text style={styles.submitButtonText}>Enregistrer les modifications</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        date={selectedDate}
        onConfirm={(date: Date) => {
          setSelectedDate(date);
          setEventDate(formatDate(date));
          setShowDatePicker(false);
        }}
        onCancel={() => setShowDatePicker(false)}
        minimumDate={new Date()}
      />
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  button: {
    backgroundColor: '#4B9EF7',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});