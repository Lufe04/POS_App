import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMenu } from "@/context/dataContext/MenuContext";
import CameraModal from "@/components/CameraModal";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import { supabase, getPublicImageUrl } from "@/utils/SuperbaseConfig";

export default function EditDishScreen() {
  const { id } = useLocalSearchParams();
  const { menu, updateMenuItem } = useMenu();
  const router = useRouter();
  const [cameraModalVisible, setCameraModalVisible] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [dish, setDish] = useState({
    name: "",
    description: "",
    price: "",
    type: "plato" as "plato" | "bebida" | "entrada" | "postre",
    url: "",
  });

  useEffect(() => {
    const current = menu.find((item) => item.ID_dish === id);
    if (current) {
      setDish({
        name: current.dish,
        description: current.description,
        price: current.price.toString(),
        type: current.type,
        url: current.url ?? "",
      });
      setImagePreview(current.url ? getPublicImageUrl(current.url) : null);
    }
  }, [id, menu]);

    const handleImageSelected = async (uriOrFile: string | File) => {
        try {
        let blob: Blob | Uint8Array; 
        let extension = "jpg";      
        let contentType = "image/jpeg"; 
        let preview: string;         // URL para mostrar una previsualización de la imagen
    
        // Web
        if (Platform.OS === "web") {
            const file = uriOrFile as File; 
            extension = file.name.split(".").pop() ?? "jpg"; // Obtenemos extensión del archivo
            preview = URL.createObjectURL(file); // Creamos una URL temporal para mostrar la imagen
            blob = file; 
    
        } else {
            // Móvil 
            const uri = uriOrFile as string; 
            extension = uri.split(".").pop()?.split("?")[0] ?? "jpg"; // Sacamos la extensión del URI
            contentType = `image/${extension}`; 
            preview = uri; // URI para vista previa
    
            // Manipulamos la imagen
            const manipulated = await ImageManipulator.manipulateAsync(
                uri,
                [], 
                { compress: 1, format: ImageManipulator.SaveFormat.JPEG } // Convertimos a JPG 
            );
    
            // Leer como Base64
            const base64 = await FileSystem.readAsStringAsync(manipulated.uri, {
            encoding: FileSystem.EncodingType.Base64,
            });
    
            // Convertimos a Uint8Array
            const byteCharacters = atob(base64);
            const byteArrays = [];
            for (let i = 0; i < byteCharacters.length; i++) {
            byteArrays.push(byteCharacters.charCodeAt(i));
            }
    
            blob = new Uint8Array(byteArrays); 
        }
    
        const filename = `dish_${Date.now()}.${extension}`;
        const filePath = filename; 
    
        // Subir a Supabase
        const { error } = await supabase.storage.from("menu").upload(filePath, blob, {
            cacheControl: "3600", 
            upsert: true,          // Reemplaza si ya existe
            contentType,           
        });

        if (error) {
            Alert.alert("Error", "No se pudo subir la imagen.");
            return;
        }
    
        setImagePreview(preview);
        setDish(prev => ({ ...prev, url: `menu/${filePath}` }));
    
        } catch (error) {
        console.error("Error al procesar imagen:", error);
        Alert.alert("Error", "Fallo al procesar la imagen.");
        }
    };  

  const handleSave = async () => {
    if (!dish.name || !dish.description || !dish.price) {
      Alert.alert("Campos incompletos", "Por favor completa todos los campos.");
      return;
    }

    try {
      await updateMenuItem(id as string, {
        dish: dish.name,
        description: dish.description,
        price: parseFloat(dish.price),
        type: dish.type,
        url: dish.url,
      });
      Alert.alert("Actualizado", "El plato fue actualizado correctamente.");
      router.replace("/admin");
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar el plato.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Plato</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={dish.name}
        onChangeText={(text) => setDish({ ...dish, name: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Descripción"
        value={dish.description}
        onChangeText={(text) => setDish({ ...dish, description: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Precio"
        keyboardType="numeric"
        value={dish.price}
        onChangeText={(text) => setDish({ ...dish, price: text })}
      />

      <View style={styles.toggleContainer}>
        {["plato", "bebida", "entrada", "postre"].map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.toggleButton, dish.type === type && styles.toggleButtonSelected]}
            onPress={() => setDish({ ...dish, type: type as any })}
          >
            <Text
              style={[styles.toggleButtonText, dish.type === type && styles.toggleButtonTextSelected]}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {imagePreview && (
        <Image
          source={{ uri: imagePreview }}
          style={{ width: 200, height: 200, alignSelf: "center", marginBottom: 10, borderRadius: 12 }}
        />
      )}

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

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Guardar Cambios</Text>
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