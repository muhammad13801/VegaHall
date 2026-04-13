import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../styles";
import { goBack } from "./navigateTo";

export default function BackButton() {
  return (
    <TouchableOpacity style={styles.backButton} onPress={() => goBack()}>
      <Ionicons name="arrow-forward" size={28} color="#6C4AB6" />
    </TouchableOpacity>
  );
}
