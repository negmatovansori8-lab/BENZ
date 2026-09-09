import type { CSSProperties, ComponentType, SVGProps } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../context/LocaleContext';
import type { Msg } from '../i18n/dict';
import { CatExcavator, CatHouse, CatKamaz, CatPiston, CatSedan, CatTruck } from './CategoryIcons';

const CATS: {
  to: string;
  key: Msg;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  rgb: string;
}[] = [
  { to: '/cars?category=passenger', key: 'catPassenger', Icon: CatSedan, rgb: '232 72 85' },
  { to: '/cars?category=commercial', key: 'catCommercial', Icon: CatTruck, rgb: '245 140 48' },
  { to: '/cars?category=kamaz', key: 'catKamaz', Icon: CatKamaz, rgb: '56 152 236' },
  { to: '/cars?category=special', key: 'catSpecial', Icon: CatExcavator, rgb: '212 168 52' },
  { to: '/cars?category=parts', key: 'catParts', Icon: CatPiston, rgb: '46 184 122' },
  { to: '/homes', key: 'catHomes', Icon: CatHouse, rgb: '156 110 232' },
];

export function CategoryGrid() {
  const { t } = useI18n();
  return (
    <section className="container-ah relative z-20 -mt-10">
      <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-[var(--ah-surface)]/88 p-3 shadow-[0_28px_80px_-36px_rgba(0,0,0,.65)] backdrop-blur-2xl sm:p-7">
        <div className="mb-4 flex items-center gap-4 sm:mb-6">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-gold-500/55 to-transparent" />
          <p className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.38em] text-gold-500">
            {t('categories')}
          </p>
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-gold-500/55 to-transparent" />
        </div>

        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6 sm:gap-3">
          {CATS.map((c, i) => (
            <Link
              key={c.to}
              to={c.to}
              viewTransition
              style={{ '--cat': c.rgb, animationDelay: `${i * 55}ms` } as CSSProperties}
              className="cat-enter cat-tile group flex flex-col items-center gap-2 rounded-2xl px-1 py-2 text-center sm:gap-3 sm:px-1.5 sm:py-3"
            >
              <span className="cat-orb relative grid h-14 w-14 place-items-center rounded-[1.15rem] sm:h-[4.6rem] sm:w-[4.6rem] sm:rounded-[1.45rem]">
                <span className="cat-orb-glow" />
                <c.Icon className="relative z-[1] h-7 w-7 transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-110 group-hover:-translate-y-0.5 sm:h-9 sm:w-9" />
              </span>
              <span className="cat-label max-w-[6.4rem] text-[10px] font-semibold leading-tight tracking-wide sm:max-w-[7.5rem] sm:text-sm">
                {t(c.key)}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
