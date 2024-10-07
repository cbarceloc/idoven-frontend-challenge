import { useState } from "react";

export function useFileUpload(): {
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  file: File | null;
} {
  const [file, setFile] = useState<File | null>(null);
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    return setFile(file);
  };
  return {
    handleFileUpload,
    file,
  };
}
