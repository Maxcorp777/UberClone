import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
// 💳 Componente nativo del SDK de Stripe para procesar tarjetas de forma segura
import { CardField } from '@stripe/stripe-react-native';
// 📦 Hook de Redux para extraer la información matemática del viaje global
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🟢 SOLUCIÓN 1: Inyectamos { navigation } para poder saltar de pantalla
export default function PaymentScreen({ navigation }) {
  // 🏢 ESTADO: Almacena si el usuario completó la estructura correcta de la tarjeta
  const [cardDetails, setCardDetails] = useState(null);

  // 📦 REDUX: Consumimos el estado global del viaje actual ("trip")
  const trip = useSelector(state => state.trip);

  const finalizarViaje = async () => {
    try {
      // 1. Recuperamos el ID del usuario que está logueado en la app
      const idUsuario = await AsyncStorage.getItem('userId');
      
      if (!idUsuario) {
        console.error("❌ No se encontró el ID del usuario en AsyncStorage");
        Alert.alert("Error", "Sesión inválida");
        return;
      }

      // 2. Armamos el paquete usando los datos REALES de Redux
      const datosDelViaje = {
        userId: idUsuario, 
        distance: trip.distance || "5.8 km", // Toma lo de redux o deja un backup por si acaso
        duration: trip.duration || "14 mins",
        cost: trip.price || 13500            // 🟢 SOLUCIÓN 2: Costo real mapeado desde Redux
      };

      console.log("📤 Enviando viaje a la DB...", datosDelViaje);

      // 3. Hacemos la petición POST al backend
      const response = await fetch('http://192.168.1.73:5000/api/trips/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosDelViaje)
      });

      const resultado = await response.json();
      console.log("🟢 Servidor respondió:", resultado);

      // 4. Si guardó bien en Atlas, disparamos la alerta de éxito y navegamos
      if (response.status === 201) {
        Alert.alert(
          'Transaction Approved',
          `Your payment of ${datosDelViaje.cost.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })} has been processed successfully. Enjoy your ride!`,
          [
            { 
              text: 'OK', 
              onPress: () => navigation.navigate('History') // Solo navega cuando el usuario le dé OK a la alerta
            }
          ]
        );
      } else {
        console.error("❌ El servidor no pudo guardar el viaje:", resultado.message);
        Alert.alert("Error", "No se pudo registrar el viaje en el servidor.");
      }

    } catch (error) {
      console.error("❌ Error de red al conectar con el servidor:", error);
      // Si el servidor falla, igual te manda al historial para no bloquear al usuario
      navigation.navigate('History');
    }
  };

  // 🚀 FUNCIÓN: Valida la tarjeta ficticia e inicia el flujo seguro de facturación
  const handlePayment = async () => {
    // Bloquea el proceso si faltan números, el CVV o la fecha expiró
    if (!cardDetails?.complete) {
      Alert.alert(
        'Payment Error',
        'Please complete all your credit/debit card fields.'
      );
      return;
    }
    
    // Si la tarjeta está llena, guardamos en base de datos y cerramos el ciclo
    await finalizarViaje();
  };

  return (
    <View style={styles.container}>
      
      {/* 🏛️ ENCABEZADO DE CHECKOUT MINIMALISTA */}
      <View style={styles.headerBlock}>
        <Text style={styles.title}>Secure Checkout</Text>
        <Text style={styles.subtitle}>SKIP.com • Encrypted Gateway</Text>
      </View>

      {/* 💳 TARJETA INVOICE (Resumen del cobro total) */}
      <View style={styles.invoiceCard}>
        <Text style={styles.invoiceLabelTitle}>Total Amount to Pay</Text>
        <Text style={styles.priceText}>
          {trip.price ? trip.price.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }) : '$0 COP'}
        </Text>
      </View>

      {/* 🔒 CONFIGURACIÓN CLARA DEL COMPONENTE DE STRIPE */}
      <Text style={styles.inputSectionLabel}>Credit or Debit Card</Text>
      <CardField
        postalCodeEnabled={false}
        placeholders={{
          number: '4242 4242 4242 4242', // Tarjeta universal de pruebas sandbox
        }}
        cardStyle={{
          backgroundColor: '#FFFFFF', 
          textColor: '#0F172A',       
          placeholderColor: '#94A3B8', 
        }}
        style={styles.stripeInputField}
        onCardChange={(details) => setCardDetails(details)}
      />

      {/* BOTÓN DE ACCIÓN CON EL MORADO PREMIUM OFICIAL */}
      <TouchableOpacity
        style={styles.payActionButton}
        onPress={handlePayment}
      >
        <Text style={styles.payActionButtonText}>Authorize Payment</Text>
      </TouchableOpacity>

      {/* PIE DE PÁGINA DE SEGURIDAD */}
      <Text style={styles.securityFooterText}>🔒 PCI-DSS Compliant Secure Payment via Stripe Sandbox</Text>

    </View>
  );
}

// 🎨 HOJA DE ESTILOS MODULADOS
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', paddingHorizontal: 24, justifyContent: 'center' },
  headerBlock: { alignItems: 'center', marginBottom: 35 },
  title: { fontSize: 26, fontWeight: '900', color: '#0F172A' },
  subtitle: { fontSize: 14, color: '#64748B', marginTop: 4, fontWeight: '500' },
  invoiceCard: { 
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, alignItems: 'center', 
    borderWidth: 1, borderColor: '#E2E8F0', elevation: 3, shadowColor: '#6D28D9', 
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, marginBottom: 24 
  },
  invoiceLabelTitle: { fontSize: 11, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5 },
  priceText: { fontSize: 36, fontWeight: '900', color: '#6D28D9', marginTop: 6 },
  inputSectionLabel: { fontSize: 11, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  stripeInputField: { width: '100%', height: 55, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, paddingHorizontal: 12, marginBottom: 30, elevation: 1 },
  payActionButton: { 
    backgroundColor: '#6D28D9', paddingVertical: 16, borderRadius: 14, alignItems: 'center', 
    elevation: 3, shadowColor: '#6D28D9', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6 
  },
  payActionButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
  securityFooterText: { textAlign: 'center', color: '#94A3B8', fontSize: 12, marginTop: 24, fontWeight: '500' },
});