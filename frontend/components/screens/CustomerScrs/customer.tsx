import { useEffect, useState, useCallback } from "react";
import { Text, TouchableOpacity, View, ScrollView, TextInput, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigateTo } from "../../reusable func/navigateTo";
import { FilterBox } from "../../reusable func/filterBox";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { getHallsApi, searchApi, getFavoritesApi, toggleFavoriteApi } from "../../Services/customerApi";
import { useRefresh } from "../../reusable func/refreshContext";
import { HallCard } from "../hallOwnerscrs/hallCard";
import { styles as s } from "./ibrahimStyles";

const CITIES = ["نابلس", "رام الله", "جنين", "طولكرم", "قلقيلية"];
const ALL_SERVICES = ["مساحة خارجية", "مسبح", "دي جي", "ضيافة", "تصوير", "قاعة طعام", "تكييف"];

export default function Customer({ onOpenDrawer }: { onOpenDrawer?: () => void }) {
  const { refreshKey, triggerRefresh } = useRefresh();
  const [query, setQuery] = useState("");

  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());

  const [openFilter, setOpenFilter] = useState<"services" | "city" | null>(null);
  const [dateModalVis, setDateModalVis] = useState(false);
  const [halls, setHalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHallsAndFavorites = useCallback(async () => {
    setLoading(true);
    try {
      const favRes = await getFavoritesApi(1, 100);
      const userFavIds = new Set<number>(favRes.data.map((fav: any) => fav.id));
      setFavoriteIds(userFavIds);

      if (query.trim()) {
        const res = await searchApi({ query });
        setHalls(res.data);
      } else {
        const res = await getHallsApi();
        setHalls(res.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchHallsAndFavorites();
  }, [fetchHallsAndFavorites, refreshKey]);

  const handleToggleFavorite = async (hallId: number) => {
    try {
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (next.has(hallId)) next.delete(hallId);
        else next.add(hallId);
        return next;
      });

      await toggleFavoriteApi(hallId);
      triggerRefresh();
    } catch (error) {
      console.error("Toggle favorite error:", error);
      fetchHallsAndFavorites();
    }
  };

  const handleSearch = (
    overrideServices?: string[],
    overrideCity?: string,
    overrideMinPrice?: string,
    overrideMaxPrice?: string,
    overrideDate?: Date | null
  ) => {
    const finalCity = overrideCity !== undefined ? overrideCity : selectedCity;
    const finalServices = overrideServices !== undefined ? overrideServices : selectedServices;
    const finalDate = overrideDate !== undefined ? (overrideDate ? overrideDate.toISOString() : null) : (selectedDate ? selectedDate.toISOString() : null);

    NavigateTo("HallsResult", {
      query,
      city: finalCity,
      date: finalDate,
      services: finalServices,
    });
  };

  const toggleService = (srv: string) => {
    let newServices;
    if (selectedServices.includes(srv)) {
      newServices = selectedServices.filter((s) => s !== srv);
    } else {
      newServices = [...selectedServices, srv];
    }
    setSelectedServices(newServices);
    handleSearch(newServices);
  };

  const toggleFilter = (filter: "services" | "city") => {
    setOpenFilter(openFilter === filter ? null : filter);
  };

  return (
    <SafeAreaView style={s.screen} edges={["top", "left", "right"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.homeHero}>
          <Text style={s.homeTitle}>ابحث عن القاعة المثالية لمناسبتك</Text>

          <View style={[s.searchCard, { marginTop: 0, width: '100%' }]}>
            <View style={s.searchRow}>
              <TouchableOpacity style={s.searchBtn} onPress={() => handleSearch()}>
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

        <View style={s.body}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.filtersScrollContainer}
          >
            <FilterBox
              title="الخدمات"
              value={selectedServices.length > 0 ? `${selectedServices.length} خدمات` : "الكل"}
              isOpen={openFilter === "services"}
              onPress={() => toggleFilter("services")}
              isCustomerPage={true}
            />

            <FilterBox
              title="التاريخ"
              value={selectedDate ? selectedDate.toLocaleDateString("en-GB") : "الكل"}
              isOpen={dateModalVis}
              onPress={() => { setOpenFilter(null); setDateModalVis(true); }}
              isCustomerPage={true}
            />
            <FilterBox
              title="المدينة"
              value={selectedCity || "الكل"}
              isOpen={openFilter === "city"}
              onPress={() => toggleFilter("city")}
              isCustomerPage={true}
            />
          </ScrollView>

          {openFilter && (
            <View style={s.dropdownPanel}>
              <Text style={s.panelTitle}>
                {openFilter === "services" ? "اختر الخدمات المطلوبة:" : "اختر المدينة:"}
              </Text>
              <View style={s.checkboxesGrid}>
                {(openFilter === "services" ? ALL_SERVICES : CITIES).map((item) => {
                  const isActive = openFilter === "services" ? selectedServices.includes(item) : selectedCity === item;
                  return (
                    <TouchableOpacity
                      key={item}
                      style={s.checkboxItem}
                      onPress={() => {
                        if (openFilter === "services") {
                          toggleService(item);
                        } else {
                          const newCity = isActive ? "" : item;
                          setSelectedCity(newCity);
                          handleSearch(undefined, newCity);
                        }
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[s.checkboxLabel, isActive && s.checkboxLabelActive]}>{item}</Text>
                      <View style={[s.checkboxBox, isActive && s.checkboxBoxActive]}>
                        {isActive && <Feather name="check" size={12} color="#FFF" />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          <View style={s.verticalListContainer}>
            {loading && halls.length === 0 ? (
              <ActivityIndicator size="large" color="#6C4AB6" style={{ marginTop: 40 }} />
            ) : halls.length > 0 ? (
              halls.map((hall) => (
                <HallCard
                  key={hall.id}
                  item={hall}
                  isCustomer={true}
                  isFav={favoriteIds.has(hall.id)}
                  onToggleFavorite={(id: number) => handleToggleFavorite(id)}
                  onPress={() => NavigateTo("HallDetails", { hall })}
                />
              ))
            ) : (
              <View style={s.emptyContainer}>
                <Feather name="search" size={48} color="#D4C4F7" style={{ marginBottom: 12 }} />
                <Text style={s.emptyText}>لم يتم العثور على صالات تطابق بحثك</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <DateTimePickerModal
        isVisible={dateModalVis}
        mode="date"
        onConfirm={(date) => {
          setSelectedDate(date);
          setDateModalVis(false);
          setOpenFilter(null);
          handleSearch(undefined, undefined, undefined, undefined, date);
        }}
        onCancel={() => setDateModalVis(false)}
        minimumDate={new Date()}
      />
    </SafeAreaView>
  );
}