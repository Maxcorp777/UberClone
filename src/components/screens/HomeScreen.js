import React, {
  useRef,
  useState,
  useEffect,
} from 'react';

import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';

import MapView, {
  Marker,
  PROVIDER_GOOGLE,
} from 'react-native-maps';

import {useNavigation} from '@react-navigation/native';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';

import MapViewDirections from 'react-native-maps-directions';

import {useDispatch} from 'react-redux';
import {setTripData} from '../../redux/slices/tripSlice';

export default function HomeScreen() {

  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [region, setRegion] = useState({
    latitude: 6.2442,
    longitude: -75.5812,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const [destination, setDestination] = useState(null);

  const [distance, setDistance] = useState(null);

  const [duration, setDuration] = useState(null);

  const [price, setPrice] = useState(null);
  
  const [viewTarget, setViewTarget] = useState(false)

  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [vehicleType, setVehicleType] = useState('Economy');

  const mapRef = useRef(null);

  useEffect(() => {

  if (!distance || !duration) return;

  const basePrice = 5000;

  const distancePrice = distance * 2500;

  const timePrice = duration * 300;

  let multiplier = 1;

  if (vehicleType === 'XL') {
    multiplier = 1.5;
  }

  if (vehicleType === 'Premium') {
    multiplier = 2;
  }

  const totalPrice =
    (
      basePrice +
      distancePrice +
      timePrice
    ) * multiplier;

  setPrice(totalPrice);

}, [vehicleType]);

  const handleConfirmRide = () => {

    if (!destination) {
      Alert.alert('Selecciona un destino');
      return;
    }

    dispatch(
      setTripData({
        origin: region,
        destination,
        distance,
        duration,
        price,
      }),
    );

navigation.navigate('Payment');
  };

  return (
    <View style={styles.container}>

<GooglePlacesAutocomplete
  placeholder="A donde quieres ir?"
  fetchDetails={true}
  enablePoweredByContainer={false}

  onPress={(data, details = null) => {

    console.log(data, details);

    if (!details) return;

    const destinationCoordinates = {
      latitude: details.geometry.location.lat,
      longitude: details.geometry.location.lng,
    };

    setDestination(destinationCoordinates);
    setViewTarget(true)

    mapRef.current?.animateToRegion({
      ...destinationCoordinates,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    });
  }}

  query={{
    key: 'AIzaSyDzIRjWuh1JrBjBjqQOllAQhml3XElB67E',
    language: 'en',
  }}

  nearbyPlacesAPI="GooglePlacesSearch"

  debounce={400}

  styles={{

    container: {
      position: 'absolute',
      top: 60,
      left: 0,
      right: 0,
      zIndex: 9999,
    },

    textInput: {
      height: 55,
      borderRadius: 12,
      paddingHorizontal: 15,
      fontSize: 16,
      marginHorizontal: 15,
      backgroundColor: 'black',
      color: 'white',
      elevation: 5,
    },

    listView: {
      backgroundColor: 'white',
      marginHorizontal: 15,
      borderRadius: 10,
      elevation: 5,
    },

    row: {
      padding: 15,
    },

    description: {
      color: 'black',
      fontSize: 15,
    },
  }}
/>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        showsUserLocation={true}
        initialRegion={region}

        onUserLocationChange={(event) => {
          const {
            latitude,
            longitude,
          } = event.nativeEvent.coordinate;
          setRegion({
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }}

        onPress={(event) => {
          const coords = event.nativeEvent.coordinate;
          setDestination(coords);
          setViewTarget(true);
  }}
      >
        {destination && (
          <Marker coordinate={destination} />
        )}

        {destination && (

          <MapViewDirections
            origin={region}
            destination={destination}
            apikey="AIzaSyDzIRjWuh1JrBjBjqQOllAQhml3XElB67E"
            strokeWidth={5}
            strokeColor="black"

            onReady={result => {

              setDistance(result.distance);

              setDuration(result.duration);

              const basePrice = 5000;

              const distancePrice = result.distance * 2500;

              const timePrice = result.duration * 300;

              let multiplier = 1;
              if (vehicleType === 'XL') {
                multiplier = 1.5;
              }
              if (vehicleType === 'Premium') {
                multiplier = 2;
              }
              const totalPrice = (
                basePrice + distancePrice + timePrice ) * multiplier;
                setPrice(totalPrice);
            }}
          />
        )}

      </MapView>

      {viewTarget && (
        <View style={styles.bottomSheet} pointerEvents="box-none">
          <TouchableOpacity onPress={()=> setViewTarget(false)} style={styles.closeButton}><Text>Cerrar</Text></TouchableOpacity>
        <Text style={styles.title}>
          Detalles de Carrera
        </Text>

        <Text style={styles.infoText}>
          Distancia: {distance?.toFixed(2)} km
        </Text>

        <Text style={styles.infoText}>
          Duración: {duration?.toFixed(0)} min
        </Text>

        <Text style={styles.priceText}>
          ${price?.toFixed(0)} COP
        </Text>
        <Text style={styles.paymentTitle}>
  Tipo de Vehiculo
</Text>

<View style={styles.paymentContainer}>

  <TouchableOpacity
    style={[
      styles.paymentButton,
      vehicleType === 'Economy' &&
      styles.selectedPayment,
    ]}
    onPress={() => setVehicleType('Economy')}
  >
    <Text style={styles.paymentText}>
      Economico
    </Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={[
      styles.paymentButton,
      vehicleType === 'XL' &&
      styles.selectedPayment,
    ]}
    onPress={() => setVehicleType('XL')}
  >
    <Text style={styles.paymentText}>
      XL
    </Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={[
      styles.paymentButton,
      vehicleType === 'Premium' &&
      styles.selectedPayment,
    ]}
    onPress={() => setVehicleType('Premium')}
  >
    <Text style={styles.paymentText}>
      Premium
    </Text>
  </TouchableOpacity>

</View>

        <Text style={styles.paymentTitle}>
          Metodo de Pago
        </Text>

        <View style={styles.paymentContainer}>

          <TouchableOpacity
            style={[
              styles.paymentButton,
              paymentMethod === 'Cash' &&
              styles.selectedPayment,
            ]}
            onPress={() => setPaymentMethod('Cash')}
          >
            <Text style={styles.paymentText}>
              Fisico
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentButton,
              paymentMethod === 'Card' &&
              styles.selectedPayment,
            ]}
            onPress={() => setPaymentMethod('Card')}
          >
            <Text style={styles.paymentText}>
              Tarjeta
            </Text>
          </TouchableOpacity>

        </View>

        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirmRide}
        >

          <Text style={styles.confirmButtonText}>
            Confirmar Carrera
          </Text>

        </TouchableOpacity>

      </View>

      )}
    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
  },

  map: {
    flex: 1,
  },

  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,

    backgroundColor: 'white',

    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,

    padding: 25,

    zIndex: 1,

    elevation: 10,
  },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },

  infoText: {
    fontSize: 16,
    marginBottom: 8,
  },

  priceText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 20,
  },

  paymentTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },

  paymentContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },

  paymentButton: {
    flex: 1,

    padding: 15,

    borderRadius: 12,

    backgroundColor: '#E5E5E5',

    alignItems: 'center',
  },

  selectedPayment: {
    backgroundColor: 'black',
  },

  paymentText: {
    color: 'white',
    fontWeight: 'bold',
  },

  confirmButton: {
    backgroundColor: 'black',

    padding: 18,

    borderRadius: 15,

    alignItems: 'center',
  },

  confirmButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },

  closeButton: {
  position: 'absolute',
  top: 15,
  right: 15,

  width: 70,
  height: 70,

  borderRadius: 20,

  backgroundColor: '#F2F2F2',

  justifyContent: 'center',
  alignItems: 'center',

  elevation: 3,
},

closeText: {
  fontSize: 30,
  fontWeight: 'bold',
  color: 'black',
},
});