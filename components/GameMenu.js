import { View, Button, Text } from "react-native"; // Import React Native components.

import "./styles.css";

// GameMenu component for displaying after game ends or pauses.
const GameMenu = ({ route, navigation }) => {
  const { timeTaken } = route.params || {}; // Get time taken from navigation params.

  return (
    <View style={centeredContainer}>
      <Button
        title="Restart Game"
        onPress={() => navigation.navigate("Game", { restart: true })}
      />
      <Button
        title="Main Menu"
        onPress={() => navigation.navigate("Welcome")}
      />
      {timeTaken !== undefined && timeTaken !== null && (
        <Text style={timeText}>Time Taken: {timeTaken.toFixed(2)} seconds</Text>
      )}
    </View>
  );
};

export default GameMenu;
