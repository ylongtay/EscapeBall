import React, { useEffect, useState } from "react"; // Import necessary hooks from React.
import { Button, Dimensions, Platform, Text, View } from "react-native"; // Import React Native components.
import { useFocusEffect } from "@react-navigation/native"; // Import useFocusEffect from react-navigation.
import { Accelerometer } from "expo-sensors"; // Import Accelerometer from expo-sensors to handle accelerometer data.
import Svg, { Circle, Rect } from "react-native-svg"; // Import Svg and its sub-components for drawing shapes.

import styles from "../styles.js";

// Get device screen dimensions.
const { width, height } = Dimensions.get("window");
// Set radius of the ball.
const ballRadius = 15;

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

  // Loop until a valid point is found.
  while (true) {
    // Generate a random point on the screen.
    point = {
      x: Math.floor(Math.random() * (width - cellSize)),
      y: Math.floor(Math.random() * (height - cellSize)),
    };

    // If the point is valid, exit the loop.
    // if (isValidPoint(point, maze)) break;
    if (isValidPoint(point)) break; // Remove passing of maze prop for fixed maze.
  }

  // Return the random point.
  return point;
};

// Game component where the main game logic resides.
const Game = ({ navigation, route }) => {
  // Define state variables for the game.
  const [ballPosition, setBallPosition] = useState({
    x: width / 2,
    y: height / 2,
  }); // State to track the ball's position.
  const [isPaused, setIsPaused] = useState(false); // State to track if the game is paused.
  const [startTime, setStartTime] = useState(Date.now()); // State to track the start time.
  const [initialSpeedMultiplier] = useState(200); // Initial speed multiplier for ball movement.
  const [speedMultiplier, setSpeedMultiplier] = useState(
    initialSpeedMultiplier
  ); // Speed multiplier state.
  // const [maze, setMaze] = useState(generateMaze());
  // Remove generateMaze() function in getRandomPoint
  const [startPoint, setStartPoint] = useState(getRandomPoint()); // Start point of the ball.
  // Remove generateMaze() function in getRandomPoint
  const [endPoint, setEndPoint] = useState(getRandomPoint()); // End point of the ball.
  const [timeTaken, setTimeTaken] = useState(null); // State to track time taken to complete the maze.

  // Effect to handle restart game logic.
  // useEffect(() => {
  // Check if the game should be restarted.
  //   if (route.params?.restart) {
  // If so, restart the game.
  //     handleRestart();
  // Reset the restart parameter in navigation params.
  //     navigation.setParams({ restart: false });
  //   } else {
  // If not, unpause the game.
  //     handleUnpause();
  //   }
  // }, [route.params?.restart]);
  // Use useFocusEffect to handle screen focus and detect return from GameMenu.
  useFocusEffect(
    React.useCallback(() => {
      // Check if the game should be restarted.
      if (route.params?.restart) {
        // If so, restart the game.
        handleRestart();
        // Reset the restart parameter in navigation params.
        navigation.setParams({ restart: false });
      } else {
        // If not, unpause the game.
        handleUnpause();
      }
    }, [route.params?.restart])
  );

  // Effect to set the ball position to start point when the game starts.
  useEffect(() => {
    setBallPosition(startPoint);
  }, [startPoint]);

  // Effect to handle accelerometer data and game logic.
  useEffect(() => {
    Accelerometer.setUpdateInterval(16); // Set accelerometer update interval to 16ms.

    // Function to update speed multiplier over time.
    const updateSpeedMultiplier = () => {
      const duration = (Date.now() - startTime) / 1000; // Calculate elapsed time in seconds.
      setSpeedMultiplier(initialSpeedMultiplier + duration * 5); // Increase speed multiplier over time.
    };

    const intervalId = setInterval(updateSpeedMultiplier, 100); // Update speed multiplier every 100ms to increase the acceleration rate.

    // Subscribe to accelerometer data.
    const subscription = Accelerometer.addListener((accelerometerData) => {
      // Check if the game is not paused.
      if (!isPaused) {
        const { x, y } = accelerometerData; // Get x and y data from accelerometer.
        // Update ball position based on accelerometer data.
        setBallPosition((prevPosition) => {
          // Added adjusted variable to correct android accelerometer work in opposite direction. Adjust x and y based on platform (iOS or Android).
          const adjustedX = Platform.OS === "ios" ? x : -x;
          const adjustedY = Platform.OS === "ios" ? y : -y;

          // Calculate new ball position based on accelerometer data.
          let newX = prevPosition.x + adjustedX * speedMultiplier * 0.02;
          let newY = prevPosition.y - adjustedY * speedMultiplier * 0.02;

          // Ensure the ball stays within screen bounds.
          if (newX + ballRadius > width) newX = width - ballRadius;
          if (newX - ballRadius < 0) newX = ballRadius;
          if (newY + ballRadius > height) newY = height - ballRadius;
          if (newY - ballRadius < 0) newY = ballRadius;

          // Check for collisions with maze walls.
          //   for (let wall of maze) {
          for (let wall of fixedMaze) {
            //Change maze to fixedMaze.
            // Check if the ball collides with a wall.
            if (
              newX + ballRadius > wall.x &&
              newX - ballRadius < wall.x + wall.width &&
              newY + ballRadius > wall.y &&
              newY - ballRadius < wall.y + wall.height
            ) {
              // If collision detected, reset position to previous position.
              newX = prevPosition.x;
              newY = prevPosition.y;
              break;
            }
          }

          // Check if ball has reached the end point.
          if (
            newX + ballRadius > endPoint.x &&
            newX - ballRadius < endPoint.x + 20 &&
            newY + ballRadius > endPoint.y &&
            newY - ballRadius < endPoint.y + 20
          ) {
            // If end point reached, pause the game and navigate to the game menu screen.
            // setIsPaused(true); // Pause the game.
            const timeElapsed = (Date.now() - startTime) / 1000; // Calculate time taken.
            setTimeTaken(timeElapsed); // Set time taken state.
            // setTimeout(
            // Navigate to the game menu screen after 0ms.
            //   () => navigation.navigate("GameMenu", { timeTaken: timeElapsed }),
            //   0
            // );
            setIsPaused(true); // Pause the game.
          }

          return { x: newX, y: newY }; // Update ball position state.
        });
      }
    });

    // Clean up subscription and interval on component unmount.
    return () => {
      // Unsubscribe from accelerometer data.
      subscription.remove();
      // Clear interval for speed multiplier update.
      clearInterval(intervalId);
    };
    //   }, [isPaused, speedMultiplier, maze]); // Remove maze.
    // Remove maze prop from useEffect dependency array.
  }, [isPaused, speedMultiplier]); // Remove maze.

  useEffect(() => {
    console.log("isPaused state updated:", isPaused);
    console.log("Time taken:", timeTaken, "seconds");
    // if (isPaused) {
    if (isPaused && timeTaken !== null) {
      // navigation.navigate("GameMenu", { timeTaken });
      setTimeout(() => navigation.navigate("GameMenu", { timeTaken }), 0);
    }
  }, [isPaused, timeTaken]);

  // Function to handle game pause.
  const handlePause = () => {
    // If pause button is pressed, calculate time taken and pause the game.
    const timeElapsed = (Date.now() - startTime) / 1000; // Calculate time taken.
    setTimeTaken(timeElapsed); // Set time taken state.
    // Pause the game and navigate to the game menu screen.
    console.log("Pause button pressed, isPaused state before set:", isPaused);
    setIsPaused(true);
    // console.log("Pause button pressed, isPaused state after set:", isPaused);
    console.log("Pause button pressed, isPaused state after set:", true);
  };

  // Function to handle game restart.
  const handleRestart = () => {
    // Reset the game state.
    // Comment out when random maze not used.
    // const newMaze = generateMaze();
    // const newStartPoint = getRandomPoint(newMaze);
    // const newEndPoint = getRandomPoint(newMaze);
    const newStartPoint = getRandomPoint(); // Remove newMaze prop from getRandomPoint(). Generate new start point.
    const newEndPoint = getRandomPoint(); // Remove newMaze prop from getRandomPoint(). Generate new end point.

    // setMaze(newMaze);
    // Remove maze prop from setBallPosition, setStartPoint, and setEndPoint.
    setBallPosition(newStartPoint); // Set ball position to new start point.
    setStartPoint(newStartPoint); // Set start point to new start point.
    setEndPoint(newEndPoint); // Set end point to new end point.
    setStartTime(Date.now()); // Reset start time.
    setSpeedMultiplier(initialSpeedMultiplier); // Reset speed multiplier.
    setIsPaused(false); // Unpause the game.
    setTimeTaken(null); // Reset time taken.
  };

  // Function to handle game unpause.
  const handleUnpause = () => {
    console.log("Resume button pressed, isPaused state before set:", isPaused);
    // Unpause the game.
    setIsPaused(false);
    // console.log("Resume button pressed, isPaused state after set:", isPaused);
    console.log("Resume button pressed, isPaused state after set:", false);
  };

  // Return the game screen with maze, ball, start point, end point, and pause button.
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
      <View style={styles.pauseButtonContainer}>
        <Button title="Pause" onPress={handlePause} />
      </View>
      {timeTaken !== null && (
        // Display time taken in seconds with 2 decimal places.
        <Text style={styles.timeText}>
          Time Taken: {timeTaken.toFixed(2)} seconds
        </Text>
      )}
    </View>
  );
};

export default Game;
