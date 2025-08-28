import { useQuery } from "@tanstack/react-query";
import { listExpenses, type RecurringExpense } from "./db";

export function useExpensesQuery() {
  return useQuery<RecurringExpense[]>({
    queryKey: ["expenses"],
    queryFn: listExpenses,
    staleTime: 60_000,
  });
}


