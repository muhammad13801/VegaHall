import { Dimensions, StyleSheet } from "react-native";
import { styles as globalStyles } from "../../styles";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const styles = StyleSheet.create({
  ...globalStyles,

  // ─── Standardized Premium Styles ──────────────────────────────────────────

  screen: {
    flex: 1,
    backgroundColor: "#F7F8FC",
    direction: "rtl",
  },

  body: {
    padding: 16,
    paddingBottom: 120,
    direction: "rtl",
  },
  // Premium Input Override
  primaryButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: "#6C4AB6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#6C4AB6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  successOverlay: {
    flex: 1,
    backgroundColor: "#F7F8FC",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    direction: "rtl",
  },
  successIconBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1A1A2E",
    marginBottom: 8,
    textAlign: "center",
  },
  successAmount: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#5B3A9E",
    marginBottom: 12,
  },

  successCurrency: {
    fontSize: 18,
    color: "#888",
  },
  successSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  summaryRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 6,
 },
  summaryLabel: {
  fontSize: 14,
  color: "#888",
  },
  costLabel: {
  fontSize: 13,
  color: "#666",
},

costValue: {
  fontSize: 14,
  fontWeight: "600",
  color: "#333",
},
costTotalLabel: {
  fontSize: 15,
  fontWeight: "bold",
  color: "#333",
},
priceText: {
  fontSize: 18,
  fontWeight: "bold",
  color: "#5B3A9E",
},
currency: {
  fontSize: 14,
  color: "#888",
},

  summaryValue: {
  fontSize: 14,
  fontWeight: "bold",
  color: "#333",
  },

  successBtn: {
    width: "100%",
    borderRadius: 14,
    overflow: "hidden",
  },

  successBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
  },

  successBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  primaryButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
  },

  primaryButtonDisabled: {
    backgroundColor: "#DDD",
    shadowOpacity: 0,
    elevation: 0,
  },
  costTotalRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: 8,
  paddingTop: 10,
  borderTopWidth: 1,
  borderTopColor: "#F0EDF8",
},

   // ─── Search Bar ───
searchCard: {
  width: "90%",
  alignSelf: "center",
  marginTop: 14,
  marginBottom: 8,
  backgroundColor: "#FFF",
  borderRadius: 16,
  padding: 8,
  elevation: 4,
},
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    textAlign: "right",
    paddingEnd: 10,
  },

  searchBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#6C4AB6",
    justifyContent: "center",
    alignItems: "center",
  },

  // ─── Filters & Dropdowns ───
  filterSummaryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#FFF",
  },

  filterSummaryChip: {
    backgroundColor: "#F0EBFF",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },

  filterSummaryText: {
    fontSize: 13,
    color: "#6C4AB6",
    fontWeight: "600",
  },

  sortContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: "#F7F8FC",
  },

  sortOptions: {
    flexDirection: "row",
    gap: 8,
    flex: 1,
  },

  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#EEE",
  },

  sortChipText: {
    fontSize: 13,
    color: "#555",
  },

  checkboxBoxActive: {
    backgroundColor: "#6C4AB6",
  },

  serviceChipTextActive: {
    color: "#FFF",
    fontWeight: "bold",
  },

  // ─── Filters & Dropdowns ───
  filtersScrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dropdownPanel: {
    marginHorizontal: 16,
    marginTop: 4,
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
    direction: "rtl",
   
  },
  panelTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    textAlign: "left",
    
  },
  checkboxesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "flex-start",
  },
  checkboxItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F8FF",
    borderRadius: 50,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#EEE",
    gap: 8,
  },
  checkboxLabel: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  checkboxLabelActive: {
    color: "#6C4AB6",
    fontWeight: "bold",
  },
  checkboxBox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#DDD",
    alignItems: "center",
    justifyContent: "center",
  },

  listContainer: {
    padding: 16,
    paddingBottom: 100,
    alignItems: "center",
  },

  verticalListContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
    direction: "rtl",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
    paddingHorizontal: 30,
    direction: "rtl",
  },
  // ─── Bottom CTA Bar ────────────────────────────────────────────────────────
 ctaLabel: {
    fontSize: 13,
    color: "#333",
    fontWeight: "bold",
  },
  emptyBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    direction: "rtl",
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    lineHeight: 22,
  },

  

  resultEmptyIcon: {
    marginBottom: 16,
  },

  resultEmptySubtitle: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginBottom: 20,
  },

  resultEmptyButton: {
    backgroundColor: "#6C4AB6",
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },

  resultEmptyButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 15,
  },

  // ─── RateHall ──────────────────────────────────────────────────────────────
  hallInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  hallIconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginStart: 14,
  },

  hallInfoName: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#1A1A2E",
    marginBottom: 4,
  },

  hallInfoCity: {
    fontSize: 13,
    color: "#888",
  },

  starsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginVertical: 12,
  },

  starBtn: {
    padding: 4,
  },

  ratingLabel: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#6C4AB6",
    marginTop: 4,
  },

  quickTagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  quickTag: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#F0EBFF",
    borderWidth: 1,
    borderColor: "#DDD4F7",
  },

  quickTagText: {
    fontSize: 13,
    color: "#6C4AB6",
    fontWeight: "500",
  },

});
