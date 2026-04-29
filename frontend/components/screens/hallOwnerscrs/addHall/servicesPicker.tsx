import React, { useEffect, useState, memo } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Input } from "../../../reusable func/input";
import { styles } from "../../../styles";
import {
  getServicesApi,
  getMealTypesApi,
  requestServiceApi,
  requestMealApi,
} from "../../../Services/hallApi";
import { HallFormProps } from "../../../Validations/validateHall";
import Toast from "react-native-toast-message";
import { Err } from "../../../reusable func/Err";

const SectionHeader = memo(({ icon, title }: { icon: any; title: string }) => (
  <View style={[styles.row, { alignItems: "center", marginBottom: 10 }]}>
    <Ionicons name={icon} size={18} color="#6C4AB6" style={styles.screenIcon} />
    <Text style={styles.label}>
      {title}
      <Text style={{ color: "#777", fontSize: 13 }}> (اختياري)</Text>
    </Text>
  </View>
));

const ChipList = memo(
  ({
    items,
    selectedIds,
    onAdd,
    idField,
  }: {
    items: any[];
    selectedIds: number[];
    onAdd: (item: any) => void;
    idField: string;
  }) => (
    <View style={[styles.row, { flexWrap: "wrap", gap: 8, marginBottom: 15 }]}>
      {items.map((item) => {
        const isSelected = selectedIds.includes(item.id);
        return (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.serviceChip,
              {
                backgroundColor: isSelected ? "#6C4AB6" : "#F8F8FF",
                borderColor: isSelected ? "#6C4AB6" : "#E0D7F5",
                elevation: isSelected ? 3 : 0,
              },
            ]}
            onPress={() => onAdd(item)}
            disabled={isSelected}
          >
            <Text
              style={{
                color: isSelected ? "#FFF" : "#6C4AB6",
                fontSize: 14,
                fontWeight: "600",
              }}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  ),
);

const RequestForm = ({
  placeholder,
  onSend,
  onCancel,
}: {
  placeholder: string;
  onSend: (name: string) => Promise<void>;
  onCancel: () => void;
}) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSend = async () => {
    if (!name.trim()) return;
    setLoading(true);
    await onSend(name.trim());
    setLoading(false);
  };
  return (
    <View style={[styles.serviceItemCard, { marginTop: 10 }]}>
      <View style={[styles.row, { alignItems: "center", gap: 8 }]}>
        <Input
          placeholder={placeholder}
          value={name}
          onChangeText={setName}
          style={{ flex: 1, marginBottom: 0, height: 40, fontSize: 14 }}
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={loading || !name.trim()}
          style={[
            styles.profileAvatarSmall,
            { backgroundColor: "#6C4AB6", opacity: !name.trim() ? 0.5 : 1 },
          ]}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="send" size={18} color="#fff" />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onCancel}
          style={[styles.profileAvatarSmall, { backgroundColor: "#FFF0F0" }]}
        >
          <Ionicons name="close" size={18} color="#FF5A5A" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function ServicesPicker({
  form,
  setForm,
  errors,
}: HallFormProps) {
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [availableMealTypes, setAvailableMealTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showServiceRequest, setShowServiceRequest] = useState(false);
  const [showMealRequest, setShowMealRequest] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [s, m] = await Promise.all([getServicesApi(), getMealTypesApi()]);
        setAvailableServices(s.data);
        setAvailableMealTypes(m.data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const updateForm = (key: "services" | "mealOptions", update: any) =>
    setForm((prev) => ({ ...prev, [key]: update(prev[key] || []) }));

  const handleRequest = async (type: "service" | "meal", name: string) => {
    try {
      const res = await (type === "service"
        ? requestServiceApi(name)
        : requestMealApi(name));
      Toast.show({ type: "success", text1: res.data });
      type === "service"
        ? setShowServiceRequest(false)
        : setShowMealRequest(false);
    } catch (err: any) {
      Toast.show({ type: "error", text1: err.response?.data || "حدث خطأ" });
    }
  };

  if (loading)
    return <ActivityIndicator style={{ padding: 20 }} color="#6C4AB6" />;

  return (
    <View>
      <SectionHeader icon="star-outline" title="خدمات الصالة" />
      <ChipList
        items={availableServices}
        selectedIds={form.services?.map((s) => s.serviceId) || []}
        onAdd={(s) =>
          updateForm("services", (prev: any[]) => [
            ...prev,
            { serviceId: s.id, name: s.name, price: 0 },
          ])
        }
        idField="serviceId"
      />

      {form.services?.map((s) => (
        <View key={s.serviceId} style={styles.serviceItemCard}>
          <View style={[styles.row, { alignItems: "center" }]}>
            <Text style={[styles.label, { flex: 1.5, fontSize: 16 }]}>
              {s.name}
            </Text>
            <View style={styles.pricingRow}>
              <Input
                placeholder="0"
                value={(s.price ?? 0).toString()}
                onChangeText={(t) =>
                  updateForm("services", (prev: any[]) =>
                    prev.map((item) =>
                      item.serviceId === s.serviceId
                        ? { ...item, price: parseFloat(t) || 0 }
                        : item,
                    ),
                  )
                }
                keyboardType="numeric"
                style={{ flex: 1, marginBottom: 0, height: 40 }}
              />
              <Text style={{ fontSize: 14, color: "#666", fontWeight: "600" }}>
                ₪
              </Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                updateForm("services", (prev: any[]) =>
                  prev.filter((item) => item.serviceId !== s.serviceId),
                )
              }
              style={[
                styles.profileAvatarSmall,
                { backgroundColor: "#FFF0F0" },
              ]}
            >
              <Ionicons name="trash" size={18} color="#FF5A5A" />
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {showServiceRequest ? (
        <RequestForm
          placeholder="اكتب اسم الخدمة..."
          onSend={(n) => handleRequest("service", n)}
          onCancel={() => setShowServiceRequest(false)}
        />
      ) : (
        <TouchableOpacity
          onPress={() => setShowServiceRequest(true)}
          style={[
            styles.serviceChip,
            styles.profileSecondaryAction,
            {
              marginTop: 10,
              borderStyle: "dashed",
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            },
          ]}
        >
          <Ionicons name="add-circle-outline" size={16} color="#6C4AB6" />
          <Text style={{ color: "#6C4AB6", fontWeight: "600" }}>
            اقتراح خدمة جديدة
          </Text>
        </TouchableOpacity>
      )}

      <View style={{ marginTop: 25 }}>
        <SectionHeader
          icon="restaurant-outline"
          title="خيارات وقوائم الوجبات"
        />
        <ChipList
          items={availableMealTypes}
          selectedIds={form.mealOptions?.map((m) => m.mealTypeId) || []}
          onAdd={(m) =>
            updateForm("mealOptions", (prev: any[]) => [
              ...prev,
              { mealTypeId: m.id, name: m.name, pricePerPerson: 0 },
            ])
          }
          idField="mealTypeId"
        />
        <Err error={errors.mealOptions} />

        {form.mealOptions?.map((m, i) => (
          <View key={m.mealTypeId} style={styles.serviceItemCard}>
            <View style={[styles.row, { alignItems: "center" }]}>
              <Text style={[styles.label, { flex: 1.5, fontSize: 16 }]}>
                {m.name}
              </Text>
              <View style={styles.pricingRow}>
                <Input
                  placeholder="0"
                  value={(m.pricePerPerson ?? 0).toString()}
                  onChangeText={(t) =>
                    updateForm("mealOptions", (prev: any[]) =>
                      prev.map((item) =>
                        item.mealTypeId === m.mealTypeId
                          ? { ...item, pricePerPerson: parseFloat(t) || 0 }
                          : item,
                      ),
                    )
                  }
                  keyboardType="numeric"
                  style={{ flex: 1, marginBottom: 0, height: 40 }}
                />
                <Text
                  style={{ fontSize: 14, color: "#666", fontWeight: "600" }}
                >
                  ₪/شخص
                </Text>
              </View>
              <TouchableOpacity
                onPress={() =>
                  updateForm("mealOptions", (prev: any[]) =>
                    prev.filter((item) => item.mealTypeId !== m.mealTypeId),
                  )
                }
                style={[
                  styles.profileAvatarSmall,
                  { backgroundColor: "#FFF0F0" },
                ]}
              >
                <Ionicons name="trash" size={18} color="#FF5A5A" />
              </TouchableOpacity>
            </View>
            <Err error={errors[`mealPrice_${i}`]} style={{ marginTop: 4 }} />
          </View>
        ))}

        {showMealRequest ? (
          <RequestForm
            placeholder="اكتب اسم الوجبة..."
            onSend={(n) => handleRequest("meal", n)}
            onCancel={() => setShowMealRequest(false)}
          />
        ) : (
          <TouchableOpacity
            onPress={() => setShowMealRequest(true)}
            style={[
              styles.serviceChip,
              styles.profileSecondaryAction,
              {
                marginTop: 10,
                borderStyle: "dashed",
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              },
            ]}
          >
            <Ionicons name="add-circle-outline" size={16} color="#6C4AB6" />
            <Text style={{ color: "#6C4AB6", fontWeight: "600" }}>
              اقتراح وجبة جديدة
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
