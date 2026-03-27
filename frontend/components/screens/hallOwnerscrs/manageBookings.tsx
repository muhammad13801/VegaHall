import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BackgroundDecoration from "../../reusable func/backgroundDecoration";
import { styles } from "../../styles";

export default function ManageBookings() {
  return (
    <SafeAreaView style={styles.container}>
      <BackgroundDecoration />
      <Text>Managing page!</Text>
    </SafeAreaView>
  );
}
