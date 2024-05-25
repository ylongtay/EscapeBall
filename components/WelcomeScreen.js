import React from "react";
import { Button, Text, View } from "react-native"; // Import React Native components.
import Background from "./Background"; // Import the Background component.

import styles from "../styles.js";

// WelcomeScreen component for the initial screen.
const WelcomeScreen = ({ navigation }) => (
  // Return the WelcomeScreen component.
  <View style={styles.centeredContainer}>
    <Background />
    <View style={styles.overlay}>
      <Text style={styles.title}>Welcome to Escape Ball</Text>
      <Button title="Start Game" onPress={() => navigation.navigate("Game")} />
    </View>
  </View>
);

export default WelcomeScreen;
