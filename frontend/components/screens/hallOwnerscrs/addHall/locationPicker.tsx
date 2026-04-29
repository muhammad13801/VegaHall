import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  FlatList,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { Input } from "../../../reusable func/input";
import { styles } from "../../../styles";
import * as Location from "expo-location";
import { useHandleChange } from "../../../reusable func/useHandleChange";
import {
  HallFormProps,
  PALESTINE_CITIES,
} from "../../../Validations/validateHall";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Err } from "../../../reusable func/Err";

export default function LocationPicker({
  form,
  setForm,
  errors,
}: HallFormProps) {
  const inset = useSafeAreaInsets(),
    [cityPicker, setCityPicker] = useState(false),
    [mapVis, setMapVis] = useState(false);
  const [loading, setLoading] = useState(false),
    [query, setQuery] = useState(""),
    change = useHandleChange(setForm),
    mapRef = useRef<MapView>(null);
  const [reg, setReg] = useState({
    latitude: form.latitude || 32.2227,
    longitude: form.longitude || 35.2621,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [coords, setCoords] = useState(
    form.latitude && form.longitude
      ? { latitude: form.latitude, longitude: form.longitude }
      : null,
  );

  const move = (lat: number, lon: number) => {
    const c = { latitude: lat, longitude: lon },
      r = { ...c, latitudeDelta: 0.01, longitudeDelta: 0.01 };
    setReg(r);
    setCoords(c);
    mapRef.current?.animateToRegion(r, 500);
  };

  const locate = async (q?: string) => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return alert("يجب السماح بالوصول للموقع");
    if (!q) setLoading(true);
    try {
      const res = q
        ? (await Location.geocodeAsync(q))[0]
        : (await Location.getCurrentPositionAsync({})).coords;
      if (res) move(res.latitude, res.longitude);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const hasLoc = !!(form.latitude && form.longitude);

  return (
    <View>
      <View style={{ flexDirection: "row", marginBottom: 8 }}>
        <Ionicons
          name="location-outline"
          size={18}
          color="#6C4AB6"
          style={styles.screenIcon}
        />
        <Text style={styles.label}>الموقع</Text>
      </View>

      <Modal visible={cityPicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>اختر المدينة</Text>
            <FlatList
              data={PALESTINE_CITIES}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.cityItem}
                  onPress={() => {
                    change("city", item);
                    setCityPicker(false);
                  }}
                >
                  <Text style={styles.cityText}>{item}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(i) => i}
            />
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setCityPicker(false)}
            >
              <Text style={styles.actionButtonText}>إلغاء</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={mapVis} animationType="slide">
        <View style={{ flex: 1 }}>
          <MapView
            ref={mapRef}
            style={{ flex: 1 }}
            initialRegion={reg}
            onPress={(e) => setCoords(e.nativeEvent.coordinate)}
          >
            {coords && (
              <Marker
                coordinate={coords}
                draggable
                onDragEnd={(e) => setCoords(e.nativeEvent.coordinate)}
              />
            )}
          </MapView>
          <Input
            style={{
              position: "absolute",
              width: "90%",
              top: inset.top,
              alignSelf: "center",
            }}
            placeholder="ابحث عن موقع..."
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => locate(query)}
            returnKeyType="search"
          />
          <TouchableOpacity
            onPress={() => locate()}
            disabled={loading}
            style={{
              position: "absolute",
              bottom: inset.bottom + 100,
              left: 10,
              padding: 15,
              backgroundColor: "#fff",
              elevation: 4,
              borderRadius: 30,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#6C4AB6" size="small" />
            ) : (
              <Ionicons name="locate" size={22} color="#6C4AB6" />
            )}
          </TouchableOpacity>
          <View
            style={{
              flexDirection: "row",
              position: "absolute",
              gap: 5,
              padding: 10,
              bottom: inset.bottom,
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
              onPress={() => setMapVis(false)}
            >
              <Text style={[styles.actionButtonText, { color: "#6C4AB6" }]}>
                إلغاء
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { flex: 1 }]}
              onPress={() => {
                if (coords) setForm((p) => ({ ...p, ...coords }));
                setMapVis(false);
              }}
              disabled={!coords}
            >
              <Text style={styles.actionButtonText}>تأكيد الموقع</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.row}>
        <View style={{ flex: 0.36 }}>
          <TouchableOpacity
            style={[styles.input, styles.row, { alignItems: "center" }]}
            onPress={() => setCityPicker(true)}
          >
            <Text
              style={[
                styles.pickerText,
                { color: form.city ? "#000" : "#898989", textAlign: "center" },
              ]}
            >
              {form.city || "المدينة"}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#6C4AB6" />
          </TouchableOpacity>
          <Err error={errors.city} style={{ textAlign: "center" }} />
        </View>
        <View style={styles.gapBetween} />
        <View style={{ flex: 0.64 }}>
          <Input
            placeholder="الشارع..."
            value={form.address}
            onChangeText={(t) => change("address", t)}
          />
          <Err error={errors.address} style={{ textAlign: "center" }} />
        </View>
      </View>

      <View style={styles.formSection}>
        <TouchableOpacity
          style={styles.locationButton}
          onPress={() => setMapVis(true)}
        >
          <Ionicons name="map" size={20} color="#6C4AB6" />
          <Text style={[styles.actionButtonText, { color: "#6C4AB6" }]}>
            {hasLoc ? "تعديل الموقع على الخريطة" : "تحديد الموقع على الخريطة"}
          </Text>
        </TouchableOpacity>
        {hasLoc && (
          <Text style={styles.locationText}>
            📍 {Number(form.latitude).toFixed(5)},{" "}
            {Number(form.longitude).toFixed(5)}
          </Text>
        )}
        <Err error={errors.location} style={{ textAlign: "center" }} />
      </View>
    </View>
  );
}
