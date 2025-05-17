import React, { useState } from "react";
import { View, Text, Button, Image, Alert, ScrollView, TouchableOpacity, StyleSheet, Modal } from "react-native";
import * as ImagePicker from "expo-image-picker";

const SERVER_URL = "http://192.168.2.81:8000/ocr";
const MEANING_URL = "http://192.168.2.81:8000/meaning";

const Home = () => {
  const [image, setImage] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [meaning, setMeaning] = useState<string>("");
  const [modalVisible, setModalVisible] = useState(false);

  // select image from gallery
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

  // send image to server
  const sendImage = async (base64Data: string) => {
    try {
      setMessage("sending image...");
      console.log('Starting image upload...');
      console.log('Base64 data length:', base64Data.length);

      if (!base64Data) {
        throw new Error('no image data.');
      }

      console.log('Sending to server...');
      // send to server
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
      Alert.alert('error', 'image sending failed: ' + (error as Error).message);
      setMessage('image sending failed: ' + (error as Error).message);
    }
  };

  // find sentence for word
  const findSentenceForWord = (text: string, word: string): string | null => {
    const sentences = text.split(/(?<=[.!?])\s+/);
    return sentences.find(sentence =>
      sentence.toLowerCase().includes(word.toLowerCase())
    ) || null;
  };

  // handle word press
  const handleWordPress = async (word: string) => {
    setSelectedWords(prev =>
      prev.includes(word)
        ? prev.filter(w => w !== word)
        : [...prev, word]
    );
    const sentence = findSentenceForWord(message, word);
    if (sentence) {
      try {
        const res = await fetch(MEANING_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ word, sentence }),
        });
        const data = await res.json();
        setMeaning(data.meaning);
        setModalVisible(true);
      } catch (e) {
        setMeaning('뜻을 가져오는 데 실패했습니다.');
        setModalVisible(true);
      }
    }
  };

  // split text into words and wrap with Touchable
  const renderSelectableText = (text: string) => {
    return text.split(/\s+/).map((word, idx) => (
      <TouchableOpacity
        key={idx}
        onPress={() => handleWordPress(word)}
        style={[
          styles.word,
          selectedWords.includes(word) && styles.selectedWord
        ]}
      >
        <Text style={{ color: selectedWords.includes(word) ? "#fff" : "#222" }}>
          {word + " "}
        </Text>
      </TouchableOpacity>
    ));
  };

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Button title="Select image" onPress={pickImage} />
      {image && <Image source={{ uri: image }} style={{ width: 200, height: 200, margin: 10 }} />}
      <ScrollView style={{ maxHeight: 300, width: '90%' }}>
        <Text style={{ padding: 10, flexWrap: "wrap", flexDirection: "row" }}>
          {renderSelectableText(message)}
        </Text>
      </ScrollView>
      {/* show selected words (optional) */}
      <Text style={{ marginTop: 10, color: "#007AFF" }}>
        selected words: {selectedWords.join(", ")}
      </Text>
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={{ fontSize: 18, marginBottom: 10 }}>문맥 기반 단어 뜻</Text>
            <Text>{meaning}</Text>
            <Button title="닫기" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  word: {
    padding: 2,
    borderRadius: 4,
  },
  selectedWord: {
    backgroundColor: "#007AFF",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    minWidth: 250,
    alignItems: 'center',
  },
});

export default Home;