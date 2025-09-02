import GlassCard from "@/components/GlassCard";
import { getCategoryMeta } from "@/lib/categories";
import type { RecurringExpense } from "@/lib/db";
import { currency } from "@/lib/format";
import { useExpensesQuery, useUpdateExpenseMutation } from "@/lib/queries";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";
import { useEffect, useMemo, useRef } from "react";
import {
  ActivityIndicator,
  InteractionManager,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Swipeable, {
  type SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";

const ACTION_WIDTH = 80;

export default function Subscriptions() {
  const navigation = useNavigation();
  const router = useRouter();
  const { data: expenses = [], isLoading } = useExpensesQuery();
  const { mutate: updateExpense } = useUpdateExpenseMutation();

  const sorted = useMemo(() => {
    return [...expenses].sort((a, b) => a.name.localeCompare(b.name));
  }, [expenses]);

  useEffect(() => {
    navigation.setOptions({
      tabBarStyle: undefined,
    });
  }, [navigation]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.centerWrap}>
          <ActivityIndicator color="#fff" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, styles.maxWidth]}>
          <Text style={styles.title}>Subscriptions</Text>
          <Text style={styles.subtitle}>{sorted.length} total</Text>
        </View>

        {sorted.length === 0 ? (
          <EmptyState />
        ) : (
          <View style={[styles.list, styles.maxWidth]}>
            {sorted.map((item) => (
              <SubscriptionSwipeRow
                key={item.id}
                item={item}
                onPauseToggle={() =>
                  {
                    console.log("Subscriptions pause");
                    return updateExpense({
                      id: item.id!,
                      update: { paused: !item.paused },
                    });
                  }
                }
                onEdit={() => {
                  router.push({ pathname: "/subscription", params: { id: String(item.id) } });
                }}
              />
            ))}
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      <Pressable
        style={styles.fab}
        onPress={() => router.push("/subscription")}
      >
        <Ionicons name="add" size={22} color="#fff" />
        <Text style={styles.fabText}>Add</Text>
      </Pressable>
    </View>
  );
}

function EmptyState() {
  return (
    <View style={styles.emptyWrap}>
      <View style={styles.emptyIconWrap}>
        <Ionicons name="card-outline" size={22} color="#9BA1A6" />
      </View>
      <Text style={styles.emptyTitle}>No subscriptions yet</Text>
      <Text style={styles.emptySub}>Tap Add to create your first one.</Text>
    </View>
  );
}

function SubscriptionSwipeRow({
  item,
  onPauseToggle,
  onEdit,
}: {
  item: RecurringExpense;
  onPauseToggle: () => void;
  onEdit: () => void;
}) {
  const { icon, bg } = getCategoryMeta(item.category);
  const swipeRef = useRef<SwipeableMethods | null>(null);
  const pendingActionRef = useRef<"edit" | "pause" | null>(null);
  const closingRef = useRef(false);
  const rowScale = useSharedValue(1);
  const rowAnimatedStyle = useAnimatedStyle(() => {
    return { transform: [{ scale: rowScale.value }] };
  });

  return (
    <Swipeable
      ref={swipeRef}
      friction={2.5}
      overshootLeft={false}
      overshootRight={false}
      animationOptions={{
        damping: 16,
        stiffness: 240,
        mass: 0.9,
        type: "spring",
      }}
      leftThreshold={ACTION_WIDTH}
      rightThreshold={ACTION_WIDTH}
      renderLeftActions={() => <SwipeLeftAction paused={!!item.paused} />}
      renderRightActions={() => <SwipeRightAction />}
      onSwipeableWillOpen={(direction) => {
        pendingActionRef.current = direction === "right" ? "pause" : "edit";
        closingRef.current = true;
        swipeRef.current?.close();
      }}
      onSwipeableClose={() => {
        if (!closingRef.current || !pendingActionRef.current) return;
        InteractionManager.runAfterInteractions(() => {
          requestAnimationFrame(() => {
            if (pendingActionRef.current === "pause") {
              onPauseToggle();
            } else {
              onEdit();
            }
            pendingActionRef.current = null;
            closingRef.current = false;
          });
        });
      }}
    >
      <Animated.View style={rowAnimatedStyle}>
        <GlassCard style={styles.listItem}>
          <View style={styles.itemLeft}>
            <View style={[styles.itemIcon, { backgroundColor: bg }]}>
              <Ionicons name={icon} size={16} color="#fff" />
            </View>
            <View style={styles.itemTextWrap}>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.itemSub} numberOfLines={1}>
                {item.cadence[0].toUpperCase() + item.cadence.slice(1)}
                {item.paused ? " • Paused" : ""}
              </Text>
            </View>
          </View>
          <View style={styles.itemRight}>
            <Text style={styles.itemAmount}>
              {currency.format(item.amount)}
            </Text>
          </View>
        </GlassCard>
      </Animated.View>
    </Swipeable>
  );
}

function SwipeLeftAction({ paused }: { paused: boolean }) {
  return (
    <View
      style={[
        styles.swipeAction,
        styles.swipeLeft,
        { width: "100%" },
        paused ? styles.resumeBg : styles.pauseBg,
      ]}
    >
      <Ionicons name={paused ? "play" : "pause"} size={16} color="#000" />
      <Text style={styles.swipeText}>{paused ? "Resume" : "Pause"}</Text>
    </View>
  );
}

function SwipeRightAction() {
  return (
    <View
      style={[styles.swipeAction, styles.swipeRight, { width: '100%' }]}
    >
      <Text style={styles.swipeText}>Edit</Text>
      <Ionicons name="create-outline" size={16} color="#000" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  contentContainer: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  maxWidth: {
    width: "100%",
    alignSelf: "center",
    maxWidth: 780,
  },
  centerWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    marginBottom: 12,
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 2,
    color: "#9BA1A6",
  },
  list: {
    gap: 10,
  },
  listItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  itemIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  itemTextWrap: {
    flex: 1,
  },
  itemName: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  itemSub: {
    color: "#9BA1A6",
    fontSize: 12,
    marginTop: 2,
  },
  itemRight: {
    alignItems: "flex-end",
    gap: 8,
  },
  itemAmount: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  iconBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.06)",
    borderWidth: StyleSheet.hairlineWidth,
  },
  iconBtnDestructive: {
    backgroundColor: "rgba(255,69,58,0.08)",
    borderColor: "rgba(255,69,58,0.2)",
  },
  emptyWrap: {
    paddingTop: 64,
    alignItems: "center",
  },
  emptyIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.06)",
    borderWidth: StyleSheet.hairlineWidth,
  },
  emptyTitle: {
    marginTop: 14,
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  emptySub: {
    marginTop: 6,
    color: "#9BA1A6",
  },
  fab: {
    position: "absolute",
    right: 18,
    bottom: 92,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderColor: "rgba(255,255,255,0.12)",
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 999,
  },
  fabText: {
    color: "#fff",
    fontWeight: "700",
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  // Swipe actions
  swipeAction: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginVertical: 2,
    borderRadius: 12,
  },
  swipeLeft: {
    justifyContent: "flex-start",
  },
  swipeRight: {
    justifyContent: "flex-end",
    backgroundColor: "#FFD60A",
  },
  pauseBg: {
    backgroundColor: "#FF9F0A",
  },
  resumeBg: {
    backgroundColor: "#30D158",
  },
  swipeText: {
    marginLeft: 8,
    marginRight: 8,
    color: "#000",
    fontWeight: "700",
  },
});
