export async function fetchFFmpegCommand(
  instruction: string,
  inputFilename: string
): Promise<{ ffmpeg_command: string }> {
  const response = await fetch("/api/task", {
    method: "POST",
    body: JSON.stringify({
      instruction,
      input_filename: inputFilename,
    }),
  });

  const data = await response.json();
  const AiRes: string = data.choices[0].message.content;
  return JSON.parse(AiRes) as { ffmpeg_command: string };
}
