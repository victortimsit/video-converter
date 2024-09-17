"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useFFmpegMT } from "../hooks/useFFmpegMT";
import { fetchFFmpegCommand } from "../utils/apiUtils";
import { extractAndReplaceFilenames } from "../utils/ffmpegUtils";
import {
  getMimeType,
  removeExtension,
  replaceFilename,
} from "../utils/fileUtils";
import FileItem, { FileItemData } from "./FileItem";
import FileUploadButton from "./FileUploadButton";

// Dynamic imports for FFmpeg-related modules
// @ts-ignore
const FFmpeg = dynamic(
  // @ts-ignore
  () => import("@ffmpeg/ffmpeg").then((mod) => mod.FFmpeg),
  { ssr: false }
);
const fetchFile = dynamic(
  () => import("@ffmpeg/util").then((mod) => mod.fetchFile),
  { ssr: false }
);

interface Message {
  id: string; // Unique identifier for each message
  fileItems: FileItemData[];
  role: "input" | "output" | "processing";
  text: string;
  ffmpegCommand?: string;
}

export default function FFmpegComponent() {
  const [instruction, setInstruction] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const { ffmpeg, loaded, message, progress } = useFFmpegMT();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const uploadedFiles = Array.from(e.target.files);
      const newFileItems: FileItemData[] = uploadedFiles.map((file) => ({
        id: uuidv4(),
        file,
        status: "queued",
        progress: 0,
      }));
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: uuidv4(),
          fileItems: newFileItems,
          role: "input",
          text: "Original",
        },
      ]);
    }
  };

  const handleTranscode = async () => {
    const latestMessage = messages[messages.length - 1];
    if (!latestMessage) {
      alert("Please upload files before submitting.");
      return;
    }

    const processingFileItems: FileItemData[] = latestMessage.fileItems.map(
      (fileItem) => ({
        ...fileItem,
        status: "processing", // Update only serializable data
      })
    );

    const newMessage: Message = {
      id: uuidv4(),
      fileItems: processingFileItems, // This contains file objects and status only
      role: "output",
      text: instruction,
    };

    setInstruction(""); // Clear instruction input
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    const { ffmpeg_command } = await fetchFFmpegCommand(
      instruction,
      replaceFilename(processingFileItems[0].file.name, "input")
    );

    // Update the message with the FFmpeg command
    updateMessage(newMessage.id, { ffmpegCommand: ffmpeg_command });

    for (const fileItem of processingFileItems) {
      try {
        const newOutputFile = await transcode(ffmpeg_command, fileItem.file);

        // Mark as completed if transcoding succeeds
        if (newOutputFile)
          updateFile(newMessage.id, fileItem.id, {
            status: "completed",
            file: newOutputFile, // Return new file here
            progress: 1,
          });
      } catch (error) {
        console.error("Error during transcoding:", error);

        // Mark as failed if an error occurs
        updateFile(newMessage.id, fileItem.id, {
          status: "failed",
          progress: 1,
        });
      }
    }
  };

  const updateFile = (
    messageId: string,
    fileId: string,
    update: Partial<FileItemData>
  ) => {
    setMessages((prevMessages) =>
      prevMessages.map((message) =>
        message.id === messageId
          ? {
              ...message,
              fileItems: message.fileItems.map((fileItem) =>
                fileItem.id === fileId ? { ...fileItem, ...update } : fileItem
              ),
            }
          : message
      )
    );
  };

  const updateMessage = (messageId: string, update: Partial<Message>) => {
    setMessages((prevMessages) =>
      prevMessages.map((message) =>
        message.id === messageId ? { ...message, ...update } : message
      )
    );
  };

  async function transcode(ffmpegCommand: string, file: File) {
    try {
      const tempInputFilename = replaceFilename(file.name, uuidv4());
      const tempOutputFilename = replaceFilename(file.name, uuidv4());

      // Extract and replace filenames in the ffmpeg command
      const extracted = extractAndReplaceFilenames(
        ffmpegCommand,
        tempInputFilename,
        tempOutputFilename
      );
      if (!extracted) throw new Error("Error extracting filenames");

      const outputFilename = replaceFilename(
        extracted.output,
        removeExtension(file.name)
      );

      const fetchFileModule = await fetchFile;
      // @ts-ignore
      // Ensure only File data is passed to the worker (avoid non-serializable data)
      const fileData = await fetchFileModule(file);

      // Only pass serializable data to ffmpeg worker
      await ffmpeg.writeFile(extracted.newInput, fileData);

      console.log("Transcoding:", extracted.args);

      // Execute the ffmpeg command
      await ffmpeg.exec(extracted.args);

      // Read the output file from ffmpeg worker
      const data = await ffmpeg.readFile(extracted.newOutput);

      // Create a new File object with the output data and return it
      return new File([data], outputFilename, {
        type: getMimeType(extracted.newOutput),
      });
    } catch (error) {
      console.error("Transcoding error:", error);
      return null;
    }
  }

  const handleDownloadAll = (message: Message) => {
    // Download all files in the message
    message.fileItems.forEach((fileItem) => {
      const url = URL.createObjectURL(fileItem.file);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileItem.file.name;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  return loaded ? (
    <div className="w-full flex-1 max-w-3xl flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto flex flex-col gap-8 my-8">
        {messages.map((message) => (
          <div key={message.id} className="mb-4">
            <p className="font-medium text-lg ml-20 px-2">{message.text}</p>
            {message.ffmpegCommand && (
              <p className="font-medium text-xs ml-20 mt-1 px-2 text-neutral-500">
                {message.ffmpegCommand}
              </p>
            )}
            <div className={`flex gap-2 mt-2`}>
              {message.role == "output" ? (
                <button
                  className="font-medium bg-neutral-100 p-4 rounded-xl size-20 shrink-0"
                  onClick={() => handleDownloadAll(message)}
                >
                  DL All
                </button>
              ) : (
                <div className="size-20 shrink-0" />
              )}
              {message.fileItems.map((fileItem) => (
                <FileItem key={fileItem.id} data={fileItem} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mt-16">
        <FileUploadButton onChange={handleFileUpload} />
        <form
          className="flex w-full mx-auto justify-center"
          onSubmit={(e) => {
            e.preventDefault(); // Prevent the page from refreshing
            handleTranscode(); // Call your function to handle the form submission
          }}
        >
          <div className="relative w-full">
            <input
              autoComplete="off"
              id="instruction"
              ref={(ref) => {
                if (ref) ref.focus();
              }}
              className="text-3xl outline-none w-full bg-transparent p-4 rounded-xl"
              placeholder="Write what you want to do with the file"
              type="text"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
            />
            <div className="w-20 right-0 top-0 h-full absolute bg-gradient-to-l from-white to-transparent" />
          </div>
          <button
            type="submit"
            className="font-medium bg-neutral-100 px-6 py-2 rounded-xl h-20"
          >
            Submit
          </button>
        </form>
      </div>

      <p className="font-xs text-neutral-400 mt-16 truncate text-center">
        {message && progress
          ? `${Math.round(progress * 100)}% - ${message}`
          : "Waiting for instructions"}
      </p>
    </div>
  ) : (
    <div>Loading ffmpeg-core (~31 MB)</div>
  );
}
