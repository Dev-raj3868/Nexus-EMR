import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Search,
  Users,
  ChevronLeft,
  ChevronRight,
  CalendarIcon,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Patient {
  id: string;
  full_name: string;
  phone: string;
  age: number;
  gender: string;
  blood_group: string | null;
  created_at: string;
}

const ManagePatients = () => {
  const { user } = useAuth();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Single date – default TODAY
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const [hasSearched, setHasSearched] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  /* ----------------------------- Fetch Patients ----------------------------- */
  useEffect(() => {
    if (user) fetchPatients();
  }, [user]);

  const fetchPatients = async () => {
    setIsLoading(true);

    const { data } = await supabase
      .from("patients")
      .select("*")
      .eq("doctor_id", user?.id)
      .order("created_at", { ascending: false });

    if (data) setPatients(data);
    setIsLoading(false);
  };

  /* ----------------------------- Search ----------------------------- */
  const handleSearch = () => {
    let filtered = patients;

    // Search by name / phone / id
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.full_name.toLowerCase().includes(term) ||
          p.phone.includes(term) ||
          p.id.toLowerCase().includes(term)
      );
    }

    // ✅ Filter by selected date (same day)
    if (selectedDate) {
      const start = new Date(selectedDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(selectedDate);
      end.setHours(23, 59, 59, 999);

      filtered = filtered.filter((p) => {
        const created = new Date(p.created_at);
        return created >= start && created <= end;
      });
    }

    setFilteredPatients(filtered);
    setCurrentPage(1);
    setHasSearched(true);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedDate(new Date()); // ✅ reset to today
    setFilteredPatients([]);
    setHasSearched(false);
  };

  /* ----------------------------- Pagination ----------------------------- */
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;

  const paginatedData = hasSearched
    ? filteredPatients.slice(startIndex, startIndex + itemsPerPage)
    : [];

  /* -------------------------------- UI -------------------------------- */
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Manage Patients</h1>
          <p className="text-muted-foreground">
            Search patients and view details
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Patient Records
            </CardTitle>
          </CardHeader>

          <CardContent>
            {/* ---------------------------- Search Section ---------------------------- */}
            <div className="mb-6 space-y-4">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                  <Label>Search Patient</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Name, Phone or ID"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* ✅ Single Date Picker */}
                <div>
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-[160px] justify-start")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(selectedDate, "dd/MM/yyyy")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(d) => d && setSelectedDate(d)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>

                <Button variant="outline" onClick={clearFilters}>
                  Clear
                </Button>
              </div>
            </div>

            {/* ------------------------------ Table ------------------------------ */}
            {isLoading ? (
              <p className="text-center py-10 text-muted-foreground">
                Loading...
              </p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Blood Group</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {!hasSearched ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                          Click search to view patient records
                        </TableCell>
                      </TableRow>
                    ) : paginatedData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                          No patients found
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedData.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-mono text-xs">
                            {p.id.slice(0, 8)}...
                          </TableCell>
                          <TableCell>{p.full_name}</TableCell>
                          <TableCell>{p.phone}</TableCell>
                          <TableCell>{p.age}</TableCell>
                          <TableCell>{p.gender}</TableCell>
                          <TableCell>{p.blood_group || "N/A"}</TableCell>
                          <TableCell>
                            {format(new Date(p.created_at), "dd/MM/yyyy")}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* --------------------------- Pagination --------------------------- */}
            {hasSearched && totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {startIndex + 1}–
                  {Math.min(startIndex + itemsPerPage, filteredPatients.length)} of{" "}
                  {filteredPatients.length}
                </p>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <span className="text-sm">
                    Page {currentPage} of {totalPages}
                  </span>

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ManagePatients;
