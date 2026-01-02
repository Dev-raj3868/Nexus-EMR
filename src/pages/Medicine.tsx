import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Check, Pill } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface Medicine {
  id: string;
  name: string;
  dose: string;
  type: string;
  timing: string;
  dUnit: string;
  duration: string;
  frequency: string;
  instructions: string;
}

const Medicine = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [newMedicine, setNewMedicine] = useState<Omit<Medicine, "id">>({
    name: "",
    dose: "",
    type: "",
    timing: "",
    dUnit: "",
    duration: "",
    frequency: "",
    instructions: "",
  });

  const handleAddMedicine = () => {
    if (!newMedicine.name) {
      toast.error("Please enter medicine name");
      return;
    }
    const medicine: Medicine = {
      id: crypto.randomUUID(),
      ...newMedicine,
    };
    setMedicines([...medicines, medicine]);
    setNewMedicine({
      name: "",
      dose: "",
      type: "",
      timing: "",
      dUnit: "",
      duration: "",
      frequency: "",
      instructions: "",
    });
    toast.success("Medicine added to list");
  };

  const handleDeleteMedicine = (id: string) => {
    setMedicines(medicines.filter((m) => m.id !== id));
    toast.success("Medicine removed");
  };

  const handleSaveMedicine = (id: string) => {
    toast.success("Medicine saved successfully");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Pill className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Medicine</h1>
            <p className="text-muted-foreground">Manage your medicine inventory</p>
          </div>
        </div>

        <Card className="border-primary/20 shadow-lg">
          <CardHeader className="bg-primary/80 text-primary-foreground rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Current Medicine</CardTitle>
              <Button
                onClick={handleAddMedicine}
                variant="secondary"
                className="bg-secondary/90 hover:bg-secondary text-secondary-foreground"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="bg-primary/10 p-4 border-b">
              <div className="grid grid-cols-9 gap-2 items-end">
                <div>
                  <Label className="text-xs text-muted-foreground">Medicine</Label>
                  <Input
                    placeholder="Name"
                    value={newMedicine.name}
                    onChange={(e) =>
                      setNewMedicine({ ...newMedicine, name: e.target.value })
                    }
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Dose</Label>
                  <Input
                    placeholder="Dose"
                    value={newMedicine.dose}
                    onChange={(e) =>
                      setNewMedicine({ ...newMedicine, dose: e.target.value })
                    }
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Type</Label>
                  <Select
                    value={newMedicine.type}
                    onValueChange={(v) =>
                      setNewMedicine({ ...newMedicine, type: v })
                    }
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tablet">Tablet</SelectItem>
                      <SelectItem value="capsule">Capsule</SelectItem>
                      <SelectItem value="syrup">Syrup</SelectItem>
                      <SelectItem value="injection">Injection</SelectItem>
                      <SelectItem value="cream">Cream</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Timing</Label>
                  <Select
                    value={newMedicine.timing}
                    onValueChange={(v) =>
                      setNewMedicine({ ...newMedicine, timing: v })
                    }
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="before_meal">Before Meal</SelectItem>
                      <SelectItem value="after_meal">After Meal</SelectItem>
                      <SelectItem value="with_meal">With Meal</SelectItem>
                      <SelectItem value="empty_stomach">Empty Stomach</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">D-Unit</Label>
                  <Select
                    value={newMedicine.dUnit}
                    onValueChange={(v) =>
                      setNewMedicine({ ...newMedicine, dUnit: v })
                    }
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mg">mg</SelectItem>
                      <SelectItem value="ml">ml</SelectItem>
                      <SelectItem value="g">g</SelectItem>
                      <SelectItem value="units">Units</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Duration</Label>
                  <Select
                    value={newMedicine.duration}
                    onValueChange={(v) =>
                      setNewMedicine({ ...newMedicine, duration: v })
                    }
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3_days">3 Days</SelectItem>
                      <SelectItem value="5_days">5 Days</SelectItem>
                      <SelectItem value="7_days">7 Days</SelectItem>
                      <SelectItem value="14_days">14 Days</SelectItem>
                      <SelectItem value="30_days">30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Frequency</Label>
                  <Select
                    value={newMedicine.frequency}
                    onValueChange={(v) =>
                      setNewMedicine({ ...newMedicine, frequency: v })
                    }
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once">Once Daily</SelectItem>
                      <SelectItem value="twice">Twice Daily</SelectItem>
                      <SelectItem value="thrice">Thrice Daily</SelectItem>
                      <SelectItem value="sos">SOS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Instructions</Label>
                  <Input
                    placeholder="Instructions"
                    value={newMedicine.instructions}
                    onChange={(e) =>
                      setNewMedicine({ ...newMedicine, instructions: e.target.value })
                    }
                    className="h-8 text-sm"
                  />
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      setNewMedicine({
                        name: "",
                        dose: "",
                        type: "",
                        timing: "",
                        dUnit: "",
                        duration: "",
                        frequency: "",
                        instructions: "",
                      })
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleAddMedicine}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medicine Name</TableHead>
                  <TableHead>Dose</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Instructions</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medicines.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No medicines added yet. Use the form above to add medicines.
                    </TableCell>
                  </TableRow>
                ) : (
                  medicines.map((medicine) => (
                    <TableRow key={medicine.id}>
                      <TableCell className="font-medium">{medicine.name}</TableCell>
                      <TableCell>
                        {medicine.dose} {medicine.dUnit}
                      </TableCell>
                      <TableCell>{medicine.frequency}</TableCell>
                      <TableCell>{medicine.instructions}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteMedicine(medicine.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary hover:text-primary"
                            onClick={() => handleSaveMedicine(medicine.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Medicine;
