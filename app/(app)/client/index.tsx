import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
  Switch,
  StyleSheet,
  Platform,
} from 'react-native';
import { useCameraPermissions } from 'expo-camera';
import CameraModal from '@/components/CameraModal';
import { Icon } from 'react-native-elements';
import { useRouter } from 'expo-router';
import { useData } from '@/context/dataContext/OrderContext';
import { useAuth } from '@/context/authContext/AuthContext';
import { useMenu } from '@/context/dataContext/MenuContext';
import { getPublicImageUrl } from '@/utils/SuperbaseConfig';

const categories = [
  { label: 'Platos fuertes', type: 'plato' },
  { label: 'Postres', type: 'postre' },
  { label: 'Bebidas', type: 'bebida' },
  { label: 'Entradas', type: 'entrada' },
];

export default function MenuScreen() {
  const { menu } = useMenu();
  const [selectedCategory, setSelectedCategory] = useState(categories[0].type);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [step, setStep] = useState(1);
  const [tableNumber, setTableNumber] = useState<number | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);

  const [allergies, setAllergies] = useState<{ [key: string]: boolean }>({});
  const allergiesList = ['Nueces', 'Miel', 'Camarones', 'Lácteos'];

  const { createOrder, getAvailableTables } = useData();
  const { user, signOut } = useAuth();
  const router = useRouter();

  const filteredPlates = menu.filter((item) => item.type === selectedCategory);

  const getCartItems = () => {
    return Object.entries(quantities)
      .filter(([_, quantity]) => quantity > 0)
      .map(([name, quantity]) => {
        const item = menu.find((plate) => plate.dish === name);
        return { ...item, quantity };
      });
  };

  const getTotalPrice = () => {
    const cartItems = getCartItems();
    return cartItems
      .reduce((total, item) => {
        const price = parseFloat(item?.price?.toString() ?? '0');
        return total + price * item.quantity;
      }, 0)
      .toFixed(2);
  };

  const assignRandomTable = async () => {
    const today = new Date().toISOString().split('T')[0];
    const availableTables = await getAvailableTables(today);
    if (availableTables.length === 0) {
      Alert.alert('No hay mesas disponibles', 'Por favor espere a que se libere una mesa');
      return null;
    }
    const randomIndex = Math.floor(Math.random() * availableTables.length);
    return availableTables[randomIndex];
  };

  const handleBarCodeScanned = async (data: string): Promise<void> => {
    setIsScanning(false);

    if (!isNaN(Number(data))) {
      const mesa = parseInt(data);
      if (mesa >= 1 && mesa <= 10) {
        setTableNumber(mesa);
        Alert.alert('Mesa asignada', `Mesa ${mesa} asignada correctamente`);
        return;
      }
    }

    // Si nada aplica, asigna mesa aleatoria
    const randomTable = await assignRandomTable();
    if (randomTable) {
      setTableNumber(randomTable);
      Alert.alert('Mesa asignada', `Se te asignó la mesa ${randomTable}`);
    }
  };

  const handleScanQR = async () => {
    if (!permission) return;
    if (permission.status !== 'granted') {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert('Permiso requerido', 'Necesitamos acceso a la cámara para escanear QR');
        return;
      }
    }
    setIsScanning(true);
  };

  const handleOrder = async () => {
    const cartItems = getCartItems();
    if (cartItems.length === 0) {
      Alert.alert('Carrito vacío', 'Agrega productos al carrito antes de ordenar.');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'No se pudo identificar al usuario.');
      return;
    }

    if (!tableNumber) {
      Alert.alert('Número de mesa', 'Por favor, selecciona un número de mesa.');
      return;
    }

    const total = getTotalPrice();
    const newOrder = {
      ID_Client: user.uid,
      date: new Date().toISOString(),
      order: cartItems.map((item) => ({
        dish: item.dish ?? '',
        quantity: item.quantity,
      })),
      state: 'recibido' as 'recibido',
      table: tableNumber,
      total: parseFloat(total),
      allergies: Object.keys(allergies).filter((key) => allergies[key]),
    };

    try {
      await createOrder(newOrder);
      Alert.alert('Orden realizada', 'Tu orden ha sido enviada con éxito.');
      setIsCartVisible(false);
      setQuantities({});
      setStep(1);
      router.push('/(app)/client/orderStatus');
    } catch (error) {
      console.error('Error al realizar la orden:', error);
      Alert.alert('Error', 'Hubo un problema al realizar la orden.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <View style={styles.locationContainer}>
          <Icon name="location-on" type="material" color="#ffa500" size={20} />
          <Text style={styles.locationText}>New York, Las Cruces</Text>
        </View>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={async () => {
            try {
              await signOut();
              router.replace('/auth');
            } catch {
              Alert.alert('Error al cerrar sesión');
            }
          }}
        >
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de productos */}
      <View style={styles.contentCard}>
        <View style={styles.tabs}>
          {categories.map((cat, index) => (
            <TouchableOpacity key={index} onPress={() => setSelectedCategory(cat.type)}>
              <Text style={[styles.tab, selectedCategory === cat.type && styles.tabSelected]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <FlatList
          data={filteredPlates}
          keyExtractor={(item) => item.ID_dish}
          renderItem={({ item }) => (
            <View style={styles.verticalCard}>
              {item.url && (
                <Image
                  source={{ uri: getPublicImageUrl(item.url.replaceAll('"', '')) }}
                  style={styles.verticalImage}
                  resizeMode="cover"
                />
              )}
              <View style={styles.verticalTextContainer}>
                <Text style={styles.verticalTitle}>{item.dish}</Text>
                <Text style={styles.verticalDescription}>{item.description}</Text>
                <Text style={styles.verticalPrice}>${item.price}</Text>
              </View>
              <View style={styles.counterContainer}>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() =>
                    setQuantities((prev) => ({
                      ...prev,
                      [item.dish]: Math.max((prev[item.dish] || 0) - 1, 0),
                    }))
                  }
                >
                  <Text style={styles.counterText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.counterValue}>{quantities[item.dish] || 0}</Text>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() =>
                    setQuantities((prev) => ({
                      ...prev,
                      [item.dish]: (prev[item.dish] || 0) + 1,
                    }))
                  }
                >
                  <Text style={styles.counterText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      </View>

      {/* Carrito flotante */}
      <TouchableOpacity style={styles.cartButton} onPress={() => setIsCartVisible(true)}>
        <Icon name="shopping-cart" type="material" color="#fff" size={24} />
      </TouchableOpacity>

      {/* Modal del carrito */}
      <Modal visible={isCartVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {step === 1 ? (
              <>
                <Text style={styles.modalTitle}>Tu Carrito</Text>
                <FlatList
                  data={getCartItems()}
                  keyExtractor={(item) => item.dish ?? 'unknown-dish'}
                  renderItem={({ item }) => (
                    <View style={styles.cartItem}>
                      <Text style={styles.cartItemText}>{item.dish}</Text>
                      <Text style={styles.cartItemText}>x{item.quantity}</Text>
                      <Text style={styles.cartItemText}>${((item.price ?? 0) * item.quantity).toFixed(2)}</Text>
                    </View>
                  )}
                />
                <Text style={styles.totalText}>Total: ${getTotalPrice()}</Text>
                <TouchableOpacity style={styles.nextButton} onPress={() => setStep(2)}>
                  <Text style={styles.nextButtonText}>Continuar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeButton} onPress={() => setIsCartVisible(false)}>
                  <Text style={styles.closeButtonText}>Cerrar</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>Detalles de la Orden</Text>

                {/* Mesa + QR */}
                <View style={styles.tablePickerContainer}>
                  <View style={styles.tableSelectionContainer}>
                    <Text style={styles.tablePickerLabel}>Número de mesa:</Text>
                    <TouchableOpacity style={styles.qrButton} onPress={handleScanQR}>
                      <Icon name="qr-code-scanner" type="material" color="#fff" size={20} />
                    </TouchableOpacity>
                  </View>
                  
                    
                </View>

                {/* Alergias */}
                <View style={styles.allergiesContainer}>
                  <View>
                    <Text style={styles.label}>Alergias:</Text>
                  </View>
                  {allergiesList.map((allergy) => (
                    <View key={allergy} style={styles.allergyItem}>
                      <Text style={styles.allergyText}>{allergy}</Text>
                      <Switch
                        value={allergies[allergy] || false}
                        onValueChange={(value) =>
                          setAllergies((prev) => ({ ...prev, [allergy]: value }))
                        }
                      />
                    </View>
                  ))}
                </View>

                <TouchableOpacity style={styles.orderButton} onPress={handleOrder}>
                  <Text style={styles.orderButtonText}>Confirmar Orden</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => {
                    setStep(1);
                    setIsCartVisible(false);
                  }}
                >
                  <Text style={styles.closeButtonText}>Cerrar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* 🔍 Modal con cámara y escaneo */}
      <CameraModal
        isVisible={isScanning}
        onClose={() => setIsScanning(false)}
        onImageSelected={handleBarCodeScanned}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 20,
    backgroundColor: '#000',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  contentCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    marginTop: -10,
  },
  logoutButton: {
    backgroundColor: '#ff4d4d',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tab: {
    marginRight: 16,
    fontSize: 14,
    color: '#999',
    fontWeight: '600',
  },
  tabSelected: {
    color: '#ffa500',
    borderBottomWidth: 2,
    borderBottomColor: '#ffa500',
    paddingBottom: 4,
  },
  verticalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  verticalImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 12,
  },
  verticalTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  verticalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  verticalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  verticalPrice: {
    fontSize: 14,
    color: '#ff6b00',
    fontWeight: '600',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 100,
  },
  counterButton: {
    backgroundColor: '#ffa500',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  counterValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  cartButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#ffa500',
    borderRadius: 30,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
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
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  cartItemText: {
    fontSize: 16,
    color: '#333',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: '#ffa500',
    padding: 10,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  closeIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  nextButton: {
    marginTop: 16,
    backgroundColor: '#ffa500',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  orderButton: {
    marginTop: 16,
    backgroundColor: '#ffa500',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  orderButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  picker: {
    height: 50,
    width: '100%',
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    marginBottom: 16,
  },
  allergyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  allergiesContainer: {
    marginTop: 16,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  allergyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  tablePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  tablePickerLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginRight: 16,
  },
  tablePicker: {
    width: 140,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  tableSelectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  qrButton: {
    backgroundColor: '#ffa500',
    padding: 8,
    borderRadius: 8,
  },
});
