import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useData } from '@/context/dataContext/OrderContext';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { orders, updateOrder } = useData();

  const [order, setOrder] = useState<any | null>(null);

  useEffect(() => {
    const found = orders.find((o) => o.ID_Order === id);
    setOrder(found || null);
  }, [orders, id]);
  
  if (!order) {
    return <Text style={{ padding: 20 }}>Orden no encontrada</Text>;
  }

  const subtotal = order.order.reduce(
    (acc: number, item: any) => acc + item.quantity * 10000, // usar item.price si lo tienes
    0
  );
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const marcarComoEntregada = async () => {
    await updateOrder(order.ID_Order, { state: 'entregado' });
    alert('Orden marcada como completada 👨‍🍳');
    router.back();
  };

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
          <Text style={styles.title}>Orden #{order.ID_Order.slice(-3)}</Text>
          <Text style={styles.subtitle}>Mesa: {order.table}</Text>

          <Text style={styles.section}>Items</Text>
          {order.order.map((item: any, idx: number) => (
            <View key={idx} style={styles.itemRow}>
              <Text style={styles.itemName}>{item.dish}</Text>
              <Text style={styles.itemCantidad}>x{item.quantity}</Text>
            </View>
          ))}
        </ScrollView>
        <Pressable style={styles.boton} onPress={marcarComoEntregada}>
          <Text style={styles.botonTexto}>Orden completada</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    height: '90%',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  section: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  itemName: {
    fontSize: 15,
    flex: 1,
    color: '#444',
  },
  itemCantidad: {
    fontSize: 15,
    width: 40,
    textAlign: 'center',
    color: '#444',
  },
  boton: {
    position: 'absolute',
    bottom: 20,
    left: 24,
    right: 24,
    backgroundColor: '#FF5E3A',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  botonTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});