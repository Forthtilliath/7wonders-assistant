import { saveFile } from '@/helpers';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import indexeddb from 'fake-indexeddb';

globalThis.indexedDB = indexeddb;
const fileName = 'test.txt';

describe('File methods', () => {
  beforeEach(async () => {
    try {
      await Filesystem.deleteFile({
        path: 'test.txt',
        directory: Directory.Documents,
      });
    } catch {
      //
    }
  });
  describe('Method: saveFile()', () => {
    it('should save a file with a given file name and data in the Documents directory', async () => {
      const data = { name: 'John Doe', age: 25 };

      await saveFile(fileName, data);

      const fileExists = await Filesystem.readFile({
        path: fileName,
        directory: Directory.Documents,
      });
      expect(fileExists).toBeTruthy();

      const fileContent = await Filesystem.readFile({
        path: fileName,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });
      expect(fileContent.data).toEqual(JSON.stringify(data));
    });

    it('should throw an error when the file name is empty', async () => {
      const fileName = '';
      const data = { name: 'John Doe', age: 25 };

      await expect(saveFile(fileName, data)).rejects.toThrow();
    });

    it('should not throw an error when the data is empty object', async () => {
      const data = {};

      await saveFile(fileName, data);

      const fileContent = await Filesystem.readFile({
        path: fileName,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });
      expect(fileContent.data).toEqual(JSON.stringify(data));
    });

    it('should not throw an error when the data is empty array', async () => {
      const data = [] as unknown[];

      await saveFile(fileName, data);

      const fileContent = await Filesystem.readFile({
        path: fileName,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });
      expect(fileContent.data).toEqual(JSON.stringify(data));
    });

    it('should throw an error if file name is too long', async () => {
      const fileName =
        'thisIsAVeryLongFileNameThatExceedsTheMaximumAllowedLength.txt';
      const data = { name: 'John Doe', age: 25 };

      await expect(saveFile(fileName, data)).rejects.toThrow(
        'File name is invalid!'
      );
    });
  });
});
