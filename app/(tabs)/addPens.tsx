import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Keyboard,
  ScrollView,
  TouchableWithoutFeedback,
  StyleSheet,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

const API_URL = "https://05ed-84-245-121-100.ngrok-free.app"; 

const AddPenScreen: React.FC = () => {
  const [name, setName] = useState("");
  const [cost, setCost] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sellerId, setSellerId] = useState("1");

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const selectedImageUri = result.assets[0].uri;
      const fileType = selectedImageUri.split(".").pop()?.toLowerCase();

      const allowedTypes = ["jpg", "jpeg", "png"];

      if (fileType && allowedTypes.includes(fileType)) {
        setImage(selectedImageUri);
      } else {
        Alert.alert("⚠️ Ошибка", "Можно загружать только фото (JPG, JPEG, PNG)!");
      }
    }
  };

  // Функция для обработки изменения стоимости
  const handleCostChange = (text: string) => {
    // Заменяем запятую на точку
    const formattedText = text.replace(",", ".");
    setCost(formattedText);
  };

  const addPen = async () => {
    if (!name || !cost || !description || !sellerId) {
      Alert.alert("⚠️ Ошибка", "Заполните все поля!");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", cost); // Используем цену с точкой
      formData.append("seller_id", sellerId);

      if (image) {
        const fileType = image.split(".").pop();
        formData.append("image", {
          uri: image,
          name: `pen.${fileType}`,
          type: `image/${fileType}`,
        } as any);
      }

      const response = await fetch(`${API_URL}/add_pen`, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ошибка добавления: ${errorText}`);
      }

      Alert.alert("✅ Успех", "Ручка добавлена!");
      setName("");
      setCost("");
      setDescription("");
      setImage(null);
      Keyboard.dismiss(); 
    } catch (error: any) {
      console.error("❌ Ошибка:", error);
      Alert.alert("❌ Ошибка", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Добавить новую ручку</Text>

        <TextInput
          style={styles.input}
          placeholder="Название"
          placeholderTextColor={"gray"}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Цена"
          placeholderTextColor={"gray"}
          keyboardType="decimal-pad" // Используем decimal-pad, чтобы поддерживать точку
          value={cost}
          onChangeText={handleCostChange} // Используем новую функцию для обработки изменения
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Описание"
          placeholderTextColor={"gray"}
          multiline
          value={description}
          onChangeText={setDescription}
        />

        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          <Text style={styles.imagePickerText}>📷 Выбрать изображение</Text>
        </TouchableOpacity>

        {image && <Image source={{ uri: image }} style={styles.image} />}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={addPen}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>➕ Добавить ручку</Text>}
        </TouchableOpacity>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

export default AddPenScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
    marginTop: 25,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    marginBottom: 12,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  imagePicker: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12,
    width: "100%",
  },
  imagePickerText: {
    color: "#fff",
    fontSize: 16,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
});
