import React, { memo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Input } from "../../../reusable func/input";
import { styles } from "../../../styles";
import { HallFormProps } from "../../../Validations/validateHall";
import MaskInput from "react-native-mask-input";
import { Err } from "../../../reusable func/Err";
import { phoneMask } from "../../userScrs/signUpScrs/signUp";

const ContactCard = memo(
  ({ contact, index, errors, onRemove, onUpdate }: any) => {
    return (
      <View style={styles.secondaryContactCard}>
        <View style={[styles.info, { marginBottom: 10 }]}>
          <Text style={{ fontWeight: "bold", color: "#6C4AB6" }}>
            جهة اتصال {index + 1}
          </Text>
          <TouchableOpacity onPress={() => onRemove(index)}>
            <Ionicons name="remove-circle" size={22} color="#FF5A5A" />
          </TouchableOpacity>
        </View>

        <View style={[styles.row, { gap: 10 }]}>
          <View style={{ flex: 1 }}>
            <Input
              placeholder="الاسم الأول"
              value={contact.firstName}
              onChangeText={(t) => onUpdate(index, "firstName", t)}
            />
            <Err error={errors[`contactFirstName_${index}`]} />
          </View>
          <View style={{ flex: 1 }}>
            <Input
              placeholder="اسم العائلة"
              value={contact.lastName}
              onChangeText={(t) => onUpdate(index, "lastName", t)}
            />
            <Err error={errors[`contactLastName_${index}`]} />
          </View>
        </View>

        <MaskInput
          value={contact.phone}
          onChangeText={(t) => onUpdate(index, "phone", t)}
          mask={phoneMask}
          keyboardType="phone-pad"
          placeholder="+97ْX-5XX-XXX-XXX"
          placeholderTextColor="#999"
          style={[styles.input, { textAlign: "center", direction: "ltr" }]}
        />
        <Err error={errors[`contactPhone_${index}`]} />
      </View>
    );
  },
);

export default function SecondaryContacts({
  form,
  setForm,
  errors,
}: HallFormProps) {
  const contacts = form.secondaryContacts || [];

  const update = (newContacts: any[]) =>
    setForm((p) => ({ ...p, secondaryContacts: newContacts }));
  const add = () =>
    contacts.length < 3 &&
    update([...contacts, { firstName: "", lastName: "", phone: "" }]);
  const remove = (i: number) => update(contacts.filter((_, idx) => idx !== i));
  const change = (i: number, f: string, v: string) =>
    update(contacts.map((c, idx) => (idx === i ? { ...c, [f]: v } : c)));

  return (
    <View style={styles.secondarySection}>
      <View style={[styles.row, { alignItems: "center", marginBottom: 10 }]}>
        <Ionicons
          name="call-outline"
          size={18}
          color="#6C4AB6"
          style={styles.screenIcon}
        />
        <Text style={styles.label}>
          اضافة أشخاص آخرين للتواصل
          <Text style={{ color: "#777", fontSize: 13 }}> (اختياري)</Text>
        </Text>
      </View>

      {contacts.map((c, i) => (
        <ContactCard
          key={i}
          contact={c}
          index={i}
          errors={errors}
          onRemove={remove}
          onUpdate={change}
        />
      ))}

      {contacts.length < 3 && (
        <TouchableOpacity
          onPress={add}
          style={[styles.secondaryActionButton, { marginTop: 0 }]}
        >
          <View style={[styles.row, { alignItems: "center", gap: 5 }]}>
            <Ionicons name="add-circle" size={20} color="#6C4AB6" />
            <Text style={{ color: "#6C4AB6", fontWeight: "bold" }}>
              {"إضافة شخص آخر "}
            </Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}
