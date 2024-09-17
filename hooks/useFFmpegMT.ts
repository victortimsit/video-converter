import { useEffect, useRef, useState } from "react";

export function useFFmpegMT() {
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const ffmpegRef = useRef<any>(null);

  useEffect(() => {
    const loadFFmpeg = async () => {
      const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/umd";

      const [{ FFmpeg }, { toBlobURL }] = await Promise.all([
        import("@ffmpeg/ffmpeg"),
        import("@ffmpeg/util"),
      ]);

      ffmpegRef.current = new FFmpeg();
      const ffmpeg = ffmpegRef.current;

      // Handle log messages (ensure only strings are passed)

      // @ts-ignore
      ffmpeg.on("log", ({ message }) => {
        setMessage(message); // Make sure this is always a string
        console.log(message);
      });

      // @ts-ignore
      // Handle progress updates (ensure only numbers/serializable data)
      ffmpeg.on("progress", ({ progress, time }) => {
        setProgress(progress); // Progress should always be a number
        console.log(`Progress: ${progress}, time: ${time}`);
      });

      await ffmpeg.load({
        coreURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.js`,
          "text/javascript"
        ),
        wasmURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.wasm`,
          "application/wasm"
        ),
        workerURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.worker.js`,
          "text/javascript"
        ),
      });

      setLoaded(true);
    };

    loadFFmpeg();
  }, []);

  return { ffmpeg: ffmpegRef.current, loaded, progress, message };
}
