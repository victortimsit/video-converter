export interface FFmpegCommandInfo {
  originalCommand: string;
  args: string[];
  inputFilename: string | null;
  outputFilename: string | null;
}

export interface FFmpegCommandInfo {
  originalCommand: string;
  args: string[];
  inputFilename: string | null;
  outputFilename: string | null;
}

export function parseFFmpegCommand(command: string): FFmpegCommandInfo {
  // Store the original command
  const originalCommand = command.trim();

  // Match quoted strings and unquoted strings separately
  const parts = originalCommand.match(/'[^']*'|"[^"]*"|[^\s]+/g) || [];
  if (parts.length === 0) {
    throw new Error("Empty command provided");
  }

  // Remove the first element if it's "ffmpeg"
  if (parts[0]?.toLowerCase() === "ffmpeg") {
    parts.shift();
  }

  const args: string[] = [];
  let inputFilename: string | null = null;
  let outputFilename: string | null = null;
  let lastArgWasInput = false;

  // Iterate through the parts to find input and output filenames
  for (let i = 0; i < parts.length; i++) {
    let part = parts[i];

    // Remove leading and trailing quotes
    part = part.replace(/^["']|["']$/g, "");

    // Check if the current part is the input flag
    if (part === "-i") {
      lastArgWasInput = true;
    } else if (lastArgWasInput) {
      // The argument after "-i" is the input filename
      inputFilename = part;
      lastArgWasInput = false;
    } else if (i === parts.length - 1) {
      // The last argument is the output filename
      outputFilename = part;
    }

    args.push(part);
  }

  return {
    originalCommand,
    args,
    inputFilename,
    outputFilename,
  };
}

export function extractAndReplaceFilenames(
  ffmpegCommand: string,
  newInput: string,
  newOutputWithoutExtension: string
): {
  input: string;
  output: string;
  newInput: string;
  newOutput: string;
  args: string[];
  updatedCommand: string;
} | null {
  const inputRegex = /-i\s+([^\s]+)/;
  const outputRegex = /([^\s]+)\s*$/;

  const inputMatch = ffmpegCommand.match(inputRegex);
  const outputMatch = ffmpegCommand.match(outputRegex);

  if (inputMatch && outputMatch) {
    const input = inputMatch[1];
    const output = outputMatch[1];

    // Extract the original output file extension
    const outputExtension = output.substring(output.lastIndexOf("."));

    // Construct the new output filename with the original extension
    const newOutput = `${newOutputWithoutExtension}${outputExtension}`;

    // Replace the old input and output filenames with the new ones in the command string
    let updatedCommand = ffmpegCommand.replace(inputRegex, `-i ${newInput}`);
    updatedCommand = updatedCommand.replace(outputRegex, newOutput);
    // Remove double quotes
    updatedCommand = updatedCommand.replace(/"/g, "");

    // Split the command into an array of arguments
    const args = updatedCommand.split(/\s+/).slice(1); // Split by whitespace and remove the first "ffmpeg"

    return {
      input,
      output,
      newInput,
      newOutput,
      args,
      updatedCommand,
    };
  }

  return null; // Return null if no matches are found
}
