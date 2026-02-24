import Login from "./components/screens/login";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ForgotPassword from "./components/screens/forgotPasswordScrs/forgotPassword";
import SignUp from "./components/screens/signUpScrs/signUp";
import PasswordCode from "./components/screens/forgotPasswordScrs/passwordCode";
import SetNewPassword from "./components/screens/forgotPasswordScrs/setNewPassword";
import HallOwner from "./components/screens/hallOwnerscrs/hallOwner";
import EmailCode from "./components/screens/signUpScrs/emailCode";
import Customer from "./components/screens/CustomerScrs/customer";
import Admin from "./components/screens/AdminScrs/admin";
import { navigationRef } from "./components/reusable func/navigateTo";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        <Stack.Screen name="SignUp" component={SignUp} />
        <Stack.Screen name="PasswordCode" component={PasswordCode} />
        <Stack.Screen name="SetNewPassword" component={SetNewPassword} />
        <Stack.Screen name="HallOwner" component={HallOwner} />
        <Stack.Screen name="EmailCode" component={EmailCode} />
        <Stack.Screen name="Customer" component={Customer} />
        <Stack.Screen name="Admin" component={Admin} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
