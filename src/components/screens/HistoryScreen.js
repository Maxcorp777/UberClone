import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_URL } from '../navigation/Config' // Trae la IP centralizada


export default function HistoryScreen({ navigation }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    obtenerHistorial();
  }, []);

  const obtenerHistorial = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId'); // Recuperamos el ID del usuario logueado
      
      const response = await fetch(`${API_URL}/trips/history/${userId}`);
      const data = await response.json();
      
      setTrips(data);
    } catch (error) {
      console.error("Error al obtener historial:", error);
    } finally {
      setLoading(false);
    }
  };

  // Renderizar cada tarjetita de viaje terminado
  const renderTripItem = ({ item }) => (
    <View style={styles.tripCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.driverText}>{item.driverName || 'SKIP Driver'}</Text>
        <Text style={styles.costText}>${item.cost.toLocaleString('es-CO')}</Text>
      </View>
      <View style={styles.cardDetails}>
        <Text style={styles.detailText}>📍 Distancia: {item.distance}</Text>
        <Text style={styles.detailText}>⏱️ Tiempo: {item.duration}</Text>
      </View>
      <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString('es-CO')}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Viajes</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#6200EE" style={{ flex: 1 }} />
      ) : trips.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Aún no has realizado ningún viaje en SKIP.</Text>
        </View>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => item._id}
          renderItem={renderTripItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Volver</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', padding: 24, paddingTop: 50 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1F1F1F', marginBottom: 20 },
  tripCard: { backgroundColor: '#F6F6F6', borderRadius: 12, padding: 16, marginBottom: 15, borderWidth: 1, borderColor: '#EAEAEA' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  driverText: { fontSize: 16, fontWeight: 'bold', color: '#1F1F1F' },
  costText: { fontSize: 16, fontWeight: 'bold', color: '#6200EE' },
  cardDetails: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  detailText: { fontSize: 14, color: '#6B6B6B' },
  dateText: { fontSize: 11, color: '#A0A0A0', textAlign: 'right' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#6B6B6B', textAlign: 'center' },
  backButton: { backgroundColor: '#6200EE', height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  backButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }
});