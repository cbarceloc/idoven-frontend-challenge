import Papa, { ParseResult } from "papaparse";
import { useEffect, useRef, useState } from "react";
import { Egm, EgmSample, TimeRange } from "../types";

const CHUNK_SIZE = 1024 * 1024 * 1; // 1MB
const SAMPLES_PER_PAGE = 1000;

// when we search for a time range, we can be in these states:
type TimeRangeState =
  | "beforeRange"
  | "firstSamplesInRange"
  | "allMiddleSamplesInRange"
  | "someMiddleSamplesInRange"
  | "inExactRange"
  | "lastSamplesInRange"
  | "afterRange";

export function useParseEgmData({ file }: { file: File | null }): {
  data: Egm;
  isLoading: boolean;
  updateTimeRange: (range: TimeRange) => void;
  isBeginningOfFile: boolean;
} {
  const initialTime = useRef<number | undefined>();
  const [data, setData] = useState<Egm>([]);

  const [isLoading, setIsLoading] = useState(false);

  function setSampledData(egmData: EgmSample[]) {
    if (!egmData.length) return;
    if (egmData.length <= SAMPLES_PER_PAGE) {
      setData(egmData);
      return;
    }
    const sampledData: Egm = [];
    const step = Math.floor(egmData.length / SAMPLES_PER_PAGE);
    for (let i = 0; i < egmData.length; i += step) {
      sampledData.push(egmData[i]);
    }
    setData(sampledData);
  }
  function abortParsing(parser: Papa.Parser) {
    parser.abort();
    setIsLoading(false);
  }
  function getIsBeginningOfFile() {
    if (initialTime.current === undefined) return true;
    return data[0].Time <= initialTime.current;
  }
  function getDataInTimeRange(timeRange: TimeRange, egmData: Egm) {
    return egmData.filter(
      (val) => val.Time >= timeRange[0] && val.Time <= timeRange[1]
    );
  }

  function getTimeRangeState(
    timeRange: TimeRange | null,
    data: Egm
  ): TimeRangeState {
    if (!timeRange) return "inExactRange";
    const [start, end] = timeRange;
    const lastSample = data[data.length - 1];
    const firstSample = data[0];

    console.log("data", data);
    console.log("timeRange", timeRange);

    if (firstSample.Time === start && lastSample.Time === end) {
      return "inExactRange";
    } else if (lastSample.Time < start) {
      return "beforeRange";
    } else if (firstSample.Time > end) {
      return "afterRange";
    } else if (
      firstSample.Time <= start &&
      lastSample.Time >= start &&
      lastSample.Time <= end
    ) {
      return "lastSamplesInRange";
    } else if (
      firstSample.Time >= start &&
      firstSample.Time <= end &&
      lastSample.Time >= end
    ) {
      return "firstSamplesInRange";
    } else if (firstSample.Time > start && lastSample.Time < end) {
      return "allMiddleSamplesInRange";
    }
    return "someMiddleSamplesInRange";
  }
  const parseData = (timeRange?: TimeRange) => {
    const accumulativeData: Egm = [];
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
        if (initialTime.current === undefined) {
          // set the initial time for the first chunk
          initialTime.current = results.data[0].Time;
        }
        const timeRangeState = getTimeRangeState(
          timeRange || null,
          results.data
        );
        let newData: EgmSample[] = [];
        switch (timeRangeState) {
          case "inExactRange":
            // the current data is the exact time range we need
            setSampledData(results.data);
            abortParsing(parser);
            break;
          case "beforeRange":
            // if the data is before the time range, we can skip this chunk
            break;
          case "lastSamplesInRange":
            // we start to find the first samples in the time range
            newData = getDataInTimeRange(timeRange!, results.data);
            accumulativeData.push(...newData);
            break;
          case "allMiddleSamplesInRange":
            // all the samples belong to the time range, but we need to wait for the last samples to show up
            accumulativeData.push(...results.data);
            break;
          case "firstSamplesInRange":
            // we finally found the last samples in the time range
            newData = getDataInTimeRange(timeRange!, results.data);
            accumulativeData.push(...newData);
            setSampledData(accumulativeData);
            abortParsing(parser);
            break;
          case "someMiddleSamplesInRange":
            // if all the time range is in the data, we can abort the parsing
            // we can abort the parsing as we have the whole time range
            newData = getDataInTimeRange(timeRange!, results.data);
            setSampledData(newData);
            abortParsing(parser);
            break;
          case "afterRange":
            // if the data is after the time range, we already have the data, we can abort the parsing
            abortParsing(parser);
            break;
        }
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
    isBeginningOfFile: getIsBeginningOfFile(),
  };
}
