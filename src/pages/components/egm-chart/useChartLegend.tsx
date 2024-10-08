import { useState } from "react";
import { Egm } from "../../../types";

type SerieStatus = {
  isVisible: boolean;
  isActive: boolean;
};
type SeriesStatuses = Record<string, SerieStatus>;

type ReturnType = {
  seriesStatuses: SeriesStatuses;
  handleMouseOverLegend: (dataKey: string) => void;
  handleMouseOutLegend: () => void;
  handleClickLegend: (dataKey: string) => void;
  getChartColor: (dataKey: string) => string;
};

export function useChartLegend({
  data,
  colors,
}: {
  data: Egm;
  colors: string[];
}): ReturnType {
  const serieNames: string[] = Object.keys(data[0]).filter(
    (key) => key !== "Time"
  );
  const initialSeriesStatuses: SeriesStatuses = serieNames.reduce(
    (acc: SeriesStatuses, key: string) => {
      acc[key] = {
        isVisible: true,
        isActive: true,
      };
      return acc;
    },
    {}
  );
  function getChartColor(dataKey: string): string {
    if (!serieNames.includes(dataKey)) {
      return "black";
    }
    const { isActive, isVisible } = seriesStatuses[dataKey];

    if (isVisible && isActive) {
      return colors[serieNames.indexOf(dataKey) % colors.length];
    } else if (isVisible && !isActive) {
      return colors[serieNames.indexOf(dataKey) % colors.length] + "95";
    }
    return "rgb(173, 180, 187)";
  }

  const [seriesStatuses, setSeriesStatuses] = useState(initialSeriesStatuses);

  function handleMouseOverLegend(dataKey: string) {
    const newSeriesStatuses = serieNames.reduce(
      (acc: SeriesStatuses, key: string) => {
        acc[key] = {
          ...seriesStatuses[key],
          isActive: key === dataKey,
        };
        return acc;
      },
      {}
    );
    setSeriesStatuses(newSeriesStatuses);
  }
  function handleMouseOutLegend() {
    const newSeriesStatuses = serieNames.reduce(
      (acc: SeriesStatuses, key: string) => {
        acc[key] = {
          ...seriesStatuses[key],
          isActive: true,
        };
        return acc;
      },
      {}
    );
    setSeriesStatuses(newSeriesStatuses);
  }
  function handleClickLegend(dataKey: string) {
    const newSeriesStatuses = serieNames.reduce(
      (acc: SeriesStatuses, key: string) => {
        acc[key] = {
          ...seriesStatuses[key],
          isVisible:
            key === dataKey
              ? !seriesStatuses[key].isVisible
              : seriesStatuses[key].isVisible,
        };
        return acc;
      },
      {}
    );

    setSeriesStatuses(newSeriesStatuses);
  }
  return {
    seriesStatuses,
    getChartColor,
    handleMouseOverLegend,
    handleMouseOutLegend,
    handleClickLegend,
  };
}
