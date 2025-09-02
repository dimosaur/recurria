import { Ionicons } from "@expo/vector-icons";
import type {
  BottomTabBarProps,
  BottomTabNavigationOptions,
} from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { Tabs } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TAB_ICON_SIZE = 24;
const ACTIVE_ICON_COLOR = "#fff";
const INACTIVE_ICON_COLOR = "#9BA1A6";

const getTabBarOptions = (
  tabBarLabel: string,
  icons: {
    focused: keyof typeof Ionicons.glyphMap;
    unfocused: keyof typeof Ionicons.glyphMap;
  }
) => {
  const tabBarIcon: BottomTabNavigationOptions["tabBarIcon"] = ({
    focused,
    color,
    size,
  }) => (
    <Ionicons
      name={focused ? icons.focused : icons.unfocused}
      size={size}
      color={color}
    />
  );

  return { tabBarLabel, tabBarIcon };
};

const TAB_SCREENS = [
  {
    name: "index",
    label: "Overview",
    icons: { focused: "home", unfocused: "home-outline" } as const,
  },
  {
    name: "subscriptions",
    label: "Subscriptions",
    icons: { focused: "card", unfocused: "card-outline" } as const,
  },
  {
    name: "settings",
    label: "Settings",
    icons: { focused: "settings", unfocused: "settings-outline" } as const,
  },
];

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <FloatingTabBar {...props} />}
    >
      {TAB_SCREENS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={getTabBarOptions(tab.label, tab.icons)}
        />
      ))}
    </Tabs>
  );
}

function FloatingTabBar(props: BottomTabBarProps) {
  const { state, descriptors, navigation } = props;
  const insets = useSafeAreaInsets();

  const routes = state.routes;

  const scaleAnims = useRef(routes.map(() => new Animated.Value(0))).current;

  const bottom = Math.max(insets.bottom, 8);

  useEffect(() => {
    routes.forEach((_, index) => {
      const isFocused = state.index === index;
      Animated.spring(scaleAnims[index], {
        toValue: isFocused ? 1 : 0,
        useNativeDriver: true,
        friction: 7,
        tension: 90,
      }).start();
    });
  }, [state.index, routes, scaleAnims]);

  const focusedOptions = descriptors[routes[state.index].key].options;
  const tabBarFlattened = StyleSheet.flatten(focusedOptions?.tabBarStyle) as
    | { display?: string }
    | undefined;
  if (tabBarFlattened?.display === "none") {
    return null;
  }

  return (
    <View
      pointerEvents="box-none"
      style={[styles.root, { paddingBottom: bottom }]}
    >
      <View style={styles.shadowContainer}>
        <BlurView
          tint="dark"
          style={styles.blurContainer}
          experimentalBlurMethod="dimezisBlurView"
        >
          <View style={styles.itemsRow}>
            {routes.map((route, index) => {
              const isFocused = state.index === index;
              const { options } = descriptors[route.key];
              const label = options.tabBarLabel as string;

              const onPress = () => {
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  Haptics.selectionAsync();
                  navigation.navigate(route.name);
                }
              };

              const activeScale = scaleAnims[index].interpolate({
                inputRange: [0, 1],
                outputRange: [0.95, 1.15],
              });

              const activeOpacity = scaleAnims[index].interpolate({
                inputRange: [0, 1],
                outputRange: [0.6, 1],
              });

              return (
                <Pressable
                  key={route.key}
                  onPress={onPress}
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  accessibilityLabel={options.tabBarAccessibilityLabel}
                  style={({ pressed }) => [
                    styles.item,
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Animated.View
                    style={[
                      styles.activeBg,
                      {
                        transform: [{ scale: activeScale }],
                        opacity: isFocused ? 1 : 0,
                      },
                    ]}
                  />
                  <Animated.View
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: activeOpacity,
                    }}
                  >
                    {options.tabBarIcon!({
                      focused: isFocused,
                      color: isFocused
                        ? ACTIVE_ICON_COLOR
                        : INACTIVE_ICON_COLOR,
                      size: TAB_ICON_SIZE,
                    })}
                    <Text
                      style={[
                        styles.label,
                        {
                          color: isFocused
                            ? ACTIVE_ICON_COLOR
                            : INACTIVE_ICON_COLOR,
                        },
                      ]}
                    >
                      {label}
                    </Text>
                  </Animated.View>
                </Pressable>
              );
            })}
          </View>
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
  },
  shadowContainer: {
    width: "92%",
    borderRadius: 28,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 20,
      },
      android: {
        elevation: 12,
      },
      default: {},
    }),
  },
  blurContainer: {
    backgroundColor: "rgba(20,20,22,0.6)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.06)",
  },
  itemsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    borderRadius: 20,
    position: "relative",
  },
  label: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: Platform.select({ ios: "600", android: "500", default: "600" }),
  },
  activeBg: {
    position: "absolute",
    top: 2,
    bottom: 2,
    left: 10,
    right: 10,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
});
