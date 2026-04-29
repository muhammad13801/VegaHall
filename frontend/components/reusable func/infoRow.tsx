import { Ionicons } from "@expo/vector-icons";
import {
  Text,
  View,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import { styles } from "../styles";

interface InfoRowProps {
  icon?: string;
  label?: string;
  value?: React.ReactNode;
  onPress?: () => void;
  rightIcon?: string;
  iconColor?: string;
  iconSize?: number;
  iconBackgroundColor?: string;
  containerStyle?: StyleProp<ViewStyle>;
  valueStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  hideBorder?: boolean;
}

export const InfoRow = ({
  icon,
  label,
  value,
  onPress,
  rightIcon,
  iconColor = "#6C4AB6",
  iconSize = 20,
  iconBackgroundColor = "#F3EAFF",
  containerStyle,
  valueStyle,
  labelStyle,
  hideBorder = true,
}: InfoRowProps) => {
  const content = (
    <View
      style={[
        styles.profileInfoRow,
        {
          paddingVertical: 10,
          borderBottomWidth: hideBorder ? 0 : 1,
          borderColor: "#eee",
        },
        containerStyle,
      ]}
    >
      {icon && (
        <View
          style={[
            styles.profileInfoIcon,
            {
              width: iconSize * 2,
              height: iconSize * 2,
              borderRadius: iconSize,
              backgroundColor: iconBackgroundColor,
              marginRight: 12,
              alignItems: "center",
              justifyContent: "center",
            },
          ]}
        >
          <Ionicons name={icon as any} size={iconSize} color={iconColor} />
        </View>
      )}
      <View style={styles.profileTextContainer}>
        {label && (
          <Text style={[styles.profileLabel, labelStyle]}>{label}</Text>
        )}
        {value && typeof value === "string" ? (
          <Text style={[styles.profileValue, valueStyle]}>{value}</Text>
        ) : (
          value
        )}
      </View>
      {rightIcon && (
        <Ionicons name={rightIcon as any} size={iconSize} color="#CCC" />
      )}
    </View>
  );

  if (onPress) {
    return <TouchableOpacity onPress={onPress}>{content}</TouchableOpacity>;
  }

  return content;
};
