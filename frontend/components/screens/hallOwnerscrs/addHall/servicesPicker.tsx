import React, { useCallback, useEffect, useState } from "react";
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

interface ServiceOption {
  id: number;
  name: string;
}

interface MealTypeOption {
  id: number;
  name: string;
}

export default function ServicesPicker({
  form,
  setForm,
  errors,
}: HallFormProps) {
  const [availableServices, setAvailableServices] = useState<ServiceOption[]>(
    [],
  );
  const [availableMealTypes, setAvailableMealTypes] = useState<
    MealTypeOption[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Request service state
  const [showServiceRequest, setShowServiceRequest] = useState<boolean>(false);
  const [serviceRequestName, setServiceRequestName] = useState<string>("");
  const [serviceRequestLoading, setServiceRequestLoading] =
    useState<boolean>(false);

  // Request meal state
  const [showMealRequest, setShowMealRequest] = useState<boolean>(false);
  const [mealRequestName, setMealRequestName] = useState<string>("");
  const [mealRequestLoading, setMealRequestLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, mealsRes] = await Promise.all([
          getServicesApi(),
          getMealTypesApi(),
        ]);
        setAvailableServices(servicesRes.data);
        setAvailableMealTypes(mealsRes.data);
      } catch (err) {
        console.error("Failed to load options", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const addService = useCallback((serviceId: number, serviceName: string) => {
    setForm((prev) => {
      if (prev.services?.some((s) => s.serviceId === serviceId)) return prev;
      return {
        ...prev,
        services: [
          ...(prev.services || []),
          { serviceId, name: serviceName, price: 0 },
        ],
      };
    });
  }, []);

  const removeService = useCallback((serviceId: number) => {
    setForm((prev) => ({
      ...prev,
      services: prev.services?.filter((s) => s.serviceId !== serviceId),
    }));
  }, []);

  const updateServicePrice = useCallback((serviceId: number, price: string) => {
    setForm((prev) => ({
      ...prev,
      services: prev.services?.map((s) =>
        s.serviceId === serviceId ? { ...s, price: parseFloat(price) || 0 } : s,
      ),
    }));
  }, []);

  const addMealOption = useCallback((mealTypeId: number, name: string) => {
    setForm((prev) => {
      if (prev.mealOptions?.some((m) => m.mealTypeId === mealTypeId))
        return prev;
      return {
        ...prev,
        mealOptions: [
          ...(prev.mealOptions || []),
          { mealTypeId, name, pricePerPerson: 0 },
        ],
      };
    });
  }, []);

  const removeMealOption = useCallback((mealTypeId: number) => {
    setForm((prev) => ({
      ...prev,
      mealOptions: prev.mealOptions?.filter((m) => m.mealTypeId !== mealTypeId),
    }));
  }, []);

  const updateMealPrice = useCallback((mealTypeId: number, price: string) => {
    setForm((prev) => ({
      ...prev,
      mealOptions: prev.mealOptions?.map((m) =>
        m.mealTypeId === mealTypeId
          ? { ...m, pricePerPerson: parseFloat(price) || 0 }
          : m,
      ),
    }));
  }, []);

  const handleServiceRequest = async () => {
    if (!serviceRequestName.trim()) return;
    setServiceRequestLoading(true);
    try {
      const res = await requestServiceApi(serviceRequestName.trim());
      Toast.show({ type: "success", text1: res.data });
      setServiceRequestName("");
      setShowServiceRequest(false);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: err.response?.data || "❌ خطأ في الخادم",
      });
    } finally {
      setServiceRequestLoading(false);
    }
  };

  const handleMealRequest = async () => {
    if (!mealRequestName.trim()) return;
    setMealRequestLoading(true);
    try {
      const res = await requestMealApi(mealRequestName.trim());
      Toast.show({ type: "success", text1: res.data });
      setMealRequestName("");
      setShowMealRequest(false);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: err.response?.data || "❌ خطأ في الخادم",
      });
    } finally {
      setMealRequestLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ padding: 20, alignItems: "center" }}>
        <ActivityIndicator size="small" color="#6C4AB6" />
        <Text style={{ marginTop: 10, color: "#666" }}>
          جاري تحميل الخدمات...
        </Text>
      </View>
    );
  }

  return (
    <View>
      {/* ===== SERVICES ===== */}
      <View style={{ flexDirection: "row" }}>
        <Ionicons
          name="star-outline"
          size={18}
          color="#6C4AB6"
          style={styles.screenIcon}
        />
        <Text style={styles.label}>خدمات الصالة</Text>
      </View>

      {/* Service chips */}
      <View
        style={[styles.row, { flexWrap: "wrap", gap: 8, marginBottom: 15 }]}
      >
        {availableServices.map((service) => {
          const isSelected = form.services?.some(
            (s) => s.serviceId === service.id,
          );
          return (
            <TouchableOpacity
              key={service.id}
              style={[
                styles.serviceChip,
                {
                  backgroundColor: isSelected ? "#6C4AB6" : "#F8F8FF",
                  borderColor: isSelected ? "#6C4AB6" : "#E0D7F5",
                  elevation: isSelected ? 3 : 0,
                },
              ]}
              onPress={() => addService(service.id, service.name)}
              disabled={isSelected}
            >
              <Text
                style={{
                  color: isSelected ? "#FFF" : "#6C4AB6",
                  fontSize: 14,
                  fontWeight: "600",
                }}
              >
                {service.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Selected service cards */}
      {form.services && form.services.length > 0 && (
        <View style={{ marginTop: 10 }}>
          {form.services.map((service) => (
            <View key={service.serviceId} style={styles.serviceItemCard}>
              <View style={[styles.row, { alignItems: "center" }]}>
                <View style={{ flex: 1.5 }}>
                  <Text style={[styles.label, { fontSize: 16 }]}>
                    {service.name}
                  </Text>
                </View>
                <View style={styles.pricingRow}>
                  <View style={{ flex: 1 }}>
                    <Input
                      placeholder="0"
                      value={service.price?.toString() || "0"}
                      onChangeText={(text) =>
                        updateServicePrice(service.serviceId, text)
                      }
                      keyboardType="numeric"
                      style={{ marginBottom: 0, height: 40, fontSize: 14 }}
                    />
                  </View>
                  <Text
                    style={{ fontSize: 14, color: "#666", fontWeight: "600" }}
                  >
                    ₪
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => removeService(service.serviceId)}
                  style={{
                    backgroundColor: "#FFF0F0",
                    padding: 10,
                    borderRadius: 10,
                  }}
                >
                  <Ionicons name="trash" size={18} color="#FF5A5A" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Request new service */}
      {showServiceRequest ? (
        <View style={[styles.serviceItemCard, { marginTop: 10 }]}>
          <View style={[styles.row, { alignItems: "center", gap: 8 }]}>
            <View style={{ flex: 1 }}>
              <Input
                placeholder="اكتب اسم الخدمة..."
                value={serviceRequestName}
                onChangeText={setServiceRequestName}
                style={{ marginBottom: 0, height: 40, fontSize: 14 }}
              />
            </View>
            <TouchableOpacity
              onPress={handleServiceRequest}
              disabled={serviceRequestLoading || !serviceRequestName.trim()}
              style={{
                backgroundColor: "#6C4AB6",
                padding: 10,
                borderRadius: 10,
                opacity: !serviceRequestName.trim() ? 0.5 : 1,
              }}
            >
              {serviceRequestLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="send" size={18} color="#fff" />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setShowServiceRequest(false);
                setServiceRequestName("");
              }}
              style={{
                backgroundColor: "#FFF0F0",
                padding: 10,
                borderRadius: 10,
              }}
            >
              <Ionicons name="close" size={18} color="#FF5A5A" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          onPress={() => setShowServiceRequest(true)}
          style={[
            styles.serviceChip,
            {
              marginTop: 10,
              borderStyle: "dashed",
              borderColor: "#6C4AB6",
              backgroundColor: "#F8F8FF",
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            },
          ]}
        >
          <Ionicons name="add-circle-outline" size={16} color="#6C4AB6" />
          <Text style={{ color: "#6C4AB6", fontSize: 14, fontWeight: "600" }}>
            اقتراح خدمة جديدة
          </Text>
        </TouchableOpacity>
      )}

      {/* ===== MEAL OPTIONS ===== */}
      <View style={{ marginTop: 25 }}>
        <View style={{ flexDirection: "row" }}>
          <Ionicons
            name="restaurant-outline"
            size={18}
            color="#6C4AB6"
            style={styles.screenIcon}
          />
          <Text style={styles.label}>خيارات وقوائم الوجبات</Text>
        </View>

        {/* Meal type chips */}
        <View
          style={[styles.row, { flexWrap: "wrap", gap: 8, marginBottom: 15 }]}
        >
          {availableMealTypes.map((mealType) => {
            const isSelected = form.mealOptions?.some(
              (m) => m.mealTypeId === mealType.id,
            );
            return (
              <TouchableOpacity
                key={mealType.id}
                style={[
                  styles.serviceChip,
                  {
                    backgroundColor: isSelected ? "#6C4AB6" : "#F8F8FF",
                    borderColor: isSelected ? "#6C4AB6" : "#E0D7F5",
                    elevation: isSelected ? 3 : 0,
                  },
                ]}
                onPress={() => addMealOption(mealType.id, mealType.name)}
                disabled={isSelected}
              >
                <Text
                  style={{
                    color: isSelected ? "#FFF" : "#6C4AB6",
                    fontSize: 14,
                    fontWeight: "600",
                  }}
                >
                  {mealType.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {errors.mealOptions && (
          <Text style={styles.errorText}>{errors.mealOptions}</Text>
        )}

        {/* Selected meal cards */}
        {form.mealOptions && form.mealOptions.length > 0 && (
          <View style={{ marginTop: 10 }}>
            {form.mealOptions.map((meal, index) => (
              <View key={meal.mealTypeId} style={styles.serviceItemCard}>
                <View style={[styles.row, { alignItems: "center" }]}>
                  <View style={{ flex: 1.5 }}>
                    <Text style={[styles.label, { fontSize: 16 }]}>
                      {meal.name}
                    </Text>
                  </View>
                  <View style={styles.pricingRow}>
                    <View style={{ flex: 1 }}>
                      <Input
                        placeholder="0"
                        value={meal.pricePerPerson.toString()}
                        onChangeText={(text) =>
                          updateMealPrice(meal.mealTypeId, text)
                        }
                        keyboardType="numeric"
                        style={{ marginBottom: 0, height: 40, fontSize: 14 }}
                      />
                    </View>
                    <Text
                      style={{ fontSize: 14, color: "#666", fontWeight: "600" }}
                    >
                      ₪/شخص
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => removeMealOption(meal.mealTypeId)}
                    style={{
                      backgroundColor: "#FFF0F0",
                      padding: 10,
                      borderRadius: 10,
                    }}
                  >
                    <Ionicons name="trash" size={18} color="#FF5A5A" />
                  </TouchableOpacity>
                </View>
                {errors[`mealPrice_${index}`] && (
                  <Text style={[styles.errorText, { marginTop: 4 }]}>
                    {errors[`mealPrice_${index}`]}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Request new meal */}
        {showMealRequest ? (
          <View style={[styles.serviceItemCard, { marginTop: 10 }]}>
            <View style={[styles.row, { alignItems: "center", gap: 8 }]}>
              <View style={{ flex: 1 }}>
                <Input
                  placeholder="اكتب اسم الوجبة..."
                  value={mealRequestName}
                  onChangeText={setMealRequestName}
                  style={{ marginBottom: 0, height: 40, fontSize: 14 }}
                />
              </View>
              <TouchableOpacity
                onPress={handleMealRequest}
                disabled={mealRequestLoading || !mealRequestName.trim()}
                style={{
                  backgroundColor: "#6C4AB6",
                  padding: 10,
                  borderRadius: 10,
                  opacity: !mealRequestName.trim() ? 0.5 : 1,
                }}
              >
                {mealRequestLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="send" size={18} color="#fff" />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowMealRequest(false);
                  setMealRequestName("");
                }}
                style={{
                  backgroundColor: "#FFF0F0",
                  padding: 10,
                  borderRadius: 10,
                }}
              >
                <Ionicons name="close" size={18} color="#FF5A5A" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => setShowMealRequest(true)}
            style={[
              styles.serviceChip,
              {
                marginTop: 10,
                borderStyle: "dashed",
                borderColor: "#6C4AB6",
                backgroundColor: "#F8F8FF",
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              },
            ]}
          >
            <Ionicons name="add-circle-outline" size={16} color="#6C4AB6" />
            <Text style={{ color: "#6C4AB6", fontSize: 14, fontWeight: "600" }}>
              اقتراح وجبة جديدة
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
