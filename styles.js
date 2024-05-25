// Styles for the components.
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  },
  announcementMessage: {
    fontSize: 24,
    marginBottom: 20,
  },
});

export default styles;
