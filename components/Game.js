import React, { useEffect, useState } from "react"; // Import necessary hooks from React.
import { Button, Dimensions, Platform, Text, View } from "react-native"; // Import React Native components.
import { useFocusEffect } from "@react-navigation/native"; // Import useFocusEffect from react-navigation.
import { Accelerometer } from "expo-sensors"; // Import Accelerometer from expo-sensors to handle accelerometer data.
import Svg, { Circle, Rect } from "react-native-svg"; // Import Svg and its sub-components for drawing shapes.

import styles from "../styles.js";

// Get device screen dimensions.
const { width, height } = Dimensions.get("window");

// Set radius of the ball.
const ballRadius = 13;

// Set fixed maze wall density factor, generation scale, height, width, and scale.
const mazeWallDensityFactor = 0.3; // Adjust the density factor to change the number of walls.
const mazeWallGenerationScale = 0.9; // Adjust the generation scale to change the maze size.
const mazeWallHeight = 30; // Adjust the height of the maze walls.
const mazeWallWidth = 30; // Adjust the width of the maze walls.
const mazeWallScale = 30; // Adjust the scale of the maze walls.
const targetPointSizeReduction = 40; // Adjust the target point size reduction.

// Define fixed walls for the maze as an array of objects.
// const fixedMaze = [
//   // Define fixed walls for the maze. Add more walls as needed.
//   // Horizontal walls.
//   { x: 0, y: 100, width: 80, height: 10 },
//   { x: 200, y: 100, width: 150, height: 10 },
//   { x: 50, y: 200, width: 100, height: 10 },
//   { x: 250, y: 200, width: 100, height: 10 },
//   { x: 100, y: 300, width: 150, height: 10 },
//   { x: 0, y: 400, width: 100, height: 10 },
//   { x: 200, y: 400, width: 150, height: 10 },
//   { x: 50, y: 500, width: 100, height: 10 },
//   { x: 250, y: 500, width: 100, height: 10 },

//   // Vertical walls.
//   { x: 150, y: 0, width: 10, height: 150 },
//   { x: 150, y: 200, width: 10, height: 150 },
//   { x: 100, y: 150, width: 10, height: 100 },
//   { x: 250, y: 150, width: 10, height: 100 },
//   { x: 0, y: 300, width: 10, height: 100 },
//   { x: 300, y: 300, width: 10, height: 100 },
//   { x: 50, y: 450, width: 10, height: 100 },
//   { x: 200, y: 450, width: 10, height: 100 },
//   { x: 150, y: 550, width: 10, height: 100 },
// ];

// Utility function to convert coordinates to grid index.
const coordsToIndex = (x, y, cellSize) => {
  return { col: Math.floor(x / cellSize), row: Math.floor(y / cellSize) };
};

// Utility function to convert grid index to coordinates.
// const indexToCoords = (col, row, cellSize) => {
//   return { x: col * cellSize, y: row * cellSize };
// };

// Utility function to calculate distance between two points.
const calculateDistance = (point1, point2) => {
  // Calculate Euclidean distance between two points.
  return Math.sqrt(
    // Calculate the square of the sum of the squares of the differences in x and y coordinates.
    Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
  );
};

// This function is used to generate a random maze.
const generateMaze = () => {
  const maze = [];
  // const cellSize = 40;
  const cellSize = mazeWallScale;
  const numCols = Math.floor((width / cellSize) * mazeWallGenerationScale);
  const numRows = Math.floor((height / cellSize) * mazeWallGenerationScale);

  // Generate random walls for the maze. Adjust the density factor to change the number of walls.
  // Adjust the random factor to change the randomness of the walls.
  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      // if (Math.random() < 0.3) {
      if (Math.random() < mazeWallDensityFactor) {
        maze.push({
          x: j * cellSize,
          y: i * cellSize,
          // width: cellSize,
          // height: cellSize,
          width: mazeWallWidth,
          height: mazeWallHeight,
        });
      }
    }
  }

  // Return the generated maze.
  return maze;
};

// Generate a fixed maze for the game.
fixedMaze = generateMaze();

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
  // const cellSize = 40;
  const cellSize = targetPointSizeReduction;

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

