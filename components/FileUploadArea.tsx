import { ComponentPropsWithoutRef, FC, useRef, useState } from "react";

type FileUploadAreaProps = {} & ComponentPropsWithoutRef<"div">;

const FileUploadArea: FC<FileUploadAreaProps> = ({ ...rest }) => {
  const [hovering, setHovering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInputChange = () => {
    if (fileInputRef.current?.files) {
      console.log(fileInputRef.current.files);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    console.log(e.dataTransfer.files);
    e.preventDefault();
    e.stopPropagation();
    setHovering(false);
    if (e.dataTransfer.files.length) {
      console.log(e.dataTransfer.files);
    }
  };
  return (
    <div
      {...rest}
      className={`${rest.className} absolute inset-0 z-50 ${
        hovering ? "bg-gray-200" : ""
      }`}
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={() => setHovering(true)}
      onDragLeave={() => setHovering(false)}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="*"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
      />
    </div>
  );
};

export default FileUploadArea;
