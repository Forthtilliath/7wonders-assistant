import forth from '@/assets/devs/logo-forth.webp';
import mike from '@/assets/devs/logo-mike.webp';
import logo_mobile from '@/assets/logo-wonders-mobile.webp';
import logo_tablet from '@/assets/logo-wonders-tablet.webp';
import { CardDev } from '@/components/cards/CardDev';

export default function About() {
  const version = '0.1.0';

  return (
    <main className="flex h-full flex-col content-center items-center justify-evenly">
      <section className="flex flex-col gap-4 px-4 text-center text-gray-400">
        <picture>
          <source
            media="(max-width: 767px)"
            srcSet={logo_mobile}
          />
          <source
            media="(min-width: 768px)"
            srcSet={logo_tablet}
          />
          <img
            src={logo_mobile}
            alt="7 Wonders Logo"
          />
        </picture>
        <h2>7 Wonders: Assistant</h2>
        <p>Version {version}</p>
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
