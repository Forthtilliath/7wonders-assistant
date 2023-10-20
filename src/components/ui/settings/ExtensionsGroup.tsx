import { useTranslation } from 'react-i18next';
import { GroupInputs } from '@components/shared';
import { cn } from '@helpers';
import { useLocalStorage } from '@hooks';
import { EXTENSIONS } from '@constants';

export function ExtensionsGroup() {
  const { t } = useTranslation();
  const [extensions, setExtensions] = useLocalStorage<Extension[]>(
    'extensions',
    []
  );

  const onChange: InputChangeEventHandler = (e) => {
    const formData = new FormData(e.currentTarget.form!);
    const arrExtensions = Array.from(formData).map(([k]) => k as Extension);
    setExtensions(arrExtensions);
  };

  return (
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
                  checked={extensions.includes(extension)}
                  onChange={onChange}
                />
                <div
                  className={cn(
                    // === Base ===
                    'peer h-6 w-11 rounded-full',
                    // === After ===
                    "after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:transition-all after:content-['']",
                    // === Unchecked ===
                    'border after:border-wonders-blue after:bg-wonders-yellow dark:border-wonders-yellow dark:bg-[#151E36]',
                    // === Checked ===
                    'peer-checked:bg-[#235782] peer-checked:after:translate-x-full peer-checked:after:border-[#235782]',
                    // === Focused ===
                    'peer-focus:ring-2 peer-focus:ring-wonders-yellow'
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
  );
}
