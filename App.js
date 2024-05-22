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
import Svg, { Circle, Rect } from "react-native-svg";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

const { width, height } = Dimensions.get("window");
const ballRadius = 15;

const fixedMaze = [
  // Define fixed walls for the maze

  // Add more walls as needed
  // Horizontal walls
  { x: 0, y: 100, width: 150, height: 10 },
  { x: 200, y: 100, width: 150, height: 10 },
  { x: 50, y: 200, width: 100, height: 10 },
  { x: 250, y: 200, width: 100, height: 10 },
  { x: 100, y: 300, width: 150, height: 10 },
  { x: 0, y: 400, width: 100, height: 10 },
  { x: 200, y: 400, width: 150, height: 10 },
  { x: 50, y: 500, width: 100, height: 10 },
  { x: 250, y: 500, width: 100, height: 10 },
  // Vertical walls
  { x: 150, y: 0, width: 10, height: 150 },
  { x: 150, y: 200, width: 10, height: 150 },
  { x: 100, y: 150, width: 10, height: 100 },
  { x: 250, y: 150, width: 10, height: 100 },
  { x: 0, y: 300, width: 10, height: 100 },
  { x: 300, y: 300, width: 10, height: 100 },
  { x: 50, y: 450, width: 10, height: 100 },
  { x: 200, y: 450, width: 10, height: 100 },
  { x: 150, y: 550, width: 10, height: 100 },
];

const WelcomeScreen = ({ navigation }) => (
  <View style={styles.centeredContainer}>
    <Text style={styles.title}>Welcome to Escape Ball</Text>
    <Button title="Start Game" onPress={() => navigation.navigate("Game")} />
  </View>
);

const GameMenu = ({ route, navigation }) => {
  const { timeTaken } = route.params || {};

  return (
    <View style={styles.centeredContainer}>
      <Button
        title="Restart Game"
        onPress={() => navigation.navigate("Game", { restart: true })}
      />
      <Button
        title="Main Menu"
        onPress={() => navigation.navigate("Welcome")}
      />
      {timeTaken !== undefined && timeTaken !== null && (
        <Text style={styles.timeText}>
          Time Taken: {timeTaken.toFixed(2)} seconds
        </Text>
      )}
    </View>
  );
};

// Below use to generate random maze
// const generateMaze = () => {
//   const maze = [];
//   const cellSize = 40;
//   const numCols = Math.floor(width / cellSize);
//   const numRows = Math.floor(height / cellSize);

//   for (let i = 0; i < numRows; i++) {
//     for (let j = 0; j < numCols; j++) {
//       if (Math.random() < 0.3) {
//         maze.push({
//           x: j * cellSize,
//           y: i * cellSize,
//           width: cellSize,
//           height: cellSize,
//         });
//       }
//     }
//   }

//   return maze;
// };

// Use for random maze valid path
// const isValidPoint = (point, maze) => {
//   return !maze.some(
//     (wall) =>
//       point.x + ballRadius > wall.x &&
//       point.x - ballRadius < wall.x + wall.width &&
//       point.y + ballRadius > wall.y &&
//       point.y - ballRadius < wall.y + wall.height
//   );
// };

const isValidPoint = (point) => {
  return !fixedMaze.some(
    (wall) =>
      point.x + ballRadius > wall.x &&
      point.x - ballRadius < wall.x + wall.width &&
      point.y + ballRadius > wall.y &&
      point.y - ballRadius < wall.y + wall.height
  );
};

const getRandomPoint = () => {
  //Remove maze prop for fixed maze
  let point;
  const cellSize = 40;

  while (true) {
    point = {
      x: Math.floor(Math.random() * (width - cellSize)),
      y: Math.floor(Math.random() * (height - cellSize)),
    };

    if (isValidPoint(point)) break; //Remove passing of maze prop for fixed maze
  }

  return point;
};

const Game = ({ navigation, route }) => {
  const [ballPosition, setBallPosition] = useState({
    x: width / 2,
    y: height / 2,
  });
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [initialSpeedMultiplier] = useState(200); // Increased initial speed
  const [speedMultiplier, setSpeedMultiplier] = useState(
    initialSpeedMultiplier
  );
  // const [maze, setMaze] = useState(generateMaze());
  // Remove generateMaze() function in getRandomPoint
  const [startPoint, setStartPoint] = useState(getRandomPoint());
  // Remove generateMaze() function in getRandomPoint
  const [endPoint, setEndPoint] = useState(getRandomPoint());
  const [timeTaken, setTimeTaken] = useState(null);

  useEffect(() => {
    if (route.params?.restart) {
      handleRestart();
      navigation.setParams({ restart: false });
    }
  }, [route.params?.restart]);

  useEffect(() => {
    setBallPosition(startPoint);
  }, [startPoint]);

  useEffect(() => {
    Accelerometer.setUpdateInterval(16);

    const updateSpeedMultiplier = () => {
      const duration = (Date.now() - startTime) / 1000;
      setSpeedMultiplier(initialSpeedMultiplier + duration * 5); // Increase acceleration rate
    };

    const intervalId = setInterval(updateSpeedMultiplier, 100);

    const subscription = Accelerometer.addListener((accelerometerData) => {
      if (!isPaused) {
        const { x, y } = accelerometerData;
        setBallPosition((prevPosition) => {
          // Added adjusted variable to correct android accelerometer work in opposite direction
          const adjustedX = Platform.OS === "ios" ? x : -x;
          const adjustedY = Platform.OS === "ios" ? y : -y;

          let newX = prevPosition.x + adjustedX * speedMultiplier * 0.02;
          let newY = prevPosition.y - adjustedY * speedMultiplier * 0.02;

          if (newX + ballRadius > width) newX = width - ballRadius;
          if (newX - ballRadius < 0) newX = ballRadius;
          if (newY + ballRadius > height) newY = height - ballRadius;
          if (newY - ballRadius < 0) newY = ballRadius;

          for (let wall of fixedMaze) {
            //Change maze to fixedMaze
            if (
              newX + ballRadius > wall.x &&
              newX - ballRadius < wall.x + wall.width &&
              newY + ballRadius > wall.y &&
              newY - ballRadius < wall.y + wall.height
            ) {
              newX = prevPosition.x;
              newY = prevPosition.y;
              break;
            }
          }

          if (
            newX + ballRadius > endPoint.x &&
            newX - ballRadius < endPoint.x + 20 &&
            newY + ballRadius > endPoint.y &&
            newY - ballRadius < endPoint.y + 20
          ) {
            setIsPaused(true);
            const timeElapsed = (Date.now() - startTime) / 1000;
            setTimeTaken(timeElapsed);
            setTimeout(
              () => navigation.navigate("GameMenu", { timeTaken: timeElapsed }),
              0
            );
          }

          return { x: newX, y: newY };
        });
      }
    });

    return () => {
      subscription.remove();
      clearInterval(intervalId);
    };
  }, [isPaused, speedMultiplier]); //Remove maze

  const handlePause = () => {
    setIsPaused(true);
    setTimeout(() => navigation.navigate("GameMenu", { timeTaken }), 0);
  };

  const handleRestart = () => {
    // const newMaze = generateMaze(); //Comment out when random maze not used
    const newStartPoint = getRandomPoint(); //remove newMaze prop from getRandomPoint()
    const newEndPoint = getRandomPoint(); //remove newMaze prop from getRandomPoint()

    // setMaze(newMaze);
    setBallPosition(newStartPoint);
    setStartPoint(newStartPoint);
    setEndPoint(newEndPoint);
    setStartTime(Date.now());
    setSpeedMultiplier(initialSpeedMultiplier);
    setIsPaused(false);
    setTimeTaken(null);
  };

  return (
    <View style={styles.container}>
      <Svg height={height} width={width}>
        {/* {maze.map((wall, index) => ( */}
        {fixedMaze.map((wall, index) => (
          <Rect
            key={index}
            x={wall.x}
            y={wall.y}
            width={wall.width}
            height={wall.height}
            fill="black"
          />
        ))}
        <Circle
          cx={ballPosition.x}
          cy={ballPosition.y}
          r={ballRadius}
          fill="blue"
        />
        <Circle
          cx={startPoint.x}
          cy={startPoint.y}
          r={ballRadius}
          fill="green"
        />
        <Circle cx={endPoint.x} cy={endPoint.y} r={ballRadius} fill="red" />
      </Svg>
      <Button title="Pause" onPress={handlePause} />
      {timeTaken !== null && (
        <Text style={styles.timeText}>
          Time Taken: {timeTaken.toFixed(2)} seconds
        </Text>
      )}
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
  timeText: {
    fontSize: 18,
    marginTop: 20,
    color: "red",
  },
});

export default App;
