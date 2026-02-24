import { createNavigationContainerRef } from "@react-navigation/native";

export const navigationRef = createNavigationContainerRef();

export function NavigateTo(screenName: string, params?: Record<string, any>) {
  if (navigationRef.isReady())
    (navigationRef.navigate as any)(screenName as never, params as never);
}
export function goBack() {
  if (navigationRef.isReady() && navigationRef.canGoBack())
    navigationRef.goBack();
}
export function NavigateAndReset(screenName: string) {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{ name: screenName as never }],
    });
  }
}
