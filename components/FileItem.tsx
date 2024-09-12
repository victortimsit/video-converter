import { ComponentPropsWithoutRef, FC, memo } from "react";

export interface FileItemData {
  id: string;
  file: File;
  status: "queued" | "processing" | "completed" | "failed";
  progress: number;
}

type FileItemProps = {
  data: FileItemData;
} & ComponentPropsWithoutRef<"div">;

const FileItem: FC<FileItemProps> = memo(({ data, ...rest }) => {
  const mediaClassName = "object-cover object-center rounded-xl aspect-square";
  const renderMedia = () => {
    if (data.status === "processing") {
      return (
        <div
          className={`${mediaClassName} w-full h-full bg-neutral-100 animate-pulse`}
        />
      );
    }
    if (data.file.type.startsWith("image")) {
      return (
        <img
          src={URL.createObjectURL(data.file)}
          alt={data.file.name}
          className={`${mediaClassName}`}
        />
      );
    }
    if (data.file.type.startsWith("video")) {
      return (
        <video
          src={URL.createObjectURL(data.file)}
          controls={false}
          className={`${mediaClassName}`}
        />
      );
    }
    return null;
  };

  const getStatusLabel = () => {
    switch (data.status) {
      case "queued":
        return data.file.name;
      case "processing":
        return "";
      // return `${Math.round(data.progress * 100)}%`;
      case "completed":
        return data.file.name;
      case "failed":
        return "Failed";
    }
  };

  return (
    <div {...rest} className={`${rest.className} w-20 group`}>
      <div className="relative">
        {renderMedia()}
        <div>
          {data.status != "processing" && (
            <span className="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-md">
              {(data.file.size / 1024 / 1024).toFixed(2)} MB
            </span>
          )}
        </div>
        <button
          onClick={() => {
            const url = URL.createObjectURL(data.file);
            const a = document.createElement("a");
            a.href = url;
            a.download = data.file.name;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 size-8 bg-black/50 backdrop-blur-md rounded-xl flex items-center justify-center text-xs text-white"
        >
          DL
        </button>
      </div>
      <div className="mt-1 text-xs">{getStatusLabel()}</div>
    </div>
  );
});

FileItem.displayName = "FileItem";

export default FileItem;
