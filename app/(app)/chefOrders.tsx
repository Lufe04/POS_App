import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

// 🔸 Interfaz del tipo de orden
interface Order {
  id: string;
  mesa: number;
  resumen: string;
  total: number;
}

export default function ChefOrdersScreen() {
  const router = useRouter();

  // 🔶 DATOS DE PRUEBA – reemplazar por datos reales desde Firestore
  const orders: Order[] = [
    {
      id: "order001",
      mesa: 3,
      resumen: "2x Pasta, 1x Agua",
      total: 32000
    },
    {
      id: "order002",
      mesa: 5,
      resumen: "1x Ensalada, 2x Jugo",
      total: 28000
    }
  ];

  // 🔶 Este render usa los datos simulados
  const renderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.card}
      // 🔶 RUTA DINÁMICA – asegúrate que /orders/[id].tsx existe
      onPress={() => router.push({ pathname: "/orderDetail", params: { id: item.id } })}


    >
      <View style={styles.cardHeader}>
        <Text style={styles.orderId}>Orden #{item.id.slice(-3)}</Text>
        <Text style={styles.mesa}>Mesa {item.mesa}</Text>
      </View>
      <Text style={styles.resumen}>{item.resumen}</Text>
      <Text style={styles.total}>Total: ${item.total.toLocaleString()}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.screen}>
        <View style={styles.cardContainer}>
            <FlatList
            data={orders}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={<Text style={styles.emptyText}>No hay órdenes pendientes 🍽️</Text>}
            contentContainerStyle={{ paddingBottom: 40 }}
            />
        </View>
    </View>
  );
}

// 🎨 ESTILOS
const styles = StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: '#121212',
      justifyContent: 'flex-end',
    },
    cardContainer: {
      backgroundColor: '#fff',
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      padding: 24,
      height: '90%',
    },
    card: {
      backgroundColor: '#F9F9F9',
      padding: 16,
      marginBottom: 16,
      borderRadius: 16,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    orderId: {
      fontSize: 16,
      fontWeight: '600',
      color: '#333',
    },
    mesa: {
      fontSize: 14,
      color: '#999',
    },
    resumen: {
      color: '#555',
      marginVertical: 6,
    },
    total: {
      fontWeight: 'bold',
      color: '#FF5E3A',
      marginTop: 4,
    },
    emptyText: {
      textAlign: 'center',
      marginTop: 40,
      fontSize: 16,
      color: '#999',
    },
  });
  