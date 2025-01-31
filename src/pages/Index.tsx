import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ExpenseForm } from "@/components/ExpenseForm";
import { ExpenseList } from "@/components/ExpenseList";
import { DashboardStats } from "@/components/DashboardStats";
import { MonthlyExpenses } from "@/components/MonthlyExpenses";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { collection, addDoc, onSnapshot, query, orderBy, QueryDocumentSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "@/components/ui/use-toast";

interface Expense {
  amount: number;
  description: string;
  category: string;
  paidBy: string;
  date: string;
  image?: string | null;
  sharedWith: string[];
}

const Index = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [deletePassword, setDeletePassword] = useState("");
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);

  useEffect(() => {
    try {
      const q = query(collection(db, "expenses"), orderBy("date", "desc"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const expensesData = querySnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
          id: doc.id,
          amount: Number(doc.data().amount) || 0,
          description: String(doc.data().description || ""),
          category: String(doc.data().category || ""),
          paidBy: String(doc.data().paidBy || ""),
          date: String(doc.data().date || new Date().toISOString()),
          image: doc.data().image ? String(doc.data().image) : null,
          sharedWith: Array.isArray(doc.data().sharedWith) ? doc.data().sharedWith.map(String) : ["Ehed", "Atilla", "Behruz", "Qosqar"]
        }));
        setExpenses(expensesData);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Error in expenses subscription:", error);
      toast({
        title: "Xəta",
        description: "Xərcləri yükləmək mümkün olmadı",
        variant: "destructive",
      });
    }
  }, []);

  const handleAddExpense = async (expense: Expense) => {
    try {
      const cleanExpense = {
        amount: Number(expense.amount),
        description: String(expense.description),
        category: String(expense.category),
        paidBy: String(expense.paidBy),
        date: new Date().toISOString(),
        image: expense.image ? String(expense.image) : null,
        sharedWith: Array.isArray(expense.sharedWith) ? expense.sharedWith.map(String) : ["Ehed", "Atilla", "Behruz", "Qosqar"]
      };
      
      await addDoc(collection(db, "expenses"), cleanExpense);
      toast({
        title: "Uğurlu",
        description: "Xərc uğurla əlavə edildi",
      });
    } catch (error) {
      console.error("Error adding expense:", error);
      toast({
        title: "Xəta",
        description: "Xərc əlavə etmək mümkün olmadı",
        variant: "destructive",
      });
    }
  };

  const handleDeleteExpense = async () => {
    if (deletePassword !== "0283" || !expenseToDelete) {
      toast({
        title: "Xəta",
        description: "Yanlış şifrə",
        variant: "destructive",
      });
      return;
    }

    try {
      await deleteDoc(doc(db, "expenses", expenseToDelete));
      setExpenseToDelete(null);
      setDeletePassword("");
      toast({
        title: "Uğurlu",
        description: "Xərc silindi",
      });
    } catch (error) {
      toast({
        title: "Xəta",
        description: "Xərci silmək mümkün olmadı",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Ev Xərcləri</h1>
          <Link to="/cards">
            <Button variant="outline" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Kart Məlumatları və Balanslar
            </Button>
          </Link>
        </div>
        
        <div className="mb-8">
          <DashboardStats expenses={expenses} />
        </div>

        <div className="grid gap-8 md:grid-cols-[400px,1fr]">
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Yeni Xərc Əlavə Et</h2>
            <ExpenseForm onSubmit={handleAddExpense} />
          </div>
          
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Son Xərclər</h2>
              <div className="space-y-4">
                {expenses.map((expense: any) => (
                  <div key={expense.id} className="bg-white p-4 rounded-lg shadow-sm border flex justify-between items-center">
                    <div>
                      <div className="font-semibold">{expense.description}</div>
                      <div className="text-sm text-gray-500">
                        Ödəyən: {expense.paidBy} | Məbləğ: {expense.amount}₼
                      </div>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setExpenseToDelete(expense.id)}
                        >
                          Sil
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Xərci silmək üçün şifrəni daxil edin</DialogTitle>
                        </DialogHeader>
                        <Input
                          type="password"
                          placeholder="Şifrə"
                          value={deletePassword}
                          onChange={(e) => setDeletePassword(e.target.value)}
                        />
                        <Button onClick={handleDeleteExpense}>Təsdiqlə</Button>
                      </DialogContent>
                    </Dialog>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Aylıq Hesabat</h2>
              <MonthlyExpenses expenses={expenses} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;