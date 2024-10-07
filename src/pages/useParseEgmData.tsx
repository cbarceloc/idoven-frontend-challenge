import Papa, { ParseResult } from "papaparse";
import { useEffect, useRef, useState } from "react";
import { Egm, EgmSample, TimeRange } from "../types";

const CHUNK_SIZE = 1024 * 1024 * 1; // 1MB
const SAMPLES_PER_PAGE = 1000;

export function useParseEgmData({ file }: { file: File | null }): {
  data: Egm;
  isLoading: boolean;
  updateTimeRange: (range: TimeRange) => void;
  hasPrevData: boolean;
  hasNextData: boolean;
} {
  const initialTime = useRef<number>(0);
  const [data, setData] = useState<Egm>([]);
  const [hasPrevData, setHasPrevData] = useState(false);
  const [hasNextData, setHasNextData] = useState(true);

  const [isLoading, setIsLoading] = useState(false);

  function isGoingForward(timeRange: TimeRange) {
    return timeRange[0] > data[0].Time;
  }
  function isGoingBackward(timeRange: TimeRange) {
    return timeRange[0] < data[0].Time;
  }
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
        if (!timeRange) {
          // if we have no timeRange, show all the data from first chunk
          setSampledData(results.data);
          initialTime.current = results.data[0].Time;
          setIsLoading(false);
          parser.abort();
        } else {
          // when there is data and a time range, show only the data in the time range
          const newData = results.data.filter(
            (val) => val.Time >= timeRange[0] && val.Time <= timeRange[1]
          );

          if (newData.length) {
            // if we have data, we need to accumulate it until we reach the end of the time range at some chunk
            accumulativeData.push(...newData);
            if (isGoingBackward(timeRange)) {
              if (
                timeRange[0] <= initialTime.current &&
                results.data[0].Time <= initialTime.current &&
                newData.length > 1
              ) {
                // we reached the start of the file
                setSampledData(results.data);
                setHasPrevData(false);
                setIsLoading(false);
                parser.abort();
              }
            }
          } else {
            if (isGoingForward(timeRange)) {
              // it means we are going forward in time
              setHasPrevData(true);
              if (results.data[results.data.length - 1].Time >= timeRange[1]) {
                // we already reached the end of the time range desired
                setSampledData(accumulativeData);
                setIsLoading(false);
                parser.abort();
              } else if (results.data.length === 0) {
                // we reached the end of the file
                if (accumulativeData.length > 0) {
                  setSampledData(results.data);
                }
                setHasNextData(false);
                setIsLoading(false);
                parser.abort();
              }
            } else if (isGoingBackward(timeRange)) {
              // it means we are going backward in time (we selected a time range that is before the current data)
              setHasNextData(true);
              if (results.data[0].Time >= timeRange[1]) {
                // we already reached the start of the time range desired
                setSampledData(accumulativeData);
                setIsLoading(false);
                parser.abort();
              }
            }
          }
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

  return { data, isLoading, updateTimeRange, hasPrevData, hasNextData };
}
