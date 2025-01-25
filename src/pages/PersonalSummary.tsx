import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface PersonSummary {
  name: string;
  totalOwed: number;
  expenses: {
    description: string;
    date: string;
    amount: number;
    sharedWith: string[];
  }[];
}

const PersonalSummary = () => {
  const { data: expenses } = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const querySnapshot = await getDocs(collection(db, "expenses"));
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      }));
    },
  });

  const calculatePersonalSummaries = () => {
    if (!expenses) return [];

    const summaries: Record<string, PersonSummary> = {};
    const people = ["Ehed", "Atilla", "Behruz", "Qosqar"];

    people.forEach(person => {
      summaries[person] = {
        name: person,
        totalOwed: 0,
        expenses: [],
      };
    });

    expenses.forEach((expense: any) => {
      const sharedWith = expense.sharedWith || [];
      const amountPerPerson = expense.amount / sharedWith.length;

      sharedWith.forEach((person: string) => {
        if (summaries[person]) {
          summaries[person].totalOwed += amountPerPerson;
          summaries[person].expenses.push({
            description: expense.description,
            date: expense.date,
            amount: amountPerPerson,
            sharedWith: expense.sharedWith,
          });
        }
      });
    });

    return Object.values(summaries);
  };

  const personalSummaries = calculatePersonalSummaries();

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8 text-foreground">Şəxsi Hesabatlar</h1>
      <div className="grid gap-8 md:grid-cols-2">
        {personalSummaries.map((person) => (
          <Card key={person.name} className="bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground">{person.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <span className="text-2xl font-bold text-primary">₼{person.totalOwed.toFixed(2)}</span>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Məhsul</TableHead>
                    <TableHead>Tarix</TableHead>
                    <TableHead>Məbləğ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {person.expenses.map((expense, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{expense.description}</TableCell>
                      <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                      <TableCell>₼{expense.amount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PersonalSummary;