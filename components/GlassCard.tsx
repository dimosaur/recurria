import { BlurView } from "expo-blur";
import { FC, ReactNode } from "react";
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from "react-native";

type GlassCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  innerStyle?: StyleProp<ViewStyle>;
};

export const GlassCard: FC<GlassCardProps> = ({
  children,
  style,
  innerStyle,
}) => {
  return (
    <BlurView
      tint="dark"
      intensity={40}
      style={[styles.glassCard, style]}
      experimentalBlurMethod="dimezisBlurView"
    >
      <View style={[styles.glassInner, innerStyle]}>{children}</View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  glassCard: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.06)",
    backgroundColor: "rgba(20,20,22,0.6)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 12 },
        shadowRadius: 24,
      },
      android: {
        elevation: 8,
      },
      default: {},
    }),
  },
  glassInner: {
    padding: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
});
