'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PrescriptionPrintProps {
  prescriptionData: {
    patient_name: string;
    phone: string;
    age: number;
    gender: string;
    complaints: string;
    chronic_diseases: any;
    vitals_name: string;
    vitals_result: string;
    diagnosis: string;
    medicine_name: string;
    dose: string;
    frequency: string;
    instructions: string;
  };
}

const PrescriptionPrint = ({ prescriptionData }: PrescriptionPrintProps) => {
  const [doctorProfile, setDoctorProfile] = useState<any>(null);
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  /* -------------------- Client-only Date & Time -------------------- */
  useEffect(() => {
    const now = new Date();

    setCurrentDate(
      now.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    );

    setCurrentTime(
      now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  }, []);

  /* -------------------- Fetch Doctor Profile -------------------- */
  useEffect(() => {
    const fetchDoctorProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setDoctorProfile(data);
    };

    fetchDoctorProfile();
  }, []);

  return (
    <div className="prescription-print-content bg-white text-black p-8 max-w-4xl mx-auto">

      {/* PRINT STYLE */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .prescription-print-content,
            .prescription-print-content * {
              visibility: visible;
            }
            .prescription-print-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          }
        `}
      </style>

      {/* -------------------- HEADER -------------------- */}
      <div className="border-b-2 border-black pb-4 mb-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold">
              Name: Dr. {doctorProfile?.full_name || ""}
            </h2>
            <p>Qualification: {doctorProfile?.qualification || ""}</p>
            <p>Specialization: {doctorProfile?.specialization || ""}</p>
          </div>

          <img
            src="/nexus-logo.jpg"
            alt="Nexus Logo"
            className="w-24 h-24 object-contain"
          />
        </div>
      </div>

      {/* -------------------- PATIENT INFO -------------------- */}
      <div className="border-b border-black pb-2 mb-4">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-semibold">Patient name:</span>{" "}
            {prescriptionData.patient_name}
          </div>

          <div>
            <span className="font-semibold">Gender:</span>{" "}
            {prescriptionData.gender}
          </div>

          <div>
            <span className="font-semibold">Date:</span>{" "}
            {currentDate}
          </div>

          <div>
            <span className="font-semibold">Patient number:</span>{" "}
            {prescriptionData.phone}
          </div>

          <div>
            <span className="font-semibold">Age:</span>{" "}
            {prescriptionData.age}
          </div>

          <div>
            <span className="font-semibold">Time:</span>{" "}
            {currentTime}
          </div>
        </div>
      </div>

      {/* -------------------- CASE HISTORY -------------------- */}
      <div className="mb-6">
        <h3 className="font-bold mb-2">Case History</h3>

        <div className="mb-3">
          <p className="font-semibold text-sm">Complaint</p>
          <p className="text-sm">{prescriptionData.complaints || "N/A"}</p>
        </div>

        {prescriptionData.vitals_name && prescriptionData.vitals_result && (
          <div className="mb-3">
            <p className="font-semibold text-sm">Vitals</p>
            <p className="text-sm">
              {prescriptionData.vitals_name}: {prescriptionData.vitals_result}
            </p>
          </div>
        )}

        <div className="mb-3">
          <p className="font-semibold text-sm">Chronic Diseases</p>
          <p className="text-sm">
            {Object.entries(prescriptionData.chronic_diseases || {})
              .filter(([_, value]) => value)
              .map(([key]) => key.replace(/_/g, " "))
              .join(", ") || "No chronic diseases recorded"}
          </p>
        </div>
      </div>

      {/* -------------------- MEDICINE ADVISED -------------------- */}
      <div className="mb-6">
        <h3 className="font-bold mb-2">Medicine Advised</h3>

        <table className="w-full border-collapse border border-black text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-2 text-left">Medicine Name</th>
              <th className="border border-black p-2 text-left">Dose</th>
              <th className="border border-black p-2 text-left">Frequency</th>
              <th className="border border-black p-2 text-left">Instructions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-2">
                {prescriptionData.medicine_name || ""}
              </td>
              <td className="border border-black p-2">
                {prescriptionData.dose || ""}
              </td>
              <td className="border border-black p-2">
                {prescriptionData.frequency || ""}
              </td>
              <td className="border border-black p-2">
                {prescriptionData.instructions || ""}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* -------------------- SIGNATURE -------------------- */}
      <div className="mt-16 flex justify-end">
        <div className="text-center border-t border-black pt-2 w-48">
          <p className="text-sm font-semibold">Signature</p>
        </div>
      </div>

      {/* -------------------- FOOTER -------------------- */}
      <div className="mt-8 text-xs border-t border-black pt-2">
        <p>
          <span className="font-semibold">Clinic name:</span>{" "}
          {doctorProfile?.clinic_name || ""}
          <span className="ml-4 font-semibold">Ph:</span>{" "}
          {doctorProfile?.phone || "N/A"}
          <span className="ml-4 font-semibold">Timings:</span>{" "}
          {doctorProfile?.shift || ""}
        </p>

        <p>
          <span className="font-semibold">Address:</span>{" "}
          {doctorProfile?.address || ""}
        </p>
      </div>
    </div>
  );
};

export default PrescriptionPrint;
