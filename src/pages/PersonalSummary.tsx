import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useState } from "react";

interface Expense {
  amount: number;
  description: string;
  category: string;
  paidBy: string;
  date: string;
  sharedWith: string[];
}

const ROOMMATES = ["Ehed", "Atilla", "Behruz", "Qosqar"];

const PersonalSummary = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    const q = query(collection(db, "expenses"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const expensesData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          amount: Number(data.amount) || 0,
          description: String(data.description || ""),
          category: String(data.category || ""),
          paidBy: String(data.paidBy || ""),
          date: String(data.date || new Date().toISOString()),
          sharedWith: Array.isArray(data.sharedWith)
            ? data.sharedWith.map(String)
            : ROOMMATES,
        };
      });
      setExpenses(expensesData);
    });

    return () => unsubscribe();
  }, []);

  const calculatePersonalExpenses = (person: string) => {
    return expenses.reduce((acc, expense) => {
      if (expense.sharedWith.includes(person)) {
        const shareAmount = expense.amount / expense.sharedWith.length;
        if (expense.paidBy === person) {
          // If this person paid, they get back others' shares
          acc.paid += expense.amount;
          acc.share += shareAmount;
        } else {
          // If they didn't pay, they owe their share
          acc.share += shareAmount;
        }
        if (expense.sharedWith.includes(person)) {
          acc.items.push({
            description: expense.description,
            date: expense.date,
            amount: shareAmount,
            paidBy: expense.paidBy,
          });
        }
      }
      return acc;
    }, {
      paid: 0,
      share: 0,
      items: [] as Array<{
        description: string;
        date: string;
        amount: number;
        paidBy: string;
      }>,
    });
  };

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">Şəxsi Hesabat</h1>
      <div className="grid gap-8">
        {ROOMMATES.map((person) => {
          const summary = calculatePersonalExpenses(person);
          const balance = summary.paid - summary.share;

          return (
            <Card key={person}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{person}</span>
                  <span className={balance >= 0 ? "text-green-500" : "text-red-500"}>
                    {balance >= 0 
                      ? `${balance.toFixed(2)}₼ geri alacaq` 
                      : `${Math.abs(balance).toFixed(2)}₼ ödəməlidir`}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tarix</TableHead>
                      <TableHead>Məhsul</TableHead>
                      <TableHead>Ödəyən</TableHead>
                      <TableHead>Məbləğ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summary.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {new Date(item.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.paidBy}</TableCell>
                        <TableCell>{item.amount.toFixed(2)}₼</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default PersonalSummary;