import { useEffect, useState, useCallback } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePickerModal from "react-native-modal-datetime-picker";

import { NavigateTo } from "../../reusable func/navigateTo";
import { FilterBox } from "../../reusable func/filterBox";
import {
  getHallsApi,
  searchApi,
  getFavoritesApi,
  toggleFavoriteApi,
} from "../../Services/customerApi";
import { useRefresh } from "../../reusable func/refreshContext";
import { HallCard } from "../hallOwnerscrs/hallCard";
import { styles as s } from "./ibrahimStyles";
import { PALESTINE_CITIES } from "../../Validations/validateHall";

const ALL_SERVICES = [
  "مساحة خارجية",
  "مسبح",
  "دي جي",
  "ضيافة",
  "تصوير",
  "قاعة طعام",
  "تكييف",
];

type FilterType = "services" | "city" | "price" | null;

export default function Customer({ onOpenDrawer }: { onOpenDrawer?: () => void }) {
  const { refreshKey, triggerRefresh } = useRefresh();

  const [query, setQuery] = useState("");
  const [halls, setHalls] = useState<any[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());

  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [openFilter, setOpenFilter] = useState<FilterType>(null);
  const [dateModalVis, setDateModalVis] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFavorites = async () => {
    try {
      const favRes = await getFavoritesApi(1, 100);
      setFavoriteIds(new Set(favRes.data.map((fav: any) => fav.id)));
    } catch (error: any) {
      if (error.response?.status !== 401) {
        console.error("Error fetching favorites:", error);
      }
    }
  };

  const fetchHalls = async () => {
    try {
      const res = query.trim()
        ? await searchApi({ query })
        : await getHallsApi();

      setHalls(res.data);
    } catch (error) {
      console.error("Error fetching halls:", error);
    }
  };

  const fetchHallsAndFavorites = useCallback(async () => {
    setLoading(true);
    await fetchFavorites();
    await fetchHalls();
    setLoading(false);
    setRefreshing(false);
  }, [query]);

  useEffect(() => {
    fetchHallsAndFavorites();
  }, [fetchHallsAndFavorites, refreshKey]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHallsAndFavorites();
  }, [fetchHallsAndFavorites]);

  const handleSearch = (
    overrideServices?: string[],
    overrideCity?: string,
    overrideMinPrice?: string,
    overrideMaxPrice?: string,
    overrideDate?: Date | null
  ) => {
    const finalCity = overrideCity !== undefined ? overrideCity : selectedCity;
    const finalServices =
      overrideServices !== undefined ? overrideServices : selectedServices;

    const finalDate =
      overrideDate !== undefined
        ? overrideDate
          ? overrideDate.toISOString()
          : null
        : selectedDate
        ? selectedDate.toISOString()
        : null;

    NavigateTo("HallsResult", {
      query,
      city: finalCity,
      date: finalDate,
      services: finalServices,
      minPrice: overrideMinPrice !== undefined ? overrideMinPrice : minPrice,
      maxPrice: overrideMaxPrice !== undefined ? overrideMaxPrice : maxPrice,
    });
  };

  const handleToggleFavorite = async (hallId: number) => {
    try {
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        next.has(hallId) ? next.delete(hallId) : next.add(hallId);
        return next;
      });

      await toggleFavoriteApi(hallId);
      triggerRefresh();
    } catch (error) {
      console.error("Toggle favorite error:", error);
      fetchHallsAndFavorites();
    }
  };

  const toggleFilter = (filter: Exclude<FilterType, null>) => {
    setOpenFilter((prev) => (prev === filter ? null : filter));
  };

  const toggleService = (service: string) => {
    const newServices = selectedServices.includes(service)
      ? selectedServices.filter((s) => s !== service)
      : [...selectedServices, service];

    setSelectedServices(newServices);
    handleSearch(newServices);
  };

  const handleCitySelect = (city: string) => {
    const newCity = selectedCity === city ? "" : city;
    setSelectedCity(newCity);
    handleSearch(undefined, newCity);
  };

  const resetPriceFilter = () => {
    setMinPrice("");
    setMaxPrice("");
    setOpenFilter(null);
  };

  const renderOptions = (items: string[], type: "services" | "city") => (
    <View style={s.checkboxesGrid}>
      {items.map((item) => {
        const isActive =
          type === "services"
            ? selectedServices.includes(item)
            : selectedCity === item;

        return (
          <TouchableOpacity
            key={item}
            style={s.checkboxItem}
            activeOpacity={0.7}
            onPress={() =>
              type === "services" ? toggleService(item) : handleCitySelect(item)
            }
          >
            <Text style={[s.checkboxLabel, isActive && s.checkboxLabelActive]}>
              {item}
            </Text>

            <View style={[s.checkboxBox, isActive && s.checkboxBoxActive]}>
              {isActive && <Feather name="check" size={12} color="#FFF" />}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <SafeAreaView style={s.screen} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        stickyHeaderIndices={[0]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#6C4AB6"]}
          />
        }
      >
        <View style={{ backgroundColor: "#F7F8FC", paddingBottom: 10 }}>
          <View style={s.searchCard}>
            <View style={s.searchRow}>
              <TouchableOpacity
                style={s.searchBtn}
                onPress={() => handleSearch()}
              >
                <Feather name="search" size={20} color="#FFF" />
              </TouchableOpacity>

              <TextInput
                style={s.searchInput}
                placeholder="ابحث عن اسم الصالة..."
                placeholderTextColor="#999"
                value={query}
                onChangeText={setQuery}
              />
            </View>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.filtersScrollContainer}
        >
          <FilterBox
            title="الخدمات"
            value={
              selectedServices.length > 0
                ? `${selectedServices.length} خدمات`
                : "الكل"
            }
            isOpen={openFilter === "services"}
            onPress={() => toggleFilter("services")}
          />

          <FilterBox
            title="التاريخ"
            value={selectedDate ? selectedDate.toLocaleDateString("en-GB") : "الكل"}
            isOpen={dateModalVis}
            onPress={() => {
              setOpenFilter(null);
              setDateModalVis(true);
            }}
          />

          <FilterBox
            title="المدينة"
            value={selectedCity || "الكل"}
            isOpen={openFilter === "city"}
            onPress={() => toggleFilter("city")}
          />

          <FilterBox
            title="السعر"
            value={
              minPrice || maxPrice
                ? `${minPrice || 0} - ${maxPrice || "∞"}`
                : "الكل"
            }
            isOpen={openFilter === "price"}
            onPress={() => toggleFilter("price")}
          />
        </ScrollView>

        {openFilter && openFilter !== "price" && (
          <View style={s.dropdownPanel}>
            <Text style={s.panelTitle}>
              {openFilter === "services"
                ? "اختر الخدمات المطلوبة:"
                : "اختر المدينة:"}
            </Text>

            {renderOptions(
              openFilter === "services" ? ALL_SERVICES : PALESTINE_CITIES,
              openFilter
            )}
          </View>
        )}

        {openFilter === "price" && (
          <View style={s.dropdownPanel}>
            <View
              style={{
                flexDirection: "row-reverse",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 20,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 13,
                    color: "#666",
                    marginBottom: 8,
                    textAlign: "left",
                  }}
                >
                  أعلى سعر
                </Text>
                <TextInput
                  style={s.input}
                  placeholder="إلى"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  value={maxPrice}
                  onChangeText={setMaxPrice}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 13,
                    color: "#666",
                    marginBottom: 8,
                    textAlign: "left",
                  }}
                >
                  أدنى سعر
                </Text>
                <TextInput
                  style={s.input}
                  placeholder="من"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  value={minPrice}
                  onChangeText={setMinPrice}
                />
              </View>
            </View>

            <View style={{ flexDirection: "row-reverse", gap: 12 }}>
              <TouchableOpacity
                style={[s.primaryButton, { flex: 2, height: 48 }]}
                onPress={() => {
                  handleSearch();
                  setOpenFilter(null);
                }}
              >
                <Text style={s.primaryButtonText}>فلترة</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#DDD",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={resetPriceFilter}
              >
                <Text style={{ color: "#666", fontSize: 15 }}>حذف</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={s.verticalListContainer}>
          {loading && halls.length === 0 ? (
            <ActivityIndicator
              size="large"
              color="#6C4AB6"
              style={{ marginTop: 40 }}
            />
          ) : halls.length > 0 ? (
            halls.map((hall) => (
              <HallCard
                key={hall.id}
                item={hall}
                isCustomer
                isFav={favoriteIds.has(hall.id)}
                onToggleFavorite={handleToggleFavorite}
                onPress={() => NavigateTo("HallDetails", { hall })}
              />
            ))
          ) : (
            <View style={s.emptyContainer}>
              <Feather
                name="search"
                size={48}
                color="#D4C4F7"
                style={{ marginBottom: 12 }}
              />
              <Text style={s.emptyText}>
                لم يتم العثور على صالات تطابق بحثك
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <DateTimePickerModal
        isVisible={dateModalVis}
        mode="date"
        minimumDate={new Date()}
        onConfirm={(date) => {
          setSelectedDate(date);
          setDateModalVis(false);
          setOpenFilter(null);
          handleSearch(undefined, undefined, undefined, undefined, date);
        }}
        onCancel={() => setDateModalVis(false)}
      />
    </SafeAreaView>
  );
}