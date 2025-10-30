import React, { useEffect } from "react";
import { View, Text, StyleSheet, Image, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window"); 
const SplashScreen = ({ navigation }) => {

  useEffect(() => {
    // 2 saniye sonra Login ekranına geç
    const timer = setTimeout(() => {
      navigation.replace("Login");
    }, 2000);
    return () => clearTimeout(timer); // Temizlik
  }, []);

  return (
    <View style={styles.container}>
      {/* Üst sol küçük bloklar */}
      <View style={styles.topLeft1} />
      <View style={styles.topLeft2} />

      {/* Üst sağ blok */}
      <View style={styles.topRight} />

      {/* Sol orta blok */}
      <View style={styles.midLeft} />

      {/* Alt sol blok */}
      <View style={styles.bottomLeft} />

      {/* Alt sağ bloklar */}
      <View style={styles.bottomRight1} />
      <View style={styles.bottomRight2} />

      {/* Ortadaki logo */}
      <Image
        source={require("../assets/rast-mobile-logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.subtitle}>Building the Future</Text>
    </View>
  );
};

// Styles kodları
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },

  logo: {
    width: 150,
    height: 150,
    marginBottom: 10,
  },

  subtitle: { 
    fontSize: 28,
    marginTop: -50,
    color: "#b3b2b2ff",
    fontFamily: "sans-serif",
    letterSpacing: 1,
  },

  // Üst sol bloklar
  topLeft1: {
    position: "absolute",
    top: 0,
    left: 0,
    width: width * 0.20,
    height: height * 0.10,
    backgroundColor: "#7b2ff7",
    borderBottomRightRadius: 25,
  },
  topLeft2: {
    position: "absolute",
    top: height * 0.11,
    left: 0,
    width: width * 0.20,
    height: height * 0.30,
    backgroundColor: "#7b2ff7",
    borderBottomRightRadius: 25,
    borderTopRightRadius: 20 
  },

  // Üst sağ blok
  topRight: {
    position: "absolute",
    top: 0,
    right: 0,
    width: width * 0.78,
    height: height * 0.095,
    backgroundColor: "#7b2ff7",
    borderBottomLeftRadius: 25,
  },

  // Alt sol blok
  bottomLeft: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: width * 0.78,
    height: height * 0.10,
    backgroundColor: "#7b2ff7",
    borderTopRightRadius: 25,
  },

  // Alt sağ bloklar
  bottomRight1: {
    position: "absolute",
    bottom: height * 0.11,
    right: 0,
    width: width * 0.20,
    height: height * 0.30,
    backgroundColor: "#7b2ff7",
    borderTopLeftRadius: 25,
    borderBottomLeftRadius: 20
  },
  bottomRight2: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: width * 0.20,
    height: height * 0.10,
    backgroundColor: "#7b2ff7",
    borderTopLeftRadius: 25,
  },
});

export default SplashScreen;
