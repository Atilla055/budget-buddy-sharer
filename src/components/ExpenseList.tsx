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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface Expense {
  id?: string;
  amount: number;
  description: string;
  category: string;
  paidBy: string;
  date: string;
  image?: string | null;
  sharedWith: string[];
}

interface ExpenseListProps {
  expenses: Expense[];
  onDeleteExpense?: (id: string) => Promise<void>;
  showDeleteButton?: boolean;
}

export const ExpenseList = ({ expenses, onDeleteExpense, showDeleteButton = true }: ExpenseListProps) => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [deletePassword, setDeletePassword] = useState("");
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!id || !onDeleteExpense) return;
    
    if (deletePassword !== "0283") {
      toast({
        title: "Xəta",
        description: "Yanlış şifrə",
        variant: "destructive",
      });
      return;
    }

    try {
      await onDeleteExpense(id);
      setDeletePassword("");
      setExpenseToDelete(null);
      toast({
        title: "Uğurlu",
        description: "Xərc silindi",
      });
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast({
        title: "Xəta",
        description: "Xərci silmək mümkün olmadı",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="rounded-lg border bg-white overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">Məbləğ</TableHead>
            <TableHead className="whitespace-nowrap">Təsvir</TableHead>
            <TableHead className="whitespace-nowrap">Kateqoriya</TableHead>
            <TableHead className="whitespace-nowrap">Ödəyən</TableHead>
            <TableHead className="whitespace-nowrap">Bölüşənlər</TableHead>
            <TableHead className="whitespace-nowrap">Tarix</TableHead>
            <TableHead className="whitespace-nowrap">Qəbz</TableHead>
            {showDeleteButton && <TableHead className="whitespace-nowrap">Sil</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell className="font-medium whitespace-nowrap">
                ₼{expense.amount.toFixed(2)}
                <div className="text-xs text-muted-foreground">
                  (₼{(expense.amount / expense.sharedWith.length).toFixed(2)} hər nəfərə)
                </div>
              </TableCell>
              <TableCell className="max-w-[200px] truncate">
                {expense.description}
              </TableCell>
              <TableCell className="whitespace-nowrap">{expense.category}</TableCell>
              <TableCell className="whitespace-nowrap">{expense.paidBy}</TableCell>
              <TableCell className="whitespace-nowrap">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      {expense.sharedWith.length} nəfər
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{expense.sharedWith.join(", ")}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
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
                      <DialogHeader>
                        <DialogTitle className="sr-only">Qəbz</DialogTitle>
                      </DialogHeader>
                      <img
                        src={expense.image}
                        alt="Qəbz"
                        className="w-full h-full object-contain"
                      />
                    </DialogContent>
                  </Dialog>
                )}
              </TableCell>
              {showDeleteButton && (
                <TableCell>
                  {expenseToDelete === expense.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="password"
                        placeholder="Şifrə"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        className="w-24"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(expense.id!)}
                      >
                        Sil
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setExpenseToDelete(null);
                          setDeletePassword("");
                        }}
                      >
                        Ləğv et
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpenseToDelete(expense.id!)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};