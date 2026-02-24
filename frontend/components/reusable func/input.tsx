import { useState } from "react";
import { TextInput, TextInputProps } from "react-native";
import { styles } from "../styles";

export const Input = (props: TextInputProps) => {
  const [focused, setFocused] = useState<boolean>(false);
  return (
    <TextInput
      {...props}
      style={[
        styles.input,
        props.style,
        { borderColor: focused ? "#6C4AB6" : "#DDD" },
      ]}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      placeholderTextColor={"#898989"}
      returnKeyType="next"
    />
  );
};
