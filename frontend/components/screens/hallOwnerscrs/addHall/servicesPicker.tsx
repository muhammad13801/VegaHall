import React, { useCallback } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Input } from "../../../reusable func/input";
import { styles } from "../../../styles";
import { SERVICES, MEAL_TYPES, HallFormProps } from "./constants";

export default function ServicesPicker({
  form,
  setForm,
  errors,
}: HallFormProps) {
  const addService = useCallback((serviceName: string) => {
    setForm((prev) => {
      if (prev.services?.some((s) => s.name === serviceName)) return prev;
      return {
        ...prev,
        services: [...(prev.services || []), { name: serviceName, price: 0 }],
      };
    });
  }, []);

  const removeService = useCallback((serviceName: string) => {
    setForm((prev) => ({
      ...prev,
      services: prev.services?.filter((s) => s.name !== serviceName),
      mealOptions: serviceName === "وجبات عشاء" ? [] : prev.mealOptions,
    }));
  }, []);

  const addMealOption = useCallback((type: string) => {
    setForm((prev) => {
      if (prev.mealOptions?.some((m) => m.type === type)) return prev;
      return {
        ...prev,
        mealOptions: [...(prev.mealOptions || []), { type, pricePerPerson: 0 }],
      };
    });
  }, []);

  const removeMealOption = useCallback((type: string) => {
    setForm((prev) => ({
      ...prev,
      mealOptions: prev.mealOptions?.filter((m) => m.type !== type),
    }));
  }, []);

  const updateMealPrice = useCallback((type: string, price: string) => {
    setForm((prev) => ({
      ...prev,
      mealOptions: prev.mealOptions?.map((m) =>
        m.type === type ? { ...m, pricePerPerson: parseFloat(price) || 0 } : m,
      ),
    }));
  }, []);

  const updateServicePrice = useCallback(
    (serviceName: string, price: string) => {
      setForm((prev) => ({
        ...prev,
        services: prev.services?.map((s) =>
          s.name === serviceName ? { ...s, price: parseFloat(price) || 0 } : s,
        ),
      }));
    },
    [],
  );

  return (
    <View>
      <View style={{ flexDirection: "row" }}>
        <Ionicons
          name="star-outline"
          size={18}
          color={"#6C4AB6"}
          style={styles.screenIcon}
        />
        <Text style={styles.label}>خدمات الصالة</Text>
      </View>
      <View
        style={[styles.row, { flexWrap: "wrap", gap: 8, marginBottom: 15 }]}
      >
        {SERVICES.map((service) => {
          const isSelected = form.services?.some((s) => s.name === service);
          return (
            <TouchableOpacity
              key={service}
              style={[
                styles.serviceChip,
                {
                  backgroundColor: isSelected ? "#6C4AB6" : "#F8F8FF",
                  borderColor: isSelected ? "#6C4AB6" : "#E0D7F5",
                  elevation: isSelected ? 3 : 0,
                },
              ]}
              onPress={() => addService(service)}
              disabled={isSelected}
            >
              <Text
                style={{
                  color: isSelected ? "#FFF" : "#6C4AB6",
                  fontSize: 14,
                  fontWeight: "600",
                }}
              >
                {service}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Selected Services List */}
      {form.services && form.services.length > 0 && (
        <View style={{ marginTop: 10 }}>
          {form.services.map((service) => (
            <View key={service.name} style={styles.serviceItemCard}>
              <View
                style={[
                  styles.row,
                  {
                    alignItems: "center",
                    marginBottom: service.name === "وجبات عشاء" ? 10 : 0,
                  },
                ]}
              >
                <View style={{ flex: 1.5 }}>
                  <Text style={[styles.label, { fontSize: 16 }]}>
                    {service.name}
                  </Text>
                </View>
                {service.name !== "وجبات عشاء" && (
                  <View style={styles.pricingRow}>
                    <View style={{ flex: 1 }}>
                      <Input
                        placeholder="0"
                        value={service.price?.toString() || "0"}
                        onChangeText={(text) =>
                          updateServicePrice(service.name, text)
                        }
                        keyboardType="numeric"
                        style={{
                          marginBottom: 0,
                          height: 40,
                          fontSize: 14,
                        }}
                      />
                    </View>
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#666",
                        fontWeight: "600",
                      }}
                    >
                      ₪
                    </Text>
                  </View>
                )}
                <TouchableOpacity
                  onPress={() => removeService(service.name)}
                  style={{
                    backgroundColor: "#FFF0F0",
                    padding: 10,
                    borderRadius: 10,
                  }}
                >
                  <Ionicons name="trash" size={18} color="#FF5A5A" />
                </TouchableOpacity>
              </View>

              {/* Specific options for Meal Service */}
              {service.name === "وجبات عشاء" && (
                <View style={styles.borderTopSection}>
                  <Text
                    style={[
                      styles.label,
                      { fontSize: 14, color: "#6C4AB6", marginBottom: 8 },
                    ]}
                  >
                    اختر انواع الوجبات:
                  </Text>
                  <View
                    style={[
                      styles.row,
                      { flexWrap: "wrap", gap: 6, marginBottom: 10 },
                    ]}
                  >
                    {MEAL_TYPES.map((type) => {
                      const isMealSelected = form.mealOptions?.some(
                        (m) => m.type === type,
                      );
                      return (
                        <TouchableOpacity
                          key={type}
                          onPress={() => addMealOption(type)}
                          style={{
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 15,
                            backgroundColor: isMealSelected
                              ? "#6C4AB6"
                              : "#EEE",
                          }}
                        >
                          <Text
                            style={{
                              color: isMealSelected ? "#FFF" : "#666",
                              fontSize: 12,
                              fontWeight: "bold",
                            }}
                          >
                            {type}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  {errors.mealOptions && (
                    <Text style={styles.errorText}>{errors.mealOptions}</Text>
                  )}

                  {/* Configured Meals */}
                  {form.mealOptions && form.mealOptions.length > 0 && (
                    <View style={{ gap: 8 }}>
                      {form.mealOptions.map((meal, index) => (
                        <View key={meal.type}>
                          <View style={styles.mealOptionRow}>
                            <View style={{ flex: 1.5 }}>
                              <Text
                                style={{
                                  fontSize: 14,
                                  fontWeight: "600",
                                  color: "#4A4A4A",
                                }}
                              >
                                {meal.type}
                              </Text>
                            </View>
                            <View style={styles.pricingRow}>
                              <Input
                                placeholder="0"
                                value={meal.pricePerPerson.toString()}
                                onChangeText={(text) =>
                                  updateMealPrice(meal.type, text)
                                }
                                keyboardType="numeric"
                                style={{
                                  flex: 1,
                                  marginBottom: 0,
                                  height: 38,
                                  fontSize: 14,
                                }}
                              />
                              <Text style={{ fontSize: 13, color: "#666" }}>
                                شخص/₪
                              </Text>
                            </View>
                            <TouchableOpacity
                              onPress={() => removeMealOption(meal.type)}
                            >
                              <Ionicons
                                name="close-circle"
                                size={20}
                                color="#FF5A5A"
                              />
                            </TouchableOpacity>
                          </View>
                          {errors[`mealPrice_${index}`] && (
                            <Text
                              style={[styles.errorText, { marginRight: 15 }]}
                            >
                              {errors[`mealPrice_${index}`]}
                            </Text>
                          )}
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
