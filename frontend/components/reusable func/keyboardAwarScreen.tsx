import { ReactNode } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
type Props = {
  children: ReactNode;
  scrollHeight?: number;
};
export default function KeyboardAwareScreen({
  children,
  scrollHeight = 20,
}: Props) {
  return (
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
      enableOnAndroid={true}
      extraScrollHeight={scrollHeight}
      keyboardOpeningTime={0}
    >
      {children}
    </KeyboardAwareScrollView>
  );
}
