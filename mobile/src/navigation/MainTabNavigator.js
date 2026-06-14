import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import CustomTabBar from "./CustomTabBar";
import DashboardScreen from "../screens/dashboard/DashboardScreen";
import FamilyMembersScreen from "../screens/family/FamilyMembersScreen";
import { ROUTES } from "./routes";

const Tab = createBottomTabNavigator();

/**
 * Never rendered — CustomTabBar intercepts taps on ROUTES.ADD_TAB and
 * pushes AddDocument onto the root stack instead of switching tabs.
 */
function AddDocumentPlaceholder() {
  return null;
}

/** Bottom tabs: Dashboard | (+) Add Document | Family. */
export default function MainTabNavigator() {
  return (
    <Tab.Navigator tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tab.Screen name={ROUTES.DASHBOARD} component={DashboardScreen} />
      <Tab.Screen
        name={ROUTES.ADD_TAB}
        component={AddDocumentPlaceholder}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.getParent()?.navigate(ROUTES.ADD_DOCUMENT);
          },
        })}
      />
      <Tab.Screen name={ROUTES.FAMILY} component={FamilyMembersScreen} />
    </Tab.Navigator>
  );
}
