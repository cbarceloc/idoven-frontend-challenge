import React, { useState } from "react";
import Papa, { ParseResult } from "papaparse";
import {
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface CSVRow {
  Time: number;
  [key: string]: number | null;
}
type CSVChunk = CSVRow[];

const CHUNK_SIZE = 1024 * 1024 * 10; // 1MB
const SAMPLES_PER_PAGE = 1000;
const EgmPage: React.FC = () => {
  const [chartData, setChartData] = useState<CSVChunk>([]);
  // };
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    let initialized = false;

    Papa.parse<CSVRow>(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      chunkSize: CHUNK_SIZE,
      worker: true,
      fastMode: true,
      chunk: (results: ParseResult<CSVRow>) => {
        if (!initialized) {
          const samplesPeriod = Math.floor(
            results.data.length / SAMPLES_PER_PAGE
          );

          const data: CSVChunk = results.data.filter(
            (val, index) => index % samplesPeriod === 0
          );
          console.log("data", data);

          initialized = true;
          setChartData(data);
        }
      },
      complete: function (results) {
        console.log("CSV parsing complete", results);
      },
      error: function (error) {
        console.error("Error parsing CSV:", error);
      },
    });
  };

  if (!chartData.length)
    return <input type="file" accept=".csv" onChange={handleFileUpload} />;
  return (
    <ResponsiveContainer height={400}>
      <LineChart
        width={730}
        height={250}
        data={chartData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis allowDataOverflow dataKey="Time" type="number" />
        <YAxis allowDataOverflow type="number" dataKey={"1"} />
        <Tooltip />
        <Legend />
        <Line
          type="linear"
          dataKey="1"
          stroke="#82ca9d"
          animationDuration={300}
          connectNulls
          dot={false}
        />
        <Line
          dataKey="2"
          stroke="#d4b32d"
          strokeWidth={2}
          animationDuration={300}
          connectNulls
          dot={false}
        />
        <Line
          type="linear"
          dataKey="3"
          stroke="#4f3986"
          animationDuration={300}
          connectNulls
          dot={false}
        />
        <Line
          type="linear"
          dataKey="4"
          stroke="#be2359"
          animationDuration={300}
          connectNulls
          dot={false}
        />
        <Line
          type="linear"
          dataKey="5"
          stroke="#397f86"
          animationDuration={300}
          connectNulls
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default EgmPage;
