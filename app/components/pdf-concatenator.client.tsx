import type { MetaFunction } from "@remix-run/node";
import React, { useState } from 'react';
import Dropzone, { DropEvent, FileRejection } from 'react-dropzone';
import { v4 as uuid } from 'uuid';

import { logPageMetrics, concatPdfs } from "../pdf-util.client";

interface FileSelection {
  file: File;
  id: string,
  pageSelection?: string;
}

function fileSelectionsToFiles(fileSelections: FileSelection[]) {
  return fileSelections.map((selection) => selection.file);
}

export default function PDFConcatenator() {
  const [fileSelections, setFileSelections] = useState<FileSelection[]>([]);

  const onConcatenate = async () => {
    if (fileSelections.length > 0) {
      concatPdfs(fileSelectionsToFiles(fileSelections));
    }
  };

  const onFilesSelected = async (
    acceptedFiles: File[],
    fileRejections: FileRejection[],
    _event: DropEvent,
  ) => {
    console.log("Accepted:", acceptedFiles);
    console.log("Rejected:", fileRejections);

    const newSelections = acceptedFiles.map((file) => {
      return {
        file, id: uuid(),
      };
    })

    setFileSelections([...fileSelections, ...newSelections]);

    for (const file of acceptedFiles) {
      await logPageMetrics(file);
    }
  };

  const onFileSelectionRemoved = (index: number) => {
    setFileSelections([...fileSelections.slice(0, index), ...fileSelections.slice(index + 1)]);
  };

  const FileListing = () => {
    if (fileSelections.length === 0) {
      return <>
      </>;
    }

    return (
      <table className="w-full table-auto">
        <thead>
          <tr>
            <th className="text-left">Name</th>
            <th className="text-left">Page Selection</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {fileSelections.map((fileSelection, index) => (
            <tr key={fileSelection.id}>
              <td>
                {fileSelection.file.name}
              </td>
              <td>{fileSelection.pageSelection ?? "All"}</td>
              <td className="text-right"><button onClick={() => onFileSelectionRemoved(index)}>X</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-16">
        <Dropzone
          onDrop={onFilesSelected}
          accept={{
            'application/pdf': []
          }}
          multiple>
          {({ getRootProps, getInputProps }) => (
            <header {...getRootProps()} className="flex flex-col items-center gap-9 cursor-pointer p-10 border-2 border-dashed border-white">
              <input {...getInputProps()} />
              <h1 className="leading text-2xl font-bold text-gray-800 dark:text-gray-100">
                Drag&apos;n&apos;drop some files here, or click to select files
              </h1>
            </header>
          )}
        </Dropzone>
        <FileListing />
        <button
          disabled={fileSelections.length === 0}
          onClick={onConcatenate}>
          CONCATENATE
        </button>
      </div>
    </div>
  );
}
