import { useState, useEffect } from "react";
import { ExpenseForm } from "@/components/ExpenseForm";
import { ExpenseList } from "@/components/ExpenseList";
import { DashboardStats } from "@/components/DashboardStats";
import { collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "@/components/ui/use-toast";

interface Expense {
  amount: number;
  description: string;
  category: string;
  paidBy: string;
  date: string;
  image?: string | null;
}

const Index = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    const q = query(collection(db, "expenses"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const expensesData = querySnapshot.docs.map(doc => doc.data() as Expense);
      setExpenses(expensesData);
    });

    return () => unsubscribe();
  }, []);

  const handleAddExpense = async (expense: Expense) => {
    try {
      await addDoc(collection(db, "expenses"), expense);
      toast({
        title: "Success",
        description: "Expense added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add expense",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">Household Expenses</h1>
        
        <div className="mb-8">
          <DashboardStats expenses={expenses} />
        </div>

        <div className="grid gap-8 md:grid-cols-[400px,1fr]">
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Add New Expense</h2>
            <ExpenseForm onSubmit={handleAddExpense} />
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Expenses</h2>
            <ExpenseList expenses={expenses} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;