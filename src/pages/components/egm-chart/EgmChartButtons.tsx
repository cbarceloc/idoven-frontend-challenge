import { Stack } from "@mui/material";
import { TimeRange } from "../../../types";
import Button from "@mui/material/Button";

export default function EgmChartButtons({
  timeRange,
  onChangeTimeRange,
  isNextEnabled,
  isPrevEnabled,
}: {
  timeRange: TimeRange;
  onChangeTimeRange: (range: TimeRange) => void;
  isNextEnabled: boolean;
  isPrevEnabled: boolean;
}) {
  function getTimeDuration() {
    return timeRange[1] - timeRange[0];
  }
  function handleClickPrev() {
    const timeRangeDuration = getTimeDuration();
    console.log("timeRangeDuration", timeRangeDuration);
    console.log("timeRange", timeRange);
    onChangeTimeRange([timeRange[0] - timeRangeDuration, timeRange[0]]);
  }
  function handleClickNext() {
    const timeRangeDuration = getTimeDuration();
    onChangeTimeRange([timeRange[1], timeRange[1] + timeRangeDuration]);
  }
  return (
    <Stack
      sx={{
        mt: 2,
        px: 4,
        flexDirection: "row",
        justifyContent: "space-between",
      }}
    >
      <Button
        onClick={handleClickPrev}
        variant="contained"
        sx={{ width: 200 }}
        disabled={!isPrevEnabled}
      >
        Prev
      </Button>
      <Button
        onClick={handleClickNext}
        variant="contained"
        sx={{ width: 200 }}
        disabled={!isNextEnabled}
      >
        Next
      </Button>
    </Stack>
  );
}
