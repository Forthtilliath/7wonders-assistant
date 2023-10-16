import { Section } from '@components/layout';
import { SiBuymeacoffee } from '@components/shared/Icons';

export default function Support() {
  return (
    <main>
      <Section className="flex flex-col items-center gap-8 p-[15%]">
        <SiBuymeacoffee size="8em" />
        <p>
          <a href="https://streamlabs.com/mike_dreeman/tip">
            Buy Us a Coffee (Or Buy Us A Lambo 🤣)
          </a>
        </p>
      </Section>
    </main>
  );
}
