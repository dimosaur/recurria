import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addExpense,
  deleteExpense,
  listExpenses,
  updateExpense,
  type RecurringExpense,
} from "./db";

export function useExpensesQuery() {
  return useQuery<RecurringExpense[]>({
    queryKey: ["expenses"],
    queryFn: listExpenses,
    staleTime: 60_000,
  });
}

export function useAddExpenseMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: addExpense,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}

export function useUpdateExpenseMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, update }: { id: number; update: Partial<RecurringExpense> }) =>
      updateExpense(id, update),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}

export function useDeleteExpenseMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteExpense(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}


