import Papa, { ParseResult } from "papaparse";
import { Egm, EgmSample } from "../domain/Egm";
import { useEffect, useState } from "react";

const CHUNK_SIZE = 1024 * 1024 * 10; // 10MB
const SAMPLES_PER_PAGE = 1000;

export function useParseEgmData({ file }: { file: File | null }): {
  data: Egm;
  isLoading: boolean;
  updateTimeRange: (range: [number, number]) => void;
} {
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
  function parseData(timeRange?: [number, number]) {
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
          setIsLoading(false);
          parser.abort();
        } else if (timeRange) {
          // when there is data and a time range, show only the data in the range
          const [start, end] = timeRange;
          const newData = results.data.filter(
            (val) => val.Time >= start && val.Time <= end
          );
          if (newData.length) {
            accumulativeData.push(...newData);
          } else {
            // when the current chunk has no data in the range, abort the parser
            setSampledData(accumulativeData);
            setIsLoading(false);
            parser.abort();
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
  }
  function updateTimeRange(timeRange: [number, number]) {
    parseData(timeRange);
  }

  useEffect(() => {
    if (!file) return;
    setIsLoading(true);
    parseData();
  }, [file]);

  return { data, isLoading, updateTimeRange };
}
