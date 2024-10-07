import {
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceArea,
} from "recharts";
import { useChartZoom } from "./useChartZoom";
import { Egm } from "../domain/Egm";

type TimeRange = [number, number];
const EgmChart = ({
  egm,
  onChangeTimeRange,
  isLoading,
}: {
  egm: Egm;
  onChangeTimeRange: (range: TimeRange) => void;
  isLoading: boolean;
}) => {
  const {
    handleMouseDownInChart,
    handleMouseMoveInChart,
    handleMouseUpInChart,
    refArea,
  } = useChartZoom({
    xAxisDataKey: "Time",
    chartData: egm,
    onNewZoom: onChangeTimeRange,
  });
  const timeRange = egm.length
    ? [egm[0].Time, egm[egm.length - 1].Time]
    : undefined;
  return (
    <>
      {isLoading && <div>loading...</div>}
      <ResponsiveContainer height={400}>
        <LineChart
          onMouseDown={handleMouseDownInChart}
          onMouseMove={handleMouseMoveInChart}
          onMouseUp={handleMouseUpInChart}
          width={730}
          height={250}
          data={egm}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            allowDataOverflow
            dataKey="Time"
            type="number"
            domain={timeRange}
          />
          <YAxis allowDataOverflow type="number" dataKey={"1"} id="1" />
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
          {refArea && <ReferenceArea x1={refArea.left} x2={refArea.right} />}
        </LineChart>
      </ResponsiveContainer>
    </>
  );
};

export default EgmChart;
