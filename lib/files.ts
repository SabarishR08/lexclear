export type UploadKind = "pdf" | "docx";

const PDF_MAGIC = "%PDF-";
const ZIP_MAGIC = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
const DOCX_MARKER = "word/";

/**
 * A client can claim any MIME type, so confirm the bytes really are a PDF or a
 * DOCX (an OOXML package is a zip archive containing a `word/` part) before
 * handing the buffer to a parser.
 */
export function detectUploadKind(buffer: Buffer): UploadKind | null {
  if (buffer.length === 0) return null;

  const header = buffer.subarray(0, PDF_MAGIC.length).toString("latin1");
  if (header === PDF_MAGIC) return "pdf";

  const isZip = buffer.subarray(0, ZIP_MAGIC.length).equals(ZIP_MAGIC);
  if (isZip && buffer.includes(DOCX_MARKER)) return "docx";

  return null;
}
