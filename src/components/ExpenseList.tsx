import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";

interface Expense {
  amount: number;
  description: string;
  category: string;
  paidBy: string;
  date: string;
  image?: string | null;
}

export const ExpenseList = ({ expenses }: { expenses: Expense[] }) => {
  const isMobile = useIsMobile();

  return (
    <div className="rounded-lg border bg-white overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">Məbləğ</TableHead>
            <TableHead className="whitespace-nowrap">Təsvir</TableHead>
            <TableHead className="whitespace-nowrap">Kateqoriya</TableHead>
            <TableHead className="whitespace-nowrap">Ödəyən</TableHead>
            <TableHead className="whitespace-nowrap">Tarix</TableHead>
            <TableHead className="whitespace-nowrap">Qəbz</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium whitespace-nowrap">
                ₼{expense.amount.toFixed(2)}
              </TableCell>
              <TableCell className="max-w-[200px] truncate">
                {expense.description}
              </TableCell>
              <TableCell className="whitespace-nowrap">{expense.category}</TableCell>
              <TableCell className="whitespace-nowrap">{expense.paidBy}</TableCell>
              <TableCell className="whitespace-nowrap">
                {format(new Date(expense.date), "dd.MM.yyyy HH:mm")}
              </TableCell>
              <TableCell>
                {expense.image && (
                  <Dialog>
                    <DialogTrigger>
                      <img
                        src={expense.image}
                        alt="Qəbz"
                        className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                      />
                    </DialogTrigger>
                    <DialogContent className="max-w-[90vw] max-h-[90vh] p-0">
                      <img
                        src={expense.image}
                        alt="Qəbz"
                        className="w-full h-full object-contain"
                      />
                    </DialogContent>
                  </Dialog>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};