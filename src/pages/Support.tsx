import { useTranslation } from 'react-i18next';
import { Section } from '@components/layout';
import { SiBuymeacoffee } from '@components/shared/Icons';
import { APP_CONST } from '@constants';

export default function Support() {
  const { t } = useTranslation();
  return (
    <main>
      <Section className="flex flex-col items-center gap-8 pt-[15vh]">
        <a
          href={APP_CONST.tips_link}
          aria-label={t('support.buy_coffee_aria_label')}>
          <SiBuymeacoffee size="8em" />
        </a>
        <a href={APP_CONST.tips_link} className="text-center">
          {t('support.buy_coffee')}
          <br />({t('support.buy_coffee_2')} 🤣)
        </a>
      </Section>
    </main>
  );
}
