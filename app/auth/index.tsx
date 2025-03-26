import { useRouter } from 'expo-router';
import { useAuth } from "@/context/authContext/AuthContext";
import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet, Text } from "react-native";
import { Ionicons } from '@expo/vector-icons';

const Authentication = () => {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [secureText, setSecureText] = useState(true);

  const handleSignIn = async () => {
    setError(null); // Limpiar errores previos
    try {
      const success = await signIn(email, password);
      if (!success) {
        setError("Usuario o contraseña incorrectos");
      }
    } catch (error) {
      console.log("Error en login:", error);
      setError("Ocurrió un error al iniciar sesión");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.loginBox}>
        <Text style={styles.title}>Inicio de sesión</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color="black" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Usuario"
            placeholderTextColor="gray"
            value={email}
            onChangeText={setEmail}
          />
        </View>
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="black" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor="gray"
            secureTextEntry={secureText}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setSecureText(!secureText)}>
            <Ionicons name={secureText ? "eye-off" : "eye"} size={24} color="gray" />
          </TouchableOpacity>
        </View>
        {error && <Text style={styles.errorText}>{error}</Text>}
        <TouchableOpacity style={styles.button} onPress={handleSignIn}>
          <Text style={styles.buttonText}>Ingresar</Text>
        </TouchableOpacity>
        <Text style={styles.signupText}>
          ¿No tienes cuenta? <Text style={styles.signupLink} onPress={() => router.push('/auth/signup')}>Crear cuenta</Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "#252525", // Fondo negro
    padding: 20,
  },
  loginBox: {
    backgroundColor: "#ffffff", // Contenedor blanco
    padding: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    width: "110%",
    height: "85%", // 3/4 de la pantalla
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "black",
    marginBottom: 30,
    marginTop: 25,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 12,
    marginBottom: 15,
    width: "90%",
    backgroundColor: "white",
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "black",
  },
  button: {
    backgroundColor: "#FF8C00",
    paddingVertical: 15,
    width: "90%",
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
  },
  signupText: {
    marginTop: 15,
    fontSize: 14,
    color: "black",
  },
  signupLink: {
    color: "#FF8C00",
    fontWeight: "bold",
  },
});

export default Authentication;