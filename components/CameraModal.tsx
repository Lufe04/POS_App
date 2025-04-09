import React, { useRef, useState } from "react";
import { View, Modal, TouchableOpacity, StyleSheet } from "react-native";
import { CameraView, useCameraPermissions, CameraType } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { Feather } from "@expo/vector-icons";

interface CameraModalProps {
  isVisible: boolean;
  onClose: () => void;
  onImageSelected: (uri: string) => void;
}

export default function CameraModal({
  isVisible,
  onClose,
  onImageSelected,
}: CameraModalProps) {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const flipCamera = () => {
    setFacing(facing === "back" ? "front" : "back");
  };

  const takePhoto = async () => {
    const result = await cameraRef.current?.takePictureAsync({ quality: 1 });
    if (result?.uri) {
      onImageSelected(result.uri);
      onClose();
    }
  };

  const openGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      onImageSelected(result.assets[0].uri);
      onClose();
    }
  };

  if (!permission){
    return <View />;
  }
  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Feather name="camera-off" size={40} color="#555" />
      </View>
    );
  }

  return (
    <Modal visible={isVisible} animationType="slide">
      <View style={styles.container}>
        <CameraView style={styles.camera} facing={facing} ref={cameraRef} />

        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Feather name="x" size={26} color="#fff" />
        </TouchableOpacity>

        <View style={styles.bottomControls}>
          <TouchableOpacity onPress={openGallery} style={styles.iconButton}>
            <Feather name="image" size={30} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={takePhoto} style={styles.captureButton}>
            <View style={styles.captureInnerCircle} />
          </TouchableOpacity>

          <TouchableOpacity onPress={flipCamera} style={styles.iconButton}>
            <Feather name="refresh-ccw" size={30} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: "#00000080",
    padding: 8,
    borderRadius: 20,
  },
  bottomControls: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  iconButton: {
    backgroundColor: "#00000080",
    padding: 16,
    borderRadius: 50,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  captureInnerCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});