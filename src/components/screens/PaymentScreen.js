import React, {useState} from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';

import {
  CardField,
} from '@stripe/stripe-react-native';

import {useSelector} from 'react-redux';

export default function PaymentScreen() {

  const [cardDetails, setCardDetails] = useState();

  const trip = useSelector(state => state.trip);

  const handlePayment = async () => {

    if (!cardDetails?.complete) {

      Alert.alert(
        'Error',
        'Por favor complete los detalles de la tarjeta',
      );

      return;
    }

    // FAKE SUCCESS PAYMENT

    Alert.alert(
      'Pago Completado',
      `Tu viaje es de: $${trip.price?.toFixed(0)} COP`,
    );
  };

  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        Pago
      </Text>

      <Text style={styles.price}>
        ${trip.price?.toFixed(0)} COP
      </Text>

      <CardField
        postalCodeEnabled={false}

        placeholders={{
          number: '4242 4242 4242 4242',
          backgroundColor: '#000000',
          textColor: '#fdfcff'
        }}

        cardStyle={{
          backgroundColor: '#000000',
          textColor: '#fffcfc',
        }}

        style={{
          width: '100%',
          height: 50,
          marginVertical: 30,
        }}

        onCardChange={cardDetails => {
          setCardDetails(cardDetails);
        }}
      />

      <TouchableOpacity
        style={styles.payButton}
        onPress={handlePayment}
      >

        <Text style={styles.payText}>
          Pagar Ahora
        </Text>

      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 25,
    justifyContent: 'center',
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  price: {
    fontSize: 28,
    fontWeight: '600',
  },

  payButton: {
    backgroundColor: 'black',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 30,
  },

  payText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});