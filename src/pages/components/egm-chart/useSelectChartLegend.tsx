import { useState } from "react";

export function useSelectChartLegend() {
  const [selected, setSelected] = useState<number[]>([]);
  const selectLegend = (index: number) => {
    if (selected.includes(index)) {
      setSelected(selected.filter((i) => i !== index));
    } else {
      setSelected([...selected, index]);
    }
  };
  return { selected, selectLegend };
}
