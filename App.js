// import { StyleSheet } from "react-native"; // Import React Native components.
import { NavigationContainer } from "@react-navigation/native"; // Import navigation container.
import { createStackNavigator } from "@react-navigation/stack"; // Import stack navigator for screen navigation.
import Game from "./components/Game";
import GameMenu from "./components/GameMenu";
import WelcomeScreen from "./components/WelcomeScreen";

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
