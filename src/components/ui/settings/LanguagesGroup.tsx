import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { GroupInputs } from '@components/shared';
import { cn } from '@helpers';

export function LanguagesGroup() {
  const { i18n, t } = useTranslation();

  return (
    <GroupInputs title={t('settings.language')} className="mt-8">
      <div className="mt-3 flex justify-center gap-2">
        <button
          onClick={() => i18n.changeLanguage('en')}
          className={cn('relative border-b border-transparent px-10 py-2', {
            // 'border-wonders-yellow': i18n.language === 'en',
          })}>
          {t('settings.english')}
          {i18n.resolvedLanguage === 'en' && (
            <motion.div
              layoutId="underline"
              className="absolute left-0 top-full h-1 w-full bg-wonders-yellow"
            />
          )}
        </button>

        <button
          onClick={() => i18n.changeLanguage('fr')}
          className={cn('relative border-b border-transparent px-10 py-2', {
            // 'border-wonders-yellow': i18n.language === 'fr',
          })}>
          {t('settings.french')}
          {i18n.resolvedLanguage === 'fr' && (
            <motion.div
              layoutId="underline"
              className="absolute left-0 top-full h-1 w-full bg-wonders-yellow"
            />
          )}
        </button>
      </div>
    </GroupInputs>
  );
}
