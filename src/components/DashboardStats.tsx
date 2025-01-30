import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Expense {
  amount: number;
  paidBy: string;
  sharedWith: string[];
}

interface DashboardStatsProps {
  expenses: Expense[];
}

export const DashboardStats = ({ expenses }: DashboardStatsProps) => {
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  const calculateAverageShare = () => {
    let totalShares = 0;
    expenses.forEach(expense => {
      // Include the payer in the total number of people sharing
      totalShares += (expense.sharedWith.length + 1) * expense.amount;
    });
    return totalExpenses / (totalShares / totalExpenses || 1);
  };

  const paidByPerson = expenses.reduce((acc, expense) => {
    acc[expense.paidBy] = (acc[expense.paidBy] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ümumi Xərclər</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">
            ₼{totalExpenses.toFixed(2)}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Orta Pay</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₼{calculateAverageShare().toFixed(2)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Bu ay</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ₼{totalExpenses.toFixed(2)}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Xərc sayı</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{expenses.length}</div>
        </CardContent>
      </Card>
    </div>
  );
};