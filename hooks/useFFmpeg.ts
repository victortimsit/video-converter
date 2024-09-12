import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const FFmpeg = dynamic(
  // @ts-ignore
  () => import("@ffmpeg/ffmpeg").then((mod) => mod.FFmpeg),
  { ssr: false }
);

export function useFFmpeg() {
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const ffmpegRef = useRef<any>(null);

  useEffect(() => {
    const loadFFmpeg = async () => {
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
      const { toBlobURL } = await import("@ffmpeg/util");

      if (!ffmpegRef.current) {
        // @ts-ignore
        ffmpegRef.current = new (await FFmpeg)();
      }
      const ffmpeg = ffmpegRef.current;

      // @ts-ignore
      ffmpeg.on("log", ({ message }) => {
        setMessage(message);
        console.log(message);
      });

      // @ts-ignore
      ffmpeg.on("progress", ({ progress, time }) => {
        setProgress(progress);
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
      });

      setLoaded(true);
    };

    loadFFmpeg();
  }, []);

  return { ffmpeg: ffmpegRef.current, loaded, message, progress };
}
