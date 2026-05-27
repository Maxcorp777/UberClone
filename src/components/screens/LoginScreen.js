import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Campos incompletos', 'Por favor llena todos los datos.');
      return;
    }

    setLoading(true);
    try {
      // Petición al endpoint que acabamos de crear (Modifica la IP por la tuya si cambió)
      const response = await fetch('http://192.168.1.73:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.status === 200) {
        // 🟢 AQUÍ ESTÁ LA MAGIA: Guardamos el ID del usuario en el celular
        await AsyncStorage.setItem('userId', data.user.id);
        await AsyncStorage.setItem('userName', data.user.fullName);

        Alert.alert('Bienvenido', `Hola de nuevo, ${data.user.fullName}`);
        
        // Reseteamos el historial de navegación y lo mandamos al Home de SKIP
        navigation.replace('SKIP.com'); 
      } else {
        Alert.alert('Error', data.message || 'Credenciales inválidas.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error de red', 'No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerBlock}>
        <Text style={styles.brand}>SKIP</Text>
        <Text style={styles.subtitle}>Inicia sesión para pedir tu viaje</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        placeholderTextColor="#94A3B8"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor="#94A3B8"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Ingresar</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.registerLink}>
        <Text style={styles.registerText}>¿No tienes cuenta? <Text style={{fontWeight: 'bold', color: '#6D28D9'}}>Regístrate</Text></Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', paddingHorizontal: 24, justifyContent: 'center' },
  headerBlock: { alignItems: 'center', marginBottom: 40 },
  brand: { fontSize: 42, fontWeight: '900', color: '#6D28D9' },
  subtitle: { fontSize: 16, color: '#64748B', marginTop: 4 },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 16, height: 55, marginBottom: 16, color: '#0F172A' },
  button: { backgroundColor: '#6D28D9', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 10, elevation: 2 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  registerLink: { marginTop: 25, alignItems: 'center' },
  registerText: { color: '#64748B', fontSize: 14 }
});