import React, { useContext, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Redirect, useRouter } from 'expo-router';
//import { AuthContext } from "@/context/authContext/AuthContext";

export default function success() {
    const router = useRouter(); 

    useEffect(() => {
      const timer = setTimeout(() => {
        /*const {userCurrent} = useContext(AuthContext);

        if (userCurrent.role == "client"){
          router.push("/(app)")
        } else {
          router.push("/(app)")
        }*/

        router.push("/(app)/client")
      }, 3000); 

      return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.iconWrapper}>
                <MaterialIcons name="check-circle" size={80} color="#FF5E3A" />
                <View style={styles.sparkles}>
                    <Text style={styles.sparkle}>✨</Text>
                    <Text style={styles.sparkle}>✨</Text>
                </View>
            </View>
            <Text style={styles.text}>Successful</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#ffffff',
      justifyContent: 'center',
      alignItems: 'center',
    },
    iconWrapper: {
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
    },
    sparkles: {
      position: 'absolute',
      top: -30,
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: 100,
    },
    sparkle: {
      fontSize: 20,
      color: '#FFB6A3',
    },
    text: {
      marginTop: 30,
      fontSize: 18,
      fontWeight: '500',
      color: '#333',
    },
  });
  
