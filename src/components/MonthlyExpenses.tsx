import { format, parse, startOfMonth, endOfMonth } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
      expenses.map((expense) => format(new Date(expense.date), "yyyy-MM"))
    )
  ).sort().reverse();

  const calculateBalances = (expenses: Expense[], month: string) => {
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
      // Calculate per person share based on total number of people (including payer)
      const totalPeople = expense.sharedWith.length + 1;
      const perPersonShare = expense.amount / totalPeople;
      
      // First subtract what everyone (including the payer) needs to pay
      expense.sharedWith.forEach(person => {
        balances[person].total -= perPersonShare;
        balances[person].items.push(
          `${expense.description} (${format(new Date(expense.date), "dd.MM.yyyy")})`
        );
      });
      
      // Then add the full amount to what the payer paid, and subtract their share
      balances[expense.paidBy].total += expense.amount - perPersonShare;
    });

    return balances;
  };

  const formatBalance = (balance: number) => {
    if (balance > 0) {
      return `+${balance.toFixed(2)}₼ geri alacaq`;
    } else if (balance < 0) {
      return `${Math.abs(balance).toFixed(2)}₼ ödəməlidir`;
    }
    return "0.00₼";
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
                {Object.entries(calculateBalances(expenses, month)).map(([person, data]) => (
                  <TableRow key={person}>
                    <TableCell>{person}</TableCell>
                    <TableCell className={data.total >= 0 ? "text-green-500" : "text-red-500"}>
                      {formatBalance(data.total)}
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