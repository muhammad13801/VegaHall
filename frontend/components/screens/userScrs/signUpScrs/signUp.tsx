import React, { useState } from "react";
import { Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DropDownPicker from "react-native-dropdown-picker";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import MaskInput, { Mask } from "react-native-mask-input";
import Toast from "react-native-toast-message";
import BackButton from "../../../reusable func/backButton";
import BackgroundDecoration from "../../../reusable func/backgroundDecoration";
import { Err } from "../../../reusable func/Err";
import { Input } from "../../../reusable func/input";
import KeyboardAwareScreen from "../../../reusable func/keyboardAwarScreen";
import { NavigateTo } from "../../../reusable func/navigateTo";
import PasswordInput from "../../../reusable func/passwordInput";
import { useHandleChange } from "../../../reusable func/useHandleChange";
import { registerUser } from "../../../Services/authApi";
import { styles } from "../../../styles";
import { UserData, validateUser } from "../../../Validations/validateUser";

export const phoneMask: Mask = [
  "+",
  "9",
  "7",
  /\d/,
  "-",
  "5",
  /\d/,
  /\d/,
  "-",
  /\d/,
  /\d/,
  /\d/,
  "-",
  /\d/,
  /\d/,
  /\d/,
];

export default function SignUp() {
  const [form, setForm] = useState<UserData>({
    firstName: "",
    lastName: "",
    gender: "",
    userType: "",
    date: new Date(2000, 0, 1),
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Dropdown states
  const [genderOpen, setGenderOpen] = useState(false);
  const [genders, setGenders] = useState([
    { label: "ذكر", value: "male" },
    { label: "انثى", value: "female" },
  ]);
  const [typeOpen, setTypeOpen] = useState(false);
  const [types, setTypes] = useState([
    { label: "زبون", value: "customer" },
    { label: "مالك قاعة", value: "owner" },
  ]);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const change = useHandleChange(setForm);

  const handleSignUp = async () => {
    const validationErrors = validateUser(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    try {
      const response = await registerUser({
        firstName: form.firstName,
        lastName: form.lastName,
        gender: form.gender,
        dateOfBirth: form.date.toISOString(),
        email: form.email,
        phoneNumber: form.phoneNumber,
        role: form.userType,
        password: form.password,
      });
      Toast.show({ type: "success", text1: response.data });
      NavigateTo("EmailCode", { email: form.email });
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1:
          err.response?.data || "لا يمكن الاتصال بالخادم، حاول مرة أخرى لاحقا",
      });
    } finally {
      setLoading(false);
    }
  };

  const setDropdownValue = (field: "gender" | "userType", callback: any) => {
    change(
      field,
      typeof callback === "function" ? callback(form[field]) : callback,
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackgroundDecoration />
      <BackButton />
      <KeyboardAwareScreen scrollHeight={50}>
        <Text style={styles.title}>انشاء حساب</Text>
        <Text style={styles.subtitle}>أنشئ حسابك وابدأ رحلتك</Text>

        <View style={styles.card}>
          <View style={styles.info}>
            <View style={{ flex: 1 }}>
              <Input
                value={form.firstName}
                onChangeText={(t) => change("firstName", t)}
                placeholder="الاسم الاول"
              />
              <Err error={errors.firstName} />
            </View>
            <View style={styles.gapBetween} />
            <View style={{ flex: 1 }}>
              <Input
                value={form.lastName}
                onChangeText={(t) => change("lastName", t)}
                placeholder="اسم العائلة"
              />
              <Err error={errors.lastName} />
            </View>
          </View>

          <View style={styles.info}>
            <View style={{ flex: 1 }}>
              <DropDownPicker
                open={genderOpen}
                value={form.gender || null}
                items={genders}
                setOpen={setGenderOpen}
                setValue={(c) => setDropdownValue("gender", c)}
                setItems={setGenders}
                style={styles.input}
                placeholder="اختر الجنس"
                listMode="SCROLLVIEW"
              />
              <Err error={errors.gender} />
            </View>
            <View style={styles.gapBetween} />
            <View style={{ flex: 1 }}>
              <DropDownPicker
                open={typeOpen}
                value={form.userType || null}
                items={types}
                setOpen={setTypeOpen}
                setValue={(c) => setDropdownValue("userType", c)}
                setItems={setTypes}
                style={styles.input}
                placeholder="نوع المستخدم"
                listMode="SCROLLVIEW"
              />
              <Err error={errors.userType} />
            </View>
          </View>

          <View style={styles.info}>
            <MaskInput
              value={form.phoneNumber}
              onChangeText={(u) => change("phoneNumber", u)}
              mask={phoneMask}
              keyboardType="phone-pad"
              placeholderTextColor="#999"
              placeholder="+97X-5XX-XXX-XXX"
              style={[
                styles.input,
                { flex: 1, direction: "ltr", textAlign: "center" },
              ]}
            />
            <View style={styles.gapBetween} />
            <TouchableOpacity
              style={[
                styles.input,
                styles.justifyCenter,
                { alignItems: "center", flex: 1 },
              ]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text>{form.date.toLocaleDateString("ar-EG")}</Text>
            </TouchableOpacity>
            <DateTimePickerModal
              isVisible={showDatePicker}
              mode="date"
              maximumDate={
                new Date(
                  new Date().getFullYear() - 13,
                  new Date().getMonth(),
                  new Date().getDay(),
                )
              }
              onConfirm={(date) => {
                change("date", date);
                setShowDatePicker(false);
              }}
              onCancel={() => setShowDatePicker(false)}
            />
          </View>
          <Err error={errors.phoneNumber} />
          <Err error={errors.date} />

          <Input
            placeholder="البريد الالكتروني"
            keyboardType="email-address"
            value={form.email}
            onChangeText={(t) => change("email", t)}
          />
          <Err error={errors.email} />

          <PasswordInput
            password={form.password}
            setPassword={(t) => change("password", t)}
          />
          <Err error={errors.password} />

          <View style={styles.passwordHintBox}>
            <Text style={styles.passwordHintTitle}>
              كلمة المرور يجب أن تحتوي على:
            </Text>
            <Text style={styles.passwordHintText}>• 8 إلى 30 حرف</Text>
            <Text style={styles.passwordHintText}>• رقم واحد على الأقل</Text>
            <Text style={styles.passwordHintText}>• رمز واحد على الأقل</Text>
            <Text style={styles.passwordHintText}>
              • حرف كبير واحد على الأقل
            </Text>
          </View>

          <PasswordInput
            password={form.confirmPassword}
            setPassword={(t) => change("confirmPassword", t)}
            placeholder="تاكيد كلمة المرور"
          />
          <Err error={errors.confirmPassword} />

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleSignUp}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.actionButtonText}>انشاء حساب</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAwareScreen>
    </SafeAreaView>
  );
}
