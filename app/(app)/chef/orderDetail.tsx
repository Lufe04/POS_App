import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';

// 🧪 Simula el rol actual para pruebas: cambia entre "chef" y "cashier"
type UserRole = "chef" | "cashier";
const currentUserRole: UserRole = "chef";

// 🧪 Mock de órdenes para pruebas
const MOCK_ORDERS = [
  {
    id: "order001",
    mesa: 3,
    items: [
      { nombre: "Char-Grilled Filet Mignon", cantidad: 1, precio: 380000 },
      { nombre: "Cabernet Sauvignon", cantidad: 2, precio: 220000 }
    ]
  }
];

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const order = MOCK_ORDERS.find(o => o.id === id);

  if (!order) {
    return <Text style={{ padding: 20 }}>Orden no encontrada</Text>;
  }

  const subtotal = order.items.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const mostrarPrecios = currentUserRole === "cashier";
  const mostrarBoton = ["chef", "cashier"].includes(currentUserRole); // ✅ sin error ts(2367)

  const completarOrden = () => {
    const mensaje =
      currentUserRole === "cashier"
        ? "Orden marcada como pagada 💰"
        : "Orden marcada como completada 👨‍🍳";

    alert(mensaje);
    router.replace('/chefOrders');
  };

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
          <Text style={styles.title}>Orden #{order.id.slice(-3)}</Text>
          <Text style={styles.subtitle}>Mesa: {order.mesa}</Text>

          <Text style={styles.section}>Items</Text>
          {order.items.map((item, idx) => (
            <View key={idx} style={styles.itemRow}>
              <Text style={styles.itemName}>{item.nombre}</Text>
              <Text style={styles.itemCantidad}>x{item.cantidad}</Text>
              {mostrarPrecios && (
                <Text style={styles.itemPrecio}>
                  ${(item.precio * item.cantidad).toLocaleString()}
                </Text>
              )}
            </View>
          ))}

          {mostrarPrecios && (
            <View style={styles.summaryContainer}>
              <Text style={styles.section}>Resumen</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.label}>Subtotal</Text>
                <Text style={styles.value}>${subtotal.toLocaleString()}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.label}>IVA (10%)</Text>
                <Text style={styles.value}>${tax.toLocaleString()}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>${total.toLocaleString()}</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {mostrarBoton && (
          <Pressable style={styles.boton} onPress={completarOrden}>
            <Text style={styles.botonTexto}>
              {currentUserRole === "cashier" ? "Marcar como pagada 💰" : "Marcar como completada ✅"}
            </Text>
          </Pressable>
        )}
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
  itemPrecio: {
    fontSize: 15,
    width: 80,
    textAlign: 'right',
    color: '#444',
  },
  summaryContainer: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  label: {
    fontSize: 14,
    color: '#888',
  },
  value: {
    fontSize: 14,
    color: '#444',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
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