import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    direction: "rtl",
    backgroundColor: "#EEF2F6",
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
    width: 350,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 5,
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
    color: "#ff0000",
    fontSize: 14,
  },

  backButton: {
    alignSelf: "flex-end",
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

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: "auto",
  },

  profile: {
    borderWidth: 1,
    borderColor: "#000",
    height: 50,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
  },

  options: {
    height: 60,
    width: 150,
    marginBottom: 12,
    backgroundColor: "#FAFAFA",
    direction: "ltr",
  },

  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    height: 48,
    width: 310,
    fontSize: 15,
    marginBottom: 12,
    backgroundColor: "#FAFAFA",
    textAlignVertical: "center",
  },
});
