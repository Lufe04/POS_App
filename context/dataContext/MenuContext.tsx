import React, { createContext, useContext, useState, useEffect } from "react";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/utils/FirebaseConfig"; // Asegúrate de que este sea el path correcto a tu configuración de Firebase

// Define la estructura del menú
export interface MenuItem {
  ID_dish: string;
  description: string;
  dish: string;
  price: number;
}

// Define el contexto
interface MenuContextProps {
  menu: MenuItem[];
  addMenuItem: (item: Omit<MenuItem, "ID_dish">) => Promise<void>;
  updateMenuItem: (id: string, updatedItem: Partial<MenuItem>) => Promise<void>;
  deleteMenuItem: (id: string) => Promise<void>;
  fetchMenu: () => Promise<void>;
  getMenu: () => Promise<MenuItem[]>; // Added getMenu to the interface
}

// Define la estructura del menú
export interface MenuItem {
    ID_dish: string; // ID del plato (usado como ID del documento en Firestore)
    name: string; // Nombre del plato
    description: string; // Descripción del plato
    price: number; // Precio del plato
    type: "plato" | "bebida" | "entrada" | "postre"; // Tipo del plato
  }

// Crear el contexto
const MenuContext = createContext<MenuContextProps | undefined>(undefined);

// Proveedor del contexto
export const MenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [menu, setMenu] = useState<MenuItem[]>([]);

  // Leer el menú desde Firebase
  const fetchMenu = async () => {
    try {
      const menuRef = collection(db, "menu");
      const querySnapshot = await getDocs(menuRef);
      const menuData = querySnapshot.docs.map((doc) => ({
        ID_dish: doc.id, // Usa el ID del documento como ID_dish
        ...(doc.data() as Omit<MenuItem, "ID_dish">), // Asegúrate de que los datos coincidan con MenuItem
      }));
      setMenu(menuData);
    } catch (error) {
      console.error("Error al obtener el menú:", error);
    }
  };

     const getMenu = async (): Promise<MenuItem[]> => {
    try {
      const menuRef = collection(db, "menu");
      const querySnapshot = await getDocs(menuRef);
      const menuData = querySnapshot.docs.map((doc) => ({
        ID_dish: doc.id, // Usa el ID del documento como ID_dish
        ...(doc.data() as Omit<MenuItem, "ID_dish">), // Asegúrate de que los datos coincidan con MenuItem
      }));
      return menuData;
    } catch (error) {
      console.error("Error al obtener el menú:", error);
      return [];
    }
  };

  // Crear un nuevo elemento en el menú
  const addMenuItem = async (item: Omit<MenuItem, "ID_dish">) => {
    try {
      const menuRef = collection(db, "menu");
  
      // Obtener el último ID_dish y calcular el siguiente
      const querySnapshot = await getDocs(menuRef);
      const menuItems = querySnapshot.docs.map((doc) => doc.data() as MenuItem);
      const lastId = menuItems.length > 0 ? Math.max(...menuItems.map((menu) => parseInt(menu.ID_dish))) : 0;
      const nextId = (lastId + 1).toString();
  
      // Agregar el nuevo plato con el ID_dish calculado
      await addDoc(menuRef, { ...item, ID_dish: nextId });
      await fetchMenu(); // Actualiza el menú después de agregar
    } catch (error) {
      console.error("Error al agregar un elemento al menú:", error);
    }
  };

  // Actualizar un elemento del menú
  const updateMenuItem = async (id: string, updatedItem: Partial<MenuItem>) => {
    try {
      const menuDoc = doc(db, "menu", id);
      await updateDoc(menuDoc, updatedItem);
      await fetchMenu(); // Actualiza el menú después de modificar
    } catch (error) {
      console.error("Error al actualizar el elemento del menú:", error);
    }
  };

  // Eliminar un elemento del menú
  const deleteMenuItem = async (id: string) => {
    try {
      const menuDoc = doc(db, "menu", id);
      await deleteDoc(menuDoc);
      await fetchMenu(); // Actualiza el menú después de eliminar
    } catch (error) {
      console.error("Error al eliminar el elemento del menú:", error);
    }
  };

  // Cargar el menú al montar el proveedor
  useEffect(() => {
    fetchMenu();
  }, []);

  return (
    <MenuContext.Provider value={{ menu, addMenuItem, updateMenuItem, deleteMenuItem, fetchMenu, getMenu }}>
      {children}
    </MenuContext.Provider>
  );
};

// Hook para usar el contexto
export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error("useMenu debe usarse dentro de un MenuProvider");
  }
  return context;
};