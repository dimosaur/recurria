import Chip from "@/components/Chip";
import FormField from "@/components/FormField";
import { getCategoryMeta } from "@/lib/categories";
import type { Cadence, RecurringExpense } from "@/lib/db";
import {
  useAddExpenseMutation,
  useDeleteExpenseMutation,
  useExpensesQuery,
  useUpdateExpenseMutation,
} from "@/lib/queries";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type FormValues = {
  name: string;
  amount: string; // keep as string for input; convert on submit
  cadence: Cadence;
  startsOn: string; // ISO date
  category: string | null;
  paused: boolean;
};

const CADENCE_OPTIONS: Cadence[] = [
  "weekly",
  "biweekly",
  "monthly",
  "quarterly",
  "yearly",
];

const KNOWN_CATEGORIES = [
  "music",
  "storage",
  "video",
  "dev",
  "design",
  "web",
  "cloud",
  "health",
  "productivity",
  "gaming",
  "auto",
] as const;

export default function SubscriptionModalScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const editingId = params.id ? Number(params.id) : undefined;

  const { data: expenses = [] } = useExpensesQuery();
  const initial = useMemo<RecurringExpense | undefined>(() => {
    if (!editingId) return undefined;
    return expenses.find((e) => e.id === editingId);
  }, [editingId, expenses]);

  const { mutateAsync: addExpenseAsync } = useAddExpenseMutation();
  const { mutateAsync: updateExpenseAsync } = useUpdateExpenseMutation();
  const { mutateAsync: deleteExpenseAsync } = useDeleteExpenseMutation();

  const isEditing = !!editingId;
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = useForm<FormValues>({
    mode: "onChange",
    shouldFocusError: true,
    defaultValues: {
      name: initial?.name ?? "",
      amount: initial?.amount != null ? String(initial.amount) : "",
      cadence: initial?.cadence ?? "monthly",
      startsOn: initial?.startsOn ?? new Date().toISOString().slice(0, 10),
      category: initial?.category ?? null,
      paused: !!initial?.paused,
    },
  });

  useEffect(() => {
    reset({
      name: initial?.name ?? "",
      amount: initial?.amount != null ? String(initial.amount) : "",
      cadence: initial?.cadence ?? "monthly",
      startsOn: initial?.startsOn ?? new Date().toISOString().slice(0, 10),
      category: initial?.category ?? null,
      paused: !!initial?.paused,
    });
  }, [initial, reset]);

  const cadence = watch("cadence");
  const category = watch("category");
  const paused = watch("paused");

  const onValid = async (data: FormValues) => {
    const payload = {
      name: data.name.trim(),
      amount: Number(data.amount),
      cadence: data.cadence,
      startsOn: data.startsOn,
      category: data.category ?? null,
      paused: !!data.paused,
    } as Omit<RecurringExpense, "id">;
    try {
      if (isEditing && editingId) {
        await updateExpenseAsync({ id: editingId, update: payload });
      } else {
        await addExpenseAsync({ ...(payload as RecurringExpense) });
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const confirmDelete = () => {
    if (!editingId) return;
    Alert.alert("Delete subscription", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteExpenseAsync(editingId);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.back();
          } catch {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: "padding", android: undefined })}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.headerBtn}>
            <Text style={styles.headerBtnText}>Cancel</Text>
          </Pressable>
          <Text style={styles.headerTitle}>
            {isEditing ? "Edit" : "Add"} subscription
          </Text>
          {isEditing ? (
            <Pressable onPress={confirmDelete} style={styles.headerBtn}>
              <Text style={[styles.headerBtnText, { color: "#FF453A" }]}>
                Delete
              </Text>
            </Pressable>
          ) : (
            <View style={styles.headerBtn} />
          )}
        </View>

        <ScrollView
          contentContainerStyle={styles.form}
          showsVerticalScrollIndicator={false}
        >
          <FormField label="Name" error={errors.name}>
            <Controller
              control={control}
              name="name"
              rules={{ required: "Name is required" }}
              render={({ field: { onChange, value }, fieldState }) => (
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Netflix"
                  placeholderTextColor="#7A7F86"
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="words"
                />
              )}
            />
          </FormField>

          <FormField
            label="Amount"
            error={errors.amount}
            right={<Text style={styles.inputRight}>USD</Text>}
          >
            <Controller
              control={control}
              name="amount"
              rules={{
                required: "Enter a valid amount",
                pattern: {
                  value: /^\d*(?:\.\d{0,2})?$/,
                  message: "Enter a valid amount",
                },
                validate: (v) => {
                  const amt = Number(v);
                  return (!!v && !isNaN(amt) && amt > 0) || "Enter a valid amount";
                },
              }}
              render={({ field: { onChange, value, onBlur } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  placeholderTextColor="#7A7F86"
                  keyboardType="decimal-pad"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
          </FormField>

          <FormField label="Cadence">
            <View style={styles.chipsRow}>
              {CADENCE_OPTIONS.map((c) => (
                <Chip
                  key={c}
                  label={c[0].toUpperCase() + c.slice(1)}
                  selected={cadence === c}
                  onPress={() => setValue("cadence", c, { shouldDirty: true })}
                />
              ))}
            </View>
          </FormField>

          <FormField label="Starts on" error={errors.startsOn}>
            <Controller
              control={control}
              name="startsOn"
              rules={{
                required: "Use YYYY-MM-DD",
                pattern: {
                  value: /^\d{4}-\d{2}-\d{2}$/,
                  message: "Use YYYY-MM-DD",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#7A7F86"
                  autoCorrect={false}
                  keyboardType="numbers-and-punctuation"
                  value={value}
                  onChangeText={onChange}
                  returnKeyType="done"
                />
              )}
            />
          </FormField>

          <FormField label="Category">
            <View style={styles.chipsRow}>
              {KNOWN_CATEGORIES.map((cat) => {
                const selected = category === cat;
                const meta = getCategoryMeta(cat);
                return (
                  <Chip
                    key={cat}
                    label={cat}
                    selected={selected}
                    onPress={() =>
                      setValue("category", selected ? null : cat, {
                        shouldDirty: true,
                      })
                    }
                    iconBg={meta.bg}
                    iconName={meta.icon}
                  />
                );
              })}
            </View>
          </FormField>

          <FormField label="Status">
            <View style={styles.chipsRow}>
              <Chip
                label="Active"
                selected={!paused}
                onPress={() => setValue("paused", false, { shouldDirty: true })}
              />
              <Chip
                label="Paused"
                selected={paused}
                onPress={() => setValue("paused", true, { shouldDirty: true })}
              />
            </View>
          </FormField>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={[styles.footerBtn, styles.cancelBtn]}
            onPress={() => {
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
              );
            }}
          >
            <Text style={styles.footerBtnText}>Test</Text>
          </Pressable>
          <Pressable
            style={[styles.footerBtn, styles.cancelBtn]}
            onPress={() => router.back()}
            disabled={isSubmitting}
          >
            <Text style={styles.footerBtnText}>Cancel</Text>
          </Pressable>
          <Pressable
            style={[
              styles.footerBtn,
              styles.saveBtn,
              (isSubmitting || !isDirty || !isValid) && { opacity: 0.85 },
            ]}
            onPress={handleSubmit(onValid)}
            disabled={isSubmitting || !isDirty || !isValid}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={[styles.footerBtnText, { color: "#000" }]}>
                Save
              </Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    paddingTop: Platform.select({ ios: 4, android: 8, default: 8 }),
    paddingHorizontal: 12,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerBtn: {
    minWidth: 64,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  headerBtnText: {
    color: "#9BA1A6",
    fontWeight: "700",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  form: {
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.06)",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    color: "#fff",
    paddingHorizontal: 12,
    paddingVertical: Platform.select({ ios: 12, android: 8, default: 10 }),
  },
  inputRight: {
    color: "#7A7F86",
    fontSize: 12,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 4,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  footerBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
  },
  cancelBtn: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.10)",
    borderWidth: StyleSheet.hairlineWidth,
  },
  saveBtn: {
    backgroundColor: "#fff",
  },
  footerBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
});
