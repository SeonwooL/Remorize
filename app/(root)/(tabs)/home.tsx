import React, { useState } from "react";
import { View, Text, Button, Image, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";

const SERVER_URL = "http://192.168.2.81:8000/ocr";

const Home = () => {
  const [image, setImage] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  // 갤러리에서 이미지 선택
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.5,
        base64: true,
      });

      console.log('Image picker result:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        console.log('Selected image details:', {
          uri: selectedAsset.uri,
          width: selectedAsset.width,
          height: selectedAsset.height,
          hasBase64: !!selectedAsset.base64,
        });

        setImage(selectedAsset.uri);
        
        if (selectedAsset.base64) {
          console.log('Base64 data available, length:', selectedAsset.base64.length);
          await sendImage(selectedAsset.base64);
        } else {
          throw new Error('이미지 데이터를 가져올 수 없습니다.');
        }
      } else {
        console.log('Image selection canceled or no assets');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('오류', '이미지 선택 실패: ' + (error as Error).message);
      setMessage('이미지 선택 실패: ' + (error as Error).message);
    }
  };

  // 이미지 전송
  const sendImage = async (base64Data: string) => {
    try {
      setMessage("이미지 전송 중...");
      console.log('Starting image upload...');
      console.log('Base64 data length:', base64Data.length);

      if (!base64Data) {
        throw new Error('이미지 데이터가 없습니다.');
      }

      console.log('Sending to server...');
      // 서버로 전송
      const apiResponse = await fetch(SERVER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ image: base64Data }),
      });

      console.log('Server response status:', apiResponse.status);
      
      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        console.error('Server error response:', errorText);
        throw new Error(`서버 응답 오류: ${apiResponse.status} - ${errorText}`);
      }

      const data = await apiResponse.json();
      console.log('Server response:', data);
      
      if (!data.success) {
        throw new Error(data.error || '서버 응답 오류');
      }

      setMessage(data.message);
    } catch (error) {
      console.error('Error sending image:', error);
      Alert.alert('오류', '이미지 전송 실패: ' + (error as Error).message);
      setMessage('이미지 전송 실패: ' + (error as Error).message);
    }
  };

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Button title="갤러리에서 선택" onPress={pickImage} />
      {image && <Image source={{ uri: image }} style={{ width: 200, height: 200, margin: 10 }} />}
      <Text style={{ padding: 10 }}>{message}</Text>
    </View>
  );
};

export default Home;