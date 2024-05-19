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
const ballRadius = 20;
const cellSize = ballRadius * 2.5; // Ensure cells are at least 2.5 times the ball's diameter
const wallThickness = 4;

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

const generateMaze = () => {
  const numCols = Math.floor(width / cellSize);
  const numRows = Math.floor(height / cellSize);

  const maze = Array(numRows)
    .fill()
    .map(() => Array(numCols).fill(false));
  const walls = new Set();

  const addWalls = (x, y) => {
    if (x > 0 && !maze[y][x - 1]) walls.add([x - 1, y, x, y].toString());
    if (x < numCols - 1 && !maze[y][x + 1])
      walls.add([x + 1, y, x, y].toString());
    if (y > 0 && !maze[y - 1][x]) walls.add([x, y - 1, x, y].toString());
    if (y < numRows - 1 && !maze[y + 1][x])
      walls.add([x, y + 1, x, y].toString());
  };

  const randomIndex = () => Math.floor(Math.random() * walls.size);

  const createMaze = () => {
    const startX = Math.floor(Math.random() * numCols);
    const startY = Math.floor(Math.random() * numRows);
    maze[startY][startX] = true;
    addWalls(startX, startY);

    while (walls.size > 0) {
      const wallArray = Array.from(walls);
      const randomWallIndex = randomIndex();
      const wallString = wallArray[randomWallIndex];
      const [wx, wy, nx, ny] = wallString.split(",").map(Number);
      walls.delete(wallString);

      if (!maze[ny][nx]) {
        maze[ny][nx] = true;
        addWalls(nx, ny);

        const isHorizontal = wx !== nx;
        const wallX = isHorizontal
          ? Math.min(wx, nx) * cellSize
          : wx * cellSize;
        const wallY = isHorizontal
          ? wy * cellSize
          : Math.min(wy, ny) * cellSize;
        const wallWidth = isHorizontal
          ? wallThickness
          : cellSize + wallThickness;
        const wallHeight = isHorizontal
          ? cellSize + wallThickness
          : wallThickness;

        walls.add(
          {
            x: wallX,
            y: wallY,
            width: wallWidth,
            height: wallHeight,
          }.toString()
        );
      }
    }
  };

  createMaze();
  return Array.from(walls).map((wallString) => {
    const [x, y, width, height] = wallString.split(",").map(Number);
    return { x, y, width, height };
  });
};

const isValidPoint = (point, maze) => {
  return !maze.some(
    (wall) =>
      point.x + ballRadius > wall.x &&
      point.x - ballRadius < wall.x + wall.width &&
      point.y + ballRadius > wall.y &&
      point.y - ballRadius < wall.y + wall.height
  );
};

const getRandomPoint = (maze) => {
  let point;

  while (true) {
    point = {
      x: Math.floor(Math.random() * (width - cellSize)),
      y: Math.floor(Math.random() * (height - cellSize)),
    };

    if (isValidPoint(point, maze)) break;
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
  const [maze, setMaze] = useState(generateMaze());
  const [startPoint, setStartPoint] = useState(getRandomPoint(maze));
  const [endPoint, setEndPoint] = useState(getRandomPoint(maze));
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
          const adjustedX = Platform.OS === "ios" ? x : -x;
          const adjustedY = Platform.OS === "ios" ? y : -y;

          let newX = prevPosition.x + adjustedX * speedMultiplier * 0.02;
          let newY = prevPosition.y - adjustedY * speedMultiplier * 0.02;

          if (newX + ballRadius > width) newX = width - ballRadius;
          if (newX - ballRadius < 0) newX = ballRadius;
          if (newY + ballRadius > height) newY = height - ballRadius;
          if (newY - ballRadius < 0) newY = ballRadius;

          for (let wall of maze) {
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
  }, [isPaused, speedMultiplier, maze]);

  const handlePause = () => {
    setIsPaused(true);
    setTimeout(() => navigation.navigate("GameMenu", { timeTaken }), 0);
  };

  const handleRestart = () => {
    const newMaze = generateMaze();
    const newStartPoint = getRandomPoint(newMaze);
    const newEndPoint = getRandomPoint(newMaze);

    setMaze(newMaze);
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
        {maze.map((wall, index) => (
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
  },
});

export default App;
