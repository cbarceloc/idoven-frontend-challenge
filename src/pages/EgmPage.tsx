import React from "react";

import EgmChart from "./EgmChart";
import { useFileUpload } from "./useFileUpload";
import { useParseEgmData } from "./useParseEgmData";

const EgmPage: React.FC = () => {
  const { handleFileUpload, file } = useFileUpload();
  const { data, isLoading, updateTimeRange } = useParseEgmData({ file });

  if (!file) {
    return <input type="file" accept=".csv" onChange={handleFileUpload} />;
  }
  if (data.length === 0 && isLoading) {
    return <div>loading...</div>;
  }
  return (
    <EgmChart
      egm={data}
      onChangeTimeRange={updateTimeRange}
      isLoading={isLoading}
    />
  );
};

export default EgmPage;
