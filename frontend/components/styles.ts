import { Dimensions, StyleSheet } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const styles = StyleSheet.create({
  // Muhammad Styles
  gradient: {
    ...StyleSheet.absoluteFill,
  },

  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#6C4AB6",
  },

  subtitle: {
    fontSize: 18,
    color: "#666",
    marginBottom: 10,
  },

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

  passwordContainer: {
    position: "relative",
  },
  showPasswordButton: {
    position: "absolute",
    top: 13,
    right: 15,
  },

  actionButton: {
    backgroundColor: "#6C4AB6",
    height: 48,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },

  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },

  justifyCenter: {
    justifyContent: "center",
  },

  actionText: {
    fontSize: 14,
    color: "#6C4AB6",
    fontWeight: "bold",
  },

  errorText: {
    color: "#D32F2F",
    fontSize: 13,
    marginTop: 2,
    marginBottom: 6,
  },

  backButton: {
    alignSelf: "flex-start",
    paddingLeft: 10,
  },

  cardText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    marginRight: 5,
    width: 160,
    alignItems: "center",
  },

  info: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  gapBetween: {
    width: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    height: 50,
    width: "100%",
    fontSize: 14,
    marginBottom: 13,
    backgroundColor: "#FAFAFA",
    textAlignVertical: "center",
    padding: 8,
    color: "#000",
  },

  passwordHintBox: {
    backgroundColor: "#F3EAFF",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  passwordHintTitle: {
    fontWeight: "bold",
    fontSize: 13,
    color: "#5A3D8A",
    marginBottom: 4,
  },
  passwordHintText: {
    fontSize: 12,
    color: "#6C4AB6",
    lineHeight: 20,
  },

  screenIcon: {
    alignSelf: "center",
    color: "#6C4AB6",
    marginRight: 5,
  },

  toast: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderLeftWidth: 5,
    padding: 8,
    alignSelf: "center",
  },

  toastText1: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },

  label: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#4A4A4A",
    marginRight: 5,
  },

  profileHeader: {
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F3FA",
    paddingBottom: 20,
    width: "100%",
  },

  profileAvatarContainer: {
    position: "relative",
    marginBottom: 10,
  },

  profileInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F3FA",
    width: "100%",
  },

  profileInfoIcon: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  profileTextContainer: {
    flex: 1,
  },

  profileLabel: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
    marginBottom: 2,
  },

  profileValue: {
    fontSize: 14,
    color: "#888",
    direction: "ltr",
    textAlign: "right",
  },

  profileSecondaryAction: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#6C4AB6",
  },

  profileDeleteAction: {
    backgroundColor: "#FFE5E5",
    borderWidth: 0,
  },

  profileActionContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  profileAvatarSmall: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F3EAFF",
    alignItems: "center",
    justifyContent: "center",
  },

  commentBody: {
    fontSize: 14,
    color: "#555",
  },

  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: "70%",
  },

  items: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3EAFF",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginLeft: 8,
    marginBottom: 8,
  },

  itemText: {
    color: "#6C4AB6",
    fontSize: 13,
    fontWeight: "bold",
    marginLeft: 6,
  },

  // --- AddHall Screen Styles ---
  row: {
    flexDirection: "row",
  },
  multilineInput: {
    height: 100,
    textAlignVertical: "top",
  },
  modalOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalCard: {
    width: SCREEN_WIDTH * 0.9,
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 15,
    textAlign: "center",
    fontWeight: "bold",
    color: "#6C4AB6",
  },
  cityItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#EEE",
  },
  cityText: {
    fontSize: 16,
    textAlign: "center",
  },
  pickerText: {
    flex: 1,
    fontSize: 15,
    textAlign: "right",
  },
  locationButton: {
    backgroundColor: "#F8F8FF",
    borderWidth: 1,
    borderColor: "#6C4AB6",
    flexDirection: "row",
    gap: 8,
    height: 48,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  locationText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: 5,
  },
  mediaPickerButton: {
    flex: 1,
    height: 60,
    backgroundColor: "#F3F0FF",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#6C4AB6",
  },
  mediaPreviewContainer: {
    marginTop: 15,
  },
  mediaPreviewItem: {
    position: "relative",
  },
  mediaImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  mediaVideoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: "#F0EBFB",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DCD0F7",
  },
  mediaDeleteButton: {
    position: "absolute",
    left: -5,
    backgroundColor: "#FF5A5A",
    borderRadius: 10,
    padding: 2,
    elevation: 2,
  },
  serviceChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: "#6C4AB6",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  pricingRow: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 10,
  },
  serviceItemCard: {
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F0F0F5",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  mealOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9F9FF",
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E6E6FF",
  },
  secondaryContactCard: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#F9F9FF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E6E6FF",
  },
  toggleButton: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
  },
  borderTopSection: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F5",
    paddingTop: 10,
  },
  secondaryActionButton: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#6C4AB6",
    height: 48,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  formSection: {
    marginTop: 10,
    marginBottom: 15,
  },
  mb10: {
    marginBottom: 10,
  },
  mb20: {
    marginBottom: 20,
  },
  secondarySection: {
    marginTop: 20,
    marginBottom: 10,
  },
  // Muhammad Styles
});
