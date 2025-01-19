import React, { useState } from 'react';
import Dropzone, { DropEvent, FileRejection } from 'react-dropzone';
import { v4 as uuid } from 'uuid';
import { TrashIcon } from "@radix-ui/react-icons"

import { getPageCount, concatPdfs } from "../pdf-util.client";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"

interface FileSelection {
  file: File;
  id: string,
  pageCount: number,
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

    const newFileSelections: FileSelection[] = [];

    for (const file of acceptedFiles) {
      const pageCount = await getPageCount(file);

      newFileSelections.push({
        file, pageCount, id: uuid(),
      })
    }

    setFileSelections([...fileSelections, ...newFileSelections]);
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
      <Table>
        <TableCaption>A list of your recent invoices.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>File Order</TableHead>
            <TableHead>Page Count</TableHead>
            <TableHead>Page Selection</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fileSelections.map((fileSelection, index) => (
            <TableRow key={fileSelection.id}>
              <TableCell>{fileSelection.file.name}</TableCell>
              <TableCell>{fileSelection.pageCount}</TableCell>
              <TableCell>{fileSelection.pageSelection ?? "All"}</TableCell>
              <TableCell className="text-right"><button onClick={() => onFileSelectionRemoved(index)}><TrashIcon /></button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
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
        <Button
          disabled={fileSelections.length === 0}
          onClick={onConcatenate}>
          CONCATENATE
        </Button>
      </div>
    </div>
  );
}
