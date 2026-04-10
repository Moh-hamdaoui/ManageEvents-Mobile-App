# 📅 Events Manager

Application mobile de gestion d'événements développée avec React Native, Expo et Supabase.

## 📱 Fonctionnalités

- ✅ Authentification (inscription, connexion, déconnexion)
- ✅ Création d'événements avec image
- ✅ Liste des événements avec recherche
- ✅ Détail d'un événement
- ✅ Modification d'un evenement
- ✅ Suppression d'un événement
- ✅ Participation aux événements
- ✅ Gestion des places disponibles
- ✅ Mode hors ligne (cache local)

## 🛠️ Technologies

- **Frontend** : React Native avec Expo SDK 54
- **Navigation** : Expo Router
- **Backend** : Supabase (Auth, Database, Storage)
- **State Management** : React Context + useReducer
- **Stockage local** : AsyncStorage

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- [Node.js](https://nodejs.org/) (version 18 ou supérieure)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- [Git](https://git-scm.com/)
- [Expo Go](https://expo.dev/client) sur votre téléphone (iOS/Android)

## 🚀 Installation

### 1. Cloner le repository
```bash
git clone https://github.com/votre-username/events-manager.git
cd events-manager
```

### 2. Installer les dépendances
```bash
npm install
```

Ou avec yarn :
```bash
yarn install
```

### 3. Configuration de Supabase

Le projet que vous allez cloner est lié à ma base de données Supabase. Pour le personnaliser, 
vous devrez créer votre propre base de données.

#### 3.1 Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez votre **Project URL** et **anon public key**

#### 3.2 Configurer les variables d'environnement

Créez un fichier `.env` à la racine du projet :
```env
EXPO_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key
```
Et appeler les dans la fichier src/data/remote/SupabaseClient.ts

#### 3.3 Créer les tables dans Supabase

Exécutez ces requêtes SQL dans l'éditeur SQL de Supabase :
```sql
-- Table des profils utilisateurs
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des événements
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES profiles(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  event_adress TEXT NOT NULL,
  places INTEGER NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des participations
CREATE TABLE event_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  participated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Trigger pour créer automatiquement un profil à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger pour décrémenter les places lors d'une participation
CREATE OR REPLACE FUNCTION decrement_places()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE events 
  SET places = places - 1 
  WHERE id = NEW.event_id AND places > 0;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Plus de places disponibles';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_participation_insert
AFTER INSERT ON event_participants
FOR EACH ROW
EXECUTE FUNCTION decrement_places();

-- Trigger pour incrémenter les places lors d'une annulation
CREATE OR REPLACE FUNCTION increment_places()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE events 
  SET places = places + 1 
  WHERE id = OLD.event_id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_participation_delete
AFTER DELETE ON event_participants
FOR EACH ROW
EXECUTE FUNCTION increment_places();
```

#### 3.4 Configurer Row Level Security (RLS)
```sql
-- Activer RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;

-- Policies pour profiles
CREATE POLICY "Profiles visibles par tous" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policies pour events
CREATE POLICY "Events visibles par tous" ON events
  FOR SELECT USING (true);

CREATE POLICY "Users can create events" ON events
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update own events" ON events
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Users can delete own events" ON events
  FOR DELETE USING (auth.uid() = creator_id);

-- Policies pour event_participants
CREATE POLICY "Participations visibles par tous" ON event_participants
  FOR SELECT USING (true);

CREATE POLICY "Users can participate" ON event_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can cancel own participation" ON event_participants
  FOR DELETE USING (auth.uid() = user_id);
```

#### 3.5 Configurer le Storage pour les images

1. Dans Supabase, allez dans **Storage**
2. Créez un nouveau bucket nommé `event-images`
3. Cochez **Public bucket**
4. Ajoutez ces policies :
```sql
-- Lecture publique
CREATE POLICY "Public Access" ON storage.objects 
  FOR SELECT USING (bucket_id = 'event-images');

-- Upload pour utilisateurs connectés
CREATE POLICY "Authenticated users can upload" ON storage.objects 
  FOR INSERT WITH CHECK (bucket_id = 'event-images' AND auth.role() = 'authenticated');

-- Suppression par le propriétaire
CREATE POLICY "Users can delete own images" ON storage.objects 
  FOR DELETE USING (bucket_id = 'event-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### 4. Lancer l'application
```bash
npx expo start
```

Vous verrez un QR code dans le terminal. Scannez-le avec :
- **iOS** : App Appareil photo
- **Android** : App Expo Go


## 🧪 Scripts disponibles
```bash
# Démarrer le serveur de développement
npx expo start

# Démarrer sur iOS
npx expo start --ios

# Démarrer sur Android
npx expo start --android

# Lancer les tests
npm test

# Vérifier le code (lint)
npm run lint
```

## 🔧 Dépannage

### L'application ne se connecte pas à Supabase

1. Vérifiez que les variables d'environnement sont correctes dans `.env`
2. Redémarrez le serveur Expo : `npx expo start --clear`

### Erreur "Bucket not found"

1. Créez le bucket `event-images` dans Supabase Storage
2. Assurez-vous qu'il est configuré comme **public**

### Erreur de permission sur les images

Vérifiez que les policies RLS sont configurées pour le Storage.

### L'application ne s'affiche pas sur Expo Go

1. Assurez-vous que votre téléphone est sur le même réseau WiFi
2. Essayez le mode tunnel : `npx expo start --tunnel`

## 📄 Licence

MIT

## 👤 Auteur

MOHAMMED HAMDAOUI - https://www.linkedin.com/in/mohammed-hamdaoui-914687296?utm_source=share_via&utm_content=profile&utm_medium=member_ios

---

⭐ Si ce projet vous a aidé, n'hésitez pas à lui donner une étoile sur GitHub !