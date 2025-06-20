import Colors from '@/constants/Colors';
import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type React from 'react';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof Feather>['name'];
  color: string;
  size?: number;
}) {
  const { name, color, size = 24 } = props;
  return <Feather name={name} size={size} color={color} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          {
            backgroundColor: Colors.light.background,
            borderTopColor: '#e5e7eb',
          },
        ],
        tabBarActiveTintColor: Colors.light.tint,
        tabBarInactiveTintColor: '#6b7280',
        tabBarLabelStyle: {
          fontSize: 12,
        },
        freezeOnBlur: true,
        animation: 'shift',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'ホーム',
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="diary"
        options={{
          title: '日記',
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="edit" color={color} />,
        }}
      />
      <Tabs.Screen
        name="stock"
        options={{
          title: 'ストック',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="archive" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="media"
        options={{
          title: 'メディア',
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="image" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '設定',
          headerShown: true,
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="settings" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
