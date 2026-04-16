import React, { useState } from "react";
import { Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DropDownPicker from "react-native-dropdown-picker";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Input } from "../../reusable func/input";
import MaskInput, { Mask } from "react-native-mask-input";
import PasswordInput from "../../reusable func/passwordInput";
import KeyboardAwareScreen from "../../reusable func/keyboardAwarScreen";
import BackButton from "../../reusable func/backButton";
import { NavigateTo } from "../../reusable func/navigateTo";
import { registerUser } from "../../Services/authApi";
import { styles } from "../../styles";
import { UserData, validateUser } from "../../Validations/validateUser";
import Toast from "react-native-toast-message";
import { useHandleChange } from "../../reusable func/useHandleChange";
import BackgroundDecoration from "../../reusable func/backgroundDecoration";

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

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(form.gender || null);
  const [items, setItems] = useState([
    { label: "ذكر", value: "male" },
    { label: "انثى", value: "female" },
  ]);

  const [openUserType, setOpenUserType] = useState(false);
  const [valueUserType, setValueUserType] = useState(form.userType || null);
  const [itemsUserType, setItemsUserType] = useState([
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
      Toast.show({
        type: "success",
        text1: response.data,
      });
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
                onChangeText={(text) => change("firstName", text)}
                placeholder="الاسم الاول"
              />
              {errors.firstName && (
                <Text style={styles.errorText}>{errors.firstName}</Text>
              )}
            </View>

            <View style={styles.gapBetween} />

            <View style={{ flex: 1 }}>
              <Input
                value={form.lastName}
                onChangeText={(text) => change("lastName", text)}
                placeholder="اسم العائلة"
              />
              {errors.lastName && (
                <Text style={styles.errorText}>{errors.lastName}</Text>
              )}
            </View>
          </View>

          {/* Gender + UserType */}
          <View style={styles.info}>
            <View style={{ flex: 1 }}>
              <DropDownPicker
                open={open}
                value={value}
                items={items}
                setOpen={setOpen}
                setValue={(callback) => {
                  const val = callback(value);
                  setValue(val);
                  change("gender", val); // update your form
                }}
                style={styles.input}
                setItems={setItems}
                placeholder="اختر الجنس"
                listMode="SCROLLVIEW"
              />

              {errors.gender && (
                <Text style={styles.errorText}>{errors.gender}</Text>
              )}
            </View>

            <View style={styles.gapBetween} />

            <View style={{ flex: 1 }}>
              <DropDownPicker
                open={openUserType}
                value={valueUserType}
                items={itemsUserType}
                setOpen={setOpenUserType}
                setValue={(callback) => {
                  const val = callback(valueUserType);
                  setValueUserType(val);
                  change("userType", val);
                }}
                style={styles.input}
                setItems={setItemsUserType}
                placeholder="نوع المستخدم"
                listMode="SCROLLVIEW" // ✅ no warning
              />

              {errors.userType && (
                <Text style={styles.errorText}>{errors.userType}</Text>
              )}

              {errors.userType && (
                <Text style={styles.errorText}>{errors.userType}</Text>
              )}
            </View>
          </View>

          {/* Phone + Date */}
          <View style={styles.info}>
            <MaskInput
              value={form.phoneNumber}
              onChangeText={(unmasked) => {
                change("phoneNumber", unmasked);
              }}
              mask={phoneMask}
              keyboardType="numeric"
              placeholderTextColor="#999"
              style={[
                styles.input,
                { flex: 1, direction: "ltr", textAlign: "center" },
              ]}
            />
            <View style={styles.gapBetween} />

            <TouchableOpacity
              style={[
                styles.input,
                {
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                },
              ]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text>{form.date.toLocaleDateString("ar-EG")}</Text>
            </TouchableOpacity>

            <DateTimePickerModal
              style={styles.input}
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
          {errors.phoneNumber && (
            <Text style={styles.errorText}>{errors.phoneNumber}</Text>
          )}
          {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}

          {/* Email */}
          <Input
            placeholder="البريد الالكتروني"
            keyboardType="email-address"
            value={form.email}
            onChangeText={(text) => change("email", text)}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          {/* Password */}
          <PasswordInput
            password={form.password}
            setPassword={(text) => change("password", text)}
          />
          {errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}
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

          {/* Confirm Password */}
          <PasswordInput
            password={form.confirmPassword}
            setPassword={(text) => change("confirmPassword", text)}
            placeholder="تاكيد كلمة المرور"
          />
          {errors.confirmPassword && (
            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
          )}

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
