import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HomeScreen from '../screens/HomeScreen';
import PaymentScreen from '../screens/PaymentScreen';
import RegisterScreen from '../screens/RegisterScreen';
import LoginScreen from '../screens/LoginScreen';
import ProfileScreen from '../screens/ProfileScreen';
import HistoryScreen from '../screens/HistoryScreen'


const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Register'); // Ruta por defecto

  // COMENTARIO DIDÁCTICO: Evaluamos qué pantalla se debe mostrar como ruta inicial al encender la app
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const savedUserId = await AsyncStorage.getItem('userId');
        if (savedUserId) {
          // Si hay una sesión guardada en el dispositivo, cambiamos la ruta inicial al Home
          setInitialRoute('SKIP.com');
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsLoading(false);
      }
    };
    checkUserSession();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.splashContainer}>
        <ActivityIndicator size="large" color="#6D28D9" />
      </View>
    );
  }

  // COMENTARIO DIDÁCTICO: Todas las pantallas quedan registradas en el Navigator para que existan siempre,
  // pero controlamos cuál se abre primero mediante la propiedad "initialRouteName".
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        
        {/* Pantalla de Registro */}
        <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        
        {/* Pantallas Principales de la aplicación */}
        <Stack.Screen name="SKIP.com" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
        <Stack.Screen name="History" component={HistoryScreen} options={{ headerShown: false }} />
        
        {/* Pantalla del Perfil de Usuario */}
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splashContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }
});