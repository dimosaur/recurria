import DuePill from "@/components/DuePill";
import GlassCard from "@/components/GlassCard";
import InfoTile from "@/components/InfoTile";
import { getCategoryMeta } from "@/lib/categories";
import { computeTotals, daysBetween, getNextOccurrence } from "@/lib/date";
import type { Cadence } from "@/lib/db";
import { currency, formatDateShort } from "@/lib/format";
import { useExpensesQuery } from "@/lib/queries";
import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

const CADENCE_LABEL: Record<Cadence, string> = {
  weekly: "Weekly",
  biweekly: "Every 2 weeks",
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
};

export default function Overview() {
  const { data: expenses = [], isLoading } = useExpensesQuery();
  useWindowDimensions();

  const nowDate = new Date();
  const monthShort = nowDate.toLocaleString(undefined, { month: "short" });
  const yearStr = String(nowDate.getFullYear());

  const upcoming = useMemo(() => {
    const items = expenses
      .map((e) => {
        const nextAt = getNextOccurrence(e.startsOn, e.cadence);
        const days = daysBetween(new Date(), nextAt);
        return { ...e, nextAt, days };
      })
      .sort((a, b) => a.nextAt.getTime() - b.nextAt.getTime())
      .slice(0, 10);
    return items;
  }, [expenses]);

  const totals = useMemo(() => computeTotals(expenses), [expenses]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View
          style={[
            styles.contentContainer,
            { flex: 1, justifyContent: "center", alignItems: "center" },
          ]}
        >
          <ActivityIndicator color="#fff" />
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.headerSection, styles.maxWidth]}>
        <View>
          <View style={styles.titleRow}>
            <Text style={styles.titleLine}>Monthly</Text>
            <View style={[styles.monthPill, styles.monthPillCompact]}>
              <Ionicons name="calendar" size={14} color="#9BA1A6" />
              <Text style={styles.monthPillText}>
                {monthShort} {yearStr}
              </Text>
            </View>
          </View>
          <Text style={[styles.headerAmount, styles.headerAmountCompact]}>
            {currency.format(totals.monthly)}
          </Text>
          <View style={styles.tilesRow}>
            <InfoTile
              icon="trending-up"
              label="Yearly projection"
              value={currency.format(totals.yearly)}
            />
            <InfoTile
              icon="time-outline"
              label="Average per week"
              value={currency.format(totals.weekly)}
            />
          </View>
        </View>
      </View>

      <View style={[styles.section, styles.maxWidth]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming</Text>
        </View>

        <View style={styles.list}>
          {upcoming.map((item) => {
            const { icon, bg } = getCategoryMeta(item.category);
            return (
              <GlassCard key={item.id} style={styles.listItem}>
                <View style={styles.itemLeft}>
                  <View style={[styles.itemIcon, { backgroundColor: bg }]}>
                    <Ionicons name={icon} size={16} color="#fff" />
                  </View>
                  <View style={styles.itemTextWrap}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemSub}>{formatDueSub(item)}</Text>
                  </View>
                </View>
                <View style={styles.itemRight}>
                  <Text style={styles.itemAmount}>
                    {currency.format(item.amount)}
                  </Text>
                  <DuePill days={item.days} />
                </View>
              </GlassCard>
            );
          })}
        </View>
      </View>

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

function formatDueSub(item: { cadence: Cadence; nextAt: Date }) {
  const dateStr = formatDateShort(item.nextAt);
  return `${dateStr} • ${CADENCE_LABEL[item.cadence]}`;
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
  headerSection: {
    marginBottom: 18,
  },
  titleRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  titleLine: {
    marginTop: 6,
    color: "#C7CBD1",
    fontSize: 18,
    fontWeight: "600",
  },
  monthPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.06)",
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  monthPillCompact: {
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  monthPillText: {
    color: "#9BA1A6",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  headerAmount: {
    marginTop: 2,
    color: "#fff",
    fontSize: 34,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  headerAmountCompact: {
    fontSize: 30,
  },
  headerAmountNarrow: {
    fontSize: 28,
  },
  headerAmountWide: {
    fontSize: 38,
  },
  tilesRow: {
    marginTop: 14,
    flexDirection: "row",
    gap: 10,
    width: "100%",
    flexWrap: "wrap",
  },
  section: {
    marginTop: 8,
  },
  sectionHeader: {
    marginBottom: 10,
    paddingHorizontal: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
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
    gap: 6,
  },
  itemAmount: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
