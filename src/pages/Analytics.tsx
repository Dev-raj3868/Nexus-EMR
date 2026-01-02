import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ChartCard from "@/components/ChartCard";
import StatCard from "@/components/StatCard";
import { BarChart3, Users, FileText, CreditCard, TrendingUp, Activity, Filter } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Analytics = () => {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState("this-month");
  const [filterBy, setFilterBy] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { data: patients = [] } = useQuery({
    queryKey: ["patients-analytics", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("doctor_id", user?.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: prescriptions = [] } = useQuery({
    queryKey: ["prescriptions-analytics", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prescriptions")
        .select("*")
        .eq("doctor_id", user?.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ["invoices-analytics", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("doctor_id", user?.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const totalRevenue = invoices
    .filter((inv) => inv.payment_status === "paid")
    .reduce((sum, inv) => sum + Number(inv.amount), 0);

  const pendingRevenue = invoices
    .filter((inv) => inv.payment_status === "pending")
    .reduce((sum, inv) => sum + Number(inv.amount), 0);

  const patientGrowthData = [
    { name: "Jan", value: Math.floor(patients.length * 0.2) },
    { name: "Feb", value: Math.floor(patients.length * 0.3) },
    { name: "Mar", value: Math.floor(patients.length * 0.5) },
    { name: "Apr", value: Math.floor(patients.length * 0.6) },
    { name: "May", value: Math.floor(patients.length * 0.8) },
    { name: "Jun", value: patients.length },
  ];

  const revenueData = [
    { name: "Jan", value: Math.floor(totalRevenue * 0.1) },
    { name: "Feb", value: Math.floor(totalRevenue * 0.2) },
    { name: "Mar", value: Math.floor(totalRevenue * 0.4) },
    { name: "Apr", value: Math.floor(totalRevenue * 0.6) },
    { name: "May", value: Math.floor(totalRevenue * 0.8) },
    { name: "Jun", value: totalRevenue },
  ];

  const genderDistribution = [
    { name: "Male", value: patients.filter((p) => p.gender === "male").length },
    { name: "Female", value: patients.filter((p) => p.gender === "female").length },
    { name: "Other", value: patients.filter((p) => p.gender === "other").length },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl">
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
              <p className="text-muted-foreground">Track your clinic performance</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>

        {showFilters && (
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-primary mb-4">
                <Filter className="h-5 w-5" />
                <span className="font-semibold">Filters</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Date Range</Label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="this-week">This Week</SelectItem>
                      <SelectItem value="this-month">This Month</SelectItem>
                      <SelectItem value="this-year">This Year</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Filter By</Label>
                  <Select value={filterBy} onValueChange={setFilterBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="patients">Patients</SelectItem>
                      <SelectItem value="prescriptions">Prescriptions</SelectItem>
                      <SelectItem value="revenue">Revenue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">From Date</Label>
                  <Input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">To Date</Label>
                  <Input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                  <Filter className="h-4 w-4" />
                  Apply Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Patients"
            value={patients.length.toString()}
            icon={Users}
            trend="+12% this month"
            trendUp={true}
          />
          <StatCard
            title="Prescriptions"
            value={prescriptions.length.toString()}
            icon={FileText}
            trend="+8% this month"
            trendUp={true}
          />
          <StatCard
            title="Total Revenue"
            value={`₹${totalRevenue.toLocaleString()}`}
            icon={CreditCard}
            trend="+15% this month"
            trendUp={true}
          />
          <StatCard
            title="Pending Amount"
            value={`₹${pendingRevenue.toLocaleString()}`}
            icon={TrendingUp}
            trend="-5% this month"
            trendUp={false}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Patient Growth">
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="space-y-2">
                {patientGrowthData.map((item) => (
                  <div key={item.name} className="flex items-center gap-4">
                    <span className="w-12 text-sm">{item.name}</span>
                    <div className="w-48 h-4 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${patients.length > 0 ? (item.value / patients.length) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>
          <ChartCard title="Revenue Trend">
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="space-y-2">
                {revenueData.map((item) => (
                  <div key={item.name} className="flex items-center gap-4">
                    <span className="w-12 text-sm">{item.name}</span>
                    <div className="w-48 h-4 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${totalRevenue > 0 ? (item.value / totalRevenue) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">₹{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Gender Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {genderDistribution.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <span className="text-muted-foreground">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{
                            width: `${patients.length > 0 ? (item.value / patients.length) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Payment Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Paid</span>
                  <span className="font-medium text-green-600">
                    {invoices.filter((i) => i.payment_status === "paid").length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Pending</span>
                  <span className="font-medium text-yellow-600">
                    {invoices.filter((i) => i.payment_status === "pending").length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Overdue</span>
                  <span className="font-medium text-red-600">
                    {invoices.filter((i) => i.payment_status === "overdue").length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {patients.length} patients registered
                </p>
                <p className="text-sm text-muted-foreground">
                  {prescriptions.length} prescriptions created
                </p>
                <p className="text-sm text-muted-foreground">
                  {invoices.length} invoices generated
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
