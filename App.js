import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { Dimensions } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const { width, height } = Dimensions.get('window');
const ballRadius = 20;

export default function App() {
  const [ballPosition, setBallPosition] = useState({
    x: width / 2,
    y: height / 2,
  });

  useEffect(() => {
    Accelerometer.setUpdateInterval(100);

    const subscription = Accelerometer.addListener((accelerometerData) => {
      const { x, y } = accelerometerData;
      setBallPosition((prevPosition) => {
        let newX = prevPosition.x + x * 10;
        let newY = prevPosition.y - y * 10;

        // Prevent the ball from going off the canvas
        if (newX + ballRadius > width) newX = width - ballRadius;
        if (newX - ballRadius < 0) newX = ballRadius;
        if (newY + ballRadius > height) newY = height - ballRadius;
        if (newY - ballRadius < 0) newY = ballRadius;

        return { x: newX, y: newY };
      });
    });

    return () => subscription.remove();
  }, []);

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
