import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { ImagePlus } from "lucide-react";

const CATEGORIES = [
  "Kommunal",
  "Ərzaq",
  "Ev əşyaları",
  "Təmir",
  "Digər",
];

const ROOMMATES = ["Ehed", "Atilla", "Behruz", "Qosqar"];

export const ExpenseForm = ({ onSubmit }: { onSubmit: (expense: any) => void }) => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [sharedWith, setSharedWith] = useState<string[]>([]);
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !category || !paidBy) {
      toast({
        title: "Xəta",
        description: "Bütün sahələri doldurun",
        variant: "destructive",
      });
      return;
    }

    // Get all roommates except the payer for default sharing
    const defaultSharedWith = ROOMMATES.filter(roommate => roommate !== paidBy);
    
    if (sharedWith.length === 0) {
      setSharedWith(defaultSharedWith); // If no one is selected, share with everyone except payer
    }

    onSubmit({
      amount: parseFloat(amount),
      description,
      category,
      paidBy,
      date: new Date().toISOString(),
      image,
      sharedWith: sharedWith.length > 0 ? sharedWith : defaultSharedWith,
    });

    setAmount("");
    setDescription("");
    setCategory("");
    setPaidBy("");
    setImage(null);
    setSharedWith([]);

    toast({
      title: "Uğurlu",
      description: "Xərc uğurla əlavə edildi",
    });
  };

  const toggleRoommate = (roommate: string) => {
    setSharedWith(prev =>
      prev.includes(roommate)
        ? prev.filter(r => r !== roommate)
        : [...prev, roommate]
    );
  };

  // Filter out the payer from the roommates list for sharing
  const availableRoommates = ROOMMATES.filter(roommate => roommate !== paidBy);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-lg shadow">
      <div className="space-y-2">
        <Label htmlFor="amount">Məbləğ</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Təsvir</Label>
        <Input
          id="description"
          placeholder="Bu xərc nə üçün idi?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Kateqoriya</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Kateqoriya seçin" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="paidBy">Ödəyən</Label>
        <Select value={paidBy} onValueChange={(value) => {
          setPaidBy(value);
          setSharedWith([]); // Reset shared with when payer changes
        }}>
          <SelectTrigger>
            <SelectValue placeholder="Kim ödədi?" />
          </SelectTrigger>
          <SelectContent>
            {ROOMMATES.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Kimlər arasında bölünsün?</Label>
        <div className="grid grid-cols-2 gap-2">
          {availableRoommates.map((roommate) => (
            <div key={roommate} className="flex items-center space-x-2">
              <Checkbox
                id={`share-${roommate}`}
                checked={sharedWith.includes(roommate)}
                onCheckedChange={() => toggleRoommate(roommate)}
              />
              <Label htmlFor={`share-${roommate}`}>{roommate}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Qəbz şəkli</Label>
        <div className="flex items-center gap-2">
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById("image")?.click()}
          >
            <ImagePlus className="w-4 h-4 mr-2" />
            Qəbz yüklə
          </Button>
        </div>
        {image && (
          <div className="mt-2">
            <img src={image} alt="Qəbz" className="max-w-xs rounded-lg" />
          </div>
        )}
      </div>

      <Button type="submit" className="w-full">
        Xərc əlavə et
      </Button>
    </form>
  );
};