export function getMimeType(filename: string): string {
  // Define a mapping of file extensions to MIME types
  const mimeTypes: { [key: string]: string } = {
    mp4: "video/mp4",
    webm: "video/webm",
    jpeg: "image/jpeg",
    jpg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    mp3: "audio/mpeg",
    wav: "audio/wav",
    ogg: "audio/ogg",
    avi: "video/x-msvideo",
    mov: "video/quicktime",
    mkv: "video/x-matroska",
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    txt: "text/plain",
    html: "text/html",
    css: "text/css",
    js: "application/javascript",
    json: "application/json",
    xml: "application/xml",
    zip: "application/zip",
    tar: "application/x-tar",
    rar: "application/x-rar-compressed",
    default: "application/octet-stream",
  };

  // Extract the file extension from the filename
  const extension = filename.split(".").pop()?.toLowerCase();

  // Return the corresponding MIME type or null if not found
  return extension ? mimeTypes[extension] : mimeTypes.default;
}

export function replaceFilename(filename: string, newName: string): string {
  // Find the last dot in the filename to separate the name and the extension
  const lastDotIndex = filename.lastIndexOf(".");

  if (lastDotIndex === -1) {
    // No extension found, just return the new name
    return newName;
  }

  // Get the extension from the original filename
  const extension = filename.slice(lastDotIndex);

  // Return the new filename with the original extension
  return `${newName}${extension}`;
}

export function removeExtension(filename: string): string {
  // Find the last dot in the filename to separate the name and the extension
  const lastDotIndex = filename.lastIndexOf(".");

  if (lastDotIndex === -1) {
    // No extension found, return the filename as is
    return filename;
  }

  // Return the filename without the extension
  return filename.slice(0, lastDotIndex);
}
