'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/filmler', label: 'Filmler' },
  { href: '/sinemalar', label: 'Sinemalar' },
  { href: '/ayricalikli-salonlar', label: 'Ayrıcalıklı Salonlar' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-40 bg-[#0d0d0f]/90 backdrop-blur-md border-b border-[#1a1a1e]">
      <div className="flex items-center justify-between px-5 h-14">
        <Link href="/" className="text-xl font-bold tracking-tight no-underline">
          Seans<span className="text-[#FF7A00]">Bul</span>
        </Link>

        <div className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  'px-3 py-1.5 rounded-lg text-sm font-medium no-underline transition-all ' +
                  (isActive
                    ? 'text-white bg-[#1a1a1e]'
                    : 'text-gray-500 hover:text-white hover:bg-[#1a1a1e]/50')
                }
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2 bg-[#1a1a1e] border border-[#2a2a2e] rounded-full px-3 py-1.5 text-xs text-gray-400">
          <div className="w-2 h-2 rounded-full bg-[#FF7A00]" />
          İstanbul
        </div>
      </div>
    </nav>
  );
}