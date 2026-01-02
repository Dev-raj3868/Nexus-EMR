'use client'
// Dashboard page with quick actions and statistics
import { useState, useEffect } from "react";
import { Users, CreditCard, FileText, CalendarIcon } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import ChartCard from "@/components/ChartCard";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
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
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Appointment {
  id: string;
  patient_id: string;
  appointment_date: string;
  status: string;
  notes: string | null;
  patients: {
    full_name: string;
    phone: string;
    age: number;
    gender: string;
  } | null;
}

const weeklyAppointmentsData = [
  { day: "M", appointments: 45 },
  { day: "T", appointments: 52 },
  { day: "W", appointments: 38 },
  { day: "Th", appointments: 65 },
  { day: "F", appointments: 55 },
  { day: "ST", appointments: 30 },
  { day: "S", appointments: 25 },
];

const newPatientsData = [
  { day: "M", patients: 12 },
  { day: "T", patients: 15 },
  { day: "W", patients: 10 },
  { day: "Th", patients: 18 },
  { day: "F", patients: 14 },
  { day: "ST", patients: 8 },
  { day: "S", patients: 6 },
];

const testData = [
  { day: "M", tests: 28 },
  { day: "T", tests: 32 },
  { day: "W", tests: 25 },
  { day: "Th", tests: 35 },
  { day: "F", tests: 30 },
  { day: "ST", tests: 18 },
  { day: "S", tests: 15 },
];

const Dashboard = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user, selectedDate]);

  const fetchAppointments = async () => {
    setIsLoading(true);
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from("appointments")
      .select(`
        id,
        patient_id,
        appointment_date,
        status,
        notes,
        patients (
          full_name,
          phone,
          age,
          gender
        )
      `)
      .eq("doctor_id", user?.id)
      .gte("appointment_date", startOfDay.toISOString())
      .lte("appointment_date", endOfDay.toISOString())
      .order("appointment_date", { ascending: true });

    if (!error && data) {
      setAppointments(data);
    }
    setIsLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            onClick={() => window.location.href = '/prescriptions'}
            className="group bg-green-500 p-6 rounded-xl cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 animate-fade-in relative overflow-hidden"
          >
            <h3 className="text-white text-xl font-semibold mb-2 relative z-10">Add Prescription</h3>
            <p className="text-green-100 text-sm mb-4 relative z-10">Create new patient prescription</p>
            <div className="flex justify-center relative z-10 transform group-hover:scale-110 transition-transform duration-300">
              <FileText className="w-16 h-16 text-white" />
            </div>
          </div>
          
          <div 
            onClick={() => window.location.href = '/manage-records'}
            className="group bg-blue-500 p-6 rounded-xl cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 animate-fade-in relative overflow-hidden"
            style={{ animationDelay: '0.1s' }}
          >
            <h3 className="text-white text-xl font-semibold mb-2 relative z-10">Manage Records</h3>
            <p className="text-blue-100 text-sm mb-4 relative z-10">View and Manage Records</p>
            <div className="flex justify-center relative z-10 transform group-hover:scale-110 transition-transform duration-300">
              <CreditCard className="w-16 h-16 text-white" />
            </div>
          </div>
          
          <div 
            onClick={() => window.location.href = '/manage-patients'}
            className="group bg-yellow-500 p-6 rounded-xl cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 animate-fade-in relative overflow-hidden"
            style={{ animationDelay: '0.2s' }}
          >
            <h3 className="text-white text-xl font-semibold mb-2 relative z-10">Manage Patients</h3>
            <p className="text-yellow-100 text-sm mb-4 relative z-10">Add and manage patient information</p>
            <div className="flex justify-center relative z-10 transform group-hover:scale-110 transition-transform duration-300">
              <Users className="w-16 h-16 text-white" />
            </div>
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-foreground font-semibold">
              Today's Appointments / Follow-Ups ({appointments.length})
            </h3>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, "dd/MM/yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-background" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {isLoading ? (
            <p className="text-muted-foreground text-center py-4">Loading...</p>
          ) : appointments.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No appointments for this date</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Queue</TableHead>
                    <TableHead>Patient Name</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((appointment, index) => (
                    <TableRow key={appointment.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>{appointment.patients?.full_name || "N/A"}</TableCell>
                      <TableCell>{appointment.patients?.phone || "N/A"}</TableCell>
                      <TableCell>{appointment.patients?.age || "N/A"}</TableCell>
                      <TableCell>{appointment.patients?.gender || "N/A"}</TableCell>
                      <TableCell>
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs",
                          appointment.status === "completed" && "bg-green-100 text-green-800",
                          appointment.status === "scheduled" && "bg-blue-100 text-blue-800",
                          appointment.status === "cancelled" && "bg-red-100 text-red-800"
                        )}>
                          {appointment.status || "scheduled"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Charts Row 
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartCard title="Weekly Appointments" onViewDetails={() => {}}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyAppointmentsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Bar dataKey="appointments" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="New Patients" onViewDetails={() => {}}>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={newPatientsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="patients"
                  stroke="hsl(var(--secondary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--secondary))", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Test Data" onViewDetails={() => {}}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={testData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Bar dataKey="tests" fill="hsl(var(--chart-green))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Tables Row 
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Doctor's Efficiency">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>DOCTOR</TableHead>
                  <TableHead>NUMBER OF PATIENTS</TableHead>
                  <TableHead>PRESCRIBED TESTS</TableHead>
                  <TableHead>REVENUE GENERATED</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No data available
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </ChartCard> 

          <ChartCard title="Monthly Income Summary">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>TYPE</TableHead>
                  <TableHead>TOTAL INCOME</TableHead>
                  <TableHead>CASH</TableHead>
                  <TableHead>ONLINE</TableHead>
                  <TableHead>REFUND</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No data found
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </ChartCard> 
        </div>*/}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
