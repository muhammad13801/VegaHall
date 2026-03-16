import { Dimensions, StyleSheet } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const styles = StyleSheet.create({
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },

  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    direction: "rtl",
    backgroundColor: "#F0ECF5",
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
    left: 15,
  },

  forgotPassword: {
    fontSize: 16,
    color: "#6C4AB6",
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

  signUpRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
  },

  signUpText: {
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
    alignSelf: "flex-end",
    padding: 8,
    marginRight: 8,
    marginTop: 4,
  },

  backButtonText: {
    color: "#6C4AB6",
    fontSize: 24,
  },

  resendCode: {
    fontSize: 14,
    color: "#6C4AB6",
    marginBottom: 12,
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

  pickerWrapper: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    backgroundColor: "#FAFAFA",
    overflow: "hidden",
    marginBottom: 12,
    justifyContent: "center",
    height: 50,
  },

  options: {
    width: "100%",
    height: 60,
    direction: "ltr",
  },

  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    height: 50,
    width: "100%",
    fontSize: 15,
    marginBottom: 13,
    backgroundColor: "#FAFAFA",
    textAlignVertical: "center",
    padding: 8,
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
  },

  toast: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    borderLeftWidth: 5,
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

  profileEditIcon: {
    position: "absolute",
    bottom: 5,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 2,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
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
    fontSize: 13,
    color: "#888",
    marginBottom: 2,
  },

  profileValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
});
