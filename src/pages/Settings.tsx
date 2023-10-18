import { useTranslation } from 'react-i18next';
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
                  <label className="flex items-center gap-3 p-2 text-white">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      name={extension}
                      checked={settings.includes(extension)}
                      onChange={onChange}
                    />
                    {extension}
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
              className={cn('border-b border-transparent px-10 py-2', {
                'border-wonders-yellow': i18n.language === 'en',
              })}>
              {t('settings.english')}
            </button>
            <button
              onClick={() => i18n.changeLanguage('fr')}
              className={cn('border-b border-transparent px-10 py-2', {
                'border-wonders-yellow': i18n.language === 'fr',
              })}>
              {t('settings.french')}
            </button>
          </div>
        </GroupInputs>

        <GroupInputs title={t('settings.saves')} className="mt-8"></GroupInputs>
      </Section>
    </main>
  );
}
