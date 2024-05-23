import { Button, Text, View } from "react-native"; // Import React Native components.

import styles from "../styles.js";

// WelcomeScreen component for the initial screen.
const WelcomeScreen = ({ navigation }) => (
  <View style={styles.centeredContainer}>
    <Text style={styles.title}>Welcome to Escape Ball</Text>
    <Button title="Start Game" onPress={() => navigation.navigate("Game")} />
  </View>
);

export default WelcomeScreen;
