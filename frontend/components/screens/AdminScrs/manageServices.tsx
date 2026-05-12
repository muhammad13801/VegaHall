import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
  RefreshControl,
  Modal,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "../../styles";
import {
  getGlobalServices,
  addGlobalService,
  getGlobalMealTypes,
  addGlobalMealType,
  getServiceRequests,
  approveServiceRequest,
  rejectServiceRequest,
  renameServiceRequest,
  getMealRequests,
  approveMealRequest,
  rejectMealRequest,
  renameMealRequest,
} from "../../Services/adminApi";
import { MaterialIcons } from "@expo/vector-icons";
import BackgroundDecoration from "../../reusable func/backgroundDecoration";

type Tab = "services" | "meals" | "requests";

export default function ManageServices() {
  // التاب الحالي
  const [activeTab, setActiveTab] = useState<Tab>("services");

  // بيانات الخدمات
  const [services, setServices] = useState<any[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [serviceName, setServiceName] = useState("");
  const [submittingService, setSubmittingService] = useState(false);
  const [showServices, setShowServices] = useState(false);

  // بيانات الوجبات
  const [meals, setMeals] = useState<any[]>([]);
  const [loadingMeals, setLoadingMeals] = useState(true);
  const [mealName, setMealName] = useState("");
  const [submittingMeal, setSubmittingMeal] = useState(false);
  const [showMeals, setShowMeals] = useState(false);

  // الطلبات المعلقة
  const [serviceRequests, setServiceRequests] = useState<any[]>([]);
  const [mealRequests, setMealRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [refreshingRequests, setRefreshingRequests] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  // مودال التحرير
  const [editModal, setEditModal] = useState(false);
  const [editItem, setEditItem] = useState<{ id: number; type: "service" | "meal"; name: string } | null>(null);
  const [editedName, setEditedName] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // جلب البيانات عند أول تشغيل
  useEffect(() => {
    fetchServices();
    fetchMeals();
  }, []);

  // جلب الطلبات لما يفتح التاب
  useEffect(() => {
    if (activeTab === "requests") fetchRequests();
  }, [activeTab]);

  const fetchServices = async () => {
    try {
      setLoadingServices(true);
      const { data } = await getGlobalServices();
      setServices(data);
    } catch (err: any) {
      Toast.show({ type: "error", text1: err.response?.data || "فشل في جلب الخدمات" });
    } finally {
      setLoadingServices(false);
    }
  };

  const fetchMeals = async () => {
    try {
      setLoadingMeals(true);
      const { data } = await getGlobalMealTypes();
      setMeals(data);
    } catch (err: any) {
      Toast.show({ type: "error", text1: err.response?.data || "فشل في جلب الوجبات" });
    } finally {
      setLoadingMeals(false);
    }
  };

  const fetchRequests = useCallback(async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshingRequests(true) : setLoadingRequests(true);
      const [sRes, mRes] = await Promise.all([
        getServiceRequests(),
        getMealRequests(),
      ]);
      setServiceRequests(sRes.data);
      setMealRequests(mRes.data);
    } catch (err: any) {
      Toast.show({ type: "error", text1: err.response?.data || "فشل في جلب الطلبات" });
    } finally {
      setLoadingRequests(false);
      setRefreshingRequests(false);
    }
  }, []);

  const handleAddService = async () => {
    if (!serviceName.trim()) {
      Toast.show({ type: "error", text1: "يرجى إدخال اسم الخدمة" });
      return;
    }
    try {
      setSubmittingService(true);
      await addGlobalService(serviceName.trim());
      Toast.show({ type: "success", text1: `تمت إضافة خدمة "${serviceName}" للنظام` });
      setServiceName("");
      fetchServices();
    } catch (err: any) {
      Toast.show({ type: "error", text1: err.response?.data || "فشل في إضافة الخدمة" });
    } finally {
      setSubmittingService(false);
    }
  };

  const handleAddMeal = async () => {
    if (!mealName.trim()) {
      Toast.show({ type: "error", text1: "يرجى إدخال اسم الوجبة" });
      return;
    }
    try {
      setSubmittingMeal(true);
      await addGlobalMealType(mealName.trim());
      Toast.show({ type: "success", text1: `تمت إضافة وجبة "${mealName}" للنظام` });
      setMealName("");
      fetchMeals();
    } catch (err: any) {
      Toast.show({ type: "error", text1: err.response?.data || "فشل في إضافة الوجبة" });
    } finally {
      setSubmittingMeal(false);
    }
  };

  const handleApprove = (type: "service" | "meal", id: number, name: string) => {
    const label = type === "service" ? "الخدمة" : "الوجبة";
    Alert.alert(
      "تأكيد القبول",
      `هل تريد قبول طلب ${label}: "${name}"؟`,
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "قبول",
          onPress: async () => {
            try {
              setProcessingId(id);
              let res;
              if (type === "service") res = await approveServiceRequest(id);
              else res = await approveMealRequest(id);
              Toast.show({ type: "success", text1: res.data || "تمت الموافقة على الطلب وتم إشعار صاحبه" });
              fetchRequests();
            } catch (err: any) {
              Toast.show({ type: "error", text1: err.response?.data || "فشل في قبول الطلب" });
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const handleReject = (type: "service" | "meal", id: number, name: string) => {
    const label = type === "service" ? "الخدمة" : "الوجبة";
    Alert.alert(
      "تأكيد الرفض",
      `هل تريد رفض طلب ${label}: "${name}"؟`,
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "رفض",
          style: "destructive",
          onPress: async () => {
            try {
              setProcessingId(id);
              if (type === "service") await rejectServiceRequest(id);
              else await rejectMealRequest(id);
              Toast.show({ type: "success", text1: "تم رفض الطلب وإشعار صاحبه" });
              fetchRequests();
            } catch (err: any) {
              Toast.show({ type: "error", text1: err.response?.data || "فشل في رفض الطلب" });
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  // فتح مودال التحرير
  const handleEdit = (type: "service" | "meal", id: number, name: string) => {
    setEditItem({ id, type, name });
    setEditedName(name);
    setEditModal(true);
  };

  // حفظ التعديل وإرساله للبيكند
  const handleSaveEdit = async () => {
    if (!editItem) return;
    if (!editedName.trim()) {
      Toast.show({ type: "error", text1: "الاسم لا يمكن أن يكون فارغاً" });
      return;
    }
    try {
      setSavingEdit(true);
      if (editItem.type === "service") await renameServiceRequest(editItem.id, editedName.trim());
      else await renameMealRequest(editItem.id, editedName.trim());
      Toast.show({ type: "success", text1: "تم تعديل الاسم بنجاح" });
      setEditModal(false);
      fetchRequests();
    } catch (err: any) {
      Toast.show({ type: "error", text1: err.response?.data || "فشل في تعديل الاسم" });
    } finally {
      setSavingEdit(false);
    }
  };

  // بطاقة الطلب — خدمة أو وجبة
  const renderRequestCard = (item: any, type: "service" | "meal") => {
    const isProcessing = processingId === item.id;
    const typeLabel = type === "service" ? "خدمة" : "وجبة";
    const color = "#6C4AB6";
    const bgColor = "#F5F0FF";
    const borderSide = { borderLeftWidth: 4, borderLeftColor: color, borderRightWidth: 0 };

    return (
      <View
        key={`${type}-${item.id}`}
        style={{
          backgroundColor: bgColor,
          borderRadius: 14,
          padding: 16,
          marginBottom: 12,
          ...borderSide,
        }}
      >
        {/* نوع الطلب */}
        <View style={{ flexDirection: "row", justifyContent: "flex-start", marginBottom: 8 }}>
          <View
            style={{
              backgroundColor: color,
              borderRadius: 20,
              paddingHorizontal: 10,
              paddingVertical: 3,
            }}
          >
            <Text style={{ color: "#FFF", fontSize: 11, fontWeight: "600" }}>
              طلب {typeLabel}
            </Text>
          </View>
        </View>

        {/* الاسم */}
        <Text style={{ textAlign: "left", fontSize: 16, fontWeight: "700", color: "#1a1a2e", marginBottom: 4 }}>
          {item.name}
        </Text>

        {/* صاحب الطلب */}
        <Text style={{ textAlign: "left", fontSize: 13, color: "#666", marginBottom: 14 }}>
          الطالب: {item.owner_name} {item.owner_last_name}
        </Text>

        {/* أزرار القبول والرفض */}
        {isProcessing ? (
          <ActivityIndicator color={color} style={{ marginVertical: 6 }} />
        ) : (
          <View style={{ flexDirection: "row", gap: 8 }}>
            {/* رفض */}
            <TouchableOpacity
              onPress={() => handleReject(type, item.id, item.name)}
              style={{
                flex: 1,
                backgroundColor: "#FFEBEE",
                borderRadius: 10,
                paddingVertical: 10,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 4,
              }}
            >
              <MaterialIcons name="close" size={16} color="#C62828" />
              <Text style={{ color: "#C62828", fontWeight: "700", fontSize: 13 }}>رفض</Text>
            </TouchableOpacity>

            {/* تحرير */}
            <TouchableOpacity
              onPress={() => handleEdit(type, item.id, item.name)}
              style={{
                flex: 1,
                backgroundColor: "#FFF3E0",
                borderRadius: 10,
                paddingVertical: 10,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 4,
              }}
            >
              <MaterialIcons name="edit" size={16} color="#E65100" />
              <Text style={{ color: "#E65100", fontWeight: "700", fontSize: 13 }}>تحرير</Text>
            </TouchableOpacity>

            {/* قبول */}
            <TouchableOpacity
              onPress={() => handleApprove(type, item.id, item.name)}
              style={{
                flex: 1,
                backgroundColor: "#EDE7FF",
                borderRadius: 10,
                paddingVertical: 10,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 4,
              }}
            >
              <MaterialIcons name="check" size={16} color="#6C4AB6" />
              <Text style={{ color: "#6C4AB6", fontWeight: "700", fontSize: 13 }}>قبول</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const totalPending = serviceRequests.length + mealRequests.length;

  return (
    <SafeAreaView style={styles.container}>
      <BackgroundDecoration />

      {/* التابات */}
      <View
        style={{
          flexDirection: "row",
          width: "90%",
          alignSelf: "center",
          backgroundColor: "#EDE7FF",
          borderRadius: 14,
          padding: 4,
          marginTop: 20,
          marginBottom: 16,
        }}
      >
        {(["services", "meals", "requests"] as Tab[]).map((tab) => {
          const isActive = activeTab === tab;
          const label =
            tab === "services" ? "الخدمات" : tab === "meals" ? "الوجبات" : "الطلبات";

          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 12,
                alignItems: "center",
                backgroundColor: isActive ? "#6C4AB6" : "transparent",
                position: "relative",
              }}
            >
              <Text
                style={{
                  color: isActive ? "#FFF" : "#6C4AB6",
                  fontWeight: "600",
                  fontSize: 13,
                }}
              >
                {label}
              </Text>
              {/* عداد الطلبات المعلقة */}
              {tab === "requests" && totalPending > 0 && (
                <View
                  style={{
                    position: "absolute",
                    top: 4,
                    left: 4,
                    backgroundColor: "#E53935",
                    borderRadius: 10,
                    minWidth: 18,
                    height: 18,
                    alignItems: "center",
                    justifyContent: "center",
                    paddingHorizontal: 4,
                  }}
                >
                  <Text style={{ color: "#FFF", fontSize: 10, fontWeight: "700" }}>
                    {totalPending}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingTop: 0 }}
        style={{ width: "100%" }}
        refreshControl={
          activeTab === "requests" ? (
            <RefreshControl
              refreshing={refreshingRequests}
              onRefresh={() => fetchRequests(true)}
              colors={["#6C4AB6"]}
            />
          ) : undefined
        }
      >

        {/* ══ تاب الخدمات ══ */}
        {activeTab === "services" && (
          <View>
            {/* فورم الإضافة */}
            <View style={[styles.card, { padding: 20, marginBottom: 16 }]}>
              <Text style={[styles.cardText, { textAlign: "left", marginBottom: 12, width: "100%" }]}>
                إضافة خدمة جديدة للنظام
              </Text>
              <Text style={{ textAlign: "left", color: "#666", marginBottom: 6 }}>
                اسم الخدمة:
              </Text>
              <TextInput
                style={styles.input}
                value={serviceName}
                onChangeText={setServiceName}
                textAlign="right"
              />
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { marginTop: 16, backgroundColor: "#6C4AB6" },
                  submittingService && { opacity: 0.7 },
                ]}
                onPress={handleAddService}
                disabled={submittingService}
              >
                {submittingService ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.actionButtonText}>حفظ الخدمة</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* قائمة الخدمات قابلة للطي */}
            <View style={[styles.card, { padding: 20 }]}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={styles.cardText}>
                  الخدمات الموجودة ({services.length})
                </Text>
                <TouchableOpacity onPress={(e) => { e.stopPropagation?.(); fetchServices(); }}>
                  <MaterialIcons name="refresh" size={20} color="#6C4AB6" />
                </TouchableOpacity>
              </View>

              {showServices && (
                <View style={{ marginTop: 12 }}>
                  {loadingServices ? (
                    <ActivityIndicator color="#6C4AB6" style={{ marginVertical: 20 }} />
                  ) : services.length === 0 ? (
                    <Text style={{ textAlign: "center", color: "#999", marginVertical: 20 }}>
                      لا توجد خدمات حالياً
                    </Text>
                  ) : (
                    services.map((item) => (
                      <View
                        key={item.id}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          backgroundColor: "#F5F0FF",
                          borderRadius: 10,
                          padding: 12,
                          marginBottom: 8,
                        }}
                      >
                        <Text style={{ flex: 1, color: "#333", fontSize: 14 }}>
                          {item.name}
                        </Text>
                        <MaterialIcons name="star" size={18} color="#6C4AB6" style={{ marginLeft: 8 }} />
                      </View>
                    ))
                  )}
                </View>
              )}
            </View>
          </View>
        )}

        {/* ══ تاب الوجبات ══ */}
        {activeTab === "meals" && (
          <View>
            {/* فورم الإضافة */}
            <View style={[styles.card, { padding: 20, marginBottom: 16 }]}>
              <Text style={[styles.cardText, { textAlign: "left", marginBottom: 12, width: "100%" }]}>
                إضافة وجبة جديدة للنظام
              </Text>
              <Text style={{ textAlign: "left", color: "#666", marginBottom: 6 }}>
                اسم الوجبة:
              </Text>
              <TextInput
                style={styles.input}
                value={mealName}
                onChangeText={setMealName}
                textAlign="right"
              />
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { marginTop: 16, backgroundColor: "#6C4AB6" },
                  submittingMeal && { opacity: 0.7 },
                ]}
                onPress={handleAddMeal}
                disabled={submittingMeal}
              >
                {submittingMeal ? (
                  <ActivityIndicator color="#6C4AB6" />
                ) : (
                  <Text style={styles.actionButtonText}>حفظ الوجبة</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* قائمة الوجبات قابلة للطي */}
            <View style={[styles.card, { padding: 20 }]}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={[styles.cardText, { textAlign: "right" }]}>
                  الوجبات الموجودة ({meals.length})
                </Text>
                <TouchableOpacity onPress={(e) => { e.stopPropagation?.(); fetchMeals(); }}>
                  <MaterialIcons name="refresh" size={20} color="#6C4AB6" />
                </TouchableOpacity>
              </View>

              {showMeals && (
                <View style={{ marginTop: 12 }}>
                  {loadingMeals ? (
                    <ActivityIndicator color="#6C4AB6" style={{ marginVertical: 20 }} />
                  ) : meals.length === 0 ? (
                    <Text style={{ textAlign: "center", color: "#999", marginVertical: 20 }}>
                      لا توجد وجبات حالياً
                    </Text>
                  ) : (
                    meals.map((item) => (
                      <View
                        key={item.id}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          backgroundColor: "#F5F0FF",
                          borderRadius: 10,
                          padding: 12,
                          marginBottom: 8,
                        }}
                      >
                        <Text style={{ flex: 1, color: "#333", fontSize: 14 }}>
                          {item.name}
                        </Text>
                        <MaterialIcons name="restaurant" size={18} color="#6C4AB6" style={{ marginLeft: 8 }} />
                      </View>
                    ))
                  )}
                </View>
              )}
            </View>
          </View>
        )}

        {/* ══ تاب الطلبات ══ */}
        {activeTab === "requests" && (
          <View>
            {loadingRequests ? (
              <ActivityIndicator color="#6C4AB6" size="large" style={{ marginTop: 40 }} />
            ) : (serviceRequests.length === 0 && mealRequests.length === 0) ? (
              <View style={{ alignItems: "center", marginTop: 60 }}>
                <MaterialIcons name="inbox" size={64} color="#D0C4FF" />
                <Text style={{ color: "#999", fontSize: 16, marginTop: 14, textAlign: "center" }}>
                  لا توجد طلبات معلقة حالياً
                </Text>
                <Text style={{ color: "#bbb", fontSize: 13, marginTop: 6 }}>
                  اسحب للأسفل للتحديث
                </Text>
              </View>
            ) : (
              <>
                {serviceRequests.length > 0 && (
                  <View style={{ marginBottom: 8 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-start", marginBottom: 12 }}>
                      <MaterialIcons name="build" size={18} color="#6C4AB6" />
                      <Text style={{ fontSize: 15, fontWeight: "700", color: "#6C4AB6", marginLeft: 6 }}>
                        طلبات الخدمات ({serviceRequests.length})
                      </Text>
                    </View>
                    {serviceRequests.map((item) => renderRequestCard(item, "service"))}
                  </View>
                )}
                {mealRequests.length > 0 && (
                  <View>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-start", marginBottom: 12, marginTop: 8 }}>
                      <MaterialIcons name="restaurant" size={18} color="#6C4AB6" />
                      <Text style={{ fontSize: 15, fontWeight: "700", color: "#6C4AB6", marginLeft: 6 }}>
                        طلبات الوجبات ({mealRequests.length})
                      </Text>
                    </View>
                    {mealRequests.map((item) => renderRequestCard(item, "meal"))}
                  </View>
                )}
              </>
            )}
          </View>
        )}

      </ScrollView>
      <Modal visible={editModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" }}>
          <KeyboardAwareScrollView
            style={{ flexShrink: 1 }}
            contentContainerStyle={{
              backgroundColor: "#FFF",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              paddingBottom: 40,
            }}
            enableOnAndroid={true}
            extraScrollHeight={20}
            keyboardOpeningTime={0}
            showsVerticalScrollIndicator={false}
          >

            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <TouchableOpacity onPress={() => setEditModal(false)}>
                <MaterialIcons name="close" size={24} color="#999" />
              </TouchableOpacity>
              <Text style={{ fontSize: 16, fontWeight: "700", color: "#1a1a2e" }}>
                تعديل اسم الطلب
              </Text>
            </View>
            <Text style={{ textAlign: "right", color: "#555", marginBottom: 6, fontSize: 13 }}>
              اكتب الاسم بالشكل الصحيح:
            </Text>
            <TextInput
              style={[
                styles.input,
                { textAlign: "right", fontSize: 15, marginBottom: 16 },
              ]}
              value={editedName}
              onChangeText={setEditedName}
              placeholder="ادخل الاسم الصحيح..."
              autoFocus
            />
            {editedName.trim().length > 1 && (() => {
              const q = editedName.trim().toLowerCase();
              const matchedServices = services.filter(s => s.name.toLowerCase().includes(q));
              const matchedMeals = meals.filter(m => m.name.toLowerCase().includes(q));
              const hasMatch = matchedServices.length > 0 || matchedMeals.length > 0;

              return (
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ textAlign: "right", color: "#777", fontSize: 12, marginBottom: 8 }}>
                    نتائج الفلترة:
                  </Text>

                  {!hasMatch && (
                    <View style={{ backgroundColor: "#F5F5F5", borderRadius: 10, padding: 12, alignItems: "center" }}>
                      <Text style={{ color: "#999", fontSize: 13 }}>اسم جديد — سيُضاف كـ {editItem?.type === "service" ? "خدمة" : "وجبة"} جديدة</Text>
                    </View>
                  )}

                  {matchedServices.length > 0 && (
                    <View style={{ marginBottom: 8 }}>
                      <Text style={{ textAlign: "right", fontSize: 12, color: "#6C4AB6", fontWeight: "600", marginBottom: 4 }}>
                        موجود في جدول الخدمات:
                      </Text>
                      {matchedServices.slice(0, 3).map(s => (
                        <TouchableOpacity
                          key={s.id}
                          onPress={() => setEditedName(s.name)}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            backgroundColor: "#F5F0FF",
                            borderRadius: 8,
                            padding: 10,
                            marginBottom: 4,
                          }}
                        >
                          <MaterialIcons name="check-circle" size={16} color="#6C4AB6" style={{ marginLeft: 8 }} />
                          <Text style={{ flex: 1, textAlign: "right", color: "#333", fontSize: 13 }}>{s.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {matchedMeals.length > 0 && (
                    <View>
                      <Text style={{ textAlign: "right", fontSize: 12, color: "#E65100", fontWeight: "600", marginBottom: 4 }}>
                        موجود في جدول الوجبات:
                      </Text>
                      {matchedMeals.slice(0, 3).map(m => (
                        <TouchableOpacity
                          key={m.id}
                          onPress={() => setEditedName(m.name)}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            backgroundColor: "#FFF3E0",
                            borderRadius: 8,
                            padding: 10,
                            marginBottom: 4,
                          }}
                        >
                          <MaterialIcons name="restaurant" size={16} color="#E65100" style={{ marginLeft: 8 }} />
                          <Text style={{ flex: 1, textAlign: "right", color: "#333", fontSize: 13 }}>{m.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              );
            })()}
            <TouchableOpacity
              onPress={handleSaveEdit}
              disabled={savingEdit}
              style={[
                styles.actionButton,
                { backgroundColor: "#6C4AB6" },
                savingEdit && { opacity: 0.7 },
              ]}
            >
              {savingEdit ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.actionButtonText}>حفظ التعديل</Text>
              )}
            </TouchableOpacity>
          </KeyboardAwareScrollView>
        </View>
      </Modal>

    </SafeAreaView>
  );
}