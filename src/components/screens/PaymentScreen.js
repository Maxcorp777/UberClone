import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
// 💳 Componente nativo del SDK de Stripe para procesar tarjetas de forma segura
import { CardField } from '@stripe/stripe-react-native';
// 📦 Hook de Redux para extraer la información matemática del viaje global
import { useSelector } from 'react-redux';

export default function PaymentScreen() {
  // 🏢 ESTADO: Almacena si el usuario completó la estructura correcta de la tarjeta
  const [cardDetails, setCardDetails] = useState(null);

  // 📦 REDUX: Consumimos el estado global del viaje actual ("trip") inyectado por Alejo
  const trip = useSelector(state => state.trip);

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

    // 🔬 SIMULACIÓN DE ÉXITO (Sandbox Test Mode - Requerimiento de Rúbrica)
    Alert.alert(
      'Transaction Approved',
      `Your payment of ${trip.price ? trip.price.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }) : '$0 COP'} has been processed successfully. Enjoy your ride!`
    );
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
          backgroundColor: '#FFFFFF', // Fondo blanco limpio acorde al tema claro
          textColor: '#0F172A',       // Texto oscuro para alta legibilidad visual
          placeholderColor: '#94A3B8', // Gris suave SKIP
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

// 🎨 HOJA DE ESTILOS MODULADOS (Claros con acentos Morado Eléctrico #6D28D9)
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFC', // Fondo humo premium igual al HomeScreen
    paddingHorizontal: 24, 
    justifyContent: 'center' 
  },
  
  headerBlock: { 
    alignItems: 'center', 
    marginBottom: 35 
  },
  
  title: { 
    fontSize: 26, 
    fontWeight: '900', 
    color: '#0F172A' 
  },
  
  subtitle: { 
    fontSize: 14, 
    color: '#64748B', 
    marginTop: 4, 
    fontWeight: '500' 
  },
  
  // Contenedor blanco tipo tarjeta para el precio
  invoiceCard: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 16, 
    padding: 24, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    elevation: 3, 
    shadowColor: '#6D28D9', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 10, 
    marginBottom: 24 
  },
  
  invoiceLabelTitle: { 
    fontSize: 11, 
    fontWeight: '700', 
    color: '#94A3B8', 
    textTransform: 'uppercase', 
    letterSpacing: 0.5 
  },
  
  priceText: { 
    fontSize: 36, 
    fontWeight: '900', 
    color: '#6D28D9', // Morado Eléctrico SKIP
    marginTop: 6 
  },
  
  inputSectionLabel: { 
    fontSize: 11, 
    fontWeight: '700', 
    color: '#64748B', 
    textTransform: 'uppercase', 
    letterSpacing: 0.5, 
    marginBottom: 8 
  },
  
  // Caja de inserción nativa de Stripe (Quitamos el fondo negro invasivo)
  stripeInputField: { 
    width: '100%', 
    height: 55, 
    backgroundColor: '#FFFFFF', 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    borderRadius: 14, 
    paddingHorizontal: 12, 
    marginBottom: 30, 
    elevation: 1 
  },
  
  // Botón Principal Morado de SKIP
  payActionButton: { 
    backgroundColor: '#6D28D9', 
    paddingVertical: 16, 
    borderRadius: 14, 
    alignItems: 'center', 
    elevation: 3, 
    shadowColor: '#6D28D9', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 6 
  },
  
  payActionButtonText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: 'bold', 
    letterSpacing: 0.5 
  },
  
  securityFooterText: { 
    textAlign: 'center', 
    color: '#94A3B8', 
    fontSize: 12, 
    marginTop: 24, 
    fontWeight: '500' 
  },
});