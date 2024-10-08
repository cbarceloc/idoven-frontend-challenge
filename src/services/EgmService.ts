import { Egm, TimeRange, TimeRangePosition } from "../types";

// COMMENTS WIKI
// start: Represent the start of the time range
// end: Represent the end of the time range
// 〇: Represent the time range without samples
// 🟢: Represent a sample that is in the time range
// 🔴: Represent a sample that outside the time range
// []: Represent the current chunk or data to parse
// ___: Represent the data that is outside the current chunk and is outside the time range

type TimeRangeState =
  | "matchRange"
  // all the data is within the exact time range we need
  // __[🟢🟢🟢🟢🟢]__
  | "beforeRange"
  // all the data is before the time range
  // __[🔴🔴🔴🔴🔴]____〇〇〇〇〇〇__
  | "inRange"
  // ___〇〇〇[🟢🟢🟢🟢🟢]〇〇〇___
  // all the samples belong to the time range, but we need to wait for the last samples to show up
  | "lastInRange"
  // __[🔴🔴🟢🟢🟢]〇〇〇〇〇__
  // last samples belong to the time range
  | "firstInRange"
  // __〇〇〇[🟢🟢🟢🔴🔴]__
  // first samples belong to the time range
  | "middleInRange" // ___[🔴🟢🟢🔴🔴]___
  // ___[🔴🟢🟢🔴🔴]___
  // if all the time range is contained in the data
  | "afterRange";
// if the data is after the time range, we already parsed all the data
// ___〇〇〇〇〇〇[🔴🔴🔴🔴🔴]

export class EgmService {
  private filteredData: Egm;
  private readonly maxSamples: number;
  private initialTime: number | undefined;
  private nInitialSamples: number = 0;
  private timeRangePosition: TimeRangePosition = "start";

  constructor(props: { nParsedSamples: number }) {
    this.filteredData = [];
    this.maxSamples = props.nParsedSamples;
  }

  getTimeRangePosition(data: Egm): TimeRangePosition {
    if (this.initialTime === undefined || this.nInitialSamples === 0) {
      throw new Error("Initial time and nInitialSamples must be defined");
    }
    const firstSample = data[0];
    if (firstSample.Time <= this.initialTime) {
      return "start";
    } else if (data.length === 0) {
      return "end";
    }
    return "middle";
  }
  getTimeRangeState(data: Egm, timeRange?: TimeRange): TimeRangeState {
    if (timeRange === undefined) {
      // if there is no time range, we will consider all the data as in the time range
      return "matchRange";
    }
    const [start, end] = timeRange;
    const lastSample = data[data.length - 1];
    const firstSample = data[0];

    if (firstSample.Time === start && lastSample.Time === end) {
      return "matchRange";
    } else if (lastSample.Time < start) {
      return "beforeRange";
    } else if (firstSample.Time > end) {
      return "afterRange";
    } else if (
      firstSample.Time <= start &&
      lastSample.Time >= start &&
      lastSample.Time <= end
    ) {
      return "lastInRange";
    } else if (
      firstSample.Time >= start &&
      firstSample.Time <= end &&
      lastSample.Time >= end
    ) {
      return "firstInRange";
    } else if (firstSample.Time > start && lastSample.Time < end) {
      return "inRange";
    }
    return "middleInRange";
  }
  private getSampledData(egmData: Egm): Egm {
    if (egmData.length <= this.maxSamples) {
      return egmData;
    }
    const sampledData: Egm = [];
    const step = Math.floor(egmData.length / this.maxSamples);
    for (let i = 0; i < egmData.length; i += step) {
      sampledData.push(egmData[i]);
    }
    return sampledData;
  }
  private getFilteredData(data: Egm, timeRange: TimeRange): Egm {
    return data.filter(
      (sample) => sample.Time >= timeRange[0] && sample.Time <= timeRange[1]
    );
  }

  private getCuratedTimeRange(data: Egm, timeRange?: TimeRange): TimeRange {
    if (timeRange === undefined) {
      return [data[0].Time, data[data.length - 1].Time];
    }
    return timeRange;
  }
  private initParamsOnFirstParse(data: Egm) {
    if (this.initialTime === undefined) {
      this.initialTime = data[0].Time;
      this.nInitialSamples = data.length;
    }
  }
  private updateTimeRangePosition(data: Egm) {
    const timeRangePosition = this.getTimeRangePosition(data);
    this.timeRangePosition = timeRangePosition;
  }

  parseData({
    data,
    timeRange: propsTimeRange,
    onComplete,
    onChangeTimeRangePosition,
  }: {
    data: Egm;
    timeRange?: TimeRange;
    onComplete?: (egm: Egm) => void;
    onReachedBeginning?: () => void;
    onReachedEnd?: () => void;
    onChangeTimeRangePosition?: (timeRangePosition: TimeRangePosition) => void;
  }) {
    this.initParamsOnFirstParse(data);
    // COMPUTE TIME RANGE STATE AND PARSE DATA

    const timeRange = this.getCuratedTimeRange(data, propsTimeRange);
    const timeRangeState = this.getTimeRangeState(data, timeRange);
    const completeDataParsing = () => {
      this.updateTimeRangePosition(data);
      if (onChangeTimeRangePosition) {
        onChangeTimeRangePosition(this.timeRangePosition);
      }
      if (onComplete) {
        onComplete(this.getSampledData(this.filteredData));
      }
    };

    switch (timeRangeState) {
      case "matchRange":
        // __[🟢🟢🟢🟢🟢]__
        this.filteredData = data;
        completeDataParsing();
        break;
      case "beforeRange":
        // __[🔴🔴🔴🔴🔴]____〇〇〇〇〇〇__
        break;
      case "lastInRange":
        // __[🔴🔴🟢🟢🟢]〇〇〇〇〇__
        // we start to find the first samples in the time range
        this.filteredData = this.getFilteredData(data, timeRange);
        break;
      case "inRange":
        // ___〇〇〇[🟢🟢🟢🟢🟢]〇〇〇___
        // all the samples belong to the time range, but we need to wait for the last samples to show up
        this.filteredData.push(...data);
        break;
      case "firstInRange":
        // __〇〇〇[🟢🟢🟢🔴🔴]__
        // we finally found the last samples in the time range
        this.filteredData.push(...this.getFilteredData(data, timeRange));
        completeDataParsing();
        break;
      case "middleInRange":
        // ___[🔴🟢🟢🔴🔴]___
        // if all the time range is contained in the data
        this.filteredData = this.getFilteredData(data, timeRange);
        completeDataParsing();
        break;
      case "afterRange":
        // ___〇〇〇〇〇〇[🔴🔴🔴🔴🔴]
        // the data is after the time range, (it means we already parsed all the data)
        completeDataParsing();
        break;
    }
  }
}
