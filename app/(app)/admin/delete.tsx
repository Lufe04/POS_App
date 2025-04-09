// admin/delete.tsx
import React, { useState } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { useMenu } from "@/context/dataContext/MenuContext";
import { useRouter } from "expo-router";

export default function DeleteDishScreen() {
  const { menu, deleteMenuItem } = useMenu();
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filteredMenu = menu.filter(item => item.dish.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = (id: string) => {
    console.log("Botón de eliminar presionado para ID:", id);
    Alert.alert("Confirmar eliminación", "¿Estás seguro de que deseas eliminar este plato?",[
        { text: "Cancelar", style: "cancel", onPress: () => console.log("Eliminación cancelada") },
        { text: "Eliminar", style: "destructive", onPress: async () => {
            console.log("Eliminando plato con ID:", id);
            try {
              await deleteMenuItem(id);
              Alert.alert("Eliminado", "El plato ha sido eliminado correctamente.");
            } catch (error) {
              console.error("Error al eliminar el plato:", error);
              Alert.alert("Error", "No se pudo eliminar el plato.");
            }
        },},
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Eliminar Platos del Menú</Text>
      <TextInput style={styles.searchInput} placeholder="Buscar por nombre" value={search} onChangeText={setSearch}/>
      <FlatList
        data={filteredMenu}
        keyExtractor={(item) => item.ID_dish}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemText}>{item.dish}</Text>
              <Text style={styles.itemSubText}>{item.description}</Text>
              <Text style={styles.itemSubText}>${item.price}</Text>
              <Text style={styles.itemSubText}>Tipo: {item.type}</Text>
            </View>
            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.ID_dish)}>
              <Text style={styles.deleteButtonText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
    textAlign: 'center'
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    backgroundColor: "#f0f0f0",
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
  itemText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  itemSubText: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    backgroundColor: '#ff4d4d',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
