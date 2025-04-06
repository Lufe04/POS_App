import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from "react-native";
import { useMenu, MenuItem } from "@/context/dataContext/MenuContext";

export default function AdminScreen() {
  const { menu, addMenuItem, deleteMenuItem } = useMenu();

  const [newDish, setNewDish] = useState<{
    name: string;
    description: string;
    price: string;
    type: "plato" | "bebida" | "entrada" | "postre";
  }>({
    name: "",
    description: "",
    price: "",
    type: "plato",
  });

  const handleAddMenuItem = async () => {
    if (!newDish.name || !newDish.description || !newDish.price || !newDish.type) {
      Alert.alert("Error", "Por favor, completa todos los campos.");
      return;
    }
    try {
      await addMenuItem({
          name: newDish.name,
          description: newDish.description,
          price: parseFloat(newDish.price),
          type: newDish.type,
          dish: ""
      });
      setNewDish({ name: "", description: "", price: "", type: "plato" });
      Alert.alert("Éxito", "Plato agregado correctamente.");
    } catch (error) {
      Alert.alert("Error", "Hubo un problema al agregar el plato.");
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    try {
      await deleteMenuItem(id);
      Alert.alert("Éxito", "Plato eliminado correctamente.");
    } catch (error) {
      Alert.alert("Error", "Hubo un problema al eliminar el plato.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Administración de Menú</Text>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Nombre del plato"
          value={newDish.name}
          onChangeText={(text) => setNewDish({ ...newDish, name: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Descripción"
          value={newDish.description}
          onChangeText={(text) => setNewDish({ ...newDish, description: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Precio"
          keyboardType="numeric"
          value={newDish.price}
          onChangeText={(text) => setNewDish({ ...newDish, price: text })}
        />
        <View style={styles.toggleContainer}>
          {["plato", "bebida", "entrada", "postre"].map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.toggleButton,
                newDish.type === type && styles.toggleButtonSelected,
              ]}
              onPress={() => setNewDish({ ...newDish, type: type as "plato" | "bebida" | "entrada" | "postre" })}
            >
              <Text
                style={[
                  styles.toggleButtonText,
                  newDish.type === type && styles.toggleButtonTextSelected,
                ]}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.button} onPress={handleAddMenuItem}>
          <Text style={styles.buttonText}>Agregar Plato</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={menu}
        keyExtractor={(item) => item.ID_dish}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemText}>{item.name}</Text>
            <Text style={styles.itemText}>{item.description}</Text>
            <Text style={styles.itemText}>${item.price}</Text>
            <Text style={styles.itemText}>Tipo: {item.type}</Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteMenuItem(item.ID_dish)}
            >
              <Text style={styles.buttonText}>Eliminar</Text>
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
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  form: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    backgroundColor: "#f9f9f9",
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  toggleButtonSelected: {
    backgroundColor: "#ffa500",
    borderColor: "#ffa500",
  },
  toggleButtonText: {
    color: "#333",
    fontWeight: "bold",
  },
  toggleButtonTextSelected: {
    color: "#fff",
  },
  button: {
    backgroundColor: "#ffa500",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  deleteButton: {
    backgroundColor: "#ff4d4d",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  item: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#f9f9f9",
  },
  itemText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 4,
  },
});