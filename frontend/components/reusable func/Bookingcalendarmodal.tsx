import { useMemo, useCallback, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../styles";

interface BookingCalendarModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (dateString: string) => void;
  bookedDates: (Date | string)[];
  selectedDate?: Date;
  loading?: boolean;
  title?: string;
  subtitle?: string;
  confirmLabel?: string;
}

const toISODate = (d: Date | string): string =>
  typeof d === "string" ? d.split("T")[0] : d.toISOString().split("T")[0];

export default function BookingCalendarModal({
  visible,
  onClose,
  onConfirm,
  bookedDates,
  selectedDate = new Date(),
  loading = false,
  title = "اقتراح موعد جديد",
  subtitle = "اختر تاريخاً متاحاً (الأحمر = محجوز)",
  confirmLabel = "تأكيد الموعد",
}: BookingCalendarModalProps) {
  const bookedSet = useMemo(
    () => new Set(bookedDates.map(toISODate)),
    [bookedDates],
  );

  const today = new Date();
  const todayStr = toISODate(today);

  const [pickedDate, setPickedDate] = useState<string>(toISODate(selectedDate));

  const markedDates = useMemo(() => {
    const marks: Record<string, object> = {};
    bookedSet.forEach((dateStr) => {
      marks[dateStr] = {
        disabled: true,
        disableTouchEvent: true,
        customStyles: {
          container: { backgroundColor: "#FEE2E2", borderRadius: 8 },
          text: { color: "#DC2626", fontWeight: "500" },
        },
      };
    });
    if (!bookedSet.has(pickedDate)) {
      marks[pickedDate] = {
        selected: true,
        selectedColor: "#6C4AB6",
        selectedTextColor: "#FFFFFF",
      };
    }
    return marks;
  }, [bookedSet, pickedDate]);

  const handleDayPress = useCallback(
    (day: DateData) => {
      if (bookedSet.has(day.dateString)) {
        Alert.alert(
          "التاريخ محجوز",
          "هذا التاريخ غير متاح. يرجى اختيار تاريخ آخر.",
        );
        return;
      }
      setPickedDate(day.dateString);
    },
    [bookedSet],
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, { paddingBottom: 16 }]}>
          {/* Header */}
          <View style={[styles.info, { marginBottom: 4 }]}>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-outline" size={22} color="#888" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{title}</Text>
            <View style={{ width: 22 }} />
          </View>

          <Text
            style={[
              styles.profileLabel,
              { textAlign: "center", marginBottom: 10 },
            ]}
          >
            {subtitle}
          </Text>

          {/* Legend */}
          <View
            style={[
              styles.info,
              { justifyContent: "center", gap: 20, marginBottom: 10 },
            ]}
          >
            <LegendDot color="#FEE2E2" textColor="#DC2626" label="محجوز" />
            <LegendDot color="#6C4AB6" textColor="#FFFFFF" label="مختار" />
            <LegendDot color="#DCFCE7" textColor="#166534" label="متاح" />
          </View>

          {/* Calendar */}
          <Calendar
            minDate={todayStr}
            markingType="custom"
            markedDates={markedDates}
            onDayPress={handleDayPress}
            enableSwipeMonths
            renderArrow={(direction: string) => (
              <Ionicons
                name={direction === "left" ? "chevron-back" : "chevron-forward"}
                size={20}
                color="#6C4AB6"
              />
            )}
            theme={{
              todayTextColor: "#6C4AB6",
              selectedDayBackgroundColor: "#6C4AB6",
              selectedDayTextColor: "#FFFFFF",
              dayTextColor: "#166534",
              textDisabledColor: "#CBD5E1",
              monthTextColor: "#1E1B4B",
              textMonthFontWeight: "600",
              calendarBackground: "transparent",
            }}
            style={{ borderRadius: 12, marginBottom: 16 }}
          />
          {/* Confirm */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              { marginTop: 0, opacity: loading ? 0.7 : 1 },
            ]}
            onPress={() => onConfirm(pickedDate)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.actionButtonText}>{confirmLabel}</Text>
            )}
          </TouchableOpacity>

          {/* Cancel */}
          <TouchableOpacity
            style={[
              styles.secondaryActionButton,
              { borderWidth: 0, marginTop: 4 },
            ]}
            onPress={onClose}
            disabled={loading}
          >
            <Text style={[styles.actionButtonText, { color: "#6C4AB6" }]}>
              إلغاء
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function LegendDot({
  color,
  textColor,
  label,
}: {
  color: string;
  textColor: string;
  label: string;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <View
        style={{
          width: 14,
          height: 14,
          borderRadius: 7,
          backgroundColor: color,
          borderWidth: 1,
          borderColor: textColor + "33",
        }}
      />
      <Text style={{ fontSize: 12, color: "#555" }}>{label}</Text>
    </View>
  );
}
