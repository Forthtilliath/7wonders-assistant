import { assertsIsDefined } from '@/helpers';
import html2canvas, { Options } from 'html2canvas';

function downloadFile(url: string, filename: string) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;

  if (typeof link.download === 'undefined') {
    // Fallback for browsers that do not support the download attribute
    window.open(url);
  } else {
    link.click();
  }
}

export function useSave() {
  const download = (data: unknown, filename = 'file.json') => {
    try {
      const json = JSON.stringify(data);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      downloadFile(url, filename);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error during JSON.stringify:', error);
      // Handle the error or show an error message to the user
    }
  };

  const saveAsImage = (
    element: HTMLElement | null,
    filename = 'image.png',
    options?: Partial<Options> | undefined
  ) => {
    assertsIsDefined(element);

    const canvasOptions = Object.assign(
      {
        backgroundColor: '#1d1e22',
      },
      options
    );

    html2canvas(element, canvasOptions).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      downloadFile(imgData, filename);
    });
  };

  return { download, saveAsImage } as const;
}
