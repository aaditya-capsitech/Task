import React, { useEffect, useState, useRef } from "react";
import { Stack, Text } from "@fluentui/react";
import axios from "axios";

interface HistoryEntry {
  _id: string;
  message: string;
  timestamp: string;
  performedBy: string;
}

interface Props {
  businessId: string;
}

const BusinessHistory: React.FC<Props> = ({ businessId }) => {
  const [logs, setLogs] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    if (!businessId) {
      setError("No business selected.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token || token.split(".").length !== 3) {
        throw new Error("Invalid or missing authentication token.");
      }

      const { data } = await axios.get<HistoryEntry[]>(
        `http://localhost:5288/api/history`,
        {
          params: { businessId },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const sortedLogs = data.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setLogs(sortedLogs);
    } catch (err: any) {
      console.error(" Failed to fetch history", err);

      const errMsg =
        err.response?.data?.message ||
        (typeof err.response?.data === "string"
          ? err.response.data
          : JSON.stringify(err.response?.data)) ||
        err.message ||
        "Unknown error";

      setError(`Error fetching history: ${errMsg}`);
    } finally {
      setLoading(false);
    }
  };

  
const hasFetched = useRef(false);
useEffect(() => {
  if (hasFetched.current) return;
  hasFetched.current = true;

  fetchHistory();
}, [businessId]);

  if (loading) return <Text>Loading history...</Text>;
  if (error) return <Text style={{ color: "red" }}>{error}</Text>;
  if (logs.length === 0) return <Text>No history logs yet.</Text>;

  return (
    <Stack tokens={{ childrenGap: 16 }}>
      {logs.map((log) => (
        <Stack key={`${log._id}-${log.timestamp}`} tokens={{ childrenGap: 4 }}>
          <Text variant="small">
            {new Date(log.timestamp).toLocaleString("en-GB")} by{" "}
            <strong>{log.performedBy}</strong>
          </Text>
          <Text variant="mediumPlus">{log.message}</Text>
        </Stack>
      ))}
    </Stack>
  );
};

export default BusinessHistory;
