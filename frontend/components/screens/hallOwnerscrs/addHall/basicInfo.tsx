import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Input } from "../../../reusable func/input";
import { styles } from "../../../styles";
import { useHandleChange } from "../../../reusable func/useHandleChange";
import { HallFormProps } from "../../../Validations/validateHall";
import { Err } from "../../../reusable func/Err";

export default function BasicInfo({ form, setForm, errors }: HallFormProps) {
  const change = useHandleChange(setForm);

  return (
    <View>
      <View style={styles.row}>
        <Ionicons
          name="text-outline"
          size={18}
          color={"#6C4AB6"}
          style={styles.screenIcon}
        />
        <Text style={styles.label}>اسم الصالة</Text>
      </View>
      <Input
        placeholder="مثال: صالة الاحلام"
        value={form.name}
        onChangeText={(text) => change("name", text)}
      />
      <Err error={errors.name} />

      {/* capacity and price */}
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <View style={styles.row}>
            <Ionicons
              name="people-outline"
              size={18}
              color={"#6C4AB6"}
              style={styles.screenIcon}
            />
            <Text style={styles.label}>السعة</Text>
          </View>
          <Input
            placeholder="مثال: 300"
            value={form.capacity.toString()}
            onChangeText={(text) => change("capacity", text)}
            keyboardType="numeric"
          />
          <Err error={errors.capacity} />
        </View>

        <View style={styles.gapBetween} />

        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row" }}>
            <Ionicons
              name="cash-outline"
              size={18}
              color={"#6C4AB6"}
              style={styles.screenIcon}
            />
            <Text style={styles.label}>سعر الصالة</Text>
          </View>
          <Input
            placeholder="مثال: 1000"
            value={form.price.toString()}
            onChangeText={(text) => change("price", text)}
            keyboardType="numeric"
          />
          <Err error={errors.price} />
        </View>
      </View>

      {/* Hall Description */}
      <View style={styles.row}>
        <Ionicons
          name="document-text-outline"
          size={18}
          color={"#6C4AB6"}
          style={styles.screenIcon}
        />
        <Text style={styles.label}>وصف الصالة</Text>
      </View>
      <Input
        placeholder="اكتب وصفاً مفصلاً لصالتك (الخدمات، السعة، المميزات...)"
        value={form.description}
        onChangeText={(text) => change("description", text)}
        multiline
        style={styles.multilineInput}
      />
      <Err error={errors.description} />
    </View>
  );
}
