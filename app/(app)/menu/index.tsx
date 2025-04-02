import React, { useState } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { TextInput } from 'react-native-gesture-handler'
import CameraModal from '@/components/CameraModal'

export default function index() {
    const [image, setImage] = useState(undefined as any);
    const [isVisible, setIsVisible] = useState(false);
    
  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20}}>
        <Text>index</Text>
        {/*Select Image*/}
        {
          Image ?<View>
            {/*Pintar la Imagen*/}
        </View>
        :
        <TouchableOpacity onPress={()=>{}}> 
          <Text>📸</Text> {/*Cambiar por icono*/}
        </TouchableOpacity>
        }
       
        <View>

        </View>
        {/*Title*/}
        <TextInput/>
        {/*Price*/}
        <TextInput/>
        {/*Description*/}
        <TextInput/>

        {/*Edit*/}
        {/*Delete*/}
        {/*Guardar*/}
        <CameraModal
          isVisible={isVisible}
          image={image}
        />
    </View>
  )
}
