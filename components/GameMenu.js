import React from "react";
import { BackHandler, Button, Text, View } from "react-native"; // Import React Native components.
import { useFocusEffect } from "@react-navigation/native";

import styles from "../styles.js";

// GameMenu component for displaying after game ends or pauses.
const GameMenu = ({ route, navigation }) => {
  // Get time taken and gameCompleted from navigation params.
  const { timeTaken, gameCompleted } = route.params || {};

  // Use the useFocusEffect hook to handle back button press.
  useFocusEffect(
    // Callback function to handle back button press.
    React.useCallback(() => {
      const onBackPress = () => {
        // Check if the game is completed.
        if (!gameCompleted) {
          // If the game is not completed, resume the game.
          navigation.navigate("Game", { restart: false });
        } else {
          // If the game is completed, navigate to the main menu.
          navigation.navigate("Welcome");
        }

        // Return true to prevent default back button behavior.
        return true;
      };

      // Add event listener for hardware back press.
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress", // Event name for hardware back press.
        onBackPress // Callback function for hardware back press.
      );

      // Return a cleanup function to remove the event listener.
      return () => subscription.remove();
    }, [navigation, gameCompleted])
  );

  // Return the GameMenu component.
  return (
    // View component to display game menu options.
    <View style={styles.centeredContainer}>
      {!gameCompleted && ( // Display the game completed message if the game is completed.
        <Text style={styles.announcementMessage}>
          You have completed the level!{" "}
        </Text>
      )}
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

// Export the GameMenu component.
export default GameMenu;
