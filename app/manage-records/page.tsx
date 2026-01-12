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
import { useAuth } from "@/hooks/useAuth";
import { Eye, FileText, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { format } from "date-fns";
import axios from "axios";

// --- Interfaces ---

interface PatientSuggestion {
  _id: string;
  patient_id: string;
  patient_name: string;
  phone_number: string;
  age: number;
  gender: string;
}

interface Prescription {
  _id: string;
  prescription_id: string;
  patient_id: string;
  diagnosis_history: string;
  case_history: string;
  general_advice: string;
  prescription_date: string;
  patient_snapshot: {
    name: string;
    phone: string;
    age: number;
    gender: string;
  };
}

const ManageRecords = () => {
  const { user } = useAuth();
  const today = format(new Date(), "yyyy-MM-dd");

  // Search States
  const [searchId, setSearchId] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [searchDate, setSearchDate] = useState(today);

  // UI States
  const [filteredPrescriptions, setFilteredPrescriptions] = useState<Prescription[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Suggestion States
  const [searchSuggestions, setSearchSuggestions] = useState<PatientSuggestion[]>([]);
  const [activeField, setActiveField] = useState<"name" | "phone" | null>(null);

  // Dialog States
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // --- Suggestion Logic ---

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const currentValue = activeField === "name" ? searchName : searchPhone;
      if (currentValue && currentValue.length >= 3) {
        fetchPatientSuggestions();
      } else {
        setSearchSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchName, searchPhone, activeField]);

  const fetchPatientSuggestions = async () => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/doctors/search_patients`, {
        patient_name: searchName,
        phone_number: searchPhone
      }, {
        withCredentials: true,
      });
      console.log("Patient suggestions response:", response.data);
      if (response.data.resSuccess === 1) {
        setSearchSuggestions(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const selectPatient = (patient: PatientSuggestion) => {
    setSearchId(patient.patient_id);
    setSearchName(patient.patient_name);
    setSearchPhone(patient.phone_number);
    setSearchSuggestions([]);
    setActiveField(null);
  };

  // --- Prescription Fetching Logic ---

  const fetchPrescriptions = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/doctors/get_patient_prescriptions`, {
        patient_id: searchId || undefined,
        date: searchDate || undefined,
      }, {
        withCredentials: true,
      });
      console.log("Prescription fetch response:", response.data);
      if (response.data.resSuccess === 1) {
        setFilteredPrescriptions(response.data.data);
        setHasSearched(true);
      } else {
        setFilteredPrescriptions([]);
        setHasSearched(true);
      }
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
      setFilteredPrescriptions([]);
    } finally {
      setIsLoading(false);
      setCurrentPage(1);
    }
  };

  const handleClear = () => {
    setSearchId("");
    setSearchName("");
    setSearchPhone("");
    setSearchDate(today);
    setFilteredPrescriptions([]);
    setHasSearched(false);
  };

  // Pagination Calculations
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
            <Input 
              placeholder="Patient ID" 
              value={searchId} 
              onChange={(e) => setSearchId(e.target.value)} 
            />

            {/* Name Input with Suggestions */}
            <div className="relative">
              <Input 
                placeholder="Patient Name" 
                value={searchName} 
                onFocus={() => setActiveField("name")}
                onBlur={() => setTimeout(() => setActiveField(null), 200)}
                onChange={(e) => setSearchName(e.target.value)} 
              />
              {activeField === "name" && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {searchSuggestions.map((p) => (
                    <button
                      key={p._id}
                      onMouseDown={() => selectPatient(p)}
                      className="w-full px-3 py-2 text-left hover:bg-muted border-b border-border/50 last:border-0"
                    >
                      <div className="font-medium text-sm">{p.patient_name}</div>
                      <div className="text-xs text-muted-foreground">{p.phone_number} • {p.age}yrs</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Phone Input with Suggestions */}
            <div className="relative">
              <Input 
                placeholder="Phone Number" 
                value={searchPhone} 
                onFocus={() => setActiveField("phone")}
                onBlur={() => setTimeout(() => setActiveField(null), 200)}
                onChange={(e) => setSearchPhone(e.target.value)} 
              />
              {activeField === "phone" && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {searchSuggestions.map((p) => (
                    <button
                      key={p._id}
                      onMouseDown={() => selectPatient(p)}
                      className="w-full px-3 py-2 text-left hover:bg-muted border-b border-border/50 last:border-0"
                    >
                      <div className="font-medium text-sm">{p.patient_name}</div>
                      <div className="text-xs text-muted-foreground">{p.phone_number}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Input type="date" value={searchDate} onChange={(e) => setSearchDate(e.target.value)} />

            <div className="flex gap-2">
              <Button onClick={fetchPrescriptions} className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
              </Button>
              <Button variant="outline" onClick={handleClear} className="w-full">Clear</Button>
            </div>
          </div>

          {!hasSearched ? (
            <p className="text-center py-10 text-muted-foreground">Please search to view prescription records</p>
          ) : (
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
                      <TableRow key={p._id}>
                        <TableCell className="font-mono text-xs">{p.prescription_id}</TableCell>
                        <TableCell>{p.patient_snapshot.name}</TableCell>
                        <TableCell>{p.patient_snapshot.phone}</TableCell>
                        <TableCell>{format(new Date(p.prescription_date), "dd/MM/yyyy")}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" onClick={() => { setSelectedPrescription(p); setIsDialogOpen(true); }}>
                            <Eye className="h-4 w-4 mr-1" /> View
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
              <Button size="sm" variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="flex items-center px-2 text-sm font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <Button size="sm" variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Prescription Details - {selectedPrescription?.prescription_id}</DialogTitle>
          </DialogHeader>

          {selectedPrescription && (
            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm border-b pb-4">
                <div>
                  <p className="text-muted-foreground text-xs uppercase font-bold">Patient</p>
                  <p className="text-base font-medium">{selectedPrescription.patient_snapshot.name} ({selectedPrescription.patient_snapshot.age}Y, {selectedPrescription.patient_snapshot.gender})</p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground text-xs uppercase font-bold">Date</p>
                  <p className="text-base font-medium">{format(new Date(selectedPrescription.prescription_date), "dd MMM yyyy, hh:mm a")}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold flex items-center gap-2 mb-2"><FileText className="h-4 w-4" /> Diagnosis History</h4>
                <p className="text-sm bg-muted p-3 rounded-md italic">"{selectedPrescription.diagnosis_history || "No diagnosis recorded."}"</p>
              </div>

              <div>
                <h4 className="text-sm font-bold mb-2">Case History</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{selectedPrescription.case_history}</p>
              </div>

              <div>
                <h4 className="text-sm font-bold mb-2">General Advice</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{selectedPrescription.general_advice}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ManageRecords;