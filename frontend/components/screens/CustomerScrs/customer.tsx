import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "../../styles";

export default function Customer() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.profile}>
          <Text>حسابي</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.profile}>
          <Text>الاشعارات</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.profile}>
          <Text>الحجوزات</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
