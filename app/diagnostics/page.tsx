"use client";
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Check, FlaskConical, Edit } from "lucide-react";
import { toast } from "sonner";

interface DiagnosticTest {
  id: string;
  testName: string;
  instructions: string;
}

const Diagnostics = () => {
  const [tests, setTests] = useState<DiagnosticTest[]>([]);
  const [newTest, setNewTest] = useState<Omit<DiagnosticTest, "id">>({
    testName: "",
    instructions: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAddTest = () => {
    if (!newTest.testName) {
      toast.error("Please enter test name");
      return;
    }
    const test: DiagnosticTest = {
      id: crypto.randomUUID(),
      ...newTest,
    };
    setTests([...tests, test]);
    setNewTest({ testName: "", instructions: "" });
    toast.success("Test added to list");
  };

  const handleDeleteTest = (id: string) => {
    setTests(tests.filter((t) => t.id !== id));
    toast.success("Test removed");
  };

  const handleSaveTest = (id: string) => {
    setEditingId(null);
    toast.success("Test saved successfully");
  };

  const handleEditTest = (id: string) => {
    setEditingId(id);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <FlaskConical className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Diagnostics</h1>
            <p className="text-muted-foreground">Manage diagnostic tests</p>
          </div>
        </div>

        <Card className="border-primary/20 shadow-lg">
          <CardHeader className="bg-primary/80 text-primary-foreground rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Diagnostic Tests</CardTitle>
              <Button
                onClick={handleAddTest}
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
              <div className="grid grid-cols-3 gap-4 items-end">
                <div>
                  <Label className="text-sm text-muted-foreground">Test Name</Label>
                  <Input
                    placeholder="Enter test name"
                    value={newTest.testName}
                    onChange={(e) =>
                      setNewTest({ ...newTest, testName: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Instructions</Label>
                  <Input
                    placeholder="Enter instructions"
                    value={newTest.instructions}
                    onChange={(e) =>
                      setNewTest({ ...newTest, instructions: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setNewTest({ testName: "", instructions: "" })}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                  <Button onClick={handleAddTest}>
                    <Check className="h-4 w-4 mr-2" />
                    Add Test
                  </Button>
                </div>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test Name</TableHead>
                  <TableHead>Instructions</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                      No diagnostic tests added yet. Use the form above to add tests.
                    </TableCell>
                  </TableRow>
                ) : (
                  tests.map((test) => (
                    <TableRow key={test.id}>
                      <TableCell className="font-medium">{test.testName}</TableCell>
                      <TableCell>{test.instructions}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary hover:text-primary"
                            onClick={() => handleEditTest(test.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteTest(test.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-green-600 hover:text-green-600"
                            onClick={() => handleSaveTest(test.id)}
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

export default Diagnostics;
