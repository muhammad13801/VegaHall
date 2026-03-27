import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Input } from "../../../reusable func/input";
import { styles } from "../../../styles";
import { HallFormProps, PALESTINE_CITIES } from "./constants";
import * as Location from "expo-location";
import { useHandleChange } from "../../../reusable func/useHandleChange";

export default function LocationPicker({
  form,
  setForm,
  errors,
}: HallFormProps) {
  const [cityPickerVisible, setCityPickerVisible] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const change = useHandleChange(setForm);

  const handleGetLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setForm((prev) => ({ ...prev, location: "" }));
        setLocationLoading(false);
        return;
      }
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const locString = `${location.coords.latitude}, ${location.coords.longitude}`;
      setForm((prev) => ({ ...prev, location: locString }));
    } catch (error) {
      console.error("GPS Error:", error);
    } finally {
      setLocationLoading(false);
    }
  };

  return (
    <View>
      {/* location details */}
      <View style={{ flexDirection: "row" }}>
        <Ionicons
          name="location-outline"
          size={18}
          color={"#6C4AB6"}
          style={styles.screenIcon}
        />
        <Text style={styles.label}>المدينة</Text>
      </View>

      {/* City Picker Modal */}
      <Modal
        visible={cityPickerVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>اختر المدينة</Text>
            <FlatList
              data={PALESTINE_CITIES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.cityItem}
                  onPress={() => {
                    change("city", item);
                    setCityPickerVisible(false);
                  }}
                >
                  <Text style={styles.cityText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setCityPickerVisible(false)}
            >
              <Text style={styles.actionButtonText}>إلغاء</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={{ flexDirection: "row" }}>
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            style={[
              styles.pickerWrapper,
              styles.row,
              { alignItems: "center", paddingHorizontal: 12 },
            ]}
            onPress={() => setCityPickerVisible(true)}
          >
            <Text
              style={[
                styles.pickerText,
                { color: form.city ? "#000" : "#898989", textAlign: "center" },
              ]}
            >
              {form.city || "اختر المدينة"}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#6C4AB6" />
          </TouchableOpacity>

          {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
        </View>

        <View style={styles.gapBetween} />
        <View style={{ flex: 1.6 }}>
          <Input
            placeholder="الشارع..."
            value={form.address}
            onChangeText={(text) => change("address", text)}
          />
          {errors.address && (
            <Text style={styles.errorText}>{errors.address}</Text>
          )}
        </View>
      </View>

      {/* GPS Location */}
      <View style={styles.formSection}>
        <TouchableOpacity
          style={styles.locationButton}
          onPress={handleGetLocation}
          disabled={locationLoading}
        >
          {locationLoading ? (
            <ActivityIndicator color="#6C4AB6" size="small" />
          ) : (
            <>
              <Ionicons name="location" size={20} color="#6C4AB6" />
              <Text style={[styles.actionButtonText, { color: "#6C4AB6" }]}>
                {form.location
                  ? "تحديث الموقع الحالي (GPS)"
                  : "تحديد الموقع الحالي (GPS)"}
              </Text>
            </>
          )}
        </TouchableOpacity>
        {form.location ? (
          <Text style={styles.locationText}>الموقع: {form.location}</Text>
        ) : null}
        {errors.location && (
          <Text style={[styles.errorText, { textAlign: "center" }]}>
            {errors.location}
          </Text>
        )}
      </View>
    </View>
  );
}
