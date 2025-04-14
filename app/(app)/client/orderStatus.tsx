import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Modal, FlatList } from 'react-native';
import { useData } from '@/context/dataContext/OrderContext';
import { useAuth } from '@/context/authContext/AuthContext';
import { useMenu } from '@/context/dataContext/MenuContext';
import { MenuItem } from '@/context/dataContext/MenuContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

// Define the Order type
type Order = {
  ID_Order: string;
  state: string;
  order: { dish: string; quantity: number }[];
  total: number;
  table: string | number;
  statusUpdatedAt?: string;
};

export default function OrderStatusScreen() {
  const { user } = useAuth(); // Usuario autenticado
  const { getOrderStatus, updateOrder } = useData(); // Funciones del contexto
  const { getMenu } = useMenu(); // Funciones del contexto
  const [order, setOrder] = useState<Order | null>(null); // Detalles de la orden
  const [menu, setMenu] = useState<MenuItem[]>([]); // Menú disponible
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: number }>({}); // Elementos seleccionados
  const [isMenuVisible, setMenuVisible] = useState(false); // Visibilidad del modal del menú
  const router = useRouter(); // Para navegar entre pantallas

  useEffect(() => {
    if (user) {
      // Escucha en tiempo real para la última orden
      const unsubscribe = getOrderStatus(user.uid, (latestOrder: Order | null) => {
        if (latestOrder) {
          setOrder(latestOrder); // Asigna toda la orden al estado
        } else {
          console.error('No se encontró ninguna orden activa.');
          setOrder(null); // Limpia el estado si no hay órdenes activas
        }
      });
  
      // Carga el menú desde Firestore
      getMenu()
        .then((menuData) => setMenu(menuData))
        .catch((error) => console.error('Error al cargar el menú:', error));
  
      return () => unsubscribe(); // Cancela el listener al desmontar el componente
    }
  }, [user, getOrderStatus, getMenu]);

  // Función para abrir el menú
  const handleAddMoreItems = () => {
    if (order?.state === 'procesando') {
      Alert.alert('No se pueden añadir más elementos', 'La orden ya está en proceso y no se pueden realizar cambios.');
      return;
    }
    setMenuVisible(true); // Muestra el modal del menú
  };

  // Función para ajustar la cantidad de un elemento
  const adjustItemQuantity = (itemId: string, delta: number) => {
    setSelectedItems((prev) => {
      const newQuantity = (prev[itemId] || 0) + delta;
      if (newQuantity <= 0) {
        const { [itemId]: _, ...rest } = prev; // Elimina el elemento si la cantidad es 0
        return rest;
      }
      return { ...prev, [itemId]: newQuantity };
    });
  };

  // Función para confirmar los elementos seleccionados
  const confirmSelection = () => {
    const newItems: { dish: string; quantity: number; price: number }[] = Object.entries(selectedItems)
      .map(([itemId, quantity]) => {
        const menuItem = menu.find((item) => item.ID_dish === itemId); // Cambia item.id por item.ID_dish
        return menuItem ? { dish: menuItem.dish, quantity, price: menuItem.price } : null; // Cambia menuItem.name por menuItem.dish
      })
      .filter((item): item is { dish: string; quantity: number; price: number } => item !== null);
  
    if (newItems.length === 0) {
      Alert.alert('No se seleccionaron elementos', 'Por favor selecciona al menos un elemento.');
      return;
    }
  
    const updatedOrder = {
      ...order,
      order: [...(order?.order || []), ...newItems], // Agrega los nuevos elementos a la lista existente
      total: (order?.total || 0) + newItems.reduce((sum, item) => sum + item.price * item.quantity, 0), // Actualiza el total
    };
  
    if (order) {
      try {
        updateOrder(order.ID_Order, { order: updatedOrder.order, total: updatedOrder.total });
        Alert.alert('Elementos añadidos', 'Los nuevos elementos han sido añadidos a tu orden.');
        setMenuVisible(false); // Cierra el modal
        setSelectedItems({}); // Limpia la selección
      } catch (error) {
        console.error('Error al añadir los elementos:', error);
        Alert.alert('Error', 'No se pudieron añadir los elementos a la orden.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* Flecha para regresar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Estado de tu Orden</Text>
      </View>
      
      {order ? (
        <ScrollView style={styles.content}>
          {/* Estado de la orden */}
          <View style={styles.statusContainer}>
            <Text style={styles.statusTitle}>Estado: {order.state}</Text>
            <Text style={styles.statusDescription}>
              {order.state === 'recibido'
                ? 'Tu orden ha sido recibida y está en preparación.'
                : order.state === 'en proceso'
                ? 'Tu orden está siendo preparada.'
                : order.state === 'entregado'
                ? 'Tu orden ha sido entregada.'
                : 'Estado desconocido.'
              },
              {order.statusUpdatedAt && (
                <Text style={styles.timestamp}>
                  Última actualización: {new Date(order.statusUpdatedAt).toLocaleString()}
                </Text>
              )},
            </Text>
          </View>

          {/* Detalles de la orden */}
          <View style={styles.orderDetails}>
            <Text style={styles.sectionTitle}>Detalles de la Orden</Text>
            {order.order.map((item, index) => (
              <View key={index} style={styles.orderItem}>
                <Text style={styles.itemName}>{item.dish}</Text>
                <Text style={styles.itemQuantity}>Cantidad: {item.quantity}</Text>
              </View>
            ))}
            <Text style={styles.totalPrice}>Total: ${order.total.toFixed(2)}</Text>
          </View>

          {/* Información adicional */}
          <View style={styles.additionalInfo}>
            <Text style={styles.sectionTitle}>Información Adicional</Text>
            <Text style={styles.infoText}>Mesa: {order.table}</Text>
          </View>

          {/* Botones */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={handleAddMoreItems}>
              <Text style={styles.buttonText}>Añadir más platos o bebidas</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.noOrderContainer}>
          <Text style={styles.noOrderText}>No tienes órdenes activas.</Text>
        </View>
      )}

      {/* Modal del menú */}
      <Modal visible={isMenuVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Menú</Text>
          <FlatList
            data={menu}
            keyExtractor={(item) => item.ID_dish}
            renderItem={({ item }) => (
              <View style={styles.menuItem}>
                <Text style={styles.menuItemName}>{item.dish}</Text> {/* Cambia item.name por item.dish */}
                <Text style={styles.menuItemPrice}>${item.price.toFixed(2)}</Text>
                <View style={styles.quantityControls}>
                  <TouchableOpacity onPress={() => adjustItemQuantity(item.ID_dish, -1)}>
                    <Ionicons name="remove-circle-outline" size={24} color="#ff0000" />
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{selectedItems[item.ID_dish] || 0}</Text>
                  <TouchableOpacity onPress={() => adjustItemQuantity(item.ID_dish, 1)}>
                    <Ionicons name="add-circle-outline" size={24} color="#00ff00" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
          <TouchableOpacity style={styles.confirmButton} onPress={confirmSelection}>
            <Text style={styles.confirmButtonText}>Confirmar selección</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    backgroundColor: '#ffa500',
    padding: 16,
    paddingTop: 0, // lo maneja SafeAreaView
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: { padding: 16 },
  statusContainer: { backgroundColor: '#f9f9f9', padding: 16, borderRadius: 8, marginBottom: 16 },
  statusTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  statusDescription: { fontSize: 14, color: '#555', marginTop: 8 },
  orderDetails: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  orderItem: { marginBottom: 10 },
  itemName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  itemQuantity: { fontSize: 14, color: '#555' },
  totalPrice: { fontSize: 16, fontWeight: 'bold', color: '#333', marginTop: 10 },
  additionalInfo: { backgroundColor: '#f9f9f9', padding: 16, borderRadius: 8 },
  infoText: { fontSize: 14, color: '#555', marginBottom: 8 },
  buttonContainer: { marginTop: 16 },
  button: {
    backgroundColor: '#ffa500',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  noOrderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noOrderText: { fontSize: 16, color: '#888' },
  modalContainer: { flex: 1, padding: 16, backgroundColor: '#fff' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  menuItemName: { fontSize: 16, fontWeight: 'bold' },
  menuItemPrice: { fontSize: 14, color: '#555' },
  quantityControls: { flexDirection: 'row', alignItems: 'center' },
  quantityText: { marginHorizontal: 8, fontSize: 16 },
  confirmButton: { backgroundColor: '#ffa500', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  confirmButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  timestamp: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
  },   
});