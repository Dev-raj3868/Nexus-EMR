"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Eye, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";

interface Prescription {
  id: string;
  patient_id: string;
  diagnosis: string;
  medications: string;
  instructions: string | null;
  created_at: string;
  patients: {
    id: string;
    full_name: string;
    phone: string;
  } | null;
}

const ManageRecords = () => {
  const { user } = useAuth();

  const today = format(new Date(), "yyyy-MM-dd");

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState<Prescription[]>([]);

  const [searchId, setSearchId] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [searchDate, setSearchDate] = useState(today);

  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (user) fetchPrescriptions();
  }, [user]);

  const fetchPrescriptions = async () => {
    const { data, error } = await supabase
      .from("prescriptions")
      .select(`
        id,
        patient_id,
        diagnosis,
        medications,
        instructions,
        created_at,
        patients (
          id,
          full_name,
          phone
        )
      `)
      .eq("doctor_id", user?.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPrescriptions(data);
    }
  };

  const handleSearch = () => {
    setHasSearched(true);
    setIsLoading(true);

    const filtered = prescriptions.filter((p) => {
      const matchId = !searchId || p.id.toLowerCase().includes(searchId.toLowerCase());

      const matchName = !searchName || p.patients?.full_name.toLowerCase().includes(searchName.toLowerCase());

      const matchPhone = !searchPhone || p.patients?.phone.includes(searchPhone);

      const matchDate = !searchDate || format(new Date(p.created_at), "yyyy-MM-dd") === searchDate;

      return matchId && matchName && matchPhone && matchDate;
    });

    setFilteredPrescriptions(filtered);
    setCurrentPage(1);
    setIsLoading(false);
  };

  const handleClear = () => {
    setSearchId("");
    setSearchName("");
    setSearchPhone("");
    setSearchDate(today);
    setFilteredPrescriptions([]);
    setHasSearched(false);
  };

  const totalPages = Math.ceil(filteredPrescriptions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredPrescriptions.slice(startIndex, startIndex + itemsPerPage);

  return (
    <DashboardLayout>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Manage Prescription Records
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Input placeholder="Prescription ID" value={searchId} onChange={(e) => setSearchId(e.target.value)} />

            <Input placeholder="Patient Name" value={searchName} onChange={(e) => setSearchName(e.target.value)} />

            <Input placeholder="Phone Number" value={searchPhone} onChange={(e) => setSearchPhone(e.target.value)} />

            <Input type="date" value={searchDate} onChange={(e) => setSearchDate(e.target.value)} />

            <div className="flex gap-2">
              <Button onClick={handleSearch} className="w-full">Search</Button>
              <Button variant="outline" onClick={handleClear} className="w-full">Clear</Button>
            </div>
          </div>

          {!hasSearched && (
            <p className="text-center py-10 text-muted-foreground">Please search to view prescription records</p>
          )}

          {hasSearched && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Prescription ID</TableHead>
                    <TableHead>Patient Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6">No records found</TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-mono text-xs">{p.id.slice(0, 8)}...</TableCell>
                        <TableCell>{p.patients?.full_name}</TableCell>
                        <TableCell>{p.patients?.phone}</TableCell>
                        <TableCell>{format(new Date(p.created_at), "dd/MM/yyyy")}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" onClick={() => { setSelectedPrescription(p); setIsDialogOpen(true); }}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-end gap-2 mt-4">
              <Button size="sm" variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>
                <ChevronLeft />
              </Button>
              <Button size="sm" variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}>
                <ChevronRight />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Prescription Details</DialogTitle>
          </DialogHeader>

          {selectedPrescription && (
            <div className="space-y-4">
              <p><b>Date:</b> {format(new Date(selectedPrescription.created_at), "dd/MM/yyyy HH:mm")}</p>
              <p><b>Diagnosis:</b> {selectedPrescription.diagnosis}</p>
              <p><b>Medications:</b> {selectedPrescription.medications}</p>
              {selectedPrescription.instructions && (<p><b>Instructions:</b> {selectedPrescription.instructions}</p>)}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ManageRecords;
