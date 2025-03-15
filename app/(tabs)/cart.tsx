import { useState, useEffect } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage"; 
import Icon from 'react-native-vector-icons/FontAwesome';

const API_URL = "https://05ed-84-245-121-100.ngrok-free.app";

interface CartItem {
  id: number;
  name: string;
  quantity: number;
  cost: number;
  image: string | null;
}

const CartScreen: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [buyerId, setBuyerId] = useState<number | null>(null);

  useEffect(() => {
    const loadBuyerId = async () => {
      const storedBuyerId = await AsyncStorage.getItem("buyer_id");
      if (storedBuyerId) {
        setBuyerId(parseInt(storedBuyerId, 10));
      }
    };

    loadBuyerId();
  }, []);

  useEffect(() => {
    if (buyerId !== null) {
      fetchCart();
    }
  }, [buyerId]);

  const fetchCart = () => {
    if (!buyerId) return;

    fetch(`${API_URL}/cart/${buyerId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCartItems(data);
        } else {
          setCartItems([]); // Обработаем случай, если данные некорректны
        }
      })
      .catch((error) => console.error("Ошибка загрузки корзины:", error));
  };

  const removeFromCart = (cartItemId: number) => {
    fetch(`${API_URL}/remove_from_cart/${cartItemId}`, { method: "DELETE" })
      .then(() => {
        setCartItems((prevItems) => prevItems.filter((item) => item.id !== cartItemId));
        Alert.alert("Успех", "Товар удален из корзины");
      })
      .catch((error) => Alert.alert("Ошибка", "Не удалось удалить товар"));
  };

  const handleBuy = (item: CartItem) => {
    Alert.alert("Покупка", `Товар "${item.name}" успешно куплен!`);
    // Здесь можно добавить логику для завершения покупки
  };

  const totalCost = cartItems.reduce((sum, item) => sum + item.cost * item.quantity, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Корзина</Text>

      <TouchableOpacity style={styles.updateButton} onPress={fetchCart}>
        <Icon name="refresh" size={30} color="#fff" />
      </TouchableOpacity>

      {cartItems.length === 0 ? (
        <Text style={styles.emptyMessage}>
          Ваша корзина пуста🥺🥺🥺 Добавьте товары в корзину, чтобы продолжить покупки.
        </Text>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.card}>
                {item.image && (
                  <Image source={{ uri: `${API_URL}/static/${item.image}` }} style={styles.image} />
                )}
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.quantity}>Количество: {item.quantity}</Text>
                <Text style={styles.price}>Цена: {item.cost * item.quantity} $</Text>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity style={styles.removeButton} onPress={() => removeFromCart(item.id)}>
                    <Text style={styles.buttonText}>Удалить</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.buyButton} onPress={() => handleBuy(item)}>
                    <Text style={styles.buttonText}>Купить</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
          
          <View style={styles.totalCostContainer}>
            <Text style={styles.totalCost}>Итоговая сумма: {totalCost} $</Text>
            <TouchableOpacity style={styles.buyAllButton} onPress={() => Alert.alert("Покупка", "Спасибо за покупку всех товаров!")}>
              <Text style={styles.buttonText}>Купить все</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9f9f9" },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  updateButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: "center",
    alignSelf: "flex-end",
    position: "absolute",
    top: 75,
    right: 35,
    zIndex: 999,
  },
  card: { backgroundColor: "#fff", padding: 15, borderRadius: 10, marginBottom: 10, alignItems: "center" },
  image: { width: 100, height: 100, borderRadius: 8, marginBottom: 10 },
  name: { fontSize: 18, fontWeight: "600" },
  quantity: { fontSize: 14, color: "#666" },
  price: { fontSize: 16, fontWeight: "bold", color: "#4CAF50" },
  buttonContainer: { flexDirection: "row", marginTop: 10 },
  removeButton: { backgroundColor: "#FF6347", padding: 10, borderRadius: 8, marginRight: 10 },
  buyButton: { backgroundColor: "#4CAF50", padding: 10, borderRadius: 8 },
  buttonText: { color: "white", fontSize: 14, fontWeight: "bold" },
  emptyMessage: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
    textAlign: "center",
    marginTop: 60,
  },
  totalCostContainer: { alignItems: "center", marginBottom: 70 },
  totalCost: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  buyAllButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
});

export default CartScreen;
