import { useState } from 'react';
import { DataVersion } from '@lib';

// const defaultValue = {
//   players: [],
//   history: [],
//   settings: { version: '' },
// };

export function useLoadFile() {
  const [data, setData] = useState<DataVersion | null>(null);

  const onChange: InputChangeEventHandler = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        const data = JSON.parse(content);
        // Conversion data to last version
        // if (data.s)
        setData(data);
      }
    };

    reader.readAsText(file);
  };

  return [data, onChange] as const;
}
