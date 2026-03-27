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
import PaymentHall from "./components/screens/hallOwnerscrs/paymentHall";
import { navigationRef } from "./components/reusable func/navigateTo";
import { toastConfig } from "./components/reusable func/toastConfig";
import Toast from "react-native-toast-message";
import UpdatePassword from "./components/screens/hallOwnerscrs/profile/updatePass";
import UpdateName from "./components/screens/hallOwnerscrs/profile/updateName";
import UpdatePhone from "./components/screens/hallOwnerscrs/profile/updatePhone";
import UpdateEmail from "./components/screens/hallOwnerscrs/profile/updateEmail";
import AddHall from "./components/screens/hallOwnerscrs/addHall/addHall";
import { StripeProvider } from "@stripe/stripe-react-native";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <StripeProvider publishableKey={process.env.STRIPE_PUBLISHABLE_KEY!}>
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
          <Stack.Screen name="AddHall" component={AddHall} />
          <Stack.Screen name="PaymentHall" component={PaymentHall} />
          <Stack.Screen name="UpdatePassword" component={UpdatePassword} />
          <Stack.Screen name="UpdateName" component={UpdateName} />
          <Stack.Screen name="UpdateEmail" component={UpdateEmail} />
          <Stack.Screen name="UpdatePhone" component={UpdatePhone} />
        </Stack.Navigator>
        <Toast config={toastConfig} topOffset={60} />
      </NavigationContainer>
    </StripeProvider>
  );
}
