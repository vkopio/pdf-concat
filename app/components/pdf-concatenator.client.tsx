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

interface State {
  isDragging: boolean,
  isDefaultName: boolean,
  fileName: string,
  fileSelections: FileSelection[],
}

export default function PDFConcatenator() {
  const { toast } = useToast()
  const [state, setState] = useState<State>({
    isDragging: false,
    isDefaultName: true,
    fileName: "",
    fileSelections: [],
  })

  const onConcatenate = async () => {
    if (state.fileSelections.length > 0) {
      try {
        await concatPdfs(state.fileName, fileSelectionsToWasmCompatible(state.fileSelections));
      } catch (e) {
        const message = (e instanceof Error) ? e.message : "Unknown error";

        toast({
          variant: "destructive",
          title: "Failed to concatenate files!",
          description: message,
        })
      }
    }
  };

  const onNameChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState((state) => {
      return {
        ...state,
        fileName: event.target.value,
        isDefaultName: false,
      }
    });
  };

  const onFilesSelected = async (
    acceptedFiles: File[],
    fileRejections: FileRejection[],
    _event: DropEvent,
  ) => {
    console.log("Accepted:", acceptedFiles);
    console.log("Rejected:", fileRejections);

    for (const rejection of fileRejections) {
      toast({
        variant: "destructive",
        title: "File rejected!",
        description: `The file '${rejection.file.name}' is not a PDF.`,
      });
    }

    if (acceptedFiles.length == 0) {
      setState({ ...state, isDragging: false });
      return;
    }

    const newFileName = state.fileName === ""
      ? generateNewFileName(acceptedFiles[0].name)
      : state.fileName;

    const newFileSelections: FileSelection[] = [];

    for (const file of acceptedFiles) {
      const pageCount = await getPageCount(file);

      newFileSelections.push({
        file, pageCount, pageSelection: "", id: uuid(),
      })
    }

    setState({
      ...state,
      fileSelections: [...state.fileSelections, ...newFileSelections],
      fileName: newFileName,
      isDragging: false,
    });
  };

  const dropzoneBaseClasses = "w-full flex flex-col items-center cursor-pointer p-10 border-2 border-dashed border-primary rounded-lg hover:bg-gray-200";
  const dropzoneDragClass = " bg-gray-200";
  const hasFilesSelected = state.fileSelections.length != 0;

  return (<>
    {!hasFilesSelected && <Info />}
    {
      hasFilesSelected && <>
        <div className="w-full">
          <div className="py-1">Name of the new file:</div>
          <div className="flex w-full items-center space-x-1">
            <Input
              className="flex-1"
              value={state.fileName}
              onChange={onNameChanged}
              type="text"
              placeholder="New file name" />
            <span className="flex-none">.pdf</span>
          </div>
        </div>
        {state.fileSelections.length !== 0 &&
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
              {state.fileSelections.map((fileSelection, index) => (
                <FileListingRow
                  key={fileSelection.id}
                  index={index}
                  fileSelection={fileSelection}
                  fileSelectionCount={state.fileSelections.length}
                  setState={setState} />
              ))}
            </TableBody>
          </Table>}
      </>
    }
    <Dropzone
      onDrop={onFilesSelected}
      onDragEnter={() => setState({ ...state, isDragging: true })}
      onDragLeave={() => setState({ ...state, isDragging: false })}
      accept={{
        'application/pdf': []
      }}
      multiple>
      {({ getRootProps, getInputProps }) => (
        <header {...getRootProps()} className={state.isDragging ? `${dropzoneBaseClasses}${dropzoneDragClass}` : dropzoneBaseClasses}>
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
        disabled={state.fileSelections.length < 1}
        onClick={onConcatenate}>
        CONCATENATE
      </Button>
    }
  </>);
}

function Info() {
  return <Alert>
    <ShieldCheck className="h-8 w-8" />
    <AlertTitle className="text-lg font-bold">Concatenate PDF files securely</AlertTitle>
    <AlertDescription className="text-md">
      This tool runs completely on your own device, so your documents are kept safe! However, you should never trust any website at face value, so feel free to disconnect from the Internet while using this tool.
    </AlertDescription>
  </Alert>;
}

const FileListingRow = memo(
  function FileListingRow({
    index,
    fileSelection,
    fileSelectionCount,
    setState,
  }: {
    index: number,
    fileSelection: FileSelection,
    fileSelectionCount: number,
    setState: React.Dispatch<React.SetStateAction<State>>,
  }) {

    const moveUp = (index: number) => {
      if (index === 0) return;

      setState((oldState) => {
        const newList = [...oldState.fileSelections];
        [newList[index], newList[index - 1]] = [newList[index - 1], newList[index]];

        return {
          ...oldState,
          fileName: resolveFileName(oldState, newList),
          fileSelections: newList,
        }
      });
    };

    const moveDown = (index: number) => {
      if (index === fileSelectionCount - 1) return;

      setState((oldState) => {
        const newList = [...oldState.fileSelections];
        [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];

        return {
          ...oldState,
          fileName: resolveFileName(oldState, newList),
          fileSelections: newList,
        }
      });
    };

    const onPageSelectionChanged = (id: string, newValue: string) => {
      setState((oldState) => {
        return {
          ...oldState,
          fileSelections: oldState.fileSelections.map((selection) =>
            selection.id === id ? { ...selection, pageSelection: newValue } : selection
          )
        };
      });
    };

    const onFileSelectionRemoved = (index: number) => {
      setState((oldState) => {
        const newFileSelections = [
          ...oldState.fileSelections.slice(0, index),
          ...oldState.fileSelections.slice(index + 1)
        ];

        return {
          ...oldState,
          fileSelections: newFileSelections,
          fileName: resolveFileName(oldState, newFileSelections)
        };
      });
    };

    return (
      <TableRow key={fileSelection.id}>
        <TableCell>{fileSelection.file.name}</TableCell>
        <TableCell>{fileSelection.pageCount}</TableCell>
        <TableCell>
          <Input
            value={fileSelection.pageSelection}
            onChange={(event) => onPageSelectionChanged(fileSelection.id, event.target.value)}
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

function fileSelectionsToWasmCompatible(fileSelections: FileSelection[]) {
  return fileSelections.map((selection) => { return { file: selection.file, pages: selection.pageSelection }; });
}

function resolveFileName(state: State, newSelections: FileSelection[]): string {
  if (newSelections.length === 0) {
    return "";
  }

  if (state.isDefaultName) {
    const newFirstName = newSelections[0].file.name;

    return generateNewFileName(newFirstName);
  }

  return state.fileName;
}
