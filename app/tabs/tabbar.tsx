import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Svg, Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeScreen from './HomeScreen';

// You'll need to install these packages:
// npm install @react-navigation/bottom-tabs react-native-svg react-native-safe-area-context

// Example screen components

const AnalyticsScreen = () => <View style={styles.screen}><Text>Analytics Screen</Text></View>;
const PropertyScreen = () => <View style={styles.screen}><Text>Property Screen</Text></View>;
const ProfileScreen = () => <View style={styles.screen}><Text>Profile Screen</Text></View>;

const Tab = createBottomTabNavigator();

// SVG Icons
const HomeIcon = ({ color }: { color: string }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path 
      d="M12 2.85L3 10.5V21h18V10.5L12 2.85Z" 
      stroke={color} 
      strokeWidth="2" 
      fill={color === '#FFC93C' ? color : 'none'}
    />
  </Svg>
);

const AnalyticsIcon = ({ color }: { color: string }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M6 18V12" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M12 18V6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M18 18V10" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const PropertyIcon = ({ color }: { color: string }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path 
      d="M3 22V8l9-6 9 6v14h-5v-8h-8v8H3z" 
      stroke={color} 
      strokeWidth="1.5" 
      fill="none"
    />
    <Path 
      d="M13 14h2v3h-2v-3z" 
      stroke={color} 
      strokeWidth="1.5" 
      fill="none"
    />
  </Svg>
);

const ProfileIcon = ({ color }: { color: string }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path 
      d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" 
      stroke={color} 
      strokeWidth="2" 
    />
    <Path 
      d="M20 19C20 19.5523 19.5523 20 19 20H5C4.44772 20 4 19.5523 4 19C4 15.134 7.58172 12 12 12C16.4183 12 20 15.134 20 19Z" 
      stroke={color} 
      strokeWidth="2" 
    />
  </Svg>
);

// Custom Tab Bar
function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[
      styles.tabBarContainer, 
      { paddingBottom: insets.bottom > 0 ? insets.bottom : 10 }
    ]}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel || options.title || route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        // Icon color based on focus state
        const color = isFocused ? '#FFC93C' : '#FFFFFF';
        
        // Render different icons based on route name
        let icon;
        switch (route.name) {
          case 'Home':
            icon = <HomeIcon color={color} />;
            break;
          case 'Analytics':
            icon = <AnalyticsIcon color={color} />;
            break;
          case 'Property':
            icon = <PropertyIcon color={color} />;
            break;
          case 'Profile':
            icon = <ProfileIcon color={color} />;
            break;
          default:
            icon = null;
        }

        return (
          <TouchableOpacity
            key={index}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            style={styles.tabButton}
          >
            <View style={[
              styles.iconContainer,
              isFocused && styles.focusedIconContainer
            ]}>
              {icon}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      <Tab.Screen name="Property" component={PropertyScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: '#1A1033',
    borderTopWidth: 0,
    paddingTop: 10,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 48,
    width: 48,
    borderRadius: 24,
  },
  focusedIconContainer: {
    backgroundColor: 'rgba(255, 201, 60, 0.1)',
  },
});