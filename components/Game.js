import React, { useEffect, useState } from "react"; // Import necessary hooks from React.
import { View, Button, Platform, Text } from "react-native"; // Import React Native components.
import { Accelerometer } from "expo-sensors"; // Import Accelerometer from expo-sensors to handle accelerometer data.
import Svg, { Circle, Rect } from "react-native-svg"; // Import Svg and its sub-components for drawing shapes.

// Game component where the main game logic resides.
const Game = ({ navigation, route }) => {
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
  useEffect(() => {
    if (route.params?.restart) {
      handleRestart();
      navigation.setParams({ restart: false });
    }
  }, [route.params?.restart]);

  // Effect to set the ball position to start point when the game starts.
  useEffect(() => {
    setBallPosition(startPoint);
  }, [startPoint]);

  // Effect to handle accelerometer data and game logic.
  useEffect(() => {
    Accelerometer.setUpdateInterval(16); // Set accelerometer update interval to 16ms.

    const updateSpeedMultiplier = () => {
      const duration = (Date.now() - startTime) / 1000; // Calculate elapsed time in seconds.
      setSpeedMultiplier(initialSpeedMultiplier + duration * 5); // Increase speed multiplier over time.
    };

    const intervalId = setInterval(updateSpeedMultiplier, 100); // Update speed multiplier every 100ms to increase the acceleration rate.

    // Subscribe to accelerometer data
    const subscription = Accelerometer.addListener((accelerometerData) => {
      if (!isPaused) {
        const { x, y } = accelerometerData; // Get x and y data from accelerometer.
        setBallPosition((prevPosition) => {
          // Added adjusted variable to correct android accelerometer work in opposite direction. Adjust x and y based on platform (iOS or Android).
          const adjustedX = Platform.OS === "ios" ? x : -x;
          const adjustedY = Platform.OS === "ios" ? y : -y;

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
            if (
              newX + ballRadius > wall.x &&
              newX - ballRadius < wall.x + wall.width &&
              newY + ballRadius > wall.y &&
              newY - ballRadius < wall.y + wall.height
            ) {
              newX = prevPosition.x; // If collision detected, reset position to previous position.
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
            setIsPaused(true); // Pause the game.
            const timeElapsed = (Date.now() - startTime) / 1000; // Calculate time taken.
            setTimeTaken(timeElapsed); // Set time taken state.
            setTimeout(
              () => navigation.navigate("GameMenu", { timeTaken: timeElapsed }),
              0
            );
          }

          return { x: newX, y: newY }; // Update ball position state.
        });
      }
    });

    // Clean up subscription and interval on component unmount.
    return () => {
      subscription.remove();
      clearInterval(intervalId);
    };
    //   }, [isPaused, speedMultiplier, maze]); // Remove maze.
  }, [isPaused, speedMultiplier]); // Remove maze.

  // Function to handle game pause.
  const handlePause = () => {
    setIsPaused(true);
    setTimeout(() => navigation.navigate("GameMenu", { timeTaken }), 0);
  };

  // Function to handle game restart.
  const handleRestart = () => {
    // Comment out when random maze not used.
    // const newMaze = generateMaze();
    // const newStartPoint = getRandomPoint(newMaze);
    // const newEndPoint = getRandomPoint(newMaze);
    const newStartPoint = getRandomPoint(); // Remove newMaze prop from getRandomPoint(). Generate new start point.
    const newEndPoint = getRandomPoint(); // Remove newMaze prop from getRandomPoint(). Generate new end point.

    // setMaze(newMaze);
    setBallPosition(newStartPoint); // Set ball position to new start point.
    setStartPoint(newStartPoint);
    setEndPoint(newEndPoint);
    setStartTime(Date.now()); // Reset start time.
    setSpeedMultiplier(initialSpeedMultiplier); // Reset speed multiplier.
    setIsPaused(false); // Unpause the game.
    setTimeTaken(null); // Reset time taken.
  };

  return (
    <View style={container}>
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
        <Text style={timeText}>Time Taken: {timeTaken.toFixed(2)} seconds</Text>
      )}
    </View>
  );
};

export default Game;
