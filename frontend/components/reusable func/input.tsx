import React, { useState, useMemo } from "react";
import { TextInput, TextInputProps, StyleProp, TextStyle } from "react-native";
import { styles } from "../styles";

interface InputProps extends TextInputProps {
  style?: StyleProp<TextStyle>;
}

const InputComponent = ({ style, ...props }: InputProps) => {
  const [focused, setFocused] = useState(false);

  const inputStyle = useMemo(
    () => [styles.input, style, { borderColor: focused ? "#6C4AB6" : "#DDD" }],
    [focused, style],
  );

  return (
    <TextInput
      {...props}
      style={inputStyle}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      placeholderTextColor="#898989"
      returnKeyType="next"
    />
  );
};

export const Input = React.memo(InputComponent);
