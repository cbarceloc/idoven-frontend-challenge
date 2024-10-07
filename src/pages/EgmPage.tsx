import React, { useState } from "react";

import EgmChart from "./components/egm-chart/EgmChart";
import { useParseEgmData } from "./useParseEgmData";
import FileUpload from "./components/file-upload/FileUpload";

const EgmPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const { data, isLoading, updateTimeRange } = useParseEgmData({ file });

  if (!file) {
    return <FileUpload file={file} onFileUpload={setFile} />;
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
