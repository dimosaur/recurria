import Ionicons from "@expo/vector-icons/Ionicons";
import { ComponentProps, FC } from "react";
import {
  Platform,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { GlassCard } from "./GlassCard";

type InfoTileProps = {
  icon: ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
  sub?: string;
  style?: StyleProp<ViewStyle>;
};

export const InfoTile: FC<InfoTileProps> = ({
  icon,
  label,
  value,
  sub,
  style,
}) => {
  return (
    <GlassCard style={[styles.statTile, style]}>
      <View>
        <View style={styles.statHeaderRow}>
          <View style={styles.statIconWrap}>
            <Ionicons name={icon} size={14} color="#9BA1A6" />
          </View>
          <Text style={styles.statLabel}>{label}</Text>
        </View>
        <Text style={styles.statValue}>{value}</Text>
        {sub ? <Text style={styles.statSub}>{sub}</Text> : null}
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  statTile: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderColor: "rgba(255,255,255,0.06)",
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 14,
  },
  statHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  statIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  statLabel: {
    color: "#9BA1A6",
    fontSize: 12,
  },
  statValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: Platform.select({ ios: "700", android: "700", default: "700" }),
  },
  statSub: {
    color: "#9BA1A6",
    fontSize: 12,
    marginTop: 2,
  },
});
