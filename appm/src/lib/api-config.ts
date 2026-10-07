import Constants from 'expo-constants';
import { Platform } from 'react-native';

const host = Constants.expoConfig?.hostUri?.split(':')[0]; // ej: 192.168.1.25

// En una build real (celular instalado, web publicada) la API no está en
// localhost: define EXPO_PUBLIC_API_URL, por ejemplo en appm/.env:
//   EXPO_PUBLIC_API_URL=https://victoria.tudominio.edu.co
// Si no está definida, se usa el comportamiento de desarrollo de siempre.
const urlDeEntorno = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, '');

export const API_BASE_URL =
  urlDeEntorno || (Platform.OS === 'web' || !host ? 'http://localhost:8000' : `http://${host}:8000`);
