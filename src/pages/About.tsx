import { useTranslation } from 'react-i18next';
import { Section } from '@components/layout';
import { CardDev } from '@components/cards/CardDev';
import { APP_CONST } from '@constants';
import { forth, mike } from '@assets/devs';
import { logo_mobile, logo_tablet } from '@assets/logo';

export default function About() {
  const { t } = useTranslation();
  return (
    <main>
      <Section className="flex h-full flex-col content-center items-center justify-evenly">
        <div className="flex flex-col gap-4 text-center text-gray-400">
          <picture>
            <source media="(max-width: 767px)" srcSet={logo_mobile} />
            <source media="(min-width: 768px)" srcSet={logo_tablet} />
            <img src={logo_mobile} alt="7 Wonders Logo" />
          </picture>
          <h2 className="text-3xl text-slate-100">{APP_CONST.title}</h2>
          <p>
            {t('about.version')} {APP_CONST.version}
          </p>
        </div>

        <div>
          <h2 className="my-4 text-center text-lg">{t('about.developers')}</h2>
          <div className="flex justify-center gap-4">
            <CardDev
              href="https://github.com/Forthtilliath"
              avatar={forth}
              name="Forth"
              className="w-2/5"
              classNameImg="border-4"
            />
            <CardDev
              href="https://github.com/mickaelrebeau"
              avatar={mike}
              name="Mike_DreeMan"
              className="w-2/5"
            />
          </div>
        </div>
      </Section>
    </main>
  );
}
