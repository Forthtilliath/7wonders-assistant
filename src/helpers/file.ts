import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';

/**
 * Saves data to a file.
 *
 * @param fileName - The name of the file to be saved.
 * @param data - The data to be written to the file.
 * @throws {Error} If the file name is invalid or if there is an error during the file writing process.
 */
export async function saveFile(
  fileName: string,
  data: Record<string, unknown> | Array<unknown>
) {
  const regex = /^[\w,\s-]+\.[a-zA-Z0-9]{2,4}$/;

  if (!regex.test(fileName) || fileName.length > 25) {
    throw new Error('File name is invalid!');
  }
  
  try {
    await Filesystem.writeFile({
      path: fileName.trim(),
      data: JSON.stringify(data),
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
    });
  } catch (error) {
    throw new Error('Failed to save file');
  }
}
