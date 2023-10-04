import { GroupInputs } from '@/components/shared/GroupInputs';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const extensions = ['Armada', 'Cities', 'Edifice', 'Leaders'] as const;

type Settings = Partial<Record<(typeof extensions)[number], string>>;

const languages = [
  { label: 'English', value: 'en' },
  { label: 'Français', value: 'fr' },
];

export default function Settings() {
  const [settings, setSettings] = useLocalStorage<Settings>('settings', {});

  const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const formData = new FormData(e.currentTarget.form!);
    setSettings(Object.fromEntries(formData));
  };

  return (
    <main className="p-4">
      <GroupInputs title="Extensions">
        <form>
          <ul className="mt-3 flex flex-col gap-2">
            {extensions.map((extension) => (
              <li key={extension}>
                <label className="flex items-center gap-3 p-2 text-white">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-wonders-yellow"
                    name={extension}
                    checked={settings[extension] === 'true'}
                    onChange={onChange}
                    value={'true'}
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
    </main>
  );
}
