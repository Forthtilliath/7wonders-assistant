import { Section } from '@components/layout';
import {
  ExtensionsGroup,
  LanguagesGroup,
  SavesGroup,
} from '@components/ui/settings';

export default function Settings() {
  return (
    <main>
      <Section>
        <ExtensionsGroup />
        <LanguagesGroup />
        <SavesGroup />
      </Section>
    </main>
  );
}
