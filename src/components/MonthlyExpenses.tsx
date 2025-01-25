import { format, parse, startOfMonth, endOfMonth } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Expense {
  amount: number;
  description: string;
  category: string;
  paidBy: string;
  date: string;
  sharedWith: string[];
}

interface MonthlyExpensesProps {
  expenses: Expense[];
}

export const MonthlyExpenses = ({ expenses }: MonthlyExpensesProps) => {
  const months = Array.from(
    new Set(
      expenses.map((expense) =>
        format(new Date(expense.date), "yyyy-MM")
      )
    )
  ).sort().reverse();

  const calculateOwed = (expenses: Expense[], month: string) => {
    const startDate = startOfMonth(parse(month, "yyyy-MM", new Date()));
    const endDate = endOfMonth(parse(month, "yyyy-MM", new Date()));

    const monthlyExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    });

    const balances: Record<string, { total: number; items: string[] }> = {};
    const ROOMMATES = ["Ehed", "Atilla", "Behruz", "Qosqar"];

    ROOMMATES.forEach(person => {
      balances[person] = { total: 0, items: [] };
    });

    monthlyExpenses.forEach(expense => {
      const shareAmount = expense.amount / expense.sharedWith.length;
      
      // Add the full amount to what the payer has paid
      balances[expense.paidBy].total += expense.amount;
      
      // Subtract each person's share from their balance
      expense.sharedWith.forEach(person => {
        balances[person].total -= shareAmount;
        balances[person].items.push(expense.description);
      });
    });

    return balances;
  };

  return (
    <div className="space-y-4">
      {months.map(month => (
        <Card key={month} className="w-full">
          <CardHeader>
            <CardTitle>
              {format(parse(month, "yyyy-MM", new Date()), "MMMM yyyy")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Şəxs</TableHead>
                  <TableHead>Balans</TableHead>
                  <TableHead>Bölüşdürülmüş məhsullar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(calculateOwed(expenses, month)).map(([person, data]) => (
                  <TableRow key={person}>
                    <TableCell>{person}</TableCell>
                    <TableCell className={data.total >= 0 ? "text-green-500" : "text-red-500"}>
                      {data.total >= 0 
                        ? `${data.total.toFixed(2)}₼ geri alacaq` 
                        : `${Math.abs(data.total).toFixed(2)}₼ ödəməlidir`}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {data.items.join(", ")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};