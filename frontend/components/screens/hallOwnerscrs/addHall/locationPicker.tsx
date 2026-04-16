import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  FlatList,
} from "react-native";
import MapView, { Marker, MapPressEvent } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { Input } from "../../../reusable func/input";
import { styles } from "../../../styles";
import * as Location from "expo-location";
import { useHandleChange } from "../../../reusable func/useHandleChange";
import {
  HallFormProps,
  PALESTINE_CITIES,
} from "../../../Validations/validateHall";

export default function LocationPicker({
  form,
  setForm,
  errors,
}: HallFormProps) {
  const [cityPickerVisible, setCityPickerVisible] = useState<boolean>(false);
  const [mapVisible, setMapVisible] = useState<boolean>(false);
  const [locationLoading, setLocationLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const change = useHandleChange(setForm);
  const mapRef = useRef<MapView>(null);

  const [region, setRegion] = useState({
    latitude: form.latitude ?? 32.2211,
    longitude: form.longitude ?? 35.2544,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const [markerCoords, setMarkerCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(
    form.latitude !== undefined && form.longitude !== undefined
      ? { latitude: form.latitude, longitude: form.longitude }
      : null,
  );

  const handleMapPress = useCallback((e: MapPressEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarkerCoords({ latitude, longitude });
  }, []);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    try {
      const results = await Location.geocodeAsync(searchQuery);
      if (results.length > 0) {
        const { latitude, longitude } = results[0];
        const newRegion = {
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setRegion(newRegion);
        setMarkerCoords({ latitude, longitude });
        mapRef.current?.animateToRegion(newRegion, 500);
      }
    } catch (e) {
      console.error("Search error:", e);
    }
  }, [searchQuery]);

  const handleGPS = useCallback(async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = loc.coords;
      const newRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setRegion(newRegion);
      setMarkerCoords({ latitude, longitude });
      mapRef.current?.animateToRegion(newRegion, 500);
    } catch (e) {
      console.error("GPS error:", e);
    } finally {
      setLocationLoading(false);
    }
  }, []);

  const handleConfirm = useCallback(() => {
    if (markerCoords) {
      setForm((prev) => ({
        ...prev,
        latitude: markerCoords.latitude,
        longitude: markerCoords.longitude,
      }));
    }
    setMapVisible(false);
  }, [markerCoords, setForm]);

  const renderCityItem = useCallback(
    ({ item }: { item: string }) => (
      <TouchableOpacity
        style={styles.cityItem}
        onPress={() => {
          change("city", item);
          setCityPickerVisible(false);
        }}
      >
        <Text style={styles.cityText}>{item}</Text>
      </TouchableOpacity>
    ),
    [change],
  );

  const hasLocation =
    form.latitude !== undefined && form.longitude !== undefined;

  return (
    <View>
      {/* Section header */}
      <View style={{ flexDirection: "row", marginBottom: 8 }}>
        <Ionicons
          name="location-outline"
          size={18}
          color="#6C4AB6"
          style={styles.screenIcon}
        />
        <Text style={styles.label}>الموقع</Text>
      </View>

      {/* City Picker Modal */}
      <Modal visible={cityPickerVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>اختر المدينة</Text>
            <FlatList
              data={PALESTINE_CITIES}
              keyExtractor={(item: string) => item}
              renderItem={renderCityItem}
              keyboardShouldPersistTaps="handled"
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

      {/* Map Picker Modal */}
      <Modal visible={mapVisible} animationType="slide">
        <View style={{ flex: 1 }}>
          <MapView
            ref={mapRef}
            style={{ flex: 1 }}
            initialRegion={region}
            onPress={handleMapPress}
          >
            {markerCoords && (
              <Marker
                coordinate={markerCoords}
                draggable
                onDragEnd={(e) => setMarkerCoords(e.nativeEvent.coordinate)}
              />
            )}
          </MapView>

          {/* Search bar floating on top */}
          <Input
            style={{
              position: "absolute",
              width: "90%",
              top: 5,
              alignSelf: "center",
            }}
            placeholder="ابحث عن موقع..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />

          {/* GPS button floating */}
          <TouchableOpacity
            onPress={handleGPS}
            disabled={locationLoading}
            style={{
              position: "absolute",
              bottom: "12%",
              left: 10,
              padding: 15,
              backgroundColor: "#fff",
              elevation: 4,
              borderRadius: 30,
            }}
          >
            {locationLoading ? (
              <ActivityIndicator color="#6C4AB6" size="small" />
            ) : (
              <Ionicons name="locate" size={22} color="#6C4AB6" />
            )}
          </TouchableOpacity>

          {/* Bottom bar */}
          <View
            style={{
              flexDirection: "row",
              gap: 5,
              padding: 10,
              position: "absolute",
              bottom: 0,
              width: "100%",
            }}
          >
            <TouchableOpacity
              style={[
                styles.actionButton,
                {
                  flex: 1,
                  backgroundColor: "#fff",
                  borderWidth: 1,
                  borderColor: "#6C4AB6",
                },
              ]}
              onPress={() => setMapVisible(false)}
            >
              <Text style={[styles.actionButtonText, { color: "#6C4AB6" }]}>
                إلغاء
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { flex: 1 }]}
              onPress={handleConfirm}
              disabled={!markerCoords}
            >
              <Text style={styles.actionButtonText}>تأكيد الموقع</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* City + Street row */}
      <View style={styles.row}>
        <View style={{ flex: 0.36 }}>
          <TouchableOpacity
            style={[styles.input, styles.row, { alignItems: "center" }]}
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

        <View style={{ flex: 0.64 }}>
          <Input
            placeholder="الشارع..."
            value={form.address}
            onChangeText={(text: string) => change("address", text)}
          />
          {errors.address && (
            <Text style={styles.errorText}>{errors.address}</Text>
          )}
        </View>
      </View>

      {/* Map picker button */}
      <View style={styles.formSection}>
        <TouchableOpacity
          style={styles.locationButton}
          onPress={() => setMapVisible(true)}
        >
          <Ionicons name="map" size={20} color="#6C4AB6" />
          <Text style={[styles.actionButtonText, { color: "#6C4AB6" }]}>
            {hasLocation
              ? "تعديل الموقع على الخريطة"
              : "تحديد الموقع على الخريطة"}
          </Text>
        </TouchableOpacity>

        {hasLocation && (
          <Text style={styles.locationText}>
            📍 {Number(form.latitude)?.toFixed(5)},{" "}
            {Number(form.longitude)?.toFixed(5)}
          </Text>
        )}
        {errors.location && (
          <Text style={[styles.errorText, { textAlign: "center" }]}>
            {errors.location}
          </Text>
        )}
      </View>
    </View>
  );
}
