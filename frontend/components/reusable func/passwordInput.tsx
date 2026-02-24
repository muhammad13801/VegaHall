import { Text, TouchableOpacity, View } from "react-native";
import { useState } from "react";
import { Input } from "./input";
import { styles } from "../styles";

type Props = {
  password: string;
  setPassword: (value: string) => void;
};

export default function PasswordInput({ password, setPassword }: Props) {
  const [showPassword, setShowPassword] = useState<boolean>(true);

  return (
    <View style={styles.passwordContainer}>
      <Input
        placeholder="كلمة المرور"
        placeholderTextColor={"#898989"}
        value={password}
        onChangeText={setPassword}
        secureTextEntry={showPassword}
        textAlign="right"
      />
      <TouchableOpacity
        style={styles.showPasswordButton}
        onPress={() => setShowPassword(!showPassword)}
      >
        <Text>{showPassword ? "Show" : "Hide"}</Text>
      </TouchableOpacity>
    </View>
  );
}
