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
import { Egm, TimeRange } from "../../../types";
import EgmChartButtons from "./EgmChartButtons";
import { CardContent, Card, Stack } from "@mui/material";
import { useChartLegend } from "./useChartLegend";

type Props = {
  egm: Egm;
  onChangeTimeRange: (range: TimeRange) => void;
  isLoading: boolean;
  isPrevDisabled: boolean;
  isNextDisabled: boolean;
};
const colors = ["#109242", "#f98140", "#4f3986", "#be2359", "#397f86"];

const EgmChart = ({
  egm,
  onChangeTimeRange,
  isLoading,
  isPrevDisabled,
  isNextDisabled,
}: Props) => {
  // zoom control
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
  // legend control
  const {
    seriesStatuses,
    handleClickLegend,
    handleMouseOutLegend,
    handleMouseOverLegend,
    getChartColor,
  } = useChartLegend({ data: egm, colors });
  const timeRange = egm.length
    ? ([egm[0].Time, egm[egm.length - 1].Time] as TimeRange)
    : undefined;

  return (
    <div>
      <Card>
        <CardContent sx={{ position: "relative" }}>
          <ResponsiveContainer height={400}>
            <LineChart
              onMouseDown={handleMouseDownInChart}
              onMouseMove={handleMouseMoveInChart}
              onMouseUp={handleMouseUpInChart}
              width={730}
              data={egm}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Time" type="number" domain={timeRange} />
              <YAxis />
              <Tooltip />

              <Legend
                onClick={(data) => handleClickLegend(data.dataKey as string)}
                onMouseOver={(data) =>
                  handleMouseOverLegend(data.dataKey as string)
                }
                onMouseOut={handleMouseOutLegend}
                payload={Object.keys(seriesStatuses).map((name) => ({
                  id: name,
                  dataKey: name,
                  type: "circle",
                  value: "chart " + name,
                  color: getChartColor(name),
                }))}
              />

              {Object.keys(seriesStatuses).map((key: string) => {
                if (!seriesStatuses[key].isVisible) {
                  return null;
                }
                return (
                  <Line
                    type="linear"
                    dataKey={key}
                    stroke={getChartColor(key)}
                    animationDuration={300}
                    connectNulls
                    dot={false}
                  />
                );
              })}

              {refArea && (
                <ReferenceArea x1={refArea.left} x2={refArea.right} />
              )}
            </LineChart>
          </ResponsiveContainer>
          {isLoading && (
            <Stack
              sx={{
                backgroundColor: "white",
                opacity: 0.5,
                justifyContent: "center",
                alignItems: "center",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                position: "absolute",
              }}
            >
              <div>loading chart...</div>
            </Stack>
          )}
        </CardContent>
      </Card>
      {!!timeRange && (
        <EgmChartButtons
          isPrevDisabled={isPrevDisabled}
          isNextDisabled={isNextDisabled}
          timeRange={timeRange}
          onChangeTimeRange={onChangeTimeRange}
        ></EgmChartButtons>
      )}
    </div>
  );
};

export default EgmChart;
