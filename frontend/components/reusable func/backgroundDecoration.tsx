import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "../styles";

export default function BackgroundDecoration() {
  return (
    <LinearGradient
      colors={["#E8DFF5", "#F0ECF5", "#F5F3FA"]}
      locations={[0, 0.6, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.gradient}
    />
  );
}
