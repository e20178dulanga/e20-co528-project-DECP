import React, { useContext } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { AuthContext } from '../context/AuthContext';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';

import FeedScreen from '../screens/Feed/FeedScreen';
import CreatePostScreen from '../screens/Feed/CreatePostScreen';
import JobsScreen from '../screens/Jobs/JobsScreen';
import EventsScreen from '../screens/Events/EventsScreen';
import MessagesScreen from '../screens/Messages/MessagesScreen';
import ProjectsScreen from '../screens/Projects/ProjectsScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';

const AuthStack = createNativeStackNavigator();
const FeedStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const FeedNavigator = () => (
  <FeedStack.Navigator>
    <FeedStack.Screen name="FeedList" component={FeedScreen} options={{ title: 'Feed' }} />
    <FeedStack.Screen name="CreatePost" component={CreatePostScreen} options={{ title: 'New Post', presentation: 'modal' }} />
  </FeedStack.Navigator>
);

const AuthNavigator = () => (
  <AuthStack.Navigator>
    <AuthStack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
    <AuthStack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
  </AuthStack.Navigator>
);

const tabIcons = {
  Feed: { focused: 'home', unfocused: 'home-outline' },
  Jobs: { focused: 'briefcase', unfocused: 'briefcase-outline' },
  Projects: { focused: 'folder', unfocused: 'folder-outline' },
  Messages: { focused: 'chatbubbles', unfocused: 'chatbubbles-outline' },
  Events: { focused: 'calendar', unfocused: 'calendar-outline' },
  Profile: { focused: 'person', unfocused: 'person-outline' },
};

const MainTabsNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => {
        const icons = tabIcons[route.name] || { focused: 'ellipse', unfocused: 'ellipse-outline' };
        return <Ionicons name={focused ? icons.focused : icons.unfocused} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#003366',
      tabBarInactiveTintColor: '#94a3b8',
      tabBarStyle: {
        backgroundColor: '#fff',
        borderTopColor: '#f1f5f9',
        paddingBottom: 4,
        height: 56,
      },
      tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: '600',
      },
    })}
  >
    <Tab.Screen name="Feed" component={FeedNavigator} />
    <Tab.Screen name="Projects" component={ProjectsScreen} />
    <Tab.Screen name="Messages" component={MessagesScreen} />
    <Tab.Screen name="Jobs" component={JobsScreen} />
    <Tab.Screen name="Events" component={EventsScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

export default function AppNavigator() {
  const { userToken, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {userToken == null ? <AuthNavigator /> : <MainTabsNavigator />}
    </NavigationContainer>
  );
}
