import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useAuth } from "../context/AuthContext";
import { COLORS } from "../constants/theme";
import { ROUTES } from "./routes";

import LoginScreen from "../screens/auth/LoginScreen";
import MainDrawerNavigator from "./MainDrawerNavigator";
import AddDocumentScreen from "../screens/documents/AddDocumentScreen";
import DocumentFormScreen from "../screens/documents/DocumentFormScreen";
import DocumentDetailsScreen from "../screens/documents/DocumentDetailsScreen";
import MyDocumentsScreen from "../screens/documents/MyDocumentsScreen";
import FamilyMemberDocumentsScreen from "../screens/family/FamilyMemberDocumentsScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import NotificationsScreen from "../screens/misc/NotificationsScreen";
import SettingsScreen from "../screens/misc/SettingsScreen";
import HelpSupportScreen from "../screens/misc/HelpSupportScreen";
import AboutScreen from "../screens/misc/AboutScreen";
import TestingGuideScreen from "../screens/misc/TestingGuideScreen"; // TEMPORARY: remove with ROUTES.TESTING_GUIDE

const Stack = createNativeStackNavigator();

/**
 * Top-level navigator. Shows the Login screen until AuthContext reports a
 * session, then mounts the main app: the drawer (Dashboard/Family tabs) as
 * the home screen, plus every other screen pushed full-screen above it so
 * "back" always returns to the drawer's last tab.
 */
export default function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Group>
            <Stack.Screen name={ROUTES.DRAWER} component={MainDrawerNavigator} />
            <Stack.Screen name={ROUTES.ADD_DOCUMENT} component={AddDocumentScreen} />
            <Stack.Screen name={ROUTES.DOCUMENT_FORM} component={DocumentFormScreen} />
            <Stack.Screen name={ROUTES.DOCUMENT_DETAILS} component={DocumentDetailsScreen} />
            <Stack.Screen name={ROUTES.MY_DOCUMENTS} component={MyDocumentsScreen} />
            <Stack.Screen name={ROUTES.FAMILY_MEMBER_DOCUMENTS} component={FamilyMemberDocumentsScreen} />
            <Stack.Screen name={ROUTES.PROFILE} component={ProfileScreen} />
            <Stack.Screen name={ROUTES.NOTIFICATIONS} component={NotificationsScreen} />
            <Stack.Screen name={ROUTES.SETTINGS} component={SettingsScreen} />
            <Stack.Screen name={ROUTES.HELP_SUPPORT} component={HelpSupportScreen} />
            <Stack.Screen name={ROUTES.ABOUT} component={AboutScreen} />
            <Stack.Screen name={ROUTES.TESTING_GUIDE} component={TestingGuideScreen} />
          </Stack.Group>
        ) : (
          <Stack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },
});
