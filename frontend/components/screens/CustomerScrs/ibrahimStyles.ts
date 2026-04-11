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

  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Premium Card Override
  card: {
    width: SCREEN_WIDTH * 0.9,
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginTop: 13,
    
  },

  // Premium Input Override
  input: {
    height: 52,
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#333",
    borderWidth: 1.5,
    borderColor: "#F0F0F0",
    marginBottom: 16,
    textAlign: "right",
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginBottom: 8,
    textAlign: "left",
    paddingEnd: 4,
  },

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

  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },

  sectionSubtitle: {
    fontSize: 13,
    color: "#888",
    marginBottom: 12,
    marginTop: -6,
  },

  sectionCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    direction: "rtl",
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

  // ─── Price / Cost ──────────────────────────────────────────────────────────
  priceText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#5B3A9E",
  },

  priceBox: {
    alignItems: "flex-start",
  },

  priceLabel: {
    fontSize: 11,
    color: "#AAA",
    marginTop: 2,
  },

  currency: {
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

  costTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F0EDF8",
  },

  costTotalLabel: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

  // ─── Bottom CTA Bar ────────────────────────────────────────────────────────
  bottomCTA: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#F0EDF8",
    shadowColor: "#6C4AB6",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
  },

  ctaPriceInfo: {
    flex: 1,
    marginEnd: 12,
  },

  ctaLabel: {
    fontSize: 13,
    color: "#333",
    fontWeight: "bold",
  },

  ctaButton: {
    flex: 1,
    borderRadius: 14,
    overflow: "hidden",
  },

  ctaButtonDisabled: {
    opacity: 0.45,
  },

  ctaButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },

  ctaButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "right",
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

  // ─── MyBookings ───
  bookingCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    direction: "rtl",
  },

  bookingCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  bookingCardIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginStart: 12,
  },

  bookingCardHeaderInfo: {
    flex: 1,
  },

  bookingCardHallName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A1A2E",
    marginBottom: 3,
  },

  bookingCardLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  infoGridLabel: {
    fontSize: 12,
    color: "#999",
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },

  bookingCardDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },

  verticalInfoPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#F5F0FF",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  bookingDetailText: {
    fontSize: 13,
    color: "#444",
  },

  bookingCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F5F3FA",
    paddingTop: 12,
  },

  bookingTotalLabel: {
    fontSize: 12,
    color: "#888",
    marginBottom: 2,
  },

  bookingTotalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#5B3A9E",
  },

  cancelBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderColor: "#E74C3C",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },

  cancelBtnText: {
    color: "#E74C3C",
    fontSize: 13,
    fontWeight: "600",
  },

  rateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#FFF8E1",
    borderWidth: 1,
    borderColor: "#FFE082",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },

  rateBtnText: {
    color: "#F4B400",
    fontSize: 13,
    fontWeight: "600",
  },

  // ─── Payment – Success Screen ──────────────────────────────────────────────
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

  // ─── Payment – Card Input Form ─────────────────────────────────────────────
  inputGroup: {
    marginBottom: 4,
  },

  inputLabel: {
    fontSize: 13,
    color: "#555",
    marginBottom: 6,
    fontWeight: "600",
  },

  inputRow: {
    flexDirection: "row",
    gap: 10,
  },

  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
    backgroundColor: "#E8F5E9",
    borderRadius: 8,
    padding: 10,
  },

  securityText: {
    fontSize: 13,
    color: "#388E3C",
    fontWeight: "500",
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

  charCount: {
    fontSize: 12,
    color: "#AAA",
    textAlign: "left",
    marginTop: 6,
  },

  // ─── HallDetails ───────────────────────────────────────────────────────────
  reviewsText: {
    fontSize: 12,
    color: "#888",
  },

  descriptionText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 22,
    textAlign: "right",
  },

  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 8,
  },

  infoGridItem: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#F8F8FF",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },

  infoGridIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F0EAFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  infoGridValue: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1A1A2E",
  },

  serviceIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#6C4AB6",
    alignItems: "center",
    justifyContent: "center",
  },

  reviewItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },

  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

  guestLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  reviewerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F0EAFF",
    alignItems: "center",
    justifyContent: "center",
  },

  reviewDate: {
    fontSize: 12,
    color: "#AAA",
  },

  reviewStars: {
    flexDirection: "row",
    gap: 2,
    marginBottom: 6,
    justifyContent: "flex-end",
  },

  reviewText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
    textAlign: "right",
  },

  galleryContainer: {
    width: SCREEN_WIDTH,
    height: 280,
    backgroundColor: "#1A1A2E",
  },

  gallerySlide: {
    width: SCREEN_WIDTH,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  galleryOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },

  galleryTopBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingTop: 6,
  },

  galleryBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },

  galleryBtnRight: {
    flexDirection: "row",
    gap: 8,
  },

  galleryIndicatorRow: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
  },

  galleryDotsWrap: {
    flexDirection: "row",
    gap: 5,
  },

  galleryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.5)",
  },

  galleryDotActive: {
    width: 18,
    backgroundColor: "#FFF",
  },

  galleryCountBadge: {
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },

  galleryCountText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },

  contentBody: {
    padding: 16,
    paddingBottom: 100,
  },

  titleSection: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  titleRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },

  hallName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A2E",
    flex: 1,
    marginStart: 10,
    textAlign: "right",
  },

  infoChipsRow: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 6,
  },

  infoChip: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F5F0FF",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  ratingChipText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#333",
  },
});
