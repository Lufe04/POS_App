import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import { useData } from '@/context/dataContext/OrderContext'; // Importa el contexto de órdenes

export default function CashierOrdersScreen() {
  const { orders, getOrders, updateOrder } = useData(); // Accede a las órdenes y métodos del contexto
  const [filteredOrders, setFilteredOrders] = useState(orders); // Estado local para filtrar órdenes
  const [filter, setFilter] = useState<'recibido' | 'en proceso' | 'entregado' | 'Paid' | null>(null); // Filtro de estado
  const [selectedOrder, setSelectedOrder] = useState<{ ID_Order: string; total: number; order: { dish: string; quantity: number }[]; allergies?: string[]; state: string; table: string } | null>(null); // Orden seleccionada
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false); // Modal de detalles
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false); // Modal de pago

  // Cargar las órdenes al montar el componente
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        await getOrders(); // Llama al método del contexto para obtener las órdenes
      } catch (error) {
        Alert.alert('Error', 'Hubo un problema al cargar las órdenes.');
      }
    };

    fetchOrders();
  }, []);

  // Actualizar las órdenes filtradas cuando cambie el filtro o las órdenes
  useEffect(() => {
    if (filter) {
      setFilteredOrders(orders.filter((order) => order.state === filter));
    } else {
      setFilteredOrders(orders);
    }
  }, [filter, orders]);

  // Manejar el pago de la orden
  const handlePayOrder = async () => {
    if (!selectedOrder) return;

    try {
      await updateOrder(selectedOrder.ID_Order, { state: 'Paid' }); // Cambia el estado a "Paid"
      Alert.alert('Pago realizado', 'El estado de la orden ha sido actualizado a "Paid".');
      setIsPaymentModalVisible(false); // Cierra el modal de pago
    } catch (error) {
      Alert.alert('Error', 'Hubo un problema al realizar el pago.');
    }
  };

  // Renderizar cada orden
  // Renderizar cada orden
const renderOrder = ({ item }: { item: any }) => (
  <TouchableOpacity
    style={styles.orderCard}
    onPress={() => {
      setSelectedOrder(item);
      setIsDetailsModalVisible(true);
    }}
  >
    <View>
      <Text style={styles.orderText}>Mesa: {item.table}</Text>
      <Text style={styles.orderText}>
        Total: ${typeof item.total === 'number' ? item.total.toFixed(2) : '0.00'}
      </Text>
    </View>
    <View
      style={[
        styles.statusBadge,
        item.state === 'recibido' && styles.received,
        item.state === 'en proceso' && styles.inProcess,
        item.state === 'entregado' && styles.delivered,
        item.state === 'Paid' && styles.paid,
      ]}
    >
      <Text style={styles.statusText}>{item.state}</Text>
    </View>
  </TouchableOpacity>
);

  return (
    <View style={styles.container}>
      {/* Filtros */}
      <View style={styles.filterContainer}>
        {['recibido', 'en proceso', 'entregado', 'Paid'].map((state) => (
          <TouchableOpacity
            key={state}
            style={[
              styles.filterButton,
              filter === state && styles.filterButtonSelected,
            ]}
            onPress={() => setFilter(filter === state ? null : (state as 'recibido' | 'en proceso' | 'entregado' | 'Paid'))}
          >
            <Text style={styles.filterButtonText}>{state}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista de órdenes */}
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.ID_Order}
        renderItem={renderOrder}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No hay órdenes disponibles.</Text>
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      />

      {/* Modal de detalles */}
{selectedOrder && (
  <Modal visible={isDetailsModalVisible} animationType="slide" transparent>
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Detalles de la Orden</Text>
        <FlatList
          data={selectedOrder.order}
          keyExtractor={(item, index) => `${item.dish}-${index}`}
          renderItem={({ item }) => (
            <View style={styles.dishContainer}>
              <Text style={styles.dishText}>{item.dish}</Text>
              <Text style={styles.dishText}>Cantidad: {item.quantity}</Text>
            </View>
          )}
        />
        <Text style={styles.allergiesText}>
          Alergias: {selectedOrder.allergies?.join(', ') || 'Ninguna'}
        </Text>
        
        {/* Condicional para mostrar el botón de pago solo en órdenes entregadas */}
        {selectedOrder.state === 'entregado' && (
          <TouchableOpacity
            style={styles.payButton}
            onPress={() => {
              setIsDetailsModalVisible(false);
              setIsPaymentModalVisible(true);
            }}
          >
            <Text style={styles.payButtonText}>Realizar Pago</Text>
          </TouchableOpacity>
        )}
        
        {/* Mensaje informativo para órdenes que no se pueden pagar aún */}
        {selectedOrder.state !== 'entregado' && selectedOrder.state !== 'Paid' && (
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              Esta orden no puede pagarse hasta que esté en estado "entregado"
            </Text>
          </View>
        )}
        
        {/* Mensaje para órdenes ya pagadas */}
        {selectedOrder.state === 'Paid' && (
          <View style={[styles.infoContainer, styles.paidInfo]}>
            <Text style={styles.paidText}>
              Esta orden ya ha sido pagada
            </Text>
          </View>
        )}
        
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setIsDetailsModalVisible(false)}
        >
          <Text style={styles.closeButtonText}>Cerrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
)}

      {/* Modal de pago */}
      {selectedOrder && (
        <Modal visible={isPaymentModalVisible} animationType="slide" transparent>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Total a Pagar</Text>
              <Text style={styles.totalText}>${selectedOrder.total.toFixed(2)}</Text>
              <TouchableOpacity style={styles.payButton} onPress={handlePayOrder}>
                <Text style={styles.payButtonText}>Confirmar Pago</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsPaymentModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  filterButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#ddd',
  },
  filterButtonSelected: {
    backgroundColor: '#ffa500',
  },
  filterButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  orderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
  },
  statusBadge: {
    padding: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  received: {
    backgroundColor: '#007bff',
  },
  inProcess: {
    backgroundColor: '#ffa500',
  },
  delivered: {
    backgroundColor: '#28a745',
  },
  paid: {
    backgroundColor: '#6c757d',
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  orderText: {
    fontSize: 16,
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#999',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  dishContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  dishText: {
    fontSize: 16,
    color: '#333',
  },
  allergiesText: {
    fontSize: 14,
    color: '#666',
    marginTop: 16,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  payButton: {
    marginTop: 16,
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  payButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: '#ff4d4d',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  // Añadir a los estilos existentes
infoContainer: {
  backgroundColor: '#f8f9fa',
  padding: 12,
  borderRadius: 8,
  marginTop: 16,
  width: '100%',
  alignItems: 'center',
},
infoText: {
  color: '#6c757d',
  fontStyle: 'italic',
  textAlign: 'center',
},
paidInfo: {
  backgroundColor: '#e8f5e9',
},
paidText: {
  color: '#28a745',
  fontWeight: 'bold',
  textAlign: 'center',
},
});