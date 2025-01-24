import { formatDistance } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Expense {
  amount: number;
  description: string;
  category: string;
  paidBy: string;
  date: string;
  image?: string | null;
}

export const ExpenseList = ({ expenses }: { expenses: Expense[] }) => {
  return (
    <div className="rounded-lg border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Amount</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Paid By</TableHead>
            <TableHead>When</TableHead>
            <TableHead>Receipt</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">
                ${expense.amount.toFixed(2)}
              </TableCell>
              <TableCell>{expense.description}</TableCell>
              <TableCell>{expense.category}</TableCell>
              <TableCell>{expense.paidBy}</TableCell>
              <TableCell>
                {formatDistance(new Date(expense.date), new Date(), {
                  addSuffix: true,
                })}
              </TableCell>
              <TableCell>
                {expense.image && (
                  <img
                    src={expense.image}
                    alt="Receipt"
                    className="w-16 h-16 object-cover rounded cursor-pointer hover:scale-150 transition-transform"
                  />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};