import { Dimensions } from "react-native"; // Import React Native components.
// import { StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native"; // Import navigation container.
import { createStackNavigator } from "@react-navigation/stack"; // Import stack navigator for screen navigation.
import Game from "./components/Game";
import GameMenu from "./components/GameMenu";
import WelcomeScreen from "./components/WelcomeScreen";

const { width, height } = Dimensions.get("window"); // Get device screen dimensions.
const ballRadius = 15; // Set radius of the ball

// Define fixed walls for the maze as an array of objects.
const fixedMaze = [
  // Define fixed walls for the maze. Add more walls as needed.
  // Horizontal walls.
  { x: 0, y: 100, width: 80, height: 10 },
  { x: 200, y: 100, width: 150, height: 10 },
  { x: 50, y: 200, width: 100, height: 10 },
  { x: 250, y: 200, width: 100, height: 10 },
  { x: 100, y: 300, width: 150, height: 10 },
  { x: 0, y: 400, width: 100, height: 10 },
  { x: 200, y: 400, width: 150, height: 10 },
  { x: 50, y: 500, width: 100, height: 10 },
  { x: 250, y: 500, width: 100, height: 10 },

  // Vertical walls.
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

// This function is used to generate a random maze.
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

// Function to check if a point is valid (i.e., not inside a wall).
// const isValidPoint = (point, maze) => {
const isValidPoint = (point) => {
  // return !maze.some(
  return !fixedMaze.some(
    (wall) =>
      point.x + ballRadius > wall.x &&
      point.x - ballRadius < wall.x + wall.width &&
      point.y + ballRadius > wall.y &&
      point.y - ballRadius < wall.y + wall.height
  );
};

// Function to get a random valid point on the screen.
// const getRandomPoint = (maze) => {
const getRandomPoint = () => {
  // Remove maze prop for fixed maze.
  let point;
  const cellSize = 40;

  while (true) {
    point = {
      x: Math.floor(Math.random() * (width - cellSize)),
      y: Math.floor(Math.random() * (height - cellSize)),
    };

    // If the point is valid, exit the loop.
    // if (isValidPoint(point, maze)) break;
    if (isValidPoint(point)) break; // Remove passing of maze prop for fixed maze.
  }

  return point;
};

// Create a stack navigator.
const Stack = createStackNavigator();

// Main App component with navigation.
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

// // Styles for the components.
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   centeredContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   title: {
//     fontSize: 24,
//     marginBottom: 20,
//   },
//   timeText: {
//     fontSize: 18,
//     marginTop: 20,
//     color: "red",
//   },
// });

export default App;
