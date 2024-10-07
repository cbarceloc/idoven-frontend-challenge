import React, { useState } from "react";

import EgmChart from "./EgmChart";
import { useFileUpload } from "./useFileUpload";
import { useParseEgmData } from "./useParseEgmData";

const EgmPage: React.FC = () => {
  const { handleFileUpload, file } = useFileUpload();
  const [timeRange, setTimeRange] = useState<[number, number] | null>(null);
  const { data, isLoading } = useParseEgmData({ file, timeRange });

  if (!file) {
    return <input type="file" accept=".csv" onChange={handleFileUpload} />;
  }
  if (isLoading) {
    return <div>loading...</div>;
  }
  return <EgmChart egm={data} onChangeTimeRange={setTimeRange} />;
};

export default EgmPage;
