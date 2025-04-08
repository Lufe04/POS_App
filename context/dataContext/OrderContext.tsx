import React, { createContext, useContext, useState } from 'react';
import { collection, addDoc, getDocs, getDoc, updateDoc, deleteDoc, doc, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/utils/FirebaseConfig'; // Asegúrate de que este archivo esté configurado correctamente

// Define la estructura de una orden
interface Order {
  ID_Client: string;
  ID_Order: string;
  date: string;
  order: { dish: string; quantity: number }[]; // Lista de platos y cantidades
  state: 'recibido' | 'en proceso' | 'entregado' | 'Paid'; // Estado de la orden
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
  getOrderStatus: (ID_Client: string, callback: (order: Order | null) => void) => () => void; // Listener en tiempo real
}

const DataContext = createContext<DataContextProps | undefined>(undefined);

// Proveedor del contexto
export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);

  // Crear una nueva orden
  const createOrder = async (newOrder: Omit<Order, 'ID_Order'>) => {
    try {
      const docRef = await addDoc(collection(db, 'orders'), {
        ...newOrder,
        date: new Date().toISOString(), // Campo necesario para orden cronológico
      });
  
      // Guarda también el ID generado por Firestore
      await updateDoc(docRef, { ID_Order: docRef.id });
  
      console.log('Orden creada con ID:', docRef.id);
      await getOrders(); // Refresca la lista
    } catch (error) {
      console.error('Error al crear la orden:', error);
    }
  };

  // Leer todas las órdenes
  const getOrders = async () => {
    try {
      const q = query(collection(db, 'orders'), orderBy('date', 'asc')); // Asegura orden cronológico
      const querySnapshot = await getDocs(q);
      const ordersData = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        ID_Order: doc.id,
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
      console.log('Intentando actualizar la orden con ID:', ID_Order);
  
      const orderRef = doc(db, 'orders', ID_Order);
      const docSnapshot = await getDoc(orderRef);
  
      if (!docSnapshot.exists()) {
        throw new Error(`El documento con ID ${ID_Order} no existe.`);
      }
  
      await updateDoc(orderRef, {
        ...updatedFields,
        statusUpdatedAt: new Date().toISOString(), // ⏱ Marca el momento del cambio
      });
      console.log(`Orden actualizada: ${ID_Order}, Campos:`, updatedFields);
      await getOrders(); // Actualiza la lista de órdenes
    } catch (error) {
      console.error('Error al actualizar la orden:', error);
      throw error; // Lanza el error para manejarlo en la llamada
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

  const getOrderStatus = (ID_Client: string, callback: (order: Order | null) => void): (() => void) => {
    console.log('getOrderStatus llamado con:', { ID_Client });
  
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('ID_Client', '==', ID_Client),
      orderBy('date', 'desc'),
      limit(1)
    );
  
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const lastOrder = { ...doc.data(), ID_Order: doc.id } as Order; // Incluye el ID del documento
        console.log('Última orden obtenida (en tiempo real):', lastOrder);
  
        if (typeof callback === 'function') {
          callback(lastOrder);
        } else {
          console.error('El callback proporcionado no es una función.');
        }
      } else {
        console.warn('No se encontraron órdenes para el cliente.');
        if (typeof callback === 'function') {
          callback(null);
        }
      }
    });
  
    return unsubscribe;
  };
  
  return (
    <DataContext.Provider
      value={{
        orders,
        createOrder,
        getOrders,
        updateOrder,
        deleteOrder,
        getOrderStatus, // Agregamos la nueva función al contexto
      }}
    >
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