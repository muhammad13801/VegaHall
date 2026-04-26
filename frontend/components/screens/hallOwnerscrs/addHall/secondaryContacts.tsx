import React, { useCallback, memo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Input } from "../../../reusable func/input";
import { styles } from "../../../styles";
import { HallFormProps } from "../../../Validations/validateHall";
import MaskInput from "react-native-mask-input";
import { phoneMask } from "../../signUpScrs/signUp";

const ContactCard = memo(
  ({
    contact,
    index,
    errors,
    onRemove,
    onUpdate,
  }: {
    contact: { firstName: string; lastName: string; phone: string };
    index: number;
    errors: any;
    onRemove: (i: number) => void;
    onUpdate: (i: number, field: string, value: string) => void;
  }) => (
    <View style={styles.secondaryContactCard}>
      <View style={styles.info}>
        <Text style={{ fontWeight: "bold", color: "#6C4AB6" }}>
          جهة اتصال {index + 1}
        </Text>
        <TouchableOpacity onPress={() => onRemove(index)}>
          <Ionicons name="remove-circle" size={20} color="#FF5A5A" />
        </TouchableOpacity>
      </View>

      <View style={[styles.row, { gap: 10 }]}>
        <View style={{ flex: 1 }}>
          <Input
            placeholder="الاسم الأول"
            value={contact.firstName}
            onChangeText={(text) => onUpdate(index, "firstName", text)}
          />
          {errors[`contactFirstName_${index}`] && (
            <Text style={styles.errorText}>
              {errors[`contactFirstName_${index}`]}
            </Text>
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Input
            placeholder="اسم العائلة"
            value={contact.lastName}
            onChangeText={(text) => onUpdate(index, "lastName", text)}
          />
          {errors[`contactLastName_${index}`] && (
            <Text style={styles.errorText}>
              {errors[`contactLastName_${index}`]}
            </Text>
          )}
        </View>
      </View>

      <MaskInput
        value={contact.phone}
        onChangeText={(unmasked) => {
          onUpdate(index, "phone", unmasked);
        }}
        mask={phoneMask}
        keyboardType="phone-pad"
        placeholderTextColor="#999"
        style={[styles.input, { textAlign: "center", direction: "ltr" }]}
      />
      {errors[`contactPhone_${index}`] && (
        <Text style={styles.errorText}>{errors[`contactPhone_${index}`]}</Text>
      )}
    </View>
  ),
);

export default function SecondaryContacts({
  form,
  setForm,
  errors,
}: HallFormProps) {
  const addContact = useCallback(() => {
    if ((form.secondaryContacts?.length || 0) >= 3) return;
    setForm((prev) => ({
      ...prev,
      secondaryContacts: [
        ...(prev.secondaryContacts || []),
        { firstName: "", lastName: "", phone: "" },
      ],
    }));
  }, [form.secondaryContacts?.length, setForm]);

  const removeContact = useCallback(
    (index: number) => {
      setForm((prev) => ({
        ...prev,
        secondaryContacts: prev.secondaryContacts?.filter(
          (_, i) => i !== index,
        ),
      }));
    },
    [setForm],
  );

  const updateContact = useCallback(
    (index: number, field: string, value: string) => {
      setForm((prev) => ({
        ...prev,
        secondaryContacts: prev.secondaryContacts?.map((c, i) =>
          i === index ? { ...c, [field]: value } : c,
        ),
      }));
    },
    [setForm],
  );

  return (
    <View style={styles.secondarySection}>
      <View style={styles.info}>
        <View style={[styles.row, { alignItems: "center" }]}>
          <Ionicons
            name="call-outline"
            size={18}
            color={"#6C4AB6"}
            style={styles.screenIcon}
          />
          <Text style={styles.label}>أشخاص آخرين للتواصل</Text>
        </View>
      </View>

      <View style={styles.mediaPreviewContainer}>
        {form.secondaryContacts?.map((contact, index) => (
          <ContactCard
            key={index}
            contact={contact}
            index={index}
            errors={errors}
            onRemove={removeContact}
            onUpdate={updateContact}
          />
        ))}

        {(form.secondaryContacts?.length || 0) < 3 && (
          <TouchableOpacity
            onPress={addContact}
            style={[styles.secondaryActionButton, { marginTop: 0 }]}
          >
            <View style={styles.row}>
              <Ionicons name="add-circle" size={20} color="#6C4AB6" />
              <Text
                style={{
                  color: "#6C4AB6",
                  fontWeight: "bold",
                  marginRight: 5,
                }}
              >
                إضافة شخص آخر
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
