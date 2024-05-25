import React, { useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { Video } from "expo-av";

// const BackgroundVideo = () => {
//     return (
//       <View style={styles.container}>
//         <Video
//           source={require('../assets/your-video-file.mp4')}
//           rate={1.0}
//           volume={1.0}
//           isMuted={true}
//           resizeMode="cover"
//           shouldPlay
//           isLooping
//           style={styles.video}
//         />
//       </View>
//     );
//   };

const Background = () => {
  const [backgroundType, setBackgroundType] = useState(null);

  useEffect(() => {
    const checkFiles = async () => {
      try {
        require("../assets/WelcomeBackgroundAnimation.mp4");
        setBackgroundType("video");
      } catch (error) {
        try {
          require("../assets/WelcomeBackground.jpg");
          setBackgroundType("image");
        } catch (error) {
          setBackgroundType("none");
        }
      }
    };

    checkFiles();
  }, []);

  if (backgroundType === "video") {
    return (
      <View style={styles.container}>
        <Video
          source={require("../assets/WelcomeBackgroundAnimation.mp4")}
          rate={1.0}
          volume={1.0}
          isMuted={true}
          resizeMode="cover"
          shouldPlay
          isLooping
          style={styles.background}
        />
      </View>
    );
  } else if (backgroundType === "image") {
    return (
      <View style={styles.container}>
        <Image
          source={require("../assets/WelcomeBackground.jpg")}
          style={styles.background}
        />
      </View>
    );
  } else {
    return null; // Or return a default background if needed.
  }
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  background: {
    width: "100%",
    height: "100%",
  },
});

export default Background;
