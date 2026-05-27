// ProfileScreen.js - User Profile Dashboard with SKIP Clean Purple & White UI Design
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Alert, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen({ route, navigation }) {
  // COMENTARIO DIDÁCTICO: Se extrae el id enviado por los parámetros de navegación o se usa el fallback de pruebas
  const { userId } = route.params || { userId: '6a1652bceaffc479b0e7ca69' };
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = `http://192.168.1.73:5000/api/users/profile/${userId}`;

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Petición HTTP GET para obtener la información del perfil por ID
        const response = await fetch(API_URL);
        const data = await response.json();

        if (response.ok) {
          setUser(data);
        } else {
          Alert.alert('Error', data.message || 'Could not fetch profile');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        Alert.alert('Network Error', 'Failed to connect to backend.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

// COMENTARIO DIDÁCTICO: Limpia la sesión y reinicia el estado del navegador de forma segura
  const handleLogout = async () => {
    try {
      // 1. Borramos el ID del almacenamiento local
      await AsyncStorage.removeItem('userId');
      
      Alert.alert('Logged Out', 'Your session has been closed successfully.');
      
      // 2. Reseteamos el estado de todo el navegador, obligándolo a recalcular las rutas desde cero
      navigation.reset({
        index: 0,
        routes: [{ name: 'Register' }], // Al resetear, vuelve a leer el condicional y activa el Registro
      });
      
    } catch (error) {
      console.error('Error clearing session:', error);
      Alert.alert('Error', 'Could not clear the session.');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6D28D9" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      
      {/* Header Premium de SKIP */}
      <View style={styles.headerContainer}>
        <Text style={styles.brandTitle}>SKIP.com</Text>
        <Text style={styles.title}>Account Profile</Text>
        <Text style={styles.subtitle}>Manage your personal driver details and preferences.</Text>
      </View>

      {/* Tarjeta de Información Estilo Limpio */}
      {user ? (
        <View style={styles.profileCard}>
          <View style={styles.infoField}>
            <Text style={styles.label}>Full Name</Text>
            <Text style={styles.value}>{user.fullName}</Text>
          </View>
          
          <View style={styles.infoField}>
            <Text style={styles.label}>Email Address</Text>
            <Text style={styles.value}>{user.email}</Text>
          </View>

          <View style={styles.infoField}>
            <Text style={styles.label}>Phone Number</Text>
            <Text style={styles.value}>{user.phoneNumber}</Text>
          </View>

          <View style={styles.infoField}>
            <Text style={styles.label}>Gender</Text>
            <Text style={styles.value}>{user.gender}</Text>
          </View>

          <View style={styles.infoField}>
            <Text style={styles.label}>System Language</Text>
            <Text style={styles.value}>{user.language === 'en' ? 'English (EN)' : user.language}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>No personal data found for this account.</Text>
        </View>
      )}

      {/* Botón de Cerrar Sesión con acento Morado de la marca */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
        <Text style={styles.logoutButtonText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>SKIP Security Layer Active</Text>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF' 
  },
  scrollContainer: { 
    flexGrow: 1, 
    paddingHorizontal: 24, 
    paddingTop: 40,
    paddingBottom: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center'
  },
  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#FFFFFF' 
  },
  headerContainer: { 
    marginBottom: 28 
  },
  brandTitle: { 
    fontSize: 26, 
    fontWeight: '900', 
    color: '#6D28D9', // Morado SKIP
    letterSpacing: -0.5,
    marginBottom: 12
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#1F1F1F',
    marginBottom: 6
  },
  subtitle: { 
    fontSize: 15, 
    color: '#6B6B6B', 
    lineHeight: 22 
  },
  profileCard: { 
    backgroundColor: '#F6F6F6', // Cajas grises muy sutiles idénticas a los inputs de registro
    padding: 24, 
    borderRadius: 16, 
    borderWidth: 1,
    borderColor: '#EAEAEA',
    marginBottom: 28
  },
  infoField: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
    paddingBottom: 10
  },
  label: { 
    fontSize: 12, 
    fontWeight: '700', 
    color: '#94A3B8', 
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4
  },
  value: { 
    fontSize: 16,
    fontWeight: '600', 
    color: '#1F1F1F' 
  },
  logoutButton: { 
    backgroundColor: '#6D28D9', // Botón sólido morado unificado
    height: 54, 
    borderRadius: 10, 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#6D28D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3
  },
  logoutButtonText: { 
    color: '#FFFFFF', 
    fontSize: 17, 
    fontWeight: 'bold' 
  },
  errorCard: {
    backgroundColor: '#FEF2F2',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    marginBottom: 28
  },
  errorText: { 
    textAlign: 'center', 
    color: '#DC2626', 
    fontSize: 15,
    fontWeight: '600'
  },
  footerText: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: '#CBD5E1',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 24
  }
});