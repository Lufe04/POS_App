import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, FlatList, Modal, Alert, Switch } from 'react-native';
import { Icon } from 'react-native-elements';
import { useRouter } from 'expo-router';
import { useData } from '@/context/dataContext/DataContext'; // Importa el DataContext
import { useAuth } from '@/context/authContext/AuthContext'; // Importa el contexto de autenticación
import { Picker } from '@react-native-picker/picker';

const categories = ['Platos fuertes', 'Postres', 'Bebidas', 'Entradas'];

const allPlates: { [key: string]: { name: string; file: string; price: string }[] } = {
  'Platos fuertes': [
    { name: 'Plato1', file: 'plato1.jpg', price: '$10.00' },
  ],
  'Postres': [
    { name: 'Postre1', file: 'postre1.jpg', price: '$6.00' },
  ],
  'Entradas': [
    { name: 'Entrada1', file: 'entrada1.jpg', price: '$5.00' },
  ],
  'Bebidas': [
    { name: 'Café', file: 'bebida1.jpg', price: '$3.00' },
  ],
};

export default function MenuScreen() {
  const [selectedCategory, setSelectedCategory] = useState('Platos fuertes');
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [isCartVisible, setIsCartVisible] = useState(false); // Estado para mostrar/ocultar el carrito
  const [step, setStep] = useState(1); // Estado para manejar el paso actual
  const [tableNumber, setTableNumber] = useState<number | null>(null); // Número de mesa
  const [allergies, setAllergies] = useState<{ [key: string]: boolean }>({}); // Estado para las alergias
  const { createOrder } = useData(); // Accede al método createOrder del DataContext
  const { user } = useAuth(); // Accede al usuario autenticado desde el contexto de autenticación
  const router = useRouter();

  const allergiesList = ['Nueces', 'Miel', 'Camarones', 'Lácteos'];

  const getCartItems = () => {
    return Object.entries(quantities)
      .filter(([_, quantity]) => quantity > 0)
      .map(([name, quantity]) => {
        const item = Object.values(allPlates).flat().find((plate) => plate.name === name);
        return { ...item, quantity };
      });
  };

  const getTotalPrice = () => {
    const cartItems = getCartItems();
    return cartItems.reduce((total, item) => {
      const price = parseFloat((item?.price?.replace('$', '') ?? '0'));
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
  
    if (!tableNumber) {
      Alert.alert('Número de mesa', 'Por favor, selecciona un número de mesa.');
      return;
    }
  
    const total = getTotalPrice();
    const newOrder = {
      ID_Client: user.uid, // Usa el UID del usuario autenticado como ID_Client
      date: new Date().toISOString(),
      order: cartItems.map((item) => ({
        dish: item.name ?? '', // Asegúrate de que el nombre del plato sea una cadena
        quantity: item.quantity,
      })),
      state: "recibido" as "recibido", // Estado inicial de la orden
      table: tableNumber, // Número de mesa seleccionado
      total: parseFloat(total),
      allergies: Object.keys(allergies).filter((key) => allergies[key]), // Lista de alergias seleccionadas
    };
  
    try {
      await createOrder(newOrder); // Llama al método createOrder del DataContext
      Alert.alert('Orden realizada', 'Tu orden ha sido enviada con éxito.');
      setIsCartVisible(false); // Cierra el modal después de ordenar
      setQuantities({}); // Limpia el carrito
      setStep(1); // Reinicia el paso
    } catch (error) {
      console.error('Error al realizar la orden:', error);
      Alert.alert('Error', 'Hubo un problema al realizar la orden. Inténtalo de nuevo.');
    }
  };

  function getImageUrl(file: string): string {
    // Si las imágenes ya están en el campo `file`, simplemente devuélvelo como URL
    return file;
  }
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
      </View>

      {/* Content Card */}
      <View style={styles.contentCard}>
        {/* Categorías */}
        <View style={styles.tabs}>
          {categories.map((cat, index) => (
            <TouchableOpacity key={index} onPress={() => setSelectedCategory(cat)}>
              <Text style={[styles.tab, selectedCategory === cat && styles.tabSelected]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Lista de platos */}
        <FlatList
          data={allPlates[selectedCategory]}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.verticalCard}>
              <Image
                source={{ uri: getImageUrl(item.file) }}
                style={styles.verticalImage}
              />
              <View style={styles.verticalTextContainer}>
                <Text style={styles.verticalTitle}>{item.name}</Text>
                <Text style={styles.verticalPrice}>{item.price}</Text>
              </View>
              {/* Contador */}
              <View style={styles.counterContainer}>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => handleDecrease(item.name)}
                >
                  <Text style={styles.counterText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.counterValue}>
                  {quantities[item.name] || 0}
                </Text>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => handleIncrease(item.name)}
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

      {/* Ícono del carrito */}
      {/* Ícono del carrito */}
      <TouchableOpacity
        style={styles.cartButton}
        onPress={() => {
          setStep(1); // Restablece el paso al inicial
          setIsCartVisible(true); // Abre el modal del carrito
        }}
      >
        <Icon name="shopping-cart" type="material" color="#fff" size={24} />
      </TouchableOpacity>

      {/* Modal del carrito */}
      <Modal
        visible={isCartVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsCartVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {step === 1 ? (
              <>
                <Text style={styles.modalTitle}>Carrito</Text>
                <FlatList
                  data={getCartItems()}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => (
                    <View style={styles.cartItem}>
                      <Text style={styles.cartItemText}>{item.name}</Text>
                      <Text style={styles.cartItemText}>x{item.quantity}</Text>
                      <Text style={styles.cartItemText}>{item.price}</Text>
                    </View>
                  )}
                />
                <Text style={styles.totalText}>Total: ${getTotalPrice()}</Text>
                <TouchableOpacity
                  style={styles.nextButton}
                  onPress={() => setStep(2)}
                >
                  <Text style={styles.nextButtonText}>Siguiente</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.label}>Número de mesa:</Text>
                <View style={styles.tablePickerContainer}>
                  <Text style={styles.tablePickerLabel}>Número de mesa:</Text>
                  <Picker
                    selectedValue={tableNumber}
                    style={styles.tablePicker}
                    onValueChange={(itemValue) => setTableNumber(itemValue)}
                  >
                    <Picker.Item label="Selecciona" value={null} />
                    {[...Array(10).keys()].map((num) => (
                      <Picker.Item key={num + 1} label={`${num + 1}`} value={num + 1} />
                    ))}
                  </Picker>
                </View>
                <Text style={styles.label}>Alergias:</Text>
                <View style={styles.allergiesContainer}>
                  {allergiesList.map((allergy) => (
                    <View key={allergy} style={styles.allergyItem}>
                      <Text style={styles.allergyText}>{allergy}</Text>
                      <Switch
                        trackColor={{ false: '#ccc', true: '#ffa500' }}
                        thumbColor={allergies[allergy] ? '#fff' : '#f4f3f4'}
                        ios_backgroundColor="#ccc"
                        onValueChange={(value) =>
                          setAllergies((prev) => ({ ...prev, [allergy]: value }))
                        }
                        value={allergies[allergy] || false}
                      />
                    </View>
                  ))}
                </View>
                <TouchableOpacity
                  style={styles.orderButton}
                  onPress={handleOrder}
                >
                  <Text style={styles.orderButtonText}>Ordenar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
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
      paddingHorizontal: 16, // Más espacio interno horizontal
      paddingVertical: 12, // Espaciado vertical para mayor aire
      backgroundColor: '#f9f9f9',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#ddd',
    },
    tablePickerLabel: {
      fontSize: 16,
      fontWeight: '500',
      color: '#333',
      marginRight: 16, // Más espacio entre el texto y el desplegable
    },
    tablePicker: {
      width: 140, // Ajusta el ancho del desplegable
      backgroundColor: '#fff',
      borderRadius: 8,
    },
});