import { createNavigationContainerRef } from "@react-navigation/native";

/**
 * Module-level ref so code outside the component tree (notification-tap
 * handlers, deep links) can navigate without prop-drilling.
 */
export const navigationRef = createNavigationContainerRef();

export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}
