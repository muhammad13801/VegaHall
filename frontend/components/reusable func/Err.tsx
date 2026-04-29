import React from "react";
import { Text, TextStyle, StyleProp } from "react-native";
import { styles } from "../styles";

interface ErrProps {
  error?: string;
  style?: StyleProp<TextStyle>;
}
export const Err = ({ error, style }: ErrProps) => {
  if (!error) return null;
  return <Text style={[styles.errorText, style]}>{error}</Text>;
};
