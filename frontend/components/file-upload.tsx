"use client";

import type React from "react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloudIcon } from "lucide-react";

type FileUploadProps = {
  onFileUpload: (file: File) => void;
};

export function FileUpload({ onFileUpload }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setSelectedFileName(file.name);
      onFileUpload(file);
      // Clear the input after upload to allow re-uploading the same file
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
      <Input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden" // Hide the default file input
        aria-label="Upload file"
      />
      <Button
        onClick={handleButtonClick}
        className="flex items-center space-x-2 bg-[var(--color-accent)] text-white hover:bg-opacity-90 transition-colors duration-200 rounded-radius-button px-6 py-3"
      >
        <UploadCloudIcon className="w-5 h-5" />
        <span>Choose File</span>
      </Button>
      {selectedFileName && (
        <span className="text-sm text-[var(--color-text-secondary)]">
          Selected: {selectedFileName}
        </span>
      )}
    </div>
  );
}
