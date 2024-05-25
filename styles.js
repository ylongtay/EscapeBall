// Styles for the components.
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  announcementMessage: {
    fontSize: 24,
    marginBottom: 20,
  },
  container: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent overlay.
  },
  pauseButtonContainer: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  timeText: {
    fontSize: 18,
    marginTop: 20,
    color: "red",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    // fontSize: 32,
    // color: "white",
    // marginBottom: 20,
  },
});

export default styles;
