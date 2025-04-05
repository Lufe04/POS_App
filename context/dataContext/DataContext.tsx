import React, { createContext, useContext, useState } from 'react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/utils/FirebaseConfig'; // Asegúrate de que este archivo esté configurado correctamente

// Define la estructura de una orden
interface Order {
  ID_Client: string;
  ID_Order: string;
  date: string;
  order: { dish: string; quantity: number }[]; // Lista de platos y cantidades
  state: 'recibido' | 'en proceso' | 'entregado';
  table: number;
  total: number;
}

// Define el contexto
interface DataContextProps {
  orders: Order[];
  createOrder: (newOrder: Omit<Order, 'ID_Order'>) => Promise<void>;
  getOrders: () => Promise<void>;
  updateOrder: (ID_Order: string, updatedFields: Partial<Order>) => Promise<void>;
  deleteOrder: (ID_Order: string) => Promise<void>;
}

const DataContext = createContext<DataContextProps | undefined>(undefined);

// Proveedor del contexto
export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);

  // Crear una nueva orden
  const createOrder = async (newOrder: Omit<Order, 'ID_Order'>) => {
    try {
      const ID_Order = crypto.randomUUID(); // Genera un ID único para la orden
      const docRef = await addDoc(collection(db, 'orders'), {
        ...newOrder,
        ID_Order, // Agrega el ID generado
      });
      console.log('Orden creada con ID:', docRef.id);
      await getOrders(); // Actualiza la lista de órdenes
    } catch (error) {
      console.error('Error al crear la orden:', error);
    }
  };

  // Leer todas las órdenes
  const getOrders = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'orders'));
      const ordersData = querySnapshot.docs.map((doc) => ({
        ID_Order: doc.id,
        ...doc.data(),
      })) as Order[];

      setOrders(ordersData);
      console.log('Órdenes obtenidas:', ordersData);
    } catch (error) {
      console.error('Error al obtener las órdenes:', error);
    }
  };

  // Actualizar una orden
  const updateOrder = async (ID_Order: string, updatedFields: Partial<Order>) => {
    try {
      const orderRef = doc(db, 'orders', ID_Order);
      await updateDoc(orderRef, updatedFields); // Actualiza los campos proporcionados
      console.log(`Orden actualizada: ${ID_Order}, Campos:`, updatedFields);
      await getOrders(); // Actualiza la lista de órdenes
    } catch (error) {
      console.error('Error al actualizar la orden:', error);
    }
  };

  // Eliminar una orden
  const deleteOrder = async (ID_Order: string) => {
    try {
      const orderRef = doc(db, 'orders', ID_Order);
      await deleteDoc(orderRef);
      console.log('Orden eliminada:', ID_Order);
      await getOrders(); // Actualiza la lista de órdenes
    } catch (error) {
      console.error('Error al eliminar la orden:', error);
    }
  };

  return (
    <DataContext.Provider value={{ orders, createOrder, getOrders, updateOrder, deleteOrder }}>
      {children}
    </DataContext.Provider>
  );
};

// Hook para usar el contexto
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData debe ser usado dentro de un DataProvider');
  }
  return context;
};