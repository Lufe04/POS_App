import React, { createContext, useContext, useEffect, useState } from "react";
import {onAuthStateChanged, User, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut,
} from "firebase/auth";
import { auth, db } from "@/utils/FirebaseConfig"; // Asegúrate de que Firestore esté bien inicializado
import { useRouter } from "expo-router";
import { collection, doc, setDoc, getDocs, query, orderBy } from "firebase/firestore";

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

  // Función de inicio de sesión
  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/(app)");
      return true;
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      return false;
    }
  };

  // Función de registro de usuario con almacenamiento en Firestore
  const signUp = async (name: string, role: string, email: string, password: string) => {
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
      router.push("/(app)");
      return true;
    } catch (error) {
      console.error("Error al registrarse:", error);
      return false;
    }
  };

  // Función de cierre de sesión
  const signOutUser = async () => {
    try {
      await signOut(auth);
      setUser(null);
      router.push("/auth");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
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
