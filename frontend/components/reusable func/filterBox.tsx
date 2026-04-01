import { Text, TouchableOpacity, View } from "react-native";
import { styles as s } from "../screens/CustomerScrs/ibrahimStyles";

interface FilterBoxProps {
  title: string;
  value: string;
  isOpen?: boolean;
  onPress: () => void;
  icon?: string;
  isCustomerPage?: boolean;
}

export const FilterBox = ({ title, value, isOpen, onPress, icon }: FilterBoxProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        s.filterSummaryChip,
        isOpen && { backgroundColor: "#6C4AB6", borderColor: "#6C4AB6" }
      ]}
    >
      <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 10}}>
        <Text style={[
          s.filterSummaryText,
          isOpen && { color: "#FFF" }
        ]}>
          {title}
        </Text>
        <Text style={[
          s.filterSummaryText,
          isOpen && { color: "#FFF" }
        ]}>
          {icon ? icon : (isOpen ? "˄" : "˅")}
        </Text>
      </View>

      {value !== "الكل" && (
        <Text numberOfLines={1} style={[
          s.filterSummaryText,
          { fontSize: 11, opacity: 0.8 },
          isOpen && { color: "#E2D9F3" }
        ]}>
          : {value}
        </Text>
      )}
    </TouchableOpacity>
  );
};
