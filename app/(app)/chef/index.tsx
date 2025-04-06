import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useData } from '@/context/dataContext/OrderContext';

export default function ChefOrdersScreen() {
  const router = useRouter();
  const { orders, getOrders } = useData();
  
  useEffect(() => {
    getOrders(); // Cargar órdenes al montar la pantalla
  }, []);

  // 🔶 Este render usa los datos simulados
  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      // 🔶 RUTA DINÁMICA – asegúrate que /orders/[id].tsx existe
      onPress={() => router.navigate({ pathname: "/(app)/chef/orderDetail", params: { id: item.ID_Order } })}


    >
      <View style={styles.cardHeader}>
        <Text style={styles.orderId}>Orden #{item.ID_Order.slice(-3)}</Text>
        <Text style={styles.mesa}>Mesa {item.table}</Text>
      </View>
      <Text style={styles.resumen}>{item.order.map((o: any) => `${o.quantity}x ${o.dish}`).join(', ')}</Text>
      <Text style={styles.total}>Total: ${item.total.toLocaleString()}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.screen}>
        <View style={styles.cardContainer}>
            <FlatList
            data={orders}
            renderItem={renderItem}
            keyExtractor={(item) => item.ID_Order}
            ListEmptyComponent={
            <Text style={styles.emptyText}>No hay órdenes pendientes 🍽️</Text>
          }
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
  