import { forth, mike } from '@/assets/devs';
import { logo_mobile, logo_tablet } from '@/assets/logo';
import { CardDev } from '@/components/cards/CardDev';
import { APP_CONST } from '@/constants/app';

export default function About() {
  return (
    <main className="flex h-full flex-col content-center items-center justify-evenly">
      <section className="flex flex-col gap-4 px-4 text-center text-gray-400">
        <picture>
          <source media="(max-width: 767px)" srcSet={logo_mobile} />
          <source media="(min-width: 768px)" srcSet={logo_tablet} />
          <img src={logo_mobile} alt="7 Wonders Logo" />
        </picture>
        <h2>7 Wonders: Assistant</h2>
        <p>Version {APP_CONST.version}</p>
      </section>

      <section>
        <h2 className="my-4 text-center text-lg">Nos Développeurs</h2>
        <div className="flex justify-between gap-4">
          <CardDev
            href="https://github.com/Forthtilliath"
            avatar={forth}
            name="Forth"
          />
          <CardDev
            href="https://github.com/mickaelrebeau"
            avatar={mike}
            name="Mike_DreeMan"
          />
        </div>
      </section>
    </main>
  );
}
