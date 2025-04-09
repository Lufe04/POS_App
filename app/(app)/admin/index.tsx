import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth} from '@/context/authContext/AuthContext';

export default function AdminMenu() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panel de Administración</Text>

      <TouchableOpacity style={styles.button} onPress={() => router.navigate('/admin/add')}>
        <Text style={styles.buttonText}>Agregar Plato</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => router.navigate('/admin/edit')}>
        <Text style={styles.buttonText}>Editar Plato</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => router.navigate('/admin/delete')}>
        <Text style={styles.buttonText}>Eliminar Plato</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={async () => {
        try {
          await signOut();
          router.replace('/auth');
        } catch (error) {
          Alert.alert('Error', 'Hubo un problema al cerrar sesión. Inténtalo de nuevo.');
        }
      }}>
        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  button: {
    backgroundColor: '#ffa500',
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#ff4d4d',
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
