import { StyleSheet, Text, Image, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router'; 

const ProfileScreen = () => {
  const user = {
    name: 'Admin', 
    userType: 'Admin',  
    profilePicture: 'data:image/png;base64,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', // URL фотографии пользователя
  };

  const router = useRouter();  
  const handleLogout = () => {
    router.push('/');  
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: user.profilePicture }} style={styles.profilePicture} />
      <Text style={styles.name}>Имя: {user.name}</Text>
      <Text style={styles.userType}>Роль:{user.userType}</Text>

      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Выйти</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F4F4F9',  
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#4CAF50',  
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',  
    marginBottom: 10,
  },
  userType: {
    fontSize: 18,
    color: '#777',  
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
