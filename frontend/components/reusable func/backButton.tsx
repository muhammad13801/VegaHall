import { TouchableOpacity, Text } from "react-native";
import { styles } from "../styles";
import { goBack } from "./navigateTo";

export default function BackButton() {
  return (
    <TouchableOpacity style={styles.backButton} onPress={() => goBack()}>
      <Text style={styles.backButtonText}>رجوع ⇐ </Text>
    </TouchableOpacity>
  );
}