// Function to check if there is a valid path between the start and end points using Breadth-First Search (BFS).
const checkValidPath = (start, end, cellSize) => {
  const numCols = Math.floor((width / cellSize) * mazeWallGenerationScale);
  const numRows = Math.floor((height / cellSize) * mazeWallGenerationScale);
  const startIdx = coordsToIndex(start.x, start.y, cellSize);
  const endIdx = coordsToIndex(end.x, end.y, cellSize);

  // Ensure that startIdx and endIdx are within bounds.
  if (
    startIdx.col < 0 ||
    startIdx.col >= numCols ||
    startIdx.row < 0 ||
    startIdx.row >= numRows
  ) {
    // If startIdx is out of bounds, return false.
    // throw new Error("startIdx is out of bounds");
    // console.error("startIdx is out of bounds", startIdx);

    return false;
  }

  if (
    endIdx.col < 0 ||
    endIdx.col >= numCols ||
    endIdx.row < 0 ||
    endIdx.row >= numRows
  ) {
    // If endIdx is out of bounds, return false.
    // throw new Error("endIdx is out of bounds");
    // console.error("endIdx is out of bounds", endIdx);

    return false;
  }

  // Create a queue to store the indices of the cells to visit.
  const queue = [startIdx];

  // Create a visited array to keep track of visited cells.
  const visited = Array.from(Array(numRows), () => Array(numCols).fill(false));
  visited[startIdx.row][startIdx.col] = true;

  // Define the directions to move in the maze.
  const directions = [
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 },
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 },
  ];

  // Perform BFS to find a path from the start to end points.
  while (queue.length > 0) {
    // Get the current cell from the queue.
    const { col, row } = queue.shift();

    // Check if the current cell is the end point.
    if (col === endIdx.col && row === endIdx.row) {
      // If the end point is reached, return true.
      return true;
    }

    // Check the neighboring cells.
    for (const { dx, dy } of directions) {
      // Calculate the new column and row for the neighboring cell.
      const newCol = col + dx;
      const newRow = row + dy;

      // Check if the neighboring cell is within bounds and not visited.
      if (
        newCol >= 0 &&
        newCol < numCols &&
        newRow >= 0 &&
        newRow < numRows &&
        !visited[newRow][newCol] &&
        !fixedMaze.some(
          (wall) =>
            newCol * cellSize + ballRadius > wall.x &&
            newCol * cellSize - ballRadius < wall.x + wall.width &&
            newRow * cellSize + ballRadius > wall.y &&
            newRow * cellSize - ballRadius < wall.y + wall.height
        )
      ) {
        // If the neighboring cell is valid, mark it as visited and add it to the queue.
        visited[newRow][newCol] = true;
        queue.push({ col: newCol, row: newRow });
      }
    }
  }

  // If no valid path is found, return false.
  return false;
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
  const [gameCompleted, setGameCompleted] = useState(false); // State to track if the game is completed.

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
  // The useEffect is tied to component renders and dependency changes but doesn't handle focus changes natively.
  // The useFocusEffect ensures that the effect runs every time the screen gains focus, making it more reliable in navigation contexts.
  // By using useFocusEffect, you ensure that your effect runs every time GameMenu comes into focus,
  // thereby updating the boolean state correctly regardless of the navigation sequence.
  // Given the current scenario, we update the isPaused boolean value in the GameMenu component then navigate to the Game component.
  // If the Game component relies on navigation parameters and useEffect, it might not update correctly on subsequent navigation jumps because
  // useEffect doesn't inherently handle focus changes. With useFocusEffect, every time the Game component comes into focus, it re-runs the effect,
  // ensuring that any state or navigation parameter changes are handled correctly.
  // Here, the implementation using useFocusEffect to ensure the boolean state isPaused updates correctly every time you navigate between the
  // Game and GameMenu components.
  useFocusEffect(
    // Callback function to handle screen focus.
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

          // Check to ensure that the ball stays within screen bounds.
          if (newX + ballRadius > width) newX = width - ballRadius;
          if (newX - ballRadius < 0) newX = ballRadius;
          if (newY + ballRadius > height) newY = height - ballRadius;
          if (newY - ballRadius < 0) newY = ballRadius;

          // Function to check for collision at a given point.
          const isCollision = (x, y) => {
            // Check if the ball collides with a wall.
            // The array.some(function(value, index, arr), this) method checks if any array elements pass a test (provided as a callback function).
            // It executes the callback function once for each array element. It returns true (and stops) if the function returns true
            // for one of the array elements and returns false if the function returns false for all of the array elements.
            // It does not execute the function for empty array elements and does not change the original array.
            return fixedMaze.some(
              (wall) =>
                // Check if the ball collides with a wall.
                x + ballRadius > wall.x &&
                x - ballRadius < wall.x + wall.width &&
                y + ballRadius > wall.y &&
                y - ballRadius < wall.y + wall.height
            );
          };

          // Check for collisions with maze walls.
          // let collisionDetected = false;

          // //   for (let wall of maze) {
          // for (let wall of fixedMaze) {
          //   //Change maze to fixedMaze.
          //   // Check if the ball collides with a wall.
          //   if (
          //     newX + ballRadius > wall.x &&
          //     newX - ballRadius < wall.x + wall.width &&
          //     newY + ballRadius > wall.y &&
          //     newY - ballRadius < wall.y + wall.height
          //   ) {
          //     // // If collision detected, reset position to previous position.
          //     // newX = prevPosition.x;
          //     // newY = prevPosition.y;
          //     // break;
          //     // Calculate the distances to the wall edges.
          //     // Calculate the distances to the wall edges.
          //     const distToLeft = Math.abs(newX + ballRadius - wall.x);
          //     const distToRight = Math.abs(
          //       newX - ballRadius - (wall.x + wall.width)
          //     );
          //     const distToTop = Math.abs(newY + ballRadius - wall.y);
          //     const distToBottom = Math.abs(
          //       newY - ballRadius - (wall.y + wall.height)
          //     );

          //     // Find the minimum distance to determine the collision side.
          //     const minDist = Math.min(
          //       distToLeft,
          //       distToRight,
          //       distToTop,
          //       distToBottom
          //     );

          //     // Adjust the ball position based on the collision side.
          //     if (minDist === distToLeft) {
          //       newX = wall.x - ballRadius;
          //     } else if (minDist === distToRight) {
          //       newX = wall.x + wall.width + ballRadius;
          //     } else if (minDist === distToTop) {
          //       newY = wall.y - ballRadius;
          //     } else if (minDist === distToBottom) {
          //       newY = wall.y + wall.height + ballRadius;
          //     }
          //     collisionDetected = true;
          //     break;
          //   }
          // }

          // // If no collision, update the ball position.
          // if (!collisionDetected) {
          //   prevPosition = { x: newX, y: newY };
          // }

          // Check for horizontal collisions.
          if (isCollision(newX, prevPosition.y)) {
            // collisionDetected = true;
            // If collision detected, reset position to previous position.
            newX = prevPosition.x;
          }

          // Check for vertical collisions.
          if (isCollision(prevPosition.x, newY)) {
            // collisionDetected = true;
            // If collision detected, reset position to previous position.
            newY = prevPosition.y;
          }

          // Check for diagonal collisions by stepping through smaller increments.
          const steps = 10;

          // Calculate the change in x and y for each step.
          const deltaX = (newX - prevPosition.x) / steps;
          const deltaY = (newY - prevPosition.y) / steps;

          // Check for collisions at each intermediate step.
          for (let i = 1; i <= steps; i++) {
            // Calculate the intermediate position.
            const intermediateX = prevPosition.x + deltaX * i;
            const intermediateY = prevPosition.y + deltaY * i;

            // Check for collision at the intermediate position.
            if (isCollision(intermediateX, intermediateY)) {
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
            setGameCompleted(true); // Mark game as completed.
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

  // Effect to handle game pause and navigation to game menu screen.
  useEffect(() => {
    // console.log("isPaused state updated:", isPaused);
    // console.log("Time taken:", timeTaken, "seconds");
    // if (isPaused) {
    if (isPaused && timeTaken !== null) {
      // Check if game is paused and time taken is not null.
      // navigation.navigate("GameMenu", { timeTaken, gameCompleted });
      // Navigate to the game menu screen after 0ms.
      setTimeout(
        () => navigation.navigate("GameMenu", { timeTaken, gameCompleted }),
        0
      );
    }
  }, [isPaused, timeTaken]);

  // Function to handle game pause.
  const handlePause = () => {
    // If pause button is pressed, calculate time taken and pause the game.
    const timeElapsed = (Date.now() - startTime) / 1000; // Calculate time taken.
    setTimeTaken(timeElapsed); // Set time taken state.
    // Pause the game and navigate to the game menu screen.
    // console.log("Pause button pressed, isPaused state before set:", isPaused);
    // Pause the game.
    setIsPaused(true);
    // console.log("Pause button pressed, isPaused state after set:", isPaused);
    // console.log("Pause button pressed, isPaused state after set:", true);
  };

  // Function to handle game restart.
  const handleRestart = () => {
    // Reset the game state.
    // Comment out when random maze not used.
    // const newMaze = generateMaze();
    // const newStartPoint = getRandomPoint(newMaze);
    // const newEndPoint = getRandomPoint(newMaze);
    // const newStartPoint = getRandomPoint(); // Remove newMaze prop from getRandomPoint(). Generate new start point.
    // const newEndPoint = getRandomPoint(); // Remove newMaze prop from getRandomPoint(). Generate new end point.
    // Generate new start point.
    // let newStartPoint = getRandomPoint();

    // Generate new end point.
    // let newEndPoint = getRandomPoint();

    // Ensure there is a valid path from start to end.
    // while (!checkValidPath(newStartPoint, newEndPoint, mazeWallScale)) {
    // If there is no valid path, generate new start and end points.
    //   newStartPoint = getRandomPoint();
    //   newEndPoint = getRandomPoint();
    // }

    const minDistance = 200; // Set a minimum distance between start and end points.

    // Ensure there is a valid path from start to end and they are sufficiently far apart.
    do {
      // Generate new start and end points.
      newStartPoint = getRandomPoint(targetPointSizeReduction);
      newEndPoint = getRandomPoint(targetPointSizeReduction);
    } while (
      !checkValidPath(newStartPoint, newEndPoint, mazeWallScale) || // Check if there is a valid path from start to end.
      calculateDistance(newStartPoint, newEndPoint) < minDistance // Check if the distance between start and end points is sufficient.
    );

    // setMaze(newMaze);
    // Remove maze prop from setBallPosition, setStartPoint, and setEndPoint.
    setBallPosition(newStartPoint); // Set ball position to new start point.
    setStartPoint(newStartPoint); // Set start point to new start point.
    setEndPoint(newEndPoint); // Set end point to new end point.
    setStartTime(Date.now()); // Reset start time.
    setSpeedMultiplier(initialSpeedMultiplier); // Reset speed multiplier.
    setIsPaused(false); // Unpause the game.
    setTimeTaken(null); // Reset time taken.
    setGameCompleted(false); // Reset game completed state.
  };

  // Function to handle game unpause.
  const handleUnpause = () => {
    // console.log("Resume button pressed, isPaused state before set:", isPaused);
    // Unpause the game.
    setIsPaused(false);
    // if (!gameCompleted) {
    // Unpause the game only if not completed.
    //   setIsPaused(false);
    // }
    // console.log("Resume button pressed, isPaused state after set:", isPaused);
    // console.log("Resume button pressed, isPaused state after set:", false);
  };

  // Return the game screen with maze, ball, start point, end point, and pause button. Display time taken if available.
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
      {/* {!gameCompleted && (
        <View style={styles.pauseButtonContainer}>
          <Button title="Pause" onPress={handlePause} />
        </View>
      )} */}
      {timeTaken !== null && ( // Display time taken if available.
        // Display time taken in seconds with 2 decimal places.
        <Text style={styles.timeText}>
          Time Taken: {timeTaken.toFixed(2)} seconds
        </Text>
      )}
    </View>
  );
};

// Export the Game component.
export default Game;
