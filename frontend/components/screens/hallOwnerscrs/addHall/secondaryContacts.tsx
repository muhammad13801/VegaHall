import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TextInputMask } from "react-native-masked-text";
import { Input } from "../../../reusable func/input";
import { styles } from "../../../styles";
import { HallFormProps } from "./constants";

export default function SecondaryContacts({
  form,
  setForm,
  errors,
}: HallFormProps) {
  const [hasSecondaryContacts, setHasSecondaryContacts] = useState(false);

  const addContact = () => {
    if ((form.secondaryContacts?.length || 0) >= 3) return;
    setForm((prev) => ({
      ...prev,
      secondaryContacts: [
        ...(prev.secondaryContacts || []),
        { firstName: "", lastName: "", phone: "" },
      ],
    }));
  };

  const removeContact = (index: number) => {
    setForm((prev) => ({
      ...prev,
      secondaryContacts: prev.secondaryContacts?.filter((_, i) => i !== index),
    }));
  };

  const updateContact = (index: number, field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      secondaryContacts: prev.secondaryContacts?.map((c, i) =>
        i === index ? { ...c, [field]: value } : c,
      ),
    }));
  };

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
          <Text style={styles.label}>إضافة أشخاص آخرين للتواصل؟</Text>
        </View>
        <View style={[styles.row, { gap: 5 }]}>
          <TouchableOpacity
            onPress={() => {
              setHasSecondaryContacts(true);
              if (form.secondaryContacts?.length === 0) addContact();
            }}
            style={[
              styles.toggleButton,
              {
                backgroundColor: hasSecondaryContacts ? "#6C4AB6" : "#EEE",
              },
            ]}
          >
            <Text
              style={{
                color: hasSecondaryContacts ? "#FFF" : "#666",
                fontSize: 13,
              }}
            >
              نعم
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setHasSecondaryContacts(false);
              setForm((prev) => ({ ...prev, secondaryContacts: [] }));
            }}
            style={[
              styles.toggleButton,
              {
                backgroundColor: !hasSecondaryContacts ? "#6C4AB6" : "#EEE",
              },
            ]}
          >
            <Text
              style={{
                color: !hasSecondaryContacts ? "#FFF" : "#666",
                fontSize: 13,
              }}
            >
              لا
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {hasSecondaryContacts && (
        <View style={styles.mediaPreviewContainer}>
          {form.secondaryContacts?.map((contact, index) => (
            <View key={index} style={styles.secondaryContactCard}>
              <View style={styles.info}>
                <Text style={{ fontWeight: "bold", color: "#6C4AB6" }}>
                  جهة اتصال {index + 1}
                </Text>
                {index > 0 && (
                  <TouchableOpacity onPress={() => removeContact(index)}>
                    <Ionicons name="remove-circle" size={20} color="#FF5A5A" />
                  </TouchableOpacity>
                )}
              </View>

              <View style={[styles.row, { gap: 10 }]}>
                <View style={{ flex: 1 }}>
                  <Input
                    placeholder="الاسم الأول"
                    value={contact.firstName}
                    onChangeText={(text) =>
                      updateContact(index, "firstName", text)
                    }
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
                    onChangeText={(text) =>
                      updateContact(index, "lastName", text)
                    }
                  />
                  {errors[`contactLastName_${index}`] && (
                    <Text style={styles.errorText}>
                      {errors[`contactLastName_${index}`]}
                    </Text>
                  )}
                </View>
              </View>

              <TextInputMask
                type={"custom"}
                options={{
                  mask: "+97C-5DD-DDD-DDD",
                  translation: {
                    "9": (val: string) => (val === "9" ? val : "9"),
                    "7": (val: string) => (val === "7" ? val : "7"),
                    C: (val: string) => (/[02]/.test(val) ? val : null),
                    D: (val: string) => (/[0-9]/.test(val) ? val : null),
                  },
                }}
                value={contact.phone}
                onChangeText={(text) => updateContact(index, "phone", text)}
                keyboardType="numeric"
                placeholder="+97X-XXX-XXX-XXX"
                style={[styles.input, { direction: "ltr" }]}
              />
              {errors[`contactPhone_${index}`] && (
                <Text style={styles.errorText}>
                  {errors[`contactPhone_${index}`]}
                </Text>
              )}
            </View>
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
      )}
    </View>
  );
}
