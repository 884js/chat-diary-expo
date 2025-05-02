import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type React from 'react';

// カスタムタブバーアイコンコンポーネント
function TabBarIcon(props: {
  name: React.ComponentProps<typeof Feather>['name'];
  color: string;
  size?: number;
}) {
  const { name, color, size = 24 } = props;
  return <Feather name={name} size={size} color={color} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: useClientOnlyValue(false, true),
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopColor: '#e5e7eb',
        },
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: '#6b7280',
        tabBarLabelStyle: {
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'カレンダー',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="calendar" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: '探す',
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="search" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '設定',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="settings" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
