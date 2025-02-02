import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ExpenseForm } from "@/components/ExpenseForm";
import { ExpenseList } from "@/components/ExpenseList";
import { DashboardStats } from "@/components/DashboardStats";
import { MonthlyExpenses } from "@/components/MonthlyExpenses";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { collection, addDoc, onSnapshot, query, orderBy, QueryDocumentSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "@/components/ui/use-toast";

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

const Index = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);

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

  const handleDeleteExpense = async (id: string) => {
    try {
      await deleteDoc(doc(db, "expenses", id));
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
      throw error; // Re-throw the error to be caught by the ExpenseList component
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold text-gray-900">Ev Xərcləri</h1>
            <Link to="/cards">
              <Button variant="outline" className="gap-2">
                <CreditCard className="h-4 w-4" />
                Kart Məlumatları və Balanslar
              </Button>
            </Link>
          </div>
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
              <ExpenseList 
                expenses={expenses} 
                onDeleteExpense={handleDeleteExpense}
                showDeleteButton={true}
              />
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