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

    const owedByPerson: Record<string, { total: number; items: string[] }> = {};
    const ROOMMATES = ["Ehed", "Atilla", "Behruz", "Qosqar"];

    ROOMMATES.forEach(person => {
      owedByPerson[person] = { total: 0, items: [] };
    });

    monthlyExpenses.forEach(expense => {
      const shareAmount = expense.amount / expense.sharedWith.length;
      
      expense.sharedWith.forEach(person => {
        if (person !== expense.paidBy) {
          owedByPerson[person].total += shareAmount;
          owedByPerson[person].items.push(expense.description);
        }
      });

      if (expense.paidBy && expense.sharedWith.includes(expense.paidBy)) {
        owedByPerson[expense.paidBy].total -= (expense.amount - shareAmount);
      }
    });

    return owedByPerson;
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
                  <TableHead>Ödəniləcək məbləğ</TableHead>
                  <TableHead>Bölüşdürülmüş məhsullar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(calculateOwed(expenses, month)).map(([person, data]) => (
                  <TableRow key={person}>
                    <TableCell>{person}</TableCell>
                    <TableCell className={data.total > 0 ? "text-red-500" : "text-green-500"}>
                      ₼{Math.abs(data.total).toFixed(2)}
                      {data.total > 0 ? " (borcu var)" : " (alacağı var)"}
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