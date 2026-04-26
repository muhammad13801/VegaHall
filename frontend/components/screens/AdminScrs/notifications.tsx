import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "../../styles";
import BackgroundDecoration from "../../reusable func/backgroundDecoration";

export default function Notifications() {
    return (
        <SafeAreaView style={styles.container}>
            <BackgroundDecoration />
            <Text>Notifications page!</Text>
        </SafeAreaView>
    );
}
