import { Box, Button, Typography } from "@mui/material";
import React from "react";

type Props = {
  onFileUpload: (file: File) => void;
  file: File | null;
};

export default function FileUpload({ onFileUpload, file }: Props) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    onFileUpload(file);
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap={2}
      mt={2}
    >
      <input
        accept="*"
        style={{ display: "none" }}
        id="file-input"
        type="file"
        onChange={handleFileChange}
      />
      <label htmlFor="file-input">
        <Button variant="contained" color="primary" component="span">
          Choose File
        </Button>
      </label>
      {file && (
        <Typography variant="body1">Selected file: {file.name}</Typography>
      )}
    </Box>
  );
}
