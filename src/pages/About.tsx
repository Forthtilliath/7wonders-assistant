import forth from '@/assets/logo-forth.png';
import mike from '@/assets/logo-mike.png';
import logo from '@/assets/logo-wonder.png';
import { CardDev } from '@/components/cards/CardDev';

export default function About() {
  const version = '0.1.0';

  return (
    <main className="flex h-full flex-col content-center items-center justify-evenly">
      <section className="flex flex-col gap-4 px-4 text-center text-gray-400">
        <img src={logo} alt="7 Wonder" className="max-w-[400px]" />
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
