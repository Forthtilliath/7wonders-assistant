import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";

export async function saveFile (fileName: string, data: Record<string, unknown>)  {
  await Filesystem.writeFile({
    path: fileName,
    data: JSON.stringify(data),
    directory: Directory.Documents,
    encoding: Encoding.UTF8,
  });
}