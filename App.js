import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Button,
  Platform,
  Dimensions,
  Text,
} from "react-native";
import { Accelerometer } from "expo-sensors";
import Svg, { Circle } from "react-native-svg";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

const { width, height } = Dimensions.get("window");
const ballRadius = 20;

const WelcomeScreen = ({ navigation }) => (
  <View style={styles.centeredContainer}>
    <Text style={styles.title}>Welcome to Escape Ball</Text>
    <Button title="Start Game" onPress={() => navigation.navigate("Game")} />
  </View>
);

const GameMenu = ({ route, navigation }) => {
  const { onRestart } = route.params;

  return (
    <View style={styles.centeredContainer}>
      <Button
        title="Restart Game"
        onPress={() => {
          onRestart();
          navigation.navigate("Game");
        }}
      />
      <Button
        title="Main Menu"
        onPress={() => navigation.navigate("Welcome")}
      />
    </View>
  );
};

const Game = ({ navigation }) => {
  const [ballPosition, setBallPosition] = useState({
    x: width / 2,
    y: height / 2,
  });
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [initialSpeedMultiplier] = useState(100);
  const [speedMultiplier, setSpeedMultiplier] = useState(
    initialSpeedMultiplier
  );

  useEffect(() => {
    Accelerometer.setUpdateInterval(10);

    const updateSpeedMultiplier = () => {
      const duration = (Date.now() - startTime) / 1000;
      setSpeedMultiplier(initialSpeedMultiplier + duration * 0.1);
    };

    const intervalId = setInterval(updateSpeedMultiplier, 100);

    const subscription = Accelerometer.addListener((accelerometerData) => {
      if (!isPaused) {
        const { x, y } = accelerometerData;
        setBallPosition((prevPosition) => {
          const adjustedX = Platform.OS === "ios" ? x : -x;
          const adjustedY = Platform.OS === "ios" ? y : -y;

          let newX = prevPosition.x + adjustedX * speedMultiplier;
          let newY = prevPosition.y - adjustedY * speedMultiplier;

          if (newX + ballRadius > width) newX = width - ballRadius;
          if (newX - ballRadius < 0) newX = ballRadius;
          if (newY + ballRadius > height) newY = height - ballRadius;
          if (newY - ballRadius < 0) newY = ballRadius;

          return { x: newX, y: newY };
        });
      }
    });

    return () => {
      subscription.remove();
      clearInterval(intervalId);
    };
  }, [isPaused, speedMultiplier]);

  const handlePause = () => {
    setIsPaused(true);
    navigation.navigate("GameMenu", { onRestart: handleRestart });
  };

  const handleRestart = () => {
    setBallPosition({ x: width / 2, y: height / 2 });
    setStartTime(Date.now());
    setSpeedMultiplier(initialSpeedMultiplier);
    setIsPaused(false);
    navigation.navigate("Game");
  };

  return (
    <View style={styles.container}>
      <Svg height={height} width={width}>
        <Circle
          cx={ballPosition.x}
          cy={ballPosition.y}
          r={ballRadius}
          fill="blue"
        />
      </Svg>
      <Button title="Pause" onPress={handlePause} />
    </View>
  );
};

const Stack = createStackNavigator();

const App = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="Welcome">
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Game"
        component={Game}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="GameMenu"
        component={GameMenu}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  </NavigationContainer>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});

export default App;
