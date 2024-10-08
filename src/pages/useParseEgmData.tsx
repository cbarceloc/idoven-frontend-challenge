import Papa, { ParseResult } from "papaparse";
import { useEffect, useState } from "react";
import { Egm, EgmSample, TimeRange, TimeRangePosition } from "../types";
import { EgmService } from "../services/EgmService";

const CHUNK_SIZE = 1024 * 1024 * 1; // 1MB
const SAMPLES_PER_PAGE = 1000;

export function useParseEgmData({ file }: { file: File | null }): {
  data: Egm;
  isLoading: boolean;
  updateTimeRange: (range: TimeRange) => void;
  timeRangePosition: TimeRangePosition;
} {
  const [data, setData] = useState<Egm>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [timeRangePosition, setTimeRangePosition] =
    useState<TimeRangePosition>("start");

  const parseData = (timeRange?: TimeRange) => {
    const egmService = new EgmService({ nParsedSamples: SAMPLES_PER_PAGE });
    if (!file) return;
    setIsLoading(true);
    Papa.parse<EgmSample>(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      chunkSize: CHUNK_SIZE,
      worker: true,
      fastMode: true,
      chunk: (results: ParseResult<EgmSample>, parser: Papa.Parser) => {
        egmService.parseData({
          data: results.data,
          timeRange,
          onChangeTimeRangePosition: (timeRangePosition) => {
            switch (timeRangePosition) {
              case "start":
                setTimeRangePosition("start");
                break;
              case "middle":
                setTimeRangePosition("middle");
                break;
              case "end":
                setTimeRangePosition("end");
                break;
            }
          },
          onComplete: (egm) => {
            setData(egm);
            parser.abort();
            setIsLoading(false);
          },
        });
      },
      complete: function () {
        setIsLoading(false);
      },
      error: function (error) {
        console.error("Error parsing CSV:", error);
        setIsLoading(false);
      },
    });
  };
  const updateTimeRange = (timeRange: TimeRange) => {
    parseData(timeRange);
  };

  useEffect(() => {
    if (!file) return;
    setIsLoading(true);
    parseData();
  }, [file]);

  return {
    data,
    isLoading,
    updateTimeRange,
    timeRangePosition,
  };
}
