import { useTranslation } from 'react-i18next';
import { Section } from '@components/layout';
import { SiBuymeacoffee } from '@components/shared/Icons';

export default function Support() {
  const {t} = useTranslation();
  return (
    <main>
      <Section className="flex flex-col items-center gap-8 pt-[15vh]">
        <SiBuymeacoffee size="8em" />
        <a
          href="https://streamlabs.com/mike_dreeman/tip"
          className="text-center">
          {t('support.buy_coffee')}
          <br />
          ({t('support.buy_coffee_2')} 🤣)
        </a>
      </Section>
    </main>
  );
}
