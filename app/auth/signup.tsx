import { useRouter } from "expo-router";
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/authContext/AuthContext";

const SignupCarousel = () => {
  const router = useRouter();
  const { signUp } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", role: "Client", email: "", password: "", confirmPassword: "" });
  const [secureText, setSecureText] = useState(true);
  const [confirmSecureText, setConfirmSecureText] = useState(true);

  const handleNext = () => setStep((prev) => Math.min(prev + 1, 3));
  const handlePrev = () => setStep((prev) => Math.max(prev - 1, 0));

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  const handleRegister = async () => {
    form.email = form.email.trim(); // Elimina espacios en blanco
  
    if (!form.name || !form.email || !form.password || !form.role) {
      Alert.alert("Error", "Por favor, completa todos los campos.");
      return;
    }
  
    if (!isValidEmail(form.email)) {
      Alert.alert("Error", "Por favor, ingresa un correo electrónico válido.");
      return;
    }
  
    if (form.password !== form.confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden.");
      return;
    }
  
    console.log("Correo enviado a Firebase:", form.email); // Verifica el correo antes de enviarlo
  
    setLoading(true);
    try {
      await signUp(form.email, form.password, form.name, form.role);
    } catch (error) {
      Alert.alert("Error", "No se pudo registrar. Verifica los datos.");
      console.error("Error al registrar usuario:", error);
    } finally {
      setLoading(false);
    }
  };

  const steps: { placeholder: string; key: keyof typeof form; icon: "person-outline" | "briefcase-outline" | "mail-outline" | "lock-closed-outline"; isPassword?: boolean }[] = [
    { placeholder: "Nombre", key: "name", icon: "person-outline" },
    { placeholder: "Rol", key: "role", icon: "briefcase-outline" },
    { placeholder: "Correo", key: "email", icon: "mail-outline" },
    { placeholder: "Contraseña", key: "password", icon: "lock-closed-outline", isPassword: true },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Registro</Text>
        {step === 1 ? (
          // Toggle para seleccionar el rol
          <View style={styles.toggleContainer}>
            {["Chef", "Cashier", "Client"].map((role) => (
              <TouchableOpacity
                key={role}
                style={[styles.toggleButton, form.role === role && styles.activeToggleButton]}
                onPress={() => setForm({ ...form, role })}
              >
                <Text style={[styles.toggleText, form.role === role && styles.activeToggleText]}>{role}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.inputContainer}>
            <Ionicons name={steps[step].icon} size={20} color="black" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder={steps[step].placeholder}
              placeholderTextColor="gray"
              value={form[steps[step].key]}
              onChangeText={(text) => {
                console.log("Correo ingresado:", text); // Verifica el valor ingresado
                setForm({ ...form, [steps[step].key]: text });
              }}
              secureTextEntry={steps[step].isPassword && secureText}
            />
            {steps[step].isPassword && (
              <TouchableOpacity onPress={() => setSecureText(!secureText)}>
                <Ionicons name={secureText ? "eye-off" : "eye"} size={24} color="gray" />
              </TouchableOpacity>
            )}
          </View>
        )}
        {step === 3 && (
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="black" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Confirmar contraseña"
              placeholderTextColor="gray"
              value={form.confirmPassword}
              onChangeText={(text) => setForm({ ...form, confirmPassword: text })}
              secureTextEntry={confirmSecureText}
            />
            <TouchableOpacity onPress={() => setConfirmSecureText(!confirmSecureText)}>
              <Ionicons name={confirmSecureText ? "eye-off" : "eye"} size={24} color="gray" />
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.indicatorContainer}>
          {steps.map((_, index) => (
            <View key={index} style={[styles.indicator, step === index && styles.activeIndicator]} />
          ))}
        </View>
        <View style={styles.buttonContainer}>
          {step > 0 && (
            <TouchableOpacity onPress={handlePrev} style={styles.arrowButton}>
              <Ionicons name="chevron-back" size={30} color="black" />
            </TouchableOpacity>
          )}
          {step < 3 ? (
            <TouchableOpacity onPress={handleNext} style={styles.arrowButton}>
              <Ionicons name="chevron-forward" size={30} color="black" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.registerButton} onPress={handleRegister} disabled={loading}>
              {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Registrarse</Text>}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#252525",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    width: "90%",
    height: "80%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "white",
  },
  activeToggleButton: {
    backgroundColor: "#FF8C00",
    borderColor: "#FF8C00",
  },
  toggleText: {
    color: "gray",
    fontWeight: "bold",
  },
  activeToggleText: {
    color: "white",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 12,
    width: "90%",
    backgroundColor: "white",
    marginBottom: 15,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "black",
  },
  indicatorContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "gray",
    marginHorizontal: 5,
  },
  activeIndicator: {
    backgroundColor: "#FF8C00",
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 20,
    alignItems: "center",
  },
  arrowButton: {
    padding: 10,
  },
  registerButton: {
    backgroundColor: "#FF8C00",
    paddingVertical: 15,
    width: "90%",
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default SignupCarousel;