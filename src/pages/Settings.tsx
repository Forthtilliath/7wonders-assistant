import { Section } from '@components/layout';
import { GroupInputs } from '@components/shared';
import { useLocalStorage } from '@hooks';
import { EXTENSIONS } from '@constants';

type Settings = Partial<Record<Extension, boolean>>;

const languages = [
  { label: 'English', value: 'en' },
  { label: 'Français', value: 'fr' },
];

export default function Settings() {
  const [settings, setSettings] = useLocalStorage<Settings>('settings', {});

  const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const formData = new FormData(e.currentTarget.form!);
    const arrSettings = Array.from(formData).map(([k, v]) => [k, Boolean(v)]);
    setSettings(Object.fromEntries(arrSettings));
  };

  return (
    <main>
      <Section>
        <GroupInputs title="Extensions">
          <form>
            <ul className="mt-3 flex flex-col gap-2">
              {EXTENSIONS.map((extension) => (
                <li key={extension}>
                  <label className="flex items-center gap-3 p-2 text-white">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-wonders-yellow"
                      name={extension}
                      defaultChecked={settings[extension]}
                      onChange={onChange}
                    />
                    {extension}
                  </label>
                </li>
              ))}
            </ul>
          </form>
        </GroupInputs>
        <GroupInputs title="Languages" className="mt-8">
          <ul className="mt-3 flex flex-col gap-2">
            {languages.map((item, index) => (
              <li key={index}>
                <label className="flex items-center gap-3 p-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-blue-500"
                    value={item.value}
                  />
                  {item.label}
                </label>
              </li>
            ))}
          </ul>
        </GroupInputs>
      </Section>
    </main>
  );
}
