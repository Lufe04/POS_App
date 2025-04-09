import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function AdminMenu() {
  const router = useRouter();

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
});
