import { useTranslation } from 'react-i18next';
import { Section } from '@components/layout';
import { generateURL } from '@helpers';

export default function Feedback() {
  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    window.location.href = generateURL(
      'mailto:abc@test.fr',
      new FormData(e.currentTarget)
    );
  };
  const { t } = useTranslation();

  return (
    <main>
      <Section className="mt-[10%] p-4">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">
            <label htmlFor="subject">{t('feedback.subject')}</label>
            <input
              className="rounded p-2 text-gray-900"
              name="subject"
              id="subject"
              type="text"
            />
          </div>
          <div className="mt-8 flex flex-col gap-4">
            <label htmlFor="body">{t('feedback.message')}</label>
            <textarea
              className="rounded p-2 text-gray-900"
              name="body"
              id="body"
              rows={5}></textarea>
          </div>
          <button
            className="mt-8 w-full rounded bg-wonders-blue p-2"
            type="submit">
            {t('feedback.send')}
          </button>
        </form>
      </Section>
    </main>
  );
}
