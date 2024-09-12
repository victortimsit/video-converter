import { ComponentPropsWithoutRef, FC, useRef } from "react";

type FileUploadButtonProps = {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
} & ComponentPropsWithoutRef<"div">;

const FileUploadButton: FC<FileUploadButtonProps> = ({ onChange, ...rest }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      {...rest}
      className={`${rest.className} size-20 shrink-0 bg-neutral-950 text-white rounded-2xl font-medium p-4`}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={onChange}
      />
      <button
        className="w-full h-full"
        onClick={() => inputRef.current?.click()}
      >
        Add Files
      </button>
    </div>
  );
};

export default FileUploadButton;
