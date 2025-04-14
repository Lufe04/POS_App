import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, FlatList, Modal, Alert, Switch } from 'react-native';
import { Icon } from 'react-native-elements';
import { useRouter } from 'expo-router';
import { useData } from '@/context/dataContext/OrderContext'; // Importa el DataContext
import { useAuth} from '@/context/authContext/AuthContext'; // Importa el contexto de autenticación
import { useMenu } from '@/context/dataContext/MenuContext'; // Importa el contexto del menú
import { getPublicImageUrl } from '@/utils/SuperbaseConfig';
import ModalSelector from 'react-native-modal-selector';
import QrScannerModal from '@/components/QrCameraModal';
import { Feather } from '@expo/vector-icons';

const categories = [
  { label: 'Platos fuertes', type: 'plato' },
  { label: 'Postres', type: 'postre' },
  { label: 'Bebidas', type: 'bebida' },
  { label: 'Entradas', type: 'entrada' },
];

export default function MenuScreen() {
  const { menu } = useMenu(); // Obtén los datos del menú desde el contexto
  const [selectedCategory, setSelectedCategory] = useState(categories[0].type); // Categoría seleccionada
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [isCartVisible, setIsCartVisible] = useState(false); // Estado para mostrar/ocultar el carrito
  const [step, setStep] = useState(1); // Estado para manejar el paso actual
  const [tableNumber, setTableNumber] = useState("default"); // Número de mesa
  const [allergies, setAllergies] = useState<{ [key: string]: boolean }>({}); // Estado para las alergias
  const { createOrder } = useData(); // Accede al método createOrder del DataContext
  const { user, signOut } = useAuth(); // Accede al usuario autenticado desde el contexto de autenticación
  const router = useRouter();
  const [isQrVisible, setQrVisible] = useState(false);

  const allergiesList = ['Nueces', 'Miel', 'Camarones', 'Lácteos'];

  // Filtrar los platos según la categoría seleccionada
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
    return cartItems.reduce((total, item) => {
      const price = parseFloat((item?.price?.toString() ?? '0'));
      return total + price * item.quantity;
    }, 0).toFixed(2);
  };

  const handleOrder = async () => {
    const cartItems = getCartItems();
    if (cartItems.length === 0) {
      Alert.alert('Carrito vacío', 'Por favor, agrega productos al carrito antes de ordenar.');
      return;
    }
  
    if (!user) {
      Alert.alert('Error', 'No se pudo identificar al usuario. Por favor, inicia sesión.');
      return;
    }
  
    if (tableNumber === "default") {
      Alert.alert('Número de mesa', 'Por favor, selecciona un número de mesa.');
      return;
    }
  
    const total = getTotalPrice();
    const newOrder = {
      ID_Client: user.uid, // Usa el UID del usuario autenticado como ID_Client
      date: new Date().toISOString(),
      datePlaced: new Date().toISOString(),
      order: cartItems.map((item) => ({
        dish: item.dish ?? '', // Asegúrate de que el nombre del plato sea una cadena
        quantity: item.quantity,
      })),
      state: 'recibido' as 'recibido', // Estado inicial de la orden
      table: parseInt(tableNumber, 10), // Número de mesa seleccionado
      total: parseFloat(total),
      allergies: Object.keys(allergies).filter((key) => allergies[key]), // Lista de alergias seleccionadas
    };
  
    try {
      await createOrder(newOrder); // Llama al método createOrder del DataContext
      Alert.alert('Orden realizada', 'Tu orden ha sido enviada con éxito.');
      setIsCartVisible(false); // Cierra el modal después de ordenar
      setQuantities({}); // Limpia el carrito
      setStep(1); // Reinicia el paso
      router.push('/(app)/client/orderStatus'); // Redirige a la pantalla de estado de la orden
    } catch (error) {
      console.error('Error al realizar la orden:', error);
      Alert.alert('Error', 'Hubo un problema al realizar la orden. Inténtalo de nuevo.');
    }
  };

  function handleDecrease(name: string): void {
    setQuantities((prev) => ({
      ...prev,
      [name]: Math.max((prev[name] || 0) - 1, 0),
    }));
  }

  function handleIncrease(name: string): void {
    setQuantities((prev) => ({
      ...prev,
      [name]: (prev[name] || 0) + 1,
    }));
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      
      <View style={styles.header}>
      <View style={styles.locationContainer}>
        <Icon name="location-on" type="material" color="#ffa500" size={20} />
        <Text style={styles.locationText}>New York, Las Cruces</Text>
      </View>
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
  
      {/* Content Card */}
      <View style={styles.contentCard}>
        {/* Categorías */}
        <View style={styles.tabs}>
          {categories.map((cat, index) => (
            <TouchableOpacity key={index} onPress={() => setSelectedCategory(cat.type)}>
              <Text style={[styles.tab, selectedCategory === cat.type && styles.tabSelected]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* Lista de platos */}
        <FlatList data={filteredPlates} keyExtractor={(item) => item.ID_dish} renderItem={({ item }) => (
          <View style={styles.verticalCard}>
            {item.url && (
              <Image
                source={{ uri: getPublicImageUrl(item.url.replaceAll('"', '')) }}
                style={styles.verticalImage}
                resizeMode="cover"
              />
            )}
            <View style={styles.verticalTextContainer}>
              <Text style={styles.verticalTitle}>{item.dish}</Text> {/* Nombre del plato */}
              <Text style={styles.verticalDescription}>{item.description}</Text> {/* Descripción del plato */}
              <Text style={styles.verticalPrice}>${item.price}</Text> {/* Precio del plato */}
            </View>
            {/* Contador */}
            <View style={styles.counterContainer}>
              <TouchableOpacity
                style={styles.counterButton}
                onPress={() => handleDecrease(item.dish)}
              >
                <Text style={styles.counterText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.counterValue}>
                {quantities[item.dish] || 0}
              </Text>
              <TouchableOpacity
                style={styles.counterButton}
                onPress={() => handleIncrease(item.dish)}
              >
                <Text style={styles.counterText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />  
      </View>
  
      {/* Botón para abrir el carrito */}
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
                      <Text style={styles.cartItemText}>
                        ${((item.price ?? 0) * item.quantity).toFixed(2)}
                      </Text>
                    </View>
                  )}
                />
                <Text style={styles.totalText}>Total: ${getTotalPrice()}</Text>
                <TouchableOpacity
                  style={styles.nextButton}
                  onPress={() => setStep(2)} // Ir a la segunda parte
                >
                  <Text style={styles.nextButtonText}>Continuar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setIsCartVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Cerrar</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>Detalles de la Orden</Text>

                {/* Selección de mesa */}
                <View style={styles.tablePickerContainer}>
                  <Text style={styles.tablePickerLabel}>Número de mesa:</Text>
                  <View style={styles.tablePickerRow}>
                    <View style={styles.selectorWrapper}>
                      <ModalSelector
                        data={[...Array(10).keys()].map((i) => ({
                          key: (i + 1).toString(),
                          label: `Mesa ${i + 1}`,
                        }))}
                        initValue="Selecciona una mesa"
                        onChange={(option) => setTableNumber(option.key)}
                        style={styles.selector}
                        initValueTextStyle={styles.selectorInitText}
                        selectTextStyle={styles.selectorText}
                      >
                        <View style={styles.selector}>
                          <Text style={tableNumber === 'default' ? styles.selectorInitText : styles.selectorText}>
                            {tableNumber === 'default' ? 'Selecciona una mesa' : `Mesa ${tableNumber}`}
                          </Text>
                        </View>
                      </ModalSelector>
                    </View>

                    {/* Botón para escanear QR */}
                    <TouchableOpacity onPress={() => setQrVisible(true)} style={styles.qrButton}>
                      <Feather name="camera" size={20} color="#ffa500" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Selección de alergias */}
                <View style={styles.allergiesContainer}>
                  <Text style={styles.label}>Alergias:</Text>
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
                    setStep(1); // Regresar al paso 1
                    setIsCartVisible(false);
                  }}
                >
                  <Text style={styles.closeButtonText}>Cerrar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
        <QrScannerModal
          isVisible={isQrVisible}
          onClose={() => setQrVisible(false)}
          onCodeScanned={(code) => {
            const match = code.match(/mesa:(\d+)/i);
            if (match && match[1]) {
              setTableNumber(match[1]);
            } else {
              Alert.alert('Código no válido', 'Asegúrate de escanear un código válido con formato "mesa:4".');
            }
          }}
        />
      </Modal>
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
    marginLeft: 'auto', // Alinea el botón al extremo derecho
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
    color: '#666', // Color más tenue para diferenciarlo del título
    marginBottom: 4, // Espaciado inferior
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
      alignItems: 'flex-start',
      width: '100%',
    },
    tablePickerLabel: {
      fontSize: 16,
      fontWeight: '500',
      color: '#333',
      marginBottom: 4,
    },    
    selector: {
      width: '100%',
      backgroundColor: '#f2f2f2',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#ddd',
      padding: 12,
    },
    selectorInitText: {
      color: '#999',
      fontSize: 16,
    },
    selectorText: {
      color: '#333',
      fontSize: 16,
    },
    tablePickerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      gap: 12, // espacio entre selector y botón QR
    },
    qrButton: {
      padding: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#ffa500',
      backgroundColor: '#fff',
    },  
    selectorWrapper: {
      flex: 1,
    },  
});