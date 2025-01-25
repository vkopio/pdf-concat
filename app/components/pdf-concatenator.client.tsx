import React, { memo, useState } from 'react';
import Dropzone, { DropEvent, FileRejection } from 'react-dropzone';
import { v4 as uuid } from 'uuid';
import { ArrowDown, ArrowUp, CircleHelp, ShieldCheck, Trash2 } from 'lucide-react';

import { getPageCount, concatPdfs } from "~/lib/pdf.client";
import { generateNewFileName } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { useToast } from '~/hooks/use-toast';
import { TooltipContent, TapableTooltip } from '~/components/ui/tooltip';

interface FileSelection {
  file: File;
  id: string,
  pageCount: number,
  pageSelection: string;
}

function fileSelectionsToWasmCompatible(fileSelections: FileSelection[]) {
  return fileSelections.map((selection) => { return { file: selection.file, pages: selection.pageSelection }; });
}

const FileListingRow = memo(
  function FileListingRow({
    index,
    fileSelection,
    fileSelectionCount,
    handleInputChange,
    onFileSelectionRemoved,
    moveUp,
    moveDown,
  }: {
    index: number,
    fileSelection: FileSelection,
    fileSelectionCount: number,
    handleInputChange: (_id: string, _value: string) => void,
    onFileSelectionRemoved: (_index: number) => void,
    moveUp: (_index: number) => void,
    moveDown: (_index: number) => void,
  }) {
    return (
      <TableRow key={fileSelection.id}>
        <TableCell>{fileSelection.file.name}</TableCell>
        <TableCell>{fileSelection.pageCount}</TableCell>
        <TableCell>
          <Input
            value={fileSelection.pageSelection}
            onChange={(event) => handleInputChange(fileSelection.id, event.target.value)}
            type="text"
            placeholder="All" />
        </TableCell>
        <TableCell className="text-right">
          <Button
            variant="ghost"
            className="disabled:opacity-20"
            onClick={() => moveUp(index)}
            disabled={index === 0}>
            <ArrowUp />
          </Button>
          <Button
            variant="ghost"
            className="disabled:opacity-20"
            onClick={() => moveDown(index)}
            disabled={index === fileSelectionCount - 1}>
            <ArrowDown />
          </Button>
          <Button
            variant="ghost"
            onClick={() => onFileSelectionRemoved(index)}>
            <Trash2 />
          </Button>
        </TableCell>
      </TableRow>
    );
  }
);

export default function PDFConcatenator() {
  const { toast } = useToast()
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>("");
  const [isDefaultName, setIsDefaultName] = useState<boolean>(true);
  const [fileSelections, setFileSelections] = useState<FileSelection[]>([]);

  const onConcatenate = async () => {
    if (fileSelections.length > 1) {
      try {
        await concatPdfs(fileName, fileSelectionsToWasmCompatible(fileSelections));
      } catch (e) {
        const message = (e instanceof Error) ? e.message : "Unknown error";

        toast({
          variant: "destructive",
          title: "Failed to concatenate files",
          description: message,
        })
      }
    }
  };

  const onNameChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFileName(event.target.value);
    setIsDefaultName(false);
  };

  const resolveFileName = (oldSelections: FileSelection[], newSelections: FileSelection[]) => {
    if (oldSelections.length === 0 || newSelections.length === 0) {
      return;
    }

    const oldFirstName = oldSelections[0].file.name;
    const newFirstName = newSelections[0].file.name;

    if (isDefaultName && oldFirstName !== newFirstName) {
      setFileName(generateNewFileName(newFirstName));
    }
  }

  const onFilesSelected = async (
    acceptedFiles: File[],
    fileRejections: FileRejection[],
    _event: DropEvent,
  ) => {
    setIsDragging(false)
    console.log("Accepted:", acceptedFiles);
    console.log("Rejected:", fileRejections);

    for (const rejection of fileRejections) {
      toast({
        variant: "destructive",
        title: "File rejected",
        description: `The file '${rejection.file.name}' is not a PDF!`,
      });
    }

    if (acceptedFiles.length == 0) {
      return;
    }

    if (fileName === "") {
      const firstFile = acceptedFiles[0];

      setFileName(generateNewFileName(firstFile.name));
    }

    const newFileSelections: FileSelection[] = [];

    for (const file of acceptedFiles) {
      const pageCount = await getPageCount(file);

      newFileSelections.push({
        file, pageCount, pageSelection: "", id: uuid(),
      })
    }

    setFileSelections([...fileSelections, ...newFileSelections]);
  };

  const onFileSelectionRemoved = (index: number) => {
    const newFileSelections = [...fileSelections.slice(0, index), ...fileSelections.slice(index + 1)];

    resolveFileName(fileSelections, newFileSelections);
    setFileSelections(newFileSelections);

    if (newFileSelections.length == 0) {
      setFileName("");
    }
  };

  const moveUp = (index: number) => {
    if (index === 0) return;

    const newList = [...fileSelections];
    [newList[index], newList[index - 1]] = [newList[index - 1], newList[index]];

    resolveFileName(fileSelections, newList);
    setFileSelections(newList);
  };

  const moveDown = (index: number) => {
    if (index === fileSelections.length - 1) return;

    const newList = [...fileSelections];
    [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];

    resolveFileName(fileSelections, newList);
    setFileSelections(newList);
  };

  const FileListing = () => {
    if (fileSelections.length === 0) {
      return <></>;
    }

    const onPageSelectionChanged = (id: string, newValue: string) => {
      setFileSelections((oldData) =>
        oldData.map((selection) =>
          selection.id === id ? { ...selection, pageSelection: newValue } : selection
        ));
    };

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>File Order</TableHead>
            <TableHead>Page Count</TableHead>
            <TableHead>Page Selection
              <TapableTooltip content={
                <TooltipContent>
                  <p>A comma-separated list of pages or page ranges.</p>
                  <p>Leave empty to select all pages.</p>
                  <p>Example: 1, 3-4, 6</p>
                </TooltipContent>
              }>
                <CircleHelp className="ml-1 w-4 inline-block" />
              </TapableTooltip>
            </TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fileSelections.map((fileSelection, index) => (
            <FileListingRow
              key={fileSelection.id}
              index={index}
              fileSelection={fileSelection}
              fileSelectionCount={fileSelections.length}
              onFileSelectionRemoved={onFileSelectionRemoved}
              handleInputChange={onPageSelectionChanged}
              moveUp={moveUp}
              moveDown={moveDown} />
          ))}
        </TableBody>
      </Table>
    );
  };

  const Info = () => {
    return <Alert>
      <ShieldCheck className="h-8 w-8" />
      <AlertTitle className="text-lg font-bold">Concatenate PDF files securely</AlertTitle>
      <AlertDescription className="text-md">
        This tool runs completely on your own device, so your documents are kept safe! If you are paranoid, feel free to disconnect from the Internet while using this tool.
      </AlertDescription>
    </Alert>;
  }

  const dropzoneBaseClasses = "w-full flex flex-col items-center cursor-pointer p-10 border-2 border-dashed border-primary rounded-lg hover:bg-gray-200";
  const dropzoneDragClass = " bg-gray-200";
  const hasFilesSelected = fileSelections.length != 0;

  return (<>
    {!hasFilesSelected && <Info />}
    {
      hasFilesSelected && <>
        <div className="w-full">
          <div className="py-1">Name of the new file:</div>
          <div className="flex w-full items-center space-x-1">
            <Input
              className="flex-1"
              value={fileName}
              onChange={onNameChanged}
              type="text"
              placeholder="New file name" />
            <span className="flex-none">.pdf</span>
          </div>
        </div>
        <FileListing />
      </>
    }
    <Dropzone
      onDrop={onFilesSelected}
      onDragEnter={() => setIsDragging(true)}
      onDragLeave={() => setIsDragging(false)}
      accept={{
        'application/pdf': []
      }}
      multiple>
      {({ getRootProps, getInputProps }) => (
        <header {...getRootProps()} className={isDragging ? `${dropzoneBaseClasses}${dropzoneDragClass}` : dropzoneBaseClasses}>
          <input {...getInputProps()} />
          <h1 className="leading text-2xl font-bold text-gray-800 dark:text-gray-100">
            Drop PDF files here, or click to select.
          </h1>
        </header>
      )}
    </Dropzone>
    {
      hasFilesSelected &&
      <Button
        disabled={fileSelections.length < 2}
        onClick={onConcatenate}>
        CONCATENATE
      </Button>
    }
  </>);
}
