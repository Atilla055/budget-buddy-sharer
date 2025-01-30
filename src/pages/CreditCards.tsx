import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { collection, onSnapshot, query, orderBy, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface CreditCard {
  userId: string;
  cardNumber: string;
}

interface Balance {
  userId: string;
  amount: number;
}

const CreditCards = () => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [creditCards, setCreditCards] = useState<{ [key: string]: string }>({});
  const [newCardNumber, setNewCardNumber] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);
  const ROOMMATES = ["Ehed", "Atilla", "Behruz", "Qosqar"];

  useEffect(() => {
    const q = query(collection(db, "expenses"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const expensesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setExpenses(expensesData);
    });

    const cardsUnsubscribe = onSnapshot(collection(db, "creditCards"), (snapshot) => {
      const cards: { [key: string]: string } = {};
      snapshot.forEach((doc) => {
        cards[doc.data().userId] = doc.data().cardNumber;
      });
      setCreditCards(cards);
    });

    return () => {
      unsubscribe();
      cardsUnsubscribe();
    };
  }, []);

  const calculateBalances = () => {
    const balances: { [key: string]: number } = {};
    ROOMMATES.forEach(person => {
      balances[person] = 0;
    });

    expenses.forEach(expense => {
      const totalPeople = expense.sharedWith.length + 1;
      const perPersonShare = expense.amount / totalPeople;
      
      expense.sharedWith.forEach((person: string) => {
        balances[person] -= perPersonShare;
      });
      
      balances[expense.paidBy] += expense.amount - perPersonShare;
    });

    return balances;
  };

  const handleAddCard = async () => {
    if (!selectedUser || !newCardNumber || newCardNumber.length !== 16) {
      toast({
        title: "Xəta",
        description: "Düzgün kart nömrəsi daxil edin",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateDoc(doc(db, "creditCards", selectedUser), {
        userId: selectedUser,
        cardNumber: newCardNumber,
      });

      setNewCardNumber("");
      setSelectedUser("");
      toast({
        title: "Uğurlu",
        description: "Kart məlumatları əlavə edildi",
      });
    } catch (error) {
      toast({
        title: "Xəta",
        description: "Kart əlavə etmək mümkün olmadı",
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

  const balances = calculateBalances();

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Kart Məlumatları və Balanslar</h1>
        <Link to="/">
          <Button variant="outline">Geri qayıt</Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Kart Əlavə Et</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <select
                className="w-full p-2 border rounded"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="">Şəxs seçin</option>
                {ROOMMATES.map((person) => (
                  <option key={person} value={person}>
                    {person}
                  </option>
                ))}
              </select>
              <Input
                type="text"
                placeholder="Kart nömrəsi (16 rəqəm)"
                value={newCardNumber}
                onChange={(e) => setNewCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))}
                maxLength={16}
              />
              <Button onClick={handleAddCard}>Kart əlavə et</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Balanslar və Kartlar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ROOMMATES.map((person) => (
                <div key={person} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <div className="font-semibold">{person}</div>
                    <div className={balances[person] >= 0 ? "text-green-500" : "text-red-500"}>
                      {balances[person] >= 0
                        ? `+${balances[person].toFixed(2)}₼ geri alacaq`
                        : `${Math.abs(balances[person]).toFixed(2)}₼ ödəməlidir`}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {creditCards[person]
                      ? `**** **** **** ${creditCards[person].slice(-4)}`
                      : "Kart əlavə edilməyib"}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Xərclər</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {expenses.map((expense) => (
              <div key={expense.id} className="flex justify-between items-center p-4 border rounded">
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
        </CardContent>
      </Card>
    </div>
  );
};

export default CreditCards;