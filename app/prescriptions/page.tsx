"use client";
import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Plus, Printer, Search } from "lucide-react";
import PrescriptionPrint from "@/components/PrescriptionPrint";
import { useReactToPrint } from 'react-to-print';
import axios from "axios";

interface Patient {
  id: string;
  patient_id?: string;
  patient_name: string;
  phone_number: string;
  age: number;
  gender: string;
  address?: string;
}

const Prescriptions = () => {
  const { user } = useAuth();
  const printRef = useRef<HTMLDivElement>(null);

  const [showDoctorInfo, setShowDoctorInfo] = useState(false);
  const [showPatientInfo, setShowPatientInfo] = useState(false);
  const [showBottomInfo, setShowBottomInfo] = useState(false);

  const [patientMode, setPatientMode] = useState<'new' | 'existing'>('existing');
  const [phoneSearch, setPhoneSearch] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<Patient[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // New states for Medicine and Test suggestions
  const [medicineSuggestions, setMedicineSuggestions] = useState<any[]>([]);
  const [showMedicineSuggestions, setShowMedicineSuggestions] = useState(false);
  const [testSuggestions, setTestSuggestions] = useState<any[]>([]);
  const [showTestSuggestions, setShowTestSuggestions] = useState(false);

  const [newPatientData, setNewPatientData] = useState({
    patient_name: "",
    phone: "",
    age: "",
    gender: "",
    address: "",
  });

  const [formData, setFormData] = useState({
    patient_id: "",
    patient_name: "",
    phone: "",
    age: 0,
    gender: "",
    complaints: "",
    chronic_diseases: {
      hypertension: false,
      diabetes: false,
      heart_failure: false,
      type2dm: false,
      dyslipidemia: false,
      smoking: false,
      family_history: false,
      asthma: false,
      migraine: false,
      arthritis: false,
    },
    vitals_name: "",
    vitals_result: "",
    diagnosis: "",
    test_name: "",
    test_message: "",
    medicine_name: "",
    dose: "",
    type: "",
    timing: "",
    d_unit: "",
    duration: "",
    frequency: "",
    instructions: "",
    general_advice: "",
    referral: "",
    follow_up: "",
    follow_up_time: "",
    surgery_advice: "",
  });

  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  // --- Search Functions ---

  const searchPatientSuggestions = async (searchValue: string) => {
    setPhoneSearch(searchValue);
    if (!searchValue.trim() || searchValue.trim().length < 3) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/doctors/search_patients`,
        { phone_number: searchValue.trim() },
        { withCredentials: true }
      );
      if (response.data.apiSuccess === 1) {
        setSearchSuggestions(response.data.data);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const searchMedicines = async (value: string) => {
    setFormData({ ...formData, medicine_name: value });
    if (value.trim().length < 2) {
      setMedicineSuggestions([]);
      setShowMedicineSuggestions(false);
      return;
    }
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/services/search_medicine`,
        { search_term: value },
        { withCredentials: true }
      );
      if (response.data.resSuccess === 1) {
        setMedicineSuggestions(response.data.data);
        setShowMedicineSuggestions(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const searchTests = async (value: string) => {
    setFormData({ ...formData, test_name: value });
    if (value.trim().length < 2) {
      setTestSuggestions([]);
      setShowTestSuggestions(false);
      return;
    }
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/services/search_diagnostics`,
        { search_term: value },
        { withCredentials: true }
      );
      if (response.data.resSuccess === 1) {
        setTestSuggestions(response.data.data);
        setShowTestSuggestions(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const selectPatient = (patient: Patient) => {
    setFormData({
      ...formData,
      patient_id: patient.patient_id || "",
      patient_name: patient.patient_name,
      phone: patient.phone_number,
      age: patient.age,
      gender: patient.gender,
    });
    setPhoneSearch(patient.phone_number);
    setShowSuggestions(false);
    toast.success("Patient selected!");
  };

  const addNewPatient = async () => {
    try {
      const query = {
        patient_name: newPatientData.patient_name,
        phone_number: newPatientData.phone,
        age: parseInt(newPatientData.age),
        gender: newPatientData.gender,
      };
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/doctors/create_doctor_patient`,
        query,
        { withCredentials: true }
      );
      if (response.data.apiSuccess === 1) {
        setFormData({ ...formData, patient_id: response.data.data.patient_id });
        toast.success("Patient added successfully!");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeChronicDiseases = Object.entries(formData.chronic_diseases)
      .filter(([_, value]) => value === true)
      .map(([key, _]) => key);

    const query = {
      patient_id: formData.patient_id,
      patient_snapshot: {
        name: formData.patient_name,
        phone: formData.phone,
        age: Number(formData.age),
        gender: formData.gender,
      },
      case_history: formData.complaints,
      chronic_diseases: activeChronicDiseases,
      vitals: formData.vitals_name ? [{ name: formData.vitals_name, result: formData.vitals_result, unit: "" }] : [],
      referral: formData.referral,
      general_advice: formData.general_advice,
      surgery_advice: formData.surgery_advice,
      medicine: formData.medicine_name ? [{
        medicine_name: formData.medicine_name,
        medicine_type: formData.type,
        dose: formData.dose,
        dose_unit: formData.d_unit,
        advice: formData.instructions,
        time: formData.timing,
        duration: formData.duration,
      }] : [],
      diagnosis: formData.test_name ? [{ test_name: formData.test_name, advice: formData.test_message }] : [],
      status: "active",
      follow_up: {
        required: formData.follow_up ? true : false,
        follow_up_date: formData.follow_up || null,
        follow_up_time: formData.follow_up_time || null,
        notes: ""
      },
    };
    console.log("Submitting prescription:", query);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/doctors/create_patient_prescription`,
        query,
        { withCredentials: true }
      );
      console.log("Prescription response:", response.data);
      if (response.data.apiSuccess === 1) {
        toast.success("Prescription created successfully!");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div style={{ display: 'none' }}>
          <div ref={printRef}>
            <PrescriptionPrint prescriptionData={formData} />
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-6 flex-wrap">
              <Button onClick={() => handlePrint()} className="bg-red-500 hover:bg-red-600 text-white">
                <Printer className="mr-2 h-4 w-4" /> Print
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-sm">doctor profile info</span>
                <Switch checked={showDoctorInfo} onCheckedChange={setShowDoctorInfo} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">patient profile info</span>
                <Switch checked={showPatientInfo} onCheckedChange={setShowPatientInfo} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Bottom info</span>
                <Switch checked={showBottomInfo} onCheckedChange={setShowBottomInfo} />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="font-medium text-foreground">Patient Information</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${patientMode === 'new' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>New Patient</span>
                    <Switch checked={patientMode === 'existing'} onCheckedChange={(checked) => setPatientMode(checked ? 'existing' : 'new')} />
                    <span className={`text-sm ${patientMode === 'existing' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>Existing Patient</span>
                  </div>
                </div>

                {patientMode === 'existing' ? (
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="space-y-1 relative">
                      <Label className="text-sm">Phone Number<span className="text-destructive">*</span></Label>
                      <div className="relative">
                        <Input
                          placeholder="Search by phone number..."
                          value={phoneSearch}
                          onChange={(e) => searchPatientSuggestions(e.target.value)}
                          onFocus={() => searchSuggestions.length > 0 && setShowSuggestions(true)}
                          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                          className="border-primary/50 focus:border-primary pr-10"
                        />
                        <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                      {showSuggestions && searchSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-card border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                          {searchSuggestions.map((patient) => (
                            <button key={patient.id} type="button" onMouseDown={() => selectPatient(patient)} className="w-full px-3 py-2 text-left hover:bg-muted transition-colors border-b last:border-0 text-sm">
                              <div className="font-medium">{patient.patient_name}</div>
                              <div className="text-xs text-muted-foreground">{patient.phone_number} • {patient.age}y</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="space-y-1"><Label className="text-sm">Patient Name*</Label><Input value={formData.patient_name} readOnly className="bg-muted/50" /></div>
                    <div className="space-y-1">
                      <Label className="text-sm">Gender*</Label>
                      <Select value={formData.gender} disabled>
                        <SelectTrigger className="bg-muted/50"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1"><Label className="text-sm">Age*</Label><Input value={formData.age || ""} readOnly className="bg-muted/50" /></div>
                    <div className="space-y-1"><Label className="text-sm">Address*</Label><Input value={formData.phone} readOnly className="bg-muted/50" /></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="space-y-1"><Label className="text-sm">Phone Number*</Label><Input value={newPatientData.phone} onChange={(e) => setNewPatientData({ ...newPatientData, phone: e.target.value })} /></div>
                    <div className="space-y-1"><Label className="text-sm">Patient Name*</Label><Input value={newPatientData.patient_name} onChange={(e) => setNewPatientData({ ...newPatientData, patient_name: e.target.value })} /></div>
                    <div className="space-y-1">
                      <Label className="text-sm">Gender*</Label>
                      <Select value={newPatientData.gender} onValueChange={(v) => setNewPatientData({ ...newPatientData, gender: v })}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1"><Label className="text-sm">Age*</Label><Input type="number" value={newPatientData.age} onChange={(e) => setNewPatientData({ ...newPatientData, age: e.target.value })} /></div>
                    <div className="space-y-1"><Label className="text-sm">Address*</Label><Input value={newPatientData.address} onChange={(e) => setNewPatientData({ ...newPatientData, address: e.target.value })} /></div>
                  </div>
                )}
                {patientMode === 'new' && <Button type="button" onClick={addNewPatient} variant="outline" size="sm">Save Patient</Button>}
              </div>

              <div className="space-y-2">
                <Label>Complaints</Label>
                <Textarea value={formData.complaints} onChange={(e) => setFormData({ ...formData, complaints: e.target.value })} rows={3} className="bg-blue-50" />
              </div>

              <div className="space-y-2">
                <Label>Chronic Disease</Label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 bg-blue-50 p-4 rounded-md border">
                  {Object.keys(formData.chronic_diseases).map((key) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-sm capitalize">{key.replace(/_/g, " ")}</span>
                      <Switch checked={(formData.chronic_diseases as any)[key]} onCheckedChange={(checked) => setFormData({ ...formData, chronic_diseases: { ...formData.chronic_diseases, [key]: checked } })} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Clinical Notes</Label>
                <div className="flex items-center gap-2">
                  <Select value={formData.vitals_name} onValueChange={(v) => setFormData({ ...formData, vitals_name: v })}>
                    <SelectTrigger className="w-[150px] bg-blue-50"><SelectValue placeholder="Vitals name" /></SelectTrigger>
                    <SelectContent><SelectItem value="bp">BP</SelectItem><SelectItem value="temp">Temp</SelectItem><SelectItem value="pulse">Pulse</SelectItem><SelectItem value="spo2">SPO2</SelectItem></SelectContent>
                  </Select>
                  <span>Result</span>
                  <Input value={formData.vitals_result} onChange={(e) => setFormData({ ...formData, vitals_result: e.target.value })} className="w-[150px] bg-blue-50" />
                  <Button type="button" variant="ghost" size="icon"><Plus className="h-4 w-4" /></Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Diagnosis</Label>
                <Textarea value={formData.diagnosis} onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })} rows={3} className="bg-blue-50" />
              </div>

              <div className="space-y-2">
                <Label>Test</Label>
                <div className="flex items-center gap-2">
                  <span>Test name</span>
                  <div className="relative">
                    <Input
                      value={formData.test_name}
                      onChange={(e) => searchTests(e.target.value)}
                      onFocus={() => testSuggestions.length > 0 && setShowTestSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowTestSuggestions(false), 200)}
                      className="w-[200px] bg-blue-50"
                    />
                    {showTestSuggestions && testSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-card border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                        {testSuggestions.map((test) => (
                          <button key={test._id} type="button" onMouseDown={() => { setFormData({ ...formData, test_name: test.name }); setShowTestSuggestions(false); }} className="w-full px-3 py-2 text-left hover:bg-muted text-sm border-b last:border-0">
                            {test.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <span>Message</span>
                  <Input value={formData.test_message} onChange={(e) => setFormData({ ...formData, test_message: e.target.value })} className="flex-1 bg-blue-50" />
                  <Button type="button" variant="ghost" size="icon"><Plus className="h-4 w-4" /></Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Medicine</Label>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Medicine name</span>
                    <div className="relative">
                      <Input
                        value={formData.medicine_name}
                        onChange={(e) => searchMedicines(e.target.value)}
                        onFocus={() => medicineSuggestions.length > 0 && setShowMedicineSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowMedicineSuggestions(false), 200)}
                        className="w-[130px] bg-blue-50"
                      />
                      {showMedicineSuggestions && medicineSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 z-50 mt-1 bg-card border border-border rounded-md shadow-lg w-[200px] max-h-48 overflow-y-auto">
                          {medicineSuggestions.map((med) => (
                            <button key={med._id} type="button" onMouseDown={() => { setFormData({ ...formData, medicine_name: med.medicine_name, type: med.medicine_type }); setShowMedicineSuggestions(false); }} className="w-full px-3 py-2 text-left hover:bg-muted text-sm border-b last:border-0">
                              {med.medicine_name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1"><span className="text-xs text-muted-foreground">Dose</span><Input value={formData.dose} onChange={(e) => setFormData({ ...formData, dose: e.target.value })} className="w-[60px] bg-blue-50" /></div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Type</span>
                    <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                      <SelectTrigger className="w-[90px] bg-blue-50"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent><SelectItem value="tablet">Tablet</SelectItem><SelectItem value="syrup">Syrup</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Timing</span>
                    <Select value={formData.timing} onValueChange={(v) => setFormData({ ...formData, timing: v })}>
                      <SelectTrigger className="w-[90px] bg-blue-50"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent><SelectItem value="before_food">Before Food</SelectItem><SelectItem value="after_food">After Food</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">D-Unit</span>
                    <Select value={formData.d_unit} onValueChange={(v) => setFormData({ ...formData, d_unit: v })}>
                      <SelectTrigger className="w-[80px] bg-blue-50"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent><SelectItem value="days">Days</SelectItem><SelectItem value="weeks">Weeks</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Duration</span>
                    <Select value={formData.duration} onValueChange={(v) => setFormData({ ...formData, duration: v })}>
                      <SelectTrigger className="w-[80px] bg-blue-50"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent><SelectItem value="3">3</SelectItem><SelectItem value="5">5</SelectItem><SelectItem value="7">7</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Frequency</span>
                    <Select value={formData.frequency} onValueChange={(v) => setFormData({ ...formData, frequency: v })}>
                      <SelectTrigger className="w-[80px] bg-blue-50"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent><SelectItem value="1-0-1">1-0-1</SelectItem><SelectItem value="1-1-1">1-1-1</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1"><span className="text-xs text-muted-foreground">Instructions</span><Input value={formData.instructions} onChange={(e) => setFormData({ ...formData, instructions: e.target.value })} className="w-[120px] bg-blue-50" /></div>
                  <Button type="button" variant="ghost" size="icon" className="mt-5"><Plus className="h-4 w-4" /></Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>General Advice</Label>
                <Textarea value={formData.general_advice} onChange={(e) => setFormData({ ...formData, general_advice: e.target.value })} rows={3} className="bg-blue-50" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2"><Label>Referral</Label><Input value={formData.referral} onChange={(e) => setFormData({ ...formData, referral: e.target.value })} className="bg-blue-50" /></div>
                <div className="space-y-2"><Label>Follow up</Label><Input type="date" value={formData.follow_up} onChange={(e) => setFormData({ ...formData, follow_up: e.target.value })} className="bg-blue-50" /></div>
                <div className="space-y-2"><Label>Follow up Time</Label><Input type="time" value={formData.follow_up_time} onChange={(e) => setFormData({ ...formData, follow_up_time: e.target.value })} className="bg-blue-50" /></div>
              </div>

              <div className="space-y-2">
                <Label>Surgery Advice</Label>
                <Textarea value={formData.surgery_advice} onChange={(e) => setFormData({ ...formData, surgery_advice: e.target.value })} rows={3} className="bg-blue-50" />
              </div>

              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Done</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Prescriptions;