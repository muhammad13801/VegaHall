import { Alert, Platform, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input } from "../../reusable func/input";
import React, { useState } from "react";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { goBack, NavigateTo } from "../../reusable func/navigateTo";
import { styles } from "../../styles";
import PasswordInput from "../../reusable func/passwordInput";
import KeyboardAwareScreen from "../../reusable func/keyboardAwarScreen";
import BackButton from "../../reusable func/backButton";
import { registerUser } from "../../Services/api";

export default function SignUp() {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [userType, setUserType] = useState<string>("");
  const [date, setDate] = useState(new Date(2000, 0, 1));
  const [show, setShow] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [rePassword, setRePassword] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const [firstNameError, setFirstNameError] = useState<string>("");
  const [lastNameError, setLastNameError] = useState<string>("");
  const [genderError, setGenderError] = useState<string>("");
  const [userTypeError, setUserTypeError] = useState<string>("");
  const [phoneNumberError, setPhoneNumberError] = useState<string>("");
  const [dateError, setDateError] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [repasswordError, setRepasswordError] = useState<string>("");

  const onChange = (event: any, selectedDate?: Date) => {
    setShow(Platform.OS === "ios");
    if (selectedDate) setDate(selectedDate);
  };

  const handleSignUp = async () => {
    if (firstName.trim() === "") setFirstNameError("ادخل الاسم الاول");
    else setFirstNameError("");

    if (lastName.trim() === "") setLastNameError("ادخل اسم العائلة");
    else setLastNameError("");

    if (gender.trim() === "") setGenderError("الرجاء اختيار الجنس");
    else setGenderError("");

    if (userType.trim() === "") setUserTypeError("الرجاء اختيار نوع المستخدم");
    else setUserTypeError("");

    if (phoneNumber.trim() === "") setPhoneNumberError("ادخل رقم الهاتف");
    else setPhoneNumberError("");

    if (email.trim() === "") setEmailError("لا يمكن ترك الحقل فارغا!");
    else setEmailError("");

    if (password.trim() === "") setPasswordError("لا يمكن ترك الحقل فارغا!");
    else setPasswordError("");

    if (rePassword.trim() === "") setRepasswordError("لا يمكن ترك الحقل فارغا");
    else if (password !== rePassword)
      setRepasswordError("كلمة المرور غير متطابقة");
    else setRepasswordError("");

    setLoading(true);
    if (
      firstNameError === "" &&
      lastNameError === "" &&
      genderError === "" &&
      userTypeError === "" &&
      phoneNumberError === "" &&
      dateError === "" &&
      emailError === "" &&
      passwordError === "" &&
      repasswordError === ""
    ) {
      try {
        /* const emailCheck = await signupAPI.checkEmail(email);
        if (emailCheck.exists)
          return setEmailError("البريد الإلكتروني مستخدم بالفعل");*/
        const userData = {
          first_name: firstName,
          last_name: lastName,
          gender,
          date_of_birth: date.toISOString(),
          email,
          phone_number: phoneNumber,
          role: userType,
          password,
        };

        await registerUser(userData);
        console.log(userData);
        NavigateTo("EmailCode", { email });
      } catch (error: any) {
        console.log("Error: " + error);
        return Alert.alert("خطأ", "فشل في إرسال رمز التحقق" + error.message);
      } finally {
        setLoading(false);
      }
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <BackButton />
      <KeyboardAwareScreen scrollHeight={120}>
        <Text style={styles.title}>انشاء حساب</Text>

        <View style={styles.card}>
          <View style={styles.info}>
            <Text style={styles.cardText}>الاسم الاول</Text>
            <Text style={[styles.cardText]}>اسم العائلة</Text>
          </View>

          <View style={styles.info}>
            <Input
              style={{ width: 150 }}
              value={firstName}
              onChangeText={setFirstName}
            />
            <Input
              style={{ width: 150, marginRight: 12 }}
              value={lastName}
              onChangeText={setLastName}
            />
          </View>

          <View style={styles.info}>
            {firstNameError.length > 0 && (
              <Text style={[styles.errorText, { width: 170 }]}>
                {firstNameError}
              </Text>
            )}

            {lastNameError.length > 0 && (
              <Text style={styles.errorText}>{lastNameError}</Text>
            )}
          </View>

          <View style={[styles.info, { marginTop: 12 }]}>
            <Text style={styles.cardText}>الجنس</Text>
            <Text style={styles.cardText}>نوع المستخدم</Text>
          </View>

          <View style={styles.info}>
            <Picker
              style={styles.options}
              selectedValue={gender}
              onValueChange={setGender}
            >
              <Picker.Item label="" value="" />
              <Picker.Item label="ذكر" value="Male" />
              <Picker.Item label="انثى" value="Female" />
            </Picker>

            <Picker
              style={[styles.options, { marginRight: 12 }]}
              selectedValue={userType}
              onValueChange={setUserType}
            >
              <Picker.Item label="" value="" />
              <Picker.Item label="زبون" value="Customer" />
              <Picker.Item label="صاحب صالة" value="HallOwner" />
            </Picker>
          </View>

          <View style={styles.info}>
            {genderError.length > 0 && (
              <Text style={[styles.errorText, { width: 170 }]}>
                {genderError}
              </Text>
            )}

            {userTypeError.length > 0 && (
              <Text style={styles.errorText}>{userTypeError}</Text>
            )}
          </View>

          <View style={styles.info}>
            <Text style={styles.cardText}>رقم الهاتف</Text>
            <Text style={[styles.cardText]}>تاريح الميلاد</Text>
          </View>

          <View style={styles.info}>
            <Input
              style={{ width: 150, direction: "ltr" }}
              placeholder="9705..."
              keyboardType="numeric"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              maxLength={12}
            />
            <TouchableOpacity
              style={[
                styles.input,
                {
                  width: 150,
                  marginRight: 12,
                  justifyContent: "center",
                  alignItems: "center",
                },
              ]}
              onPress={() => setShow(true)}
            >
              <Text style={{ fontSize: 15 }}>
                {date.toLocaleDateString("EG")}
              </Text>
              {show && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="calendar"
                  maximumDate={new Date()}
                  onChange={onChange}
                />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.info}>
            {phoneNumberError.length > 0 && (
              <Text style={[styles.errorText, { width: 170 }]}>
                {phoneNumberError}
              </Text>
            )}

            {dateError.length > 0 && (
              <Text style={styles.errorText}>{dateError}</Text>
            )}
          </View>

          <Text style={styles.cardText}>البريد الالكتروني</Text>
          <Input
            placeholder="البريد الالكتروني"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          {emailError.length > 0 && (
            <Text style={styles.errorText}>{emailError}</Text>
          )}

          <Text style={styles.cardText}>كلمة المرور الجديدة</Text>
          <PasswordInput password={password} setPassword={setPassword} />

          {passwordError.length > 0 && (
            <Text style={styles.errorText}>{passwordError}</Text>
          )}

          <Text style={styles.cardText}>تاكيد كلمة المرور</Text>
          <PasswordInput password={rePassword} setPassword={setRePassword} />

          {repasswordError.length > 0 && (
            <Text style={styles.errorText}>{repasswordError}</Text>
          )}

          <TouchableOpacity style={styles.actionButton} onPress={handleSignUp}>
            <Text style={styles.actionButtonText}>
              {loading ? "جاري الارسال..." : "انشاء حساب"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScreen>
    </SafeAreaView>
  );
}
