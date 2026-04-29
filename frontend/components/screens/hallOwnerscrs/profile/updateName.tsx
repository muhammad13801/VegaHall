import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "../../../styles";
import BackButton from "../../../reusable func/backButton";
import KeyboardAwareScreen from "../../../reusable func/keyboardAwarScreen";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Input } from "../../../reusable func/input";
import { useRoute } from "@react-navigation/native";
import { useState } from "react";
import Toast from "react-native-toast-message";
import { NavigateAndReset } from "../../../reusable func/navigateTo";
import { UserData, validateName } from "../../../Validations/validateUser";
import { useHandleChange } from "../../../reusable func/useHandleChange";
import BackgroundDecoration from "../../../reusable func/backgroundDecoration";
import { updateNameApi } from "../../../Services/userApi";
import { Err } from "../../../reusable func/Err";
import { Ionicons } from "@expo/vector-icons";

export default function UpdateName() {
  const route = useRoute<any>();
  const { first_name, last_name } = route.params;
  const [form, setForm] = useState<Partial<UserData>>({
    firstName: first_name,
    lastName: last_name,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const change = useHandleChange(setForm);
  const [loading, setLoading] = useState(false);

  const handleUpdateName = async () => {
    const validationErrors = validateName(form);
    if (Object.keys(validationErrors).length > 0)
      return setErrors(validationErrors);

    try {
      setLoading(true);
      const response = await updateNameApi({
        first_name: form.firstName,
        last_name: form.lastName,
      });
      Toast.show({
        type: "success",
        text1: response?.data,
      });
      NavigateAndReset("HallOwner", {
        screen: "Profile",
        params: { refresh: true },
      });
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: err.response?.data || "حدث خطأ غير متوقع",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackgroundDecoration />

      <BackButton />

      <KeyboardAwareScreen>
        <Ionicons
          name="person-outline"
          size={40}
          style={styles.screenIcon}
        ></Ionicons>
        <Text style={styles.title}>تعديل الاسم</Text>
        <View style={styles.card}>
          <Input
            style={styles.input}
            placeholder="الاسم الأول"
            value={form.firstName}
            onChangeText={(val) => change("firstName", val)}
          />
          <Err error={errors.firstName} />

          <Text style={styles.label}>اسم العائلة</Text>
          <Input
            style={styles.input}
            placeholder="اسم العائلة"
            value={form.lastName}
            onChangeText={(val) => change("lastName", val)}
          />
          <Err error={errors.lastName} />

          <View style={{ height: 20 }} />

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleUpdateName}
            disabled={loading}
            activeOpacity={0.7}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.actionButtonText}>حفظ التغييرات</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAwareScreen>
    </SafeAreaView>
  );
}
