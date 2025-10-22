import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import SplashScreen from "./screens/SplashScreen";
import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import TaskDetail from "./screens/TaskDetail";
import UserInfoScreen from "./screens/UserInfoScreen"; // Yeni sayfa
import ChangePasswordScreen from "./screens/ChangePasswordScreen"; // Şifre değiştirme sayfası
import MyTasksScreen from "./screens/MyTasksScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} /> 
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="TaskDetail" component={TaskDetail} />
        <Stack.Screen name="UserInfo" component={UserInfoScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
        <Stack.Screen name="MyTasks" component={MyTasksScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
