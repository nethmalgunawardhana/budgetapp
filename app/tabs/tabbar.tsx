import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import HomeScreen from './HomeScreen';
import ServicePostsScreen from './servicepostScreen';
import ProfileScreen from './profileScreen';
import AnalyticsScreen from './AnalyticsScreen';




const Tab = createBottomTabNavigator();


function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  

  const getIconName = (routeName: string, isFocused: boolean) => {
    switch (routeName) {
      case 'Home':
        return 'home';
      case 'Analytic':
        return 'chart-bar';
      case 'Service':
        return 'tools';
      case 'Profile':
        return 'account';
      default:
        return 'circle';
    }
  };
  
  return (
    <View style={[
      styles.tabBarContainer, 
      { paddingBottom: insets.bottom > 0 ? insets.bottom : 10 }
    ]}>
      <View style={styles.tabBarInner}>
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
          const iconName = getIconName(route.name, isFocused);
          
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
                <Icon name={iconName} size={24} color={color} />
                {isFocused && <Text style={styles.tabLabel}>{label}</Text>}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
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
      <Tab.Screen name="Analytic" component={AnalyticsScreen} />
      <Tab.Screen name="Service" component={ServicePostsScreen} />
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
    backgroundColor: '#1a1a2e',
    borderTopWidth: 0,
    paddingTop: 0,
    
    
  },
  tabBarInner: {
    flexDirection: 'row',
    borderRadius: 30,
    backgroundColor: 'rgba(30, 20, 60, 0.8)',
    
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
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
    height: 56,
    width: 56,
    borderRadius: 28,
    padding: 8,
  },
  focusedIconContainer: {
    backgroundColor: 'rgba(255, 201, 60, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 201, 60, 0.3)',
  },
  tabLabel: {
    color: '#FFC93C',
    fontSize: 10,
    marginTop: 4,
    fontWeight: '600',
  },
});