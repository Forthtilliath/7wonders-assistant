// https://youtu.be/-wkA8ESciyg
// https://capacitorjs.com/docs/apis/camera
import { useEffect, useState } from 'react';
import {
  Camera,
  CameraResultType,
  CameraSource,
  Photo,
} from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { assertsIsDefined } from '@helpers';

const PHOTOS_PREF_KEY = 'photos';

export type PhotoItem = {
  filePath: string;
  webviewPath: string;
};

export function usePhotoGallery() {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);

  useEffect(() => {
    const loadSaved = async () => {
      const { value } = await Preferences.get({ key: PHOTOS_PREF_KEY });
      const photosInPrefs: PhotoItem[] = value ? JSON.parse(value) : [];

      if (!Capacitor.isNativePlatform()) {
        for (const photo of photosInPrefs) {
          const file = await Filesystem.readFile({
            path: photo.filePath,
            directory: Directory.Data,
          });
          photo.webviewPath = `data:image/jpeg;base64,${file.data}`;
        }
      }

      setPhotos(photosInPrefs);
    };
    loadSaved();
  }, []);

  useEffect(() => {
    if (photos.length) {
      Preferences.set({ key: PHOTOS_PREF_KEY, value: JSON.stringify(photos) });
    }
  }, [photos]);

  const takePhoto = async () => {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100,
    });

    const fileName = new Date().getTime() + '.jpeg';

    const saveFileImage = await savePhoto(photo, fileName);

    setPhotos((p) => [...p, saveFileImage]);
  };

  const savePhoto = async (
    photo: Photo,
    fileName: string
  ): Promise<PhotoItem> => {
    assertsIsDefined(photo.webPath, 'No web path provided');

    let base64data: string | Blob;

    if (Capacitor.isNativePlatform()) {
      assertsIsDefined(photo.path, 'No path provided');

      const file = await Filesystem.readFile({
        path: photo.path,
      });
      base64data = file.data;
    } else {
      base64data = await base64FromPath(photo.webPath);
    }

    const savedFile = await Filesystem.writeFile({
      path: fileName,
      directory: Directory.Data,
      data: base64data,
    });

    if (Capacitor.isNativePlatform()) {
      return {
        filePath: savedFile.uri,
        webviewPath: Capacitor.convertFileSrc(savedFile.uri),
      };
    }
    return {
      filePath: fileName,
      webviewPath: photo.webPath,
    };
  };

  async function base64FromPath(path: string): Promise<string> {
    const response = await fetch(path);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject('Method did not return a string');
        }
      };

      reader.readAsDataURL(blob);
    });
  }

  const deletePhoto = async (fileName: string) => {
    setPhotos((p) => p.filter((photo) => photo.filePath !== fileName));

    await Filesystem.deleteFile({
      path: fileName,
      directory: Directory.Data,
    });
  };

  return { photos, takePhoto, savePhoto, deletePhoto };
}
