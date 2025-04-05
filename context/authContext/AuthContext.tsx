import React, { createContext, useContext, useEffect, useState } from "react";
import {onAuthStateChanged, User, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut,
} from "firebase/auth";
import { auth, db } from "@/utils/FirebaseConfig"; // Asegúrate de que Firestore esté bien inicializado
import { useRouter } from "expo-router";
import { collection, doc, setDoc, getDocs, query, orderBy, getDoc } from "firebase/firestore";
import { Alert } from "react-native";

// Definición de la interfaz del contexto
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (name: string, role: string, email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

// Creación del contexto de autenticación
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Manejo del estado de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Función para obtener el próximo ID autoincremental
  const getNextUserId = async (): Promise<number> => {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, orderBy("id", "desc"));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const lastUser = querySnapshot.docs[0].data();
        return lastUser.id + 1;
      }
      return 1; // Si no hay usuarios, empezar desde 1
    } catch (error) {
      console.error("Error obteniendo el próximo ID de usuario:", error);
      return 1;
    }
  };

  const redirectUser = (role: string) => {
    switch (role) {
      case "Client":
        router.push("/(app)/client");
        break;
      case "Cashier":
        router.push("/(app)/cashier");
        break;
      case "Chef":
        router.push("/(app)/chef");
        break;
      default:
        router.push("/auth"); // Página por defecto si el rol no está definido
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Obtener el rol desde Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role) {
          redirectUser(userData.role);
        } else {
          console.warn("El usuario no tiene un rol asignado.");
          router.push("/auth");
        }
      } else {
        console.warn("El documento del usuario no existe.");
        router.push("/auth");
      }

      return true;
      } catch (error: any) {
        if (error.code === "auth/user-not-found") {
          Alert.alert("Error", "Usuario no encontrado.");
        } else if (error.code === "auth/wrong-password") {
          Alert.alert("Error", "Contraseña incorrecta.");
        } else {
          Alert.alert("Error", "No se pudo iniciar sesión.");
        }
        console.error("Error al iniciar sesión:", error);
        return false;
      }
    };

  // Función de registro de usuario con almacenamiento en Firestore
  const signUp = async (email: string, password: string, name: string, role: string) => {
    console.log("Datos enviados a Firebase:", { email, password, name, role }); // Verifica los datos
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      const newUserId = await getNextUserId();
      await setDoc(doc(db, "users", user.uid), {
        id: newUserId,
        email,
        name,
        role,
        createdAt: new Date().toISOString(),
      });
  
      setUser(user);
      redirectUser(role); // Redirigir según el rol
      return true;
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        Alert.alert("Error", "El correo ya está registrado.");
      } else {
        Alert.alert("Error", "No se pudo registrar.");
      }
      console.error("Error al registrarse:", error);
      return false;
    }
  };

  // Función de cierre de sesión
  const signOutUser = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      router.push("/auth");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut: signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para consumir el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
