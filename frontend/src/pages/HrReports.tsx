import { useEffect, useState, useCallback } from "react";
import axios from "axios";

type Attendance = {
  _id: string;
  userId: { name: string; email: string };
  date: string;
  entryTime?: string;
  exitTime?: string;
  entryLocation?: { lat: number; lng: number };
  exitLocation?: { lat: number; lng: number };
  totalHours?: number;
};

export default function HrReports() {
  const [allRecords, setAllRecords] = useState<Attendance[]>([]);
  const [missingExit, setMissingExit] = useState<Attendance[]>([]);
  const token = localStorage.getItem("token");

  const fetchAllRecords = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/reports/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllRecords(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  const fetchMissingExit = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/reports/missing-exit", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMissingExit(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  useEffect(() => {
    fetchAllRecords();
    fetchMissingExit();
  }, [fetchAllRecords, fetchMissingExit]);

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Full Attendance Records</h2>
      {allRecords.map((r) => (
        <div key={r._id} className="p-4 border rounded bg-gray-50">
          <p>
            <strong>{r.userId.name}</strong> ({r.userId.email})
          </p>
          <p>Date: {r.date}</p>
          <p>Entry: {r.entryTime ? new Date(r.entryTime).toLocaleTimeString() : "-"}</p>
          <p>Exit: {r.exitTime ? new Date(r.exitTime).toLocaleTimeString() : "-"}</p>
          <p>Total Hours: {r.totalHours?.toFixed(2) || "-"}</p>
          {r.entryLocation && (
            <p>
              Entry Location:{" "}
              <a
                href={`https://www.google.com/maps?q=${r.entryLocation.lat},${r.entryLocation.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                View Map
              </a>
            </p>
          )}
          {r.exitLocation && (
            <p>
              Exit Location:{" "}
              <a
                href={`https://www.google.com/maps?q=${r.exitLocation.lat},${r.exitLocation.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                View Map
              </a>
            </p>
          )}
        </div>
      ))}

      <h2 className="text-2xl font-bold mt-8">Missing Exit Report</h2>
      {missingExit.length === 0 ? (
        <p>All users have marked exit.</p>
      ) : (
        missingExit.map((r) => (
          <div key={r._id} className="p-4 border rounded bg-red-50">
            <p>
              <strong>{r.userId.name}</strong> ({r.userId.email})
            </p>
            <p>Entry Time: {new Date(r.entryTime!).toLocaleTimeString()}</p>
            {r.entryLocation && (
              <p>
                Entry Location:{" "}
                <a
                  href={`https://www.google.com/maps?q=${r.entryLocation.lat},${r.entryLocation.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  View Map
                </a>
              </p>
            )}
          </div>
        ))
      )}
    </div>
  );
}
