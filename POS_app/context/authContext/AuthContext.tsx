import { user } from "@/interfaces/common";
import { createContext } from "react";

export const AuthContext = createContext({});

export const AuthProvider = ({ children }: any) => {

    const login = (email:string, password:string) => {};
    const register = (user:user) => {};
    const logout = () => {};
    const updateUser = (user:user) => {};
    const updateRole = (role: "client" | "chef" | "cashier") => {};

    return <AuthContext.Provider 
        value={{
            login,
            register,
            logout,
            updateUser,
            updateRole
        }}
    >
        {children}
    </AuthContext.Provider>;

};
