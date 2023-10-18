import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Section } from '@components/layout';
import { GroupInputs } from '@components/shared';
import { cn } from '@helpers';
import { useLocalStorage } from '@hooks';
import { EXTENSIONS } from '@constants';

type Settings = Partial<Record<Extension, boolean>>;

export default function Settings() {
  const { i18n, t } = useTranslation();
  const [settings, setSettings] = useLocalStorage<Extension[]>('settings', []);

  const onChange: InputChangeEventHandler = (e) => {
    const formData = new FormData(e.currentTarget.form!);
    const arrSettings = Array.from(formData).map(([k]) => k as Extension);
    setSettings(arrSettings);
  };

  return (
    <main>
      <Section>
        <GroupInputs title={t('settings.extensions')}>
          <form>
            <ul className="mt-3 flex flex-col gap-2">
              {EXTENSIONS.map((extension) => (
                <li key={extension}>
                  <label className="relative mb-4 inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      name={extension}
                      checked={settings.includes(extension)}
                      onChange={onChange}
                    />
                    <div
                      className={cn(
                        // === Base ===
                        'peer h-6 w-11 rounded-full',
                        // === After ===
                        "after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:transition-all after:content-['']",
                        // === Unchecked ===
                        'border after:border-wonders-blue after:bg-[#F2E257] dark:border-[#F2E257] dark:bg-[#151E36]',
                        // === Checked ===
                        'peer-checked:bg-[#235782] peer-checked:after:translate-x-full peer-checked:after:border-[#235782]',
                        // === Focused ===
                        'peer-focus:ring-2 peer-focus:ring-[#F2E257]'
                      )}
                    />
                    <span className="ml-3 text-sm font-medium capitalize text-gray-900 dark:text-gray-300">
                      {extension}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </form>
        </GroupInputs>

        <GroupInputs title={t('settings.language')} className="mt-8">
          <div className="mt-3 flex justify-center gap-2">
            <button
              onClick={() => i18n.changeLanguage('en')}
              className={cn('relative border-b border-transparent px-10 py-2', {
                // 'border-wonders-yellow': i18n.language === 'en',
              })}>
              {t('settings.english')}
              {i18n.language === 'en' && (
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
              {i18n.language === 'fr' && (
                <motion.div
                  layoutId="underline"
                  className="absolute left-0 top-full h-1 w-full bg-wonders-yellow"
                />
              )}
            </button>
          </div>
        </GroupInputs>

        <GroupInputs title={t('settings.saves')} className="mt-8"></GroupInputs>
      </Section>
    </main>
  );
}
