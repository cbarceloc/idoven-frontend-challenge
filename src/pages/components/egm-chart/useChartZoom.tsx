import { useState } from "react";
import { CategoricalChartFunc } from "recharts/types/chart/generateCategoricalChart";
import { TimeRange } from "../../../types";

export function useChartZoom({
  xAxisDataKey,
  chartData,
  onNewZoom,
}: {
  xAxisDataKey: string;
  chartData: Record<string, number | null>[];
  onNewZoom: (range: TimeRange) => void;
}): {
  handleMouseDownInChart: CategoricalChartFunc;
  handleMouseUpInChart: CategoricalChartFunc;
  handleMouseMoveInChart: CategoricalChartFunc;
  refArea: { left: number; right: number } | null;
} {
  // Handle zoom control
  const [refAreaLeft, setRefAreaLeft] = useState<number | null>(null);
  const [refAreaRight, setRefAreaRight] = useState<number | null>(null);

  function getXValue(index: number) {
    return chartData[index][xAxisDataKey];
  }
  useState<number | null>(null);

  const handleMouseDownInChart: CategoricalChartFunc = (nextState) => {
    if (!nextState) return;
    if (!nextState.activeTooltipIndex) return;
    setRefAreaLeft(getXValue(nextState.activeTooltipIndex));
  };
  const handleMouseUpInChart = () => {
    if (refAreaLeft === null || refAreaRight === null) return;
    if (refAreaLeft > refAreaRight) {
      onNewZoom([refAreaRight, refAreaLeft]);
    } else if (refAreaLeft < refAreaRight) {
      onNewZoom([refAreaLeft, refAreaRight]);
    }

    setRefAreaLeft(null);
    setRefAreaRight(null);
  };
  const handleMouseMoveInChart: CategoricalChartFunc = (nextState) => {
    if (!nextState.activeTooltipIndex) return;
    setRefAreaRight(getXValue(nextState.activeTooltipIndex));
  };
  return {
    handleMouseDownInChart,
    handleMouseUpInChart,
    handleMouseMoveInChart,
    refArea:
      refAreaLeft && refAreaRight
        ? {
            left: refAreaLeft,
            right: refAreaRight,
          }
        : null,
  };
}
