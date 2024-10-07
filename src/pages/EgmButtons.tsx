import { TimeRange } from "./types";

export default function EgmButtons({
  timeRange,
  onChangeTimeRange,
}: {
  timeRange: TimeRange;
  onChangeTimeRange: (range: TimeRange) => void;
}) {
  function getTimeDuration() {
    return timeRange[1] - timeRange[0];
  }
  function handleClickPrev() {
    const timeRangeDuration = getTimeDuration();
    onChangeTimeRange([timeRange[0] - timeRangeDuration, timeRange[0]]);
  }
  function handleClickNext() {
    const timeRangeDuration = getTimeDuration();
    onChangeTimeRange([timeRange[1], timeRange[1] + timeRangeDuration]);
  }
  return (
    <div>
      <button onClick={handleClickPrev}>Prev</button>
      <button onClick={handleClickNext}>Next</button>
    </div>
  );
}
