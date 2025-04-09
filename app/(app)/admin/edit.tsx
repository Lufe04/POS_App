import React, { useState } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useMenu } from "@/context/dataContext/MenuContext";
import { useRouter } from "expo-router";

export default function EditDishListScreen() {
  const { menu } = useMenu();
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filteredMenu = menu.filter(item =>
    item.dish.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (id: string) => {
    router.push({ pathname: "/admin/editDish", params: { id } });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Platos del Menú</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Buscar por nombre"
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={filteredMenu}
        keyExtractor={(item) => item.ID_dish}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => handleSelect(item.ID_dish)}>
            <View>
              <Text style={styles.itemText}>{item.dish}</Text>
              <Text style={styles.itemSubText}>{item.description}</Text>
              <Text style={styles.itemSubText}>${item.price}</Text>
              <Text style={styles.itemSubText}>Tipo: {item.type}</Text>
            </View>
          </TouchableOpacity>
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
});