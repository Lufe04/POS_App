import { View, Text, Modal, TouchableOpacity } from 'react-native'
import React, { useRef, useState } from 'react'
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

interface CameraModalProps {
    isVisible: boolean;
    image?: any;
}

export default function CameraModal(props: CameraModalProps) {

    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);

    const flip = async () => {
        setFacing(facing === 'back' ? 'front' : 'back');
    }

    const take = async () => {
        let result = await cameraRef.current?.takePictureAsync({
            quality:1,
            base64: true,
        });

        if(result){
           // setImage(result.assets[0].uri);
        }
    }
    const open = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images', 'videos'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        console.log(result);

        if (!result.canceled) {
            // setImage(result.assets[0].uri);
        }
    }

    if (!permission) {
        // Camera permissions are still loading.
        return <View />;
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet.
        return (
            <View style={{
                flex: 1
            }}>
                <Text >We need your permission to show the camera</Text>
            </View>
        );
    }

    return (
        <Modal
            visible={props.isVisible}
        >
            <View
                style={{
                    flex: 1
                }}
            >
                <CameraView style={{
                    flex: 1
                }}
                    facing={facing}
                    ref={cameraRef}
                >
                    <View style={{
                        flexDirection: "row"
                    }}>
                        <TouchableOpacity
                            onPress={take}
                        >
                            <Text>Take a photo</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={open}
                        >
                            <Text>Open Library</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={flip}
                        >
                            <Text>Flip camera</Text>
                        </TouchableOpacity>
                        {/* Take a photo */}
                        {/* Open Library */}
                        {/* Flip camera */}
                    </View>
                </CameraView>
            </View>
        </Modal>
    )
}