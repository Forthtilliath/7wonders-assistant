import { ButtonSettings } from '@/components/ui/ButtonSettings';
import { Directory, Filesystem, Encoding } from '@capacitor/filesystem';
import { Section } from '@components/layout';


export default function Statistics() {
 const saveFile = async (fileName: string, data: string) => {
   await Filesystem.writeFile({
     path: fileName,
     data: data,
     directory: Directory.Documents,
     encoding: Encoding.UTF8,
   });
 };
  
  return (
    <main>
      <Section>
        <h1>Statistics</h1>
        <ButtonSettings onClick={() => saveFile('users.json', JSON.stringify({"name": "John"}))}>Save</ButtonSettings>
      </Section>
    </main>
  );
}