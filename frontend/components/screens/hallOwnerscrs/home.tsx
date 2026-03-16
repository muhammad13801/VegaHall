import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigateTo } from "../../reusable func/navigateTo";
import { styles as globalStyles } from "../../styles";
import { useRoute } from "@react-navigation/native";

export default function Home() {
  const [halls, setHalls] = useState<any[]>([]);
  const route = useRoute<any>();

  useEffect(() => {
    if (route.params?.refresh) {
      setHalls([{
        id: "1",
        name: "صالة الأحلام",
        size: "500",
        price: "1500",
        location: "الخليل - وسط البلد",
      }]);
    }
  }, [route.params]);

  return (
    <SafeAreaView style={[globalStyles.container, { justifyContent: "flex-start", paddingTop: 20 }]}>
      <View style={{ width: '90%', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, alignItems: 'center' }}>
        <Text style={globalStyles.title}>صالاتي</Text>
        <TouchableOpacity style={{ paddingVertical: 10, paddingHorizontal: 15, backgroundColor: '#6C4AB6', borderRadius: 8 }} onPress={() => NavigateTo("AddHall")}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>أضف صالة +</Text>
        </TouchableOpacity>
      </View>
      
      {halls.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={[globalStyles.subtitle, { textAlign: 'center' }]}>لا توجد صالات مضافة حالياً</Text>
        </View>
      ) : (
        <FlatList
          style={{ width: '90%' }}
          data={halls}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={[globalStyles.card, { marginBottom: 15, width: '100%' }]}>
              <Text style={[globalStyles.title, { fontSize: 24, textAlign: 'left' }]}>{item.name}</Text>
              <Text style={{ fontSize: 16, marginTop: 5, textAlign: 'left' }}>سعة: {item.size} شخص</Text>
              <Text style={{ fontSize: 16, textAlign: 'left' }}>الموقع: {item.location}</Text>
              <Text style={{ fontSize: 16, color: '#4CAF50', marginTop: 5, fontWeight: 'bold', textAlign: 'left' }}>السعر: {item.price}$</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
