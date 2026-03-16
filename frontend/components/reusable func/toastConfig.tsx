import { Text } from "react-native";
import { ToastConfig, ToastConfigParams } from "react-native-toast-message";
import { styles } from "../styles";
import { SafeAreaView } from "react-native-safe-area-context";

const baseToast = ({ text1 }: ToastConfigParams<any>, color: string) => {
  return (
    <SafeAreaView
      style={[styles.toast, { borderLeftColor: color, direction: "rtl" }]}
    >
      <Text style={styles.toastText1}>{text1}</Text>
    </SafeAreaView>
  );
};

export const toastConfig: ToastConfig = {
  success: (props: ToastConfigParams<any>) => baseToast(props, "#4CAF50"),
  error: (props: ToastConfigParams<any>) => baseToast(props, "#F44336"),
  info: (props: ToastConfigParams<any>) => baseToast(props, "#2196F3"),
  warning: (props: ToastConfigParams<any>) => baseToast(props, "#FF9800"),
};
