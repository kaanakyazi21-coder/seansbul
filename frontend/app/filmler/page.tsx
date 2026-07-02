'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Film {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  vote_average: number;
  genres: string;
  runtime: number;
  release_date: string;
}

type Sekme = 'vizyonda' | 'yakinda';
type Siralama = 'akilli' | 'tarih' | 'puan';

export default function FilmlerPage() {
  const [sekme, setSekme] = useState<Sekme>('vizyonda');
  const [siralama, setSiralama] = useState<Siralama>('akilli');
  const [films, setFilms] = useState<Film[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSiralamaMenu, setShowSiralamaMenu] = useState(false);

  useEffect(() => {
    setLoading(true);
    const filtre = sekme === 'vizyonda' ? 'bugun' : 'yakinda';
    fetch(`http://localhost:8000/api/films/filtrele?filtre=${filtre}`)
      .then(r => r.json())
      .then(data => {
        let sorted = Array.isArray(data) ? data : [];
        if (siralama === 'tarih') {
          sorted = sorted.sort((a: Film, b: Film) =>
            new Date(b.release_date || '').getTime() - new Date(a.release_date || '').getTime()
          );
        } else if (siralama === 'puan') {
          sorted = sorted.sort((a: Film, b: Film) => (b.vote_average || 0) - (a.vote_average || 0));
        }
        setFilms(sorted);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [sekme, siralama]);

  const siralamaLabel = siralama === 'akilli' ? 'Akıllı Sıralama' : siralama === 'tarih' ? 'Vizyon Tarihine Göre' : 'Puana Göre';

  return (
    <main className="min-h-screen bg-[#0d0d0f] text-white">
      {/* Hero Banner */}
      <div className="relative w-full h-52 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://www.paribucineverse.com/assets/img/page_movie_list/filmler_hero_banner.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-4xl font-bold text-white">Vizyondaki Filmler</h1>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Sekmeler + Sıralama */}
        <div className="flex items-center justify-between mb-8">
          {/* Sekmeler */}
          <div className="flex gap-6 border-b border-[#2a2a2e]">
            <button
              onClick={() => setSekme('vizyonda')}
              className={
                'pb-3 text-base font-semibold transition-all border-b-2 ' +
                (sekme === 'vizyonda'
                  ? 'text-white border-white'
                  : 'text-gray-500 border-transparent hover:text-gray-300')
              }
            >
              Vizyonda
            </button>
            <button
              onClick={() => setSekme('yakinda')}
              className={
                'pb-3 text-base font-semibold transition-all border-b-2 ' +
                (sekme === 'yakinda'
                  ? 'text-white border-white'
                  : 'text-gray-500 border-transparent hover:text-gray-300')
              }
            >
              Yakında
            </button>
          </div>

          {/* Sıralama */}
          <div className="relative">
            <button
              onClick={() => setShowSiralamaMenu(v => !v)}
              className="flex items-center gap-2 bg-[#1a1a1e] border border-[#2a2a2e] rounded-xl px-4 py-2.5 text-sm text-gray-300"
            >
              {siralamaLabel}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d={showSiralamaMenu ? 'm18 15-6-6-6 6' : 'm6 9 6 6 6-6'} />
              </svg>
            </button>
            {showSiralamaMenu && (
              <div className="absolute right-0 top-full mt-1 bg-[#1e1e22] border border-[#2a2a2e] rounded-xl overflow-hidden z-20 shadow-xl w-52">
                {[
                  { key: 'akilli', label: 'Akıllı Sıralama' },
                  { key: 'tarih', label: 'Vizyon Tarihine Göre' },
                  { key: 'puan', label: 'Puana Göre' },
                ].map((s, i, arr) => (
                  <button
                    key={s.key}
                    onClick={() => { setSiralama(s.key as Siralama); setShowSiralamaMenu(false); }}
                    className={
                      'w-full text-left px-4 py-3 text-sm transition-all ' +
                      (i < arr.length - 1 ? 'border-b border-[#2a2a2e] ' : '') +
                      (siralama === s.key ? 'text-[#FF7A00] bg-[#FF7A00]/10' : 'text-gray-300 hover:bg-[#252528]')
                    }
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Film Grid */}
        {loading ? (
          <div className="grid grid-cols-6 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i}>
                <div className="w-full aspect-[2/3] rounded-2xl bg-[#1a1a1e] animate-pulse" />
                <div className="mt-3 h-3 w-24 bg-[#1a1a1e] rounded animate-pulse" />
                <div className="mt-2 h-3 w-16 bg-[#1a1a1e] rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : films.length === 0 ? (
          <div className="text-center text-gray-500 py-20">Film bulunamadı</div>
        ) : (
          <div className="grid grid-cols-6 gap-6">
            {films.map(film => (
              <div key={film.id} className="group relative">
                {/* Afiş */}
                <div className="relative w-full aspect-[2/3] rounded-2xl overflow-hidden bg-[#1a1a1e]">
                  {film.poster_path ? (
                    <img
                      src={film.poster_path?.startsWith('http') ? film.poster_path : 'https://image.tmdb.org/t/p/w342' + film.poster_path}
                      alt={film.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600 text-4xl">🎬</div>
                  )}

                  {/* Puan badge */}
                  {film.vote_average > 0 && (
                    <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-sm rounded-lg px-2 py-0.5 flex items-center gap-1">
                      <span className="text-yellow-400 text-[10px]">★</span>
                      <span className="text-white text-[11px] font-semibold">{film.vote_average.toFixed(1)}</span>
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 p-4">
                    <Link
                      href={'/film/' + film.id}
                      className="w-full bg-[#FF7A00] text-white text-sm font-semibold py-2.5 rounded-xl text-center no-underline hover:bg-[#e56e00] transition-colors"
                    >
                      İncele
                    </Link>
                  </div>
                </div>

                {/* Bilgiler */}
                <div className="mt-3">
                  <Link href={'/film/' + film.id} className="no-underline">
                    <div className="text-sm font-semibold text-white leading-snug line-clamp-2 hover:text-[#FF7A00] transition-colors">
                      {film.title}
                    </div>
                  </Link>
                  <div className="text-xs text-gray-500 mt-1.5 flex items-center gap-1.5">
                    {film.runtime > 0 && <span>{Math.floor(film.runtime/60)} sa {film.runtime%60} dk</span>}
                    {film.runtime > 0 && film.genres && <span>·</span>}
                    {film.genres && <span>{film.genres.split(',')[0].trim()}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}