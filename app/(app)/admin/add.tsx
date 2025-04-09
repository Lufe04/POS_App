import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, Platform } from "react-native";
import { useMenu } from "@/context/dataContext/MenuContext";
import { supabase } from "@/utils/SuperbaseConfig";
import { useRouter } from "expo-router";
import CameraModal from "@/components/CameraModal";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";

export default function AddDishScreen() {
  const { addMenuItem } = useMenu();
  const router = useRouter();

  const [cameraModalVisible, setCameraModalVisible] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [newDish, setNewDish] = useState({
    name: "",
    description: "",
    price: "",
    type: "plato" as "plato" | "bebida" | "entrada" | "postre",
    url: "",
  });

  const handleImageSelected = async (uriOrFile: string | File) => {
    try {
      let blob: Blob | Uint8Array;
      let extension = "jpg";
      let contentType = "image/jpeg";
      let preview: string;
  
      if (Platform.OS === "web") {
        // ✅ WEB
        const file = uriOrFile as File;
        extension = file.name.split(".").pop() ?? "jpg";
        contentType = file.type;
        preview = URL.createObjectURL(file);
        blob = file;
      } else {
        // ✅ MÓVIL (Expo Go compatible)
        const uri = uriOrFile as string;
        extension = uri.split(".").pop()?.split("?")[0] ?? "jpg";
        contentType = `image/${extension}`;
        preview = uri;
  
        const manipulated = await ImageManipulator.manipulateAsync(
          uri,
          [],
          { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
        );
  
        console.log("📸 Manipulated URI:", manipulated.uri);
  
        const base64 = await FileSystem.readAsStringAsync(manipulated.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
  
        // 🔁 Convertir base64 a Uint8Array (sin usar Blob)
        const byteCharacters = atob(base64);
        const byteArrays = [];
  
        for (let i = 0; i < byteCharacters.length; i++) {
          byteArrays.push(byteCharacters.charCodeAt(i));
        }
  
        blob = new Uint8Array(byteArrays);
      }
  
      // ✅ Subida a Supabase
      const filename = `dish_${Date.now()}.${extension}`;
      const filePath = `${filename}`;
  
      const { error } = await supabase.storage.from("menu").upload(filePath, blob, {
        cacheControl: "3600",
        upsert: true,
        contentType,
      });
  
      if (error) {
        console.error("❌ Supabase error:", error.message);
        Alert.alert("Error", "No se pudo subir la imagen.");
        return;
      }
  
      setImagePreview(preview);
      setNewDish(prev => ({ ...prev, url: filePath }));
  
    } catch (error) {
      console.error("❌ Error al procesar imagen:", error);
      Alert.alert("Error", "Fallo al procesar la imagen.");
    }
  };
  

  const handleAdd = async () => {
    if (!newDish.name || !newDish.description || !newDish.price || !newDish.url) {
      Alert.alert("Campos incompletos", "Por favor completa todos los campos y selecciona una imagen.");
      return;
    }

    try {
      await addMenuItem({
        dish: newDish.name,
        description: newDish.description,
        price: parseFloat(newDish.price),
        type: newDish.type,
        url: newDish.url,
      });
      Alert.alert("Éxito", "Plato agregado correctamente.");
      router.replace("/admin");
    } catch (error) {
      Alert.alert("Error", "Hubo un problema al agregar el plato.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agregar Nuevo Plato</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre"
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
            style={[styles.toggleButton, newDish.type === type && styles.toggleButtonSelected]}
            onPress={() => setNewDish({ ...newDish, type: type as any })}
          >
            <Text
              style={[styles.toggleButtonText, newDish.type === type && styles.toggleButtonTextSelected]}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {Platform.OS === "web" ? (
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageSelected(file);
          }}
          style={{
            marginBottom: 12,
            backgroundColor: "#ccc",
            padding: 10,
            borderRadius: 8,
          }}
        />
      ) : (
        <TouchableOpacity style={styles.imageButton} onPress={() => setCameraModalVisible(true)}>
          <Text style={styles.buttonText}>Seleccionar Imagen</Text>
        </TouchableOpacity>
      )}
      {imagePreview && (
        <Image
          source={{ uri: imagePreview }}
          style={{ width: 200, height: 200, alignSelf: "center", marginBottom: 10, borderRadius: 12 }}
        />
      )}
      <TouchableOpacity style={styles.button} onPress={handleAdd}>
        <Text style={styles.buttonText}>Agregar</Text>
      </TouchableOpacity>

      {Platform.OS !== "web" && (
        <CameraModal
          isVisible={cameraModalVisible}
          onClose={() => setCameraModalVisible(false)}
          onImageSelected={handleImageSelected}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
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
  imageButton: {
    backgroundColor: "#999",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#ffa500",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
