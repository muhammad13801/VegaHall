import React, { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Input } from "./input";
import { styles } from "../styles";

type Props = {
  password: string;
  setPassword: (value: string) => void;
  placeholder?: string;
};

const PasswordInput = React.memo(
  ({ password, setPassword, placeholder = "كلمة المرور" }: Props) => {
    const [showPassword, setShowPassword] = useState<boolean>(true);

    return (
      <View style={styles.passwordContainer}>
        <Input
          placeholder={placeholder}
          placeholderTextColor={"#898989"}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={showPassword}
          textAlign="right"
          maxLength={30}
        />
        <TouchableOpacity
          style={styles.showPasswordButton}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={22}
            color="#6C4AB6"
          />
        </TouchableOpacity>
      </View>
    );
  },
);

export default PasswordInput;
