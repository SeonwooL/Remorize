import React, { useState } from "react";
import { View, Text, Button, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";

const GOOGLE_CLOUD_VISION_API_KEY = "AIzaSyCNAktvaBU7bx2x3T0sefPSAnbbFyAbpCg";

const Home = () => {
  const [image, setImage] = useState<string | null>(null);
  const [text, setText] = useState("");

  // 카메라 권한 요청
  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('카메라 접근 권한이 필요합니다.');
      return false;
    }
    return true;
  };

  // 카메라로 사진 촬영
  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: "images",
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      await processImage(result.assets[0].uri);
    }
  };

  // 갤러리에서 이미지 선택
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      await processImage(result.assets[0].uri);
    }
  };

  // OCR 실행
  const processImage = async (imageUri: string) => {
    setText("인식 중...");
    try {
      // 이미지를 base64로 변환
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result?.toString().split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      // Google Cloud Vision API 호출
      const visionApiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_CLOUD_VISION_API_KEY}`;
      const visionApiRequest = {
        requests: [
          {
            image: {
              content: base64,
            },
            features: [
              {
                type: "TEXT_DETECTION",
                maxResults: 1,
              },
            ],
          },
        ],
      };

      const apiResponse = await fetch(visionApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(visionApiRequest),
      });

      if (!apiResponse.ok) {
        throw new Error(`API 요청 실패: ${apiResponse.status}`);
      }

      const data = await apiResponse.json();
      
      if (!data.responses || !data.responses[0]) {
        throw new Error('API 응답 형식이 올바르지 않습니다.');
      }

      const textAnnotations = data.responses[0].textAnnotations;
      if (!textAnnotations || !textAnnotations[0]) {
        setText("이미지에서 텍스트를 찾을 수 없습니다.");
        return;
      }

      setText(textAnnotations[0].description);
    } catch (err: unknown) {
      const error = err as Error;
      setText("OCR 실패: " + error.message);
      console.error('OCR Error:', error);
    }
  };

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Button title="카메라로 촬영" onPress={takePhoto} />
      <Button title="갤러리에서 선택" onPress={pickImage} />
      {image && <Image source={{ uri: image }} style={{ width: 200, height: 200, margin: 10 }} />}
      <Text style={{ padding: 10 }}>{text}</Text>
    </View>
  );
};

export default Home;