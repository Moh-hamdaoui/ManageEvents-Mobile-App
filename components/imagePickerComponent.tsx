// src/components/ImagePickerComponent.tsx

import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface ImagePickerComponentProps {
  imageUri: string | null;
  onImageSelected: (uri: string) => void;
  onImageRemoved: () => void;
  disabled?: boolean;
}

export function ImagePickerComponent({
  imageUri,
  onImageSelected,
  onImageRemoved,
  disabled = false,
}: ImagePickerComponentProps) {

  // Demander les permissions
  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
      Alert.alert(
        'Permissions requises',
        'Veuillez autoriser l\'accès à la caméra et à la galerie pour ajouter une image.'
      );
      return false;
    }
    return true;
  };

  // Ouvrir le sélecteur d'image
  const handlePickImage = async () => {
    if (disabled) return;

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    Alert.alert(
      'Ajouter une image',
      'Choisissez une option',
      [
        {
          text: 'Prendre une photo',
          onPress: () => openCamera(),
        },
        {
          text: 'Choisir depuis la galerie',
          onPress: () => openGallery(),
        },
        {
          text: 'Annuler',
          style: 'cancel',
        },
      ]
    );
  };

  // Ouvrir la caméra
  const openCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      onImageSelected(result.assets[0].uri);
    }
  };

  // Ouvrir la galerie
  const openGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      onImageSelected(result.assets[0].uri);
    }
  };

  // Supprimer l'image
  const handleRemoveImage = () => {
    Alert.alert(
      'Supprimer l\'image',
      'Voulez-vous vraiment supprimer cette image ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: onImageRemoved },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {imageUri ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} />
          <View style={styles.imageActions}>
            <TouchableOpacity
              style={styles.changeButton}
              onPress={handlePickImage}
              disabled={disabled}
            >
              <Text style={styles.changeButtonText}>Changer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={handleRemoveImage}
              disabled={disabled}
            >
              <Text style={styles.removeButtonText}>Supprimer</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.placeholder}
          onPress={handlePickImage}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <Text style={styles.placeholderIcon}>📷</Text>
          <Text style={styles.placeholderText}>Ajouter une image</Text>
          <Text style={styles.placeholderSubtext}>Appuyez pour choisir</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  placeholder: {
    height: 180,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  imageContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 16,
  },
  imageActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 12,
  },
  changeButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  changeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  removeButton: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  removeButtonText: {
    color: '#DC2626',
    fontWeight: '600',
  },
});