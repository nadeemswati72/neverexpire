import { useEffect, useState } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useNavigation } from '@react-navigation/native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { isLoggedIn } from './src/auth'
import { colors } from './src/theme'
import type { RootStackParamList } from './src/navigation'

import LoginScreen from './src/screens/LoginScreen'
import DashboardScreen from './src/screens/DashboardScreen'
import DocumentsScreen from './src/screens/DocumentsScreen'
import DocumentDetailScreen from './src/screens/DocumentDetailScreen'
import AddDocumentScreen from './src/screens/AddDocumentScreen'
import FamilyScreen from './src/screens/FamilyScreen'

const Stack = createNativeStackNavigator<RootStackParamList>()

function LoginScreenWrapper() {
  const nav = useNavigation<any>()
  return <LoginScreen onLogin={() => nav.replace('Dashboard')} />
}

export default function App() {
  const [initialRoute, setInitialRoute] = useState<'Login' | 'Dashboard' | null>(null)

  useEffect(() => {
    isLoggedIn().then(loggedIn => setInitialRoute(loggedIn ? 'Dashboard' : 'Login'))
  }, [])

  if (!initialRoute) return (
    <SafeAreaProvider>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bgStart }}>
        <ActivityIndicator size="large" color={colors.brand} />
      </View>
    </SafeAreaProvider>
  )

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{
            headerStyle: { backgroundColor: 'rgba(221,228,240,0.95)' },
            headerTintColor: colors.textPrimary,
            headerTitleStyle: { fontWeight: '700', fontSize: 16 },
            headerBackTitle: 'Back',
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="Login" component={LoginScreenWrapper} options={{ headerShown: false }} />
          <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Documents" component={DocumentsScreen} options={{ title: 'Documents' }} />
          <Stack.Screen name="DocumentDetail" component={DocumentDetailScreen} options={{ title: 'Document' }} />
          <Stack.Screen name="AddDocument" component={AddDocumentScreen} options={{ title: 'Add Document' }} />
          <Stack.Screen name="Family" component={FamilyScreen} options={{ title: 'Family' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  )
}
