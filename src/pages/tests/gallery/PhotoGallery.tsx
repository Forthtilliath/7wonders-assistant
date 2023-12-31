import { usePhotoGallery } from '@hooks';

export function PhotoGallery() {
  const { photos } = usePhotoGallery();
  return (
    <div className="mx-auto grid max-w-[800px] grid-cols-3 gap-2">
      {photos.map((photo: PhotoItem) => (
        <img
          key={photo.filePath}
          src={photo.webviewPath}
          alt="Gallery photo"
          width={250}
          height={250}
        />
      ))}
    </div>
  );
}
