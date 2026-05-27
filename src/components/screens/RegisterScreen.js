// RegisterScreen.js - User Registration Form with Purple & White UI Design
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { LogBox } from 'react-native';
// APRENDIZAJE: Ignora advertencias específicas de gestos del emulador que no rompen la app
LogBox.ignoreLogs(['Unsupported top-level event type']);

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('other'); 
  const [language, setLanguage] = useState('en');

  const API_URL = 'http://192.168.1.73:5000/api/auth/register';

const handleRegister = async () => {
    // 1. Validar campos
    if (!fullName || !email || !password || !phoneNumber) {
      Alert.alert('Required Fields', 'Please fill in all fields.');
      return;
    }

    try {
      // 2. Petición HTTP
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fullName, phoneNumber, email, password, gender, language }),
      });

      const data = await response.json();

      // 3. Evaluar respuesta
      if (response.ok && data._id) {
        // Guardar sesión local
        await AsyncStorage.setItem('userId', data._id);
        
        Alert.alert('Welcome', 'Account created successfully!');
        
        // Navegar usando la ruta exacta de tu AppNavigator
        navigation.replace('SKIP.com');
      } else {
        Alert.alert('Registration Failed', data.message || 'Check your fields.');
      }
    } catch (error) {
      console.log("❌ ERROR:", error);
      Alert.alert('Network Error', 'Cannot connect to server.');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Header de la App con la marca e identidad */}
        <View style={styles.headerContainer}>
          <Text style={styles.brandTitle}>SKIP.com</Text>
          <Text style={styles.title}>Let's get started</Text>
          <Text style={styles.subtitle}>Create an account to unlock rides and seamless payments.</Text>
        </View>

        {/* Formulario de Inputs */}
        <View style={styles.formContainer}>
          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput 
            style={styles.input} 
            placeholder="e.g. John Doe" 
            placeholderTextColor="#A0A0A0"
            onChangeText={setFullName} 
            value={fullName}
            maxLength={50}
          />

          <Text style={styles.inputLabel}>Phone Number</Text>
          <TextInput 
            style={styles.input} 
            placeholder="e.g. +57 300 123 4567" 
            placeholderTextColor="#A0A0A0"
            keyboardType="phone-pad"
            onChangeText={setPhoneNumber} 
            value={phoneNumber}
          />

          <Text style={styles.inputLabel}>Email Address</Text>
          <TextInput 
            style={styles.input} 
            placeholder="name@example.com" 
            placeholderTextColor="#A0A0A0"
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={setEmail} 
            value={email}
          />

          <Text style={styles.inputLabel}>Password</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Minimum 6 characters" 
            placeholderTextColor="#A0A0A0"
            secureTextEntry 
            onChangeText={setPassword} 
            value={password}
          />
        </View>

        {/* Botón de Acción Principal en Morado */}
        <TouchableOpacity style={styles.button} onPress={handleRegister} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        {/* Términos Legales sutiles al pie */}
        <Text style={styles.termsText}>
          By proceeding, you agree to our Terms of Service and Privacy Policy.
        </Text>

      </ScrollView>
    </KeyboardAvoidingView>
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
    paddingBottom: 20,
    justifyContent: 'center' 
  },
  headerContainer: { 
    marginBottom: 32 
  },
  brandTitle: { 
    fontSize: 26, 
    fontWeight: '900', 
    color: '#6200EE', // Morado principal de la marca
    letterSpacing: -0.5,
    marginBottom: 16
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
  formContainer: { 
    marginBottom: 24 
  },
  inputLabel: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#1F1F1F', 
    marginBottom: 8,
    paddingLeft: 2
  },
  input: { 
    height: 54, 
    backgroundColor: '#F6F6F6', // Fondo gris claro muy limpio
    borderRadius: 10, 
    marginBottom: 20, 
    paddingHorizontal: 16, 
    fontSize: 16,
    color: '#000000',
    borderWidth: 1,
    borderColor: '#EAEAEA'
  },
  button: { 
    backgroundColor: '#6200EE', // Botón Morado Integrado
    height: 54, 
    borderRadius: 10, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 10,
    shadowColor: '#6200EE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3
  },
  buttonText: { 
    color: '#FFFFFF', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  termsText: { 
    textAlign: 'center', 
    color: '#767676', 
    fontSize: 12, 
    marginTop: 24, 
    lineHeight: 18,
    paddingHorizontal: 20
  }
});