import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";

import CustomDrawerContent from "./CustomDrawerContent";
import MainTabNavigator from "./MainTabNavigator";
import { ROUTES } from "./routes";

const Drawer = createDrawerNavigator();

/** Side navigation drawer wrapping the bottom-tab navigator. */
export default function MainDrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{ headerShown: false, drawerType: "front", overlayColor: "rgba(17, 25, 46, 0.45)" }}
    >
      <Drawer.Screen name={ROUTES.MAIN_TABS} component={MainTabNavigator} />
    </Drawer.Navigator>
  );
}
