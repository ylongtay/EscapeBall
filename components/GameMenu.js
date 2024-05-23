import React from "react";
import { BackHandler, Button, Text, View } from "react-native"; // Import React Native components.
import { useFocusEffect } from "@react-navigation/native";

import styles from "../styles.js";

// GameMenu component for displaying after game ends or pauses.
const GameMenu = ({ route, navigation }) => {
  // Get time taken and gameCompleted from navigation params.
  const { timeTaken, gameCompleted } = route.params || {};

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (!gameCompleted) {
          // If the game is not completed, resume the game.
          navigation.navigate("Game", { restart: false });
        } else {
          // If the game is completed, navigate to the main menu.
          navigation.navigate("Welcome");
        }
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => subscription.remove();
    }, [navigation, gameCompleted])
  );

  // Return the GameMenu component.
  return (
    <View style={styles.centeredContainer}>
      {!gameCompleted && (
        <Button
          title="Resume"
          onPress={() => navigation.navigate("Game", { restart: false })}
        />
      )}
      <Button
        title="Restart Game"
        onPress={() => navigation.navigate("Game", { restart: true })}
      />
      <Button
        title="Main Menu"
        onPress={() => navigation.navigate("Welcome")}
      />
      {timeTaken !== undefined &&
        timeTaken !== null && ( // Display the time taken if available.
          <Text style={styles.timeText}>
            Time Taken: {timeTaken.toFixed(2)} seconds
          </Text>
        )}
    </View>
  );
};

export default GameMenu;
