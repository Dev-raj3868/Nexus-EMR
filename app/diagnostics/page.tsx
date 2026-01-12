"use client";
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Check, FlaskConical, Edit, Loader2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth"; // Assuming you have an auth hook for doctor info

interface DiagnosticTest {
  id: string;
  testName: string;
  itemGroup: "Radiology" | "Pathology" | "Other";
  subGroup: string;
  baseCost: number;
  description: string;
}

const Diagnostics = () => {
  const { user } = useAuth(); // To get doctor_id and clinic_id
  const [tests, setTests] = useState<DiagnosticTest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newTest, setNewTest] = useState<Omit<DiagnosticTest, "id">>({
    testName: "",
    itemGroup: "Pathology",
    subGroup: "",
    baseCost: 0,
    description: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAddTest = () => {
    if (!newTest.testName || !newTest.subGroup || newTest.baseCost <= 0) {
      toast.error("Please fill Name, Sub-group and Base Cost");
      return;
    }
    const test: DiagnosticTest = {
      id: crypto.randomUUID(),
      ...newTest,
    };
    setTests([...tests, test]);
    setNewTest({ testName: "", itemGroup: "Pathology", subGroup: "", baseCost: 0, description: "" });
    toast.success("Test added to local list");
  };

  const handleSaveTest = async (id: string) => {
    const testToSave = tests.find((t) => t.id === id);
    if (!testToSave) return;

    setIsLoading(true);
    try {
      const payload = {
        diagnostics_id: testToSave.id,
        name: testToSave.testName,
        item_group: testToSave.itemGroup,
        sub_group: testToSave.subGroup,
        base_cost: Number(testToSave.baseCost),
        description: testToSave.description,
      };

      console.log("Saving test:", payload);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/services/add_doctor_diagnostic`,
        payload,
        { withCredentials: true }
      );
      console.log("Save response:", response.data);
      if (response.data.apiSuccess === 1) {
        toast.success(`${testToSave.testName} saved to database`);
        setEditingId(null);
      } else {
        toast.error(response.data.message || "Failed to save test");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Server error while saving test");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTest = (id: string) => {
    setTests(tests.filter((t) => t.id !== id));
    toast.success("Removed from list");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <FlaskConical className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Diagnostics Catalog</h1>
            <p className="text-muted-foreground">Define your clinic's test pricing and details</p>
          </div>
        </div>

        <Card className="border-primary/20 shadow-lg">
          <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
            <CardTitle className="text-lg">Add New Diagnostic to Catalog</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div>
                <Label>Test Name</Label>
                <Input
                  placeholder="e.g. CBC"
                  value={newTest.testName}
                  onChange={(e) => setNewTest({ ...newTest, testName: e.target.value })}
                />
              </div>
              <div>
                <Label>Group</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={newTest.itemGroup}
                  onChange={(e) => setNewTest({ ...newTest, itemGroup: e.target.value as any })}
                >
                  <option value="Pathology">Pathology</option>
                  <option value="Radiology">Radiology</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <Label>Sub Group</Label>
                <Input
                  placeholder="e.g. Blood Work"
                  value={newTest.subGroup}
                  onChange={(e) => setNewTest({ ...newTest, subGroup: e.target.value })}
                />
              </div>
              <div>
                <Label>Base Cost (₹)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={newTest.baseCost}
                  onChange={(e) => setNewTest({ ...newTest, baseCost: parseFloat(e.target.value) })}
                />
              </div>
              <div className="lg:col-span-3">
                <Label>Description</Label>
                <Input
                  placeholder="Optional details..."
                  value={newTest.description}
                  onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
                />
              </div>
              <Button onClick={handleAddTest} className="w-full">
                <Plus className="h-4 w-4 mr-2" /> Add to List
              </Button>
            </div>

            <div className="mt-8 border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Name</TableHead>
                    <TableHead>Group</TableHead>
                    <TableHead>Sub-Group</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tests.map((test) => (
                    <TableRow key={test.id}>
                      <TableCell className="font-medium">{test.testName}</TableCell>
                      <TableCell>{test.itemGroup}</TableCell>
                      <TableCell>{test.subGroup}</TableCell>
                      <TableCell>₹{test.baseCost}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-green-600 border-green-200 hover:bg-green-50"
                            onClick={() => handleSaveTest(test.id)}
                            disabled={isLoading}
                          >
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-destructive border-destructive/20 hover:bg-destructive/10"
                            onClick={() => handleDeleteTest(test.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Diagnostics;