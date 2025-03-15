import React from "react";
import { StyleSheet, Text, View, Image } from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";

type AccountScreenParams = {
    avatar?: string;
    username?: string;
    email?: string;
    gender?: string;
    aboutMe?: string;
};

type RouteProps = RouteProp<{ account: AccountScreenParams }, "account">;

function capitalizeFirstLetter(val?: string) {
    return val ? val.charAt(0).toUpperCase() + val.slice(1) : "Not specified";
}

const AccountScreen = () => {
    const route = useRoute<RouteProps>(); 
    const { avatar, username, email, gender, aboutMe } = route.params ?? {};

    return (
        <View style={styles.container}>
            <View style={styles.avatarContainer}>
                <Image
                    source={
                        avatar
                            ? { uri: avatar }
                            : require("@/assets/images/default-avatar.png")
                    }
                    style={styles.avatar}
                />
            </View>
            <View style={styles.infoContainer}>
                <Text style={styles.label}>Username</Text>
                <Text style={styles.text}>{username || "Not provided"}</Text>
            </View>
            <View style={styles.infoContainer}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.text}>{email || "Not provided"}</Text>
            </View>
            <View style={styles.infoContainer}>
                <Text style={styles.label}>Gender</Text>
                <Text style={styles.text}>{capitalizeFirstLetter(gender)}</Text>
            </View>
            <View style={styles.infoContainer}>
                <Text style={styles.label}>About me</Text>
                <Text style={styles.text}>{aboutMe || "Not provided"}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        gap: 15,
        paddingTop: 40,
        paddingBottom: 40,
        paddingHorizontal: 40,
        alignItems: "center",
        backgroundColor: "#DCD7C9"
    },
    avatarContainer: {
        justifyContent: "center",
        marginVertical: 20
    },
    avatar: {
        width: 150,
        height: 150,
        borderRadius: 75
    },
    infoContainer: {
        marginBottom: 15,
        width: "100%"
    },
    label: {
        fontSize: 22,
        fontWeight: "bold"
    },
    text: {
        fontSize: 20,
        marginTop: 5,
        color: "#333"
    }
});

export default AccountScreen;
