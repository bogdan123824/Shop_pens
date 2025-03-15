import { useEffect, useState } from "react";
import { 
  View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert, Modal, TextInput, Button 
} from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import Icon from 'react-native-vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';  

const API_URL = "https://05ed-84-245-121-100.ngrok-free.app";

interface Pen {
  id: number;
  name: string;
  description?: string;
  price: number;
  image?: string;
}

type RootStackParamList = {
  pensScreen: { sellerId: number };
};

type PensScreenRouteProp = RouteProp<RootStackParamList, "pensScreen">;

const PensScreen: React.FC = () => {
  const route = useRoute<PensScreenRouteProp>();
  const { sellerId } = route.params;
  const buyerId = sellerId;

  const [pens, setPens] = useState<Pen[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPen, setEditingPen] = useState<Pen | null>(null);
  const [editedName, setEditedName] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedPrice, setEditedPrice] = useState("");
  const [image, setImage] = useState<any>(null);  
  const [cartModalVisible, setCartModalVisible] = useState(false); // Для отображения модального окна с количеством
  const [selectedPenId, setSelectedPenId] = useState<number | null>(null); // Для хранения ID выбранной ручки
  const [quantity, setQuantity] = useState<string>("1"); // Количество ручек, которое нужно добавить

  const fetchPens = () => {
    setLoading(true);
    fetch(`${API_URL}/all_pens/`)
      .then((res) => res.json())
      .then((data: Pen[]) => setPens(data))
      .catch((error) => console.error("Ошибка загрузки ручек:", error))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPens();
  }, []);

  const deletePen = async (penId: number) => {
    try {
      const response = await fetch(`${API_URL}/delete_pen/${penId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        Alert.alert("Успех", "Ручка удалена");
        fetchPens();
      } else {
        Alert.alert("Ошибка", "Не удалось удалить ручку");
      }
    } catch (error) {
      console.error("Ошибка удаления ручки:", error);
      Alert.alert("Ошибка", "Что-то пошло не так");
    }
  };

  const editPen = (pen: Pen) => {
    setEditingPen(pen);
    setEditedName(pen.name);
    setEditedDescription(pen.description || "");
    setEditedPrice(pen.price.toString());
    setImage(pen.image ? { uri: `${API_URL}/static/${pen.image}` } : null); 
    setModalVisible(true);
  };

  const saveEditedPen = async () => {
    if (!editingPen) return;

    const formData = new FormData();
    formData.append("name", editedName);
    formData.append("description", editedDescription);
    formData.append("price", editedPrice);

    if (image) {
      formData.append("image", {
        uri: image.uri,
        name: image.uri.split('/').pop(),  
        type: image.type,
      });
    }

    try {
      const response = await fetch(`${API_URL}/edit_pen/${editingPen.id}`, {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
        Alert.alert("Успех", "Ручка обновлена");
        setModalVisible(false);
        fetchPens();
      } else {
        Alert.alert("Ошибка", "Не удалось обновить ручку");
      }
    } catch (error) {
      console.error("Ошибка обновления ручки:", error);
      Alert.alert("Ошибка", "Что-то пошло не так");
    }
  };

  const addToCart = async () => {
    if (selectedPenId === null || !quantity) return;

    try {
      const formData = new FormData();
      formData.append("buyer_id", buyerId.toString());
      formData.append("pen_id", selectedPenId.toString());
      formData.append("quantity", quantity);

      const response = await fetch(`${API_URL}/add_to_cart`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        Alert.alert("Успех", "Ручка добавлена в корзину");
        setCartModalVisible(false); // Закрыть модальное окно после добавления
      } else {
        Alert.alert("Ошибка", "Не удалось добавить в корзину");
      }
    } catch (error) {
      console.error("Ошибка добавления в корзину:", error);
      Alert.alert("Ошибка", "Что-то пошло не так");
    }
  };

  const chooseImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const openCartModal = (penId: number) => {
    setSelectedPenId(penId);
    setCartModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Доступные ручки</Text>
        <TouchableOpacity style={styles.updateButton} onPress={fetchPens}>
          <Icon name="refresh" size={30} color="#fff" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={pens}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.image && (
              <Image
                source={{ uri: `${API_URL}/static/${item.image}` }}
                style={styles.image}
              />
            )}
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.description}>{item.description}</Text>
            <Text style={styles.price}>{item.price} $</Text>
            <View style={styles.buttonContainer}>
            <TouchableOpacity 
                  style={styles.buttonBuy}
                  onPress={() => Alert.alert("Успех", "Товар успешно куплен")}
                >
                <Text style={styles.buttonText}>Купить</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonCart} onPress={() => openCartModal(item.id)}>
                <Text style={styles.buttonText}>Добавить в корзину</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonEdit} onPress={() => editPen(item)}>
                <Text style={styles.buttonText}>✏</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonDelete} onPress={() => deletePen(item.id)}>
                <Text style={styles.buttonText}>🗑</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <Modal visible={cartModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text>Укажите количество</Text>
            <TextInput 
              value={quantity} 
              onChangeText={setQuantity} 
              keyboardType="numeric" 
              style={styles.input} 
              placeholder="Количество" 
            />
            <Button title="Добавить в корзину" onPress={addToCart} />
            <Button title="Отмена" onPress={() => setCartModalVisible(false)} />
          </View>
        </View>
      </Modal>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text>Редактировать ручку</Text>
            <TextInput value={editedName} onChangeText={setEditedName} placeholder="Название" style={styles.input} />
            <TextInput value={editedDescription} onChangeText={setEditedDescription} placeholder="Описание" style={styles.input} />
            <TextInput value={editedPrice} onChangeText={setEditedPrice} placeholder="Цена" keyboardType="numeric" style={styles.input} />
            
            <TouchableOpacity onPress={chooseImage} style={styles.buttonChooseImage}>
              <Text style={styles.buttonText}>Выбрать изображение</Text>
            </TouchableOpacity>

            {image && <Image source={{ uri: image.uri }} style={styles.selectedImage} />}

            <Button title="Сохранить" onPress={saveEditedPen} />
            <Button title="Отмена" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default PensScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 25,
  },
  refreshButton: {
    padding: 10,
  },
  refreshText: {
    fontSize: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
  },
  description: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4CAF50",
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  buttonBuy: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 8,
    marginRight: 5,
  },
  buttonCart: {
    backgroundColor: "#FFA500",
    padding: 10,
    borderRadius: 8,
    marginRight: 5,
  },
  buttonEdit: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 8,
    marginRight: 5,
  },
  buttonDelete: {
    backgroundColor: "#dc3545",
    padding: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  updateButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: "center",
    alignSelf: "flex-end",
    position: "absolute",
    top: 70,
    right: 7,
    zIndex: 999,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    top: 20,
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginVertical: 5,
  },
  buttonChooseImage: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
  },
  selectedImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginTop: 10,
  },
});
