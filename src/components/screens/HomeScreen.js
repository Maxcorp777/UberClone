import React, { useRef, useState, useEffect } from 'react';
// Agrega esta línea arriba del todo en tu HomeScreen.js
import AsyncStorage from '@react-native-async-storage/async-storage';

import { View, StyleSheet, Text, TouchableOpacity, Alert, PermissionsAndroid } from 'react-native';
// Componentes nativos del mapa de Google y trazador de rutas
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
// Buscador de sugerencias predictivas de direcciones
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
// Redux Hooks para despachar los datos globales a la pasarela de pagos
import { useDispatch } from 'react-redux';
import { setTripData } from '../../redux/slices/tripSlice';
// Navegación nativa entre las pantallas de SKIP
import { useNavigation } from '@react-navigation/native';


export default function HomeScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const mapRef = useRef(null);

  // 🔑 Llave unificada de Google APIs
  const GOOGLE_KEY = 'AIzaSyDzIRjWuh1JrBjBjqQOllAQhml3XElB67E';

  // 📍 1. ESTADOS DE UBICACIÓN Y COORDENADAS
  const [userLocation, setUserLocation] = useState({
    latitude: 6.2442,
    longitude: -75.5812,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [destination, setDestination] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);

  // 📊 2. ESTADOS DE MÉTRICAS DEL VIAJE
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);

  // 🎛️ 3. ESTADOS DE CONTROL DE INTERFAZ (UI)
  const [showPanel, setShowPanel] = useState(false);
  const [isTripRunning, setIsTripRunning] = useState(false);
  const [routePoints, setRoutePoints] = useState([]);
  const [vehicleType, setVehicleType] = useState('Economy');
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  // 📍 NUEVO ESTADO: Almacena el ID del usuario en sesión para la navegación
  const [currentUserId, setCurrentUserId] = useState(null);

  // 🔑 EFECTO: Recupera el ID del usuario de la sesión persistente
  useEffect(() => {
    const loadUserSession = async () => {
      try {
        const id = await AsyncStorage.getItem('userId');
        if (id) setCurrentUserId(id);
      } catch (err) {
        console.error("Error loading userId in Home:", err);
      }
    };
    loadUserSession();
  }, []);

  // 🛰️ EFECTO INICIAL: Solicita los permisos de GPS nativos a Android apenas se abre la pantalla
  useEffect(() => {
    const requestGpsPermission = async () => {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log("GPS Permission granted successfully");
        } else {
          Alert.alert("Permission Denied", "SKIP needs GPS access to lock your current location.");
        }
      } catch (err) {
        console.warn(err);
      }
    };
    
    requestGpsPermission();
  }, []);

  // 🧮 EFECTO RECALCULADOR: Actualiza el precio matemático según los kilómetros y la categoría de vehículo
  useEffect(() => {
    if (!distance || !duration) return;

    const baseCost = 5000;
    const distanceCost = distance * 2500;
    const timeCost = duration * 300;
    
    let vehicleMultiplier = 1;
    if (vehicleType === 'XL') vehicleMultiplier = 1.5;
    if (vehicleType === 'Premium') vehicleMultiplier = 2.0;

    const total = (baseCost + distanceCost + timeCost) * vehicleMultiplier;
    setFinalPrice(total);
  }, [vehicleType, distance, duration]);

  // ⏱️ EFECTO CINEMÁTICO: Animación del conductor moviéndose en tiempo real por el mapa
  useEffect(() => {
    let timer = null;

    if (isTripRunning && routePoints.length > 0) {
      let step = 0;
      setDriverLocation(routePoints[0]); // Inicializa al conductor en el origen

      timer = setInterval(() => {
        if (step < routePoints.length - 1) {
          step++;
          const nextPos = routePoints[step];
          setDriverLocation(nextPos); // Actualiza la coordenada de la moto o carro

          // La cámara del mapa enfoca y sigue al conductor de forma fluida
          mapRef.current?.animateToRegion({
            latitude: nextPos.latitude,
            longitude: nextPos.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }, 300);
        } else {
          // Llegada al destino final
          clearInterval(timer);
          setIsTripRunning(false);
          setDriverLocation(null);
          
          Alert.alert('LLegamos!', 'Tu SKIP driver ha finalizado el viaje', [
            { text: 'Procede con pago', onPress: () => navigation.navigate('Payment') }
          ]);
        }
      }, 500); // Velocidad del refresco de animación (Cada 500 milisegundos)
    }

    return () => clearInterval(timer);
  }, [isTripRunning, routePoints]);

  //FUNCIÓN: Dispara la solicitud del viaje, guarda en Redux e inicia la telemetría en tiempo real
  const startSkipRide = () => {
    if (!destination) return;

    dispatch(
      setTripData({
        origin: userLocation,
        destination,
        distance,
        duration,
        price: finalPrice,
        paymentMethod,
        vehicleType,
      })
    );

    setShowPanel(false);     // Oculta el panel inferior de opciones
    setIsTripRunning(true);  // Enciende el reloj cinemático del conductor
  };

  return (
    <View style={styles.container}>
      
      {/* 🔍 COMPONENTE DE BÚSQUEDA PREDICITIVA (Se oculta durante el viaje activo) */}
      {!isTripRunning && (
        <GooglePlacesAutocomplete
          placeholder="Que nos depara el destino hoy?"
          fetchDetails={true} // Obliga a Google a traer la data detallada de la ubicación
          enablePoweredByContainer={false}
          nearbyPlacesAPI="GooglePlacesSearch"
          debounce={400}
          query={{ 
            key: GOOGLE_KEY, 
            language: 'en',
            components: 'country:co' // Filtra las sugerencias para que priorice a Colombia
          }}
          textInputProps={{
            placeholderTextColor: '#6D28D9', // El color morado premium de la paleta de SKIP
          }}
          onPress={(data, details = null) => {
            if (!details) return;
            
            // Extrae de forma segura la geometría que manda la API de Google Places
            const targetCoords = {
              latitude: details.geometry.location.lat,
              longitude: details.geometry.location.lng,
            };
            
            setDestination(targetCoords);
            setShowPanel(true); // Despliega la tarjeta de opciones abajo

            // Animación suave de la cámara viajando hacia el destino
            mapRef.current?.animateToRegion({
              ...targetCoords,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }, 1000);
          }}
          styles={searchStyles}
        />
      )}

      {/*ENTORNO DEL MAPA INTERACTIVO NATIVO DE GOOGLE */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        showsUserLocation={true}
        initialRegion={userLocation}
        onUserLocationChange={(event) => {
          // Escucha el sensor del GPS del celular y actualiza el origen dinámicamente
          if (isTripRunning || !event.nativeEvent.coordinate) return;
          const { latitude, longitude } = event.nativeEvent.coordinate;
          setUserLocation(prev => ({ ...prev, latitude, longitude }));
        }}
        onPress={(e) => {
          if (isTripRunning) return;
          setDestination(e.nativeEvent.coordinate);
          setShowPanel(true);
        }}
      >
        {/* Pin visual encima del destino */}
        {destination && <Marker coordinate={destination} pinColor="#6D28D9" />}

        {/* ICONO DE SIMULACION */}
        {driverLocation && (
          <Marker coordinate={driverLocation}>
            <View style={styles.driverIconCircle}>
              <Text style={{ fontSize: 18 }}>
                {vehicleType === 'Economy' ? '🏍️' : '🚗'}
              </Text>
            </View>
          </Marker>
        )}

        {/* MOTOR GEOMÉTRICO: Traza la línea morada y extrae los puntos de animación, KM y tiempo */}
        {destination && (
          <MapViewDirections
            origin={userLocation}
            destination={destination}
            apikey={GOOGLE_KEY}
            strokeWidth={5}
            strokeColor="#6D28D9" // Trazado morado oficial de SKIP
            onReady={(result) => {
              setDistance(result.distance);
              setDuration(result.duration);
              setRoutePoints(result.coordinates); // 📦 Guardamos el camino para la animación
            }}
          />
        )}
      </MapView>

      {/*MENÚ SUPERIOR*/}
      {!isTripRunning && (
        <View style={styles.topMenuRow}>
          {/*Enviamos el ID recuperado de AsyncStorage como parámetro de navegación */}
          <TouchableOpacity 
            style={styles.menuBtn} 
            onPress={() => {
              if (currentUserId) {
                navigation.navigate('Profile', { userId: currentUserId });
              } else {
                Alert.alert('Session Error', 'User ID not found. Please log in again.');
              }
            }}
          >
            <Text style={styles.menuBtnText}>👤 Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.navigate('History')}>
            <Text onPress={() => navigation.navigate('History')} style={styles.menuBtnText}>📜 History</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* SEGUIMIENTO DE VIAJE EN TIEMPO REAL ACTIVO */}
      {isTripRunning && (
        <View style={styles.trackingHud}>
          <Text style={styles.hudTitle}>✨ SKIP Ride Active</Text>
          <Text style={styles.hudMetrics}>
            Distance: {distance?.toFixed(1)} KM • Time: {duration?.toFixed(0)} mins
          </Text>
        </View>
      )}

      {/* PANEL INFERIOR PARA ELEGIR EL VIAJE */}
      {showPanel && !isTripRunning && (
        <View style={styles.bottomCardSheet}>
          
        <TouchableOpacity 
              onPress={() => {
                setShowPanel(false);    // Cierra la tarjeta blanca inferior
                setDestination(null);   // Borra el pin morado del destino
                setDistance(0);         // Resetea los kilómetros a cero
                setDuration(0);         // Resetea los minutos a cero
              }} 
              style={styles.closeSheetButton}
            >
            <Text style={styles.closeSheetText}>✕</Text>
        </TouchableOpacity>

          <Text style={styles.sheetTitle}>Detalles del viaje</Text>
          
          <Text style={styles.priceText}>
            {finalPrice ? finalPrice.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }) : '$0'}
          </Text>

          {/* Grid Selector: Clase de Vehículo */}
          <Text style={styles.sectionLabelTitle}>Selecciona el tipo de Vehiculo</Text>
          <View style={styles.buttonsRowGrid}>
            {['Economy', 'XL', 'Premium'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.selectorBtn, vehicleType === type && styles.activeBtn]}
                onPress={() => setVehicleType(type)}
              >
                <Text style={[styles.btnText, vehicleType === type && styles.activeText]}>
                  {type === 'Economy' ? '🏍️ Moto' : type === 'XL' ? '🚗 Carro' : '✨ Premium'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Grid Selector: Método de Pago */}
          <Text style={styles.sectionLabelTitle}>Elige el metodo de pago</Text>
          <View style={styles.optionsRowGridContainer}>
            {[
              //{ id: 'Cash', label: '💵 Cash' },
              { id: 'Card', label: '💳 Card' }
            ].map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[styles.selectorBtn, paymentMethod === method.id && styles.activeBtn]}
                onPress={() => setPaymentMethod(method.id)}
              >
                <Text style={[styles.btnText, paymentMethod === method.id && styles.activeText]}>{method.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Botón Principal de Envío */}
          <TouchableOpacity style={styles.mainActionBtn} onPress={startSkipRide}>
            <Text style={styles.mainActionBtnText}>Confirmar Viaje</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFC' 
  },
  
  map: { 
    flex: 1 
  },
  
  topMenuRow: { 
    position: 'absolute', 
    top: 130, 
    left: 20, 
    right: 20, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    zIndex: 10 
  },
  
  menuBtn: { 
    backgroundColor: '#FFFFFF', 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 20, 
    elevation: 4, 
    shadowColor: '#6D28D9', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4 
  },
  
  menuBtnText: { 
    fontSize: 13, 
    fontWeight: '700', 
    color: '#475569' 
  },

  driverIconCircle: { 
    backgroundColor: '#FFFFFF', 
    padding: 6, 
    borderRadius: 20, 
    borderWidth: 2, 
    borderColor: '#6D28D9', 
    elevation: 5 
  },

  trackingHud: { 
    position: 'absolute', 
    bottom: 40, 
    left: 20, 
    right: 20, 
    backgroundColor: '#FFFFFF', 
    borderRadius: 16, 
    padding: 20, 
    zIndex: 99,
    elevation: 6, 
    borderLeftWidth: 5, 
    borderLeftColor: '#6D28D9' 
  },
  
  hudTitle: { 
    fontSize: 16, 
    fontWeight: '800', 
    color: '#0F172A' 
  },
  
  hudMetrics: { 
    fontSize: 14, 
    fontWeight: '700', 
    color: '#6D28D9', 
    marginTop: 4 
  },

  bottomCardSheet: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    backgroundColor: '#FFFFFF', 
    borderTopLeftRadius: 24, 
    borderTopRightRadius: 24, 
    paddingHorizontal: 24, 
    paddingTop: 24, 
    paddingBottom: 34, 
    zIndex: 999,         
    elevation: 24,       
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12
  },
  
  // ✕ Botón de Cierre Minimalista dentro de la tarjeta
  closeSheetButton: { 
    position: 'absolute', 
    top: 20, 
    right: 20, 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    backgroundColor: '#F1F5F9', 
    justifyContent: 'center', 
    alignItems: 'center',
    zIndex: 1000,
    elevation: 5 
  },
  
  closeSheetText: { 
    fontSize: 13, 
    fontWeight: 'bold', 
    color: '#64748B' 
  },
  
  sheetTitle: { 
    fontSize: 18, 
    fontWeight: '800', 
    color: '#0F172A' 
  },
  
  priceText: { 
    fontSize: 34, 
    fontWeight: '900', 
    color: '#6D28D9', 
    marginVertical: 6 
  },
  
  sectionLabelTitle: { 
    fontSize: 11, 
    fontWeight: '700', 
    color: '#94A3B8', 
    textTransform: 'uppercase', 
    letterSpacing: 0.5, 
    marginBottom: 8, 
    marginTop: 12 
  },
  
  buttonsRowGrid: { 
    flexDirection: 'row', 
    gap: 8, 
    marginBottom: 4 
  },
  
  optionsRowGridContainer: { 
    flexDirection: 'row', 
    gap: 8, 
    marginBottom: 10 
  },
  
  // Botones selectores del grid de categorías y pagos
  selectorBtn: { 
    flex: 1, 
    paddingVertical: 12, 
    borderRadius: 12, 
    backgroundColor: '#F1F5F9', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#E2E8F0' 
  },
  
  activeBtn: { 
    backgroundColor: '#F5F3FF', 
    borderColor: '#6D28D9' 
  },
  
  btnText: { 
    fontSize: 13, 
    fontWeight: '700', 
    color: '#64748B' 
  },
  
  activeText: { 
    color: '#6D28D9' 
  },
  
  // Botón Principal Morado para confirmar el viaje
  mainActionBtn: { 
    backgroundColor: '#6D28D9', 
    borderRadius: 14, 
    paddingVertical: 16, 
    alignItems: 'center', 
    marginTop: 20,
    elevation: 3
  },
  
  mainActionBtnText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: 'bold', 
    letterSpacing: 0.5 
  },
});

const searchStyles = {
  container: { 
    position: 'absolute', 
    top: 60, 
    left: 0, 
    right: 0, 
    zIndex: 99999 
  },
  textInput: { 
    height: 54, 
    borderRadius: 14, 
    paddingHorizontal: 16, 
    fontSize: 15, 
    marginHorizontal: 15, 
    backgroundColor: '#FFFFFF', 
    color: '#0F172A', 
    elevation: 5, 
    borderWidth: 1, 
    borderColor: '#E2E8F0' 
  },
  listView: { 
    backgroundColor: '#FFFFFF', 
    marginHorizontal: 15, 
    borderRadius: 12, 
    marginTop: 4, 
    elevation: 5 
  },
  row: { 
    padding: 14 
  },
  description: { 
    color: '#334155', 
    fontSize: 14 
  },
};