import { useState, useEffect } from "react";
import { ExpenseForm } from "@/components/ExpenseForm";
import { ExpenseList } from "@/components/ExpenseList";
import { DashboardStats } from "@/components/DashboardStats";

interface Expense {
  amount: number;
  description: string;
  category: string;
  paidBy: string;
  date: string;
  image?: string | null;
}

const Index = () => {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const savedExpenses = localStorage.getItem("expenses");
    return savedExpenses ? JSON.parse(savedExpenses) : [];
  });

  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  const handleAddExpense = (expense: Expense) => {
    setExpenses([expense, ...expenses]);
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