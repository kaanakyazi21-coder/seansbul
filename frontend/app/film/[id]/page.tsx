'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Film {
  id: number;
  tmdb_id?: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  genres: string;
  runtime: number;
  release_date: string;
  director?: string;
  cast_list?: string;
  age_rating?: string;
}

interface SessionItem {
  id: number;
  cinema_id: number;
  time: string;
  hall_type: string;
  ticket_url: string;
  date: string;
}

interface Cinema {
  id: number;
  name: string;
  mall_name: string;
  district: string;
}

interface GroupedSessions {
  cinema: Cinema;
  sessions: SessionItem[];
}

const AVRUPA_KEYWORDS = ['Şişli', 'Beşiktaş', 'Fatih', 'Bakırköy', 'Bahçelievler', 'Güngören', 'Eyüp', 'Kağıthane', 'Sarıyer', 'Beylikdüzü', 'Avcılar', 'Küçükçekmece', 'Bağcılar', 'Esenler', 'Sultangazi', 'Gaziosmanpaşa', 'Arnavutköy', 'Başakşehir', 'Esenyurt', 'Büyükçekmece', 'Maltepe', 'Levent', 'İstinye', 'Florya', 'Hilltown', 'Historia', 'Kale', 'Zorlu', 'Cevahir', 'Kanyon', 'Aqua', 'Avlu', 'Axis', 'Marmara Park', 'ÖzdilekPark'];

const getDates = () => {
  const days = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
  const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      label: i === 0 ? 'Bugün' : i === 1 ? 'Yarın' : days[d.getDay()],
      sub: d.getDate() + ' ' + months[d.getMonth()],
      value: d.toISOString().split('T')[0],
    };
  });
};

const formatRuntime = (min: number) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h} sa ${m} dk` : `${m} dk`;
};

export default function FilmDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [film, setFilm] = useState<Film | null>(null);
  const [grouped, setGrouped] = useState<GroupedSessions[]>([]);
  const [loading, setLoading] = useState(true);
  const [bolge, setBolge] = useState('');
  const [showBolgeMenu, setShowBolgeMenu] = useState(false);
  const [selectedAvm, setSelectedAvm] = useState('');
  const [showAvmMenu, setShowAvmMenu] = useState(false);
  const [selectedCinema, setSelectedCinema] = useState('');
  const [selectedDateIdx, setSelectedDateIdx] = useState(0);
  const [liked, setLiked] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [benzerFilms, setBenzerFilms] = useState<Film[]>([]);

  const dates = getDates();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:8000/api/films/film/' + id).then(r => r.json()),
      fetch('http://localhost:8000/api/sessions/film/' + id).then(r => r.json()),
      fetch('http://localhost:8000/api/cinemas/').then(r => r.json()),
      fetch('http://localhost:8000/api/films/filtrele?filtre=bugun').then(r => r.json()),
    ]).then(([filmData, sessionsData, cinemasData, allFilms]) => {
      setFilm(filmData);

      const others = allFilms.filter((f: Film) => f.id !== filmData.id && f.poster_path);
      setBenzerFilms(others.sort(() => Math.random() - 0.5).slice(0, 6));

      if (filmData.tmdb_id) {
        fetch(`https://api.themoviedb.org/3/movie/${filmData.tmdb_id}/credits?api_key=3e77300e9d3281aa02341af32f8fbc2b&language=tr-TR`)
          .then(r => r.json())
          .then(credits => {
            const director = credits.crew?.find((p: any) => p.job === 'Director')?.name;
            const cast = credits.cast?.slice(0, 5).map((p: any) => p.name).join(', ');
            setFilm(prev => prev ? { ...prev, director, cast_list: cast } : prev);
          });

        fetch(`https://api.themoviedb.org/3/movie/${filmData.tmdb_id}/release_dates?api_key=3e77300e9d3281aa02341af32f8fbc2b`)
          .then(r => r.json())
          .then(data => {
            const tr = data.results?.find((r: any) => r.iso_3166_1 === 'TR') || data.results?.find((r: any) => r.iso_3166_1 === 'US');
            const rating = tr?.release_dates?.[0]?.certification;
            if (rating) setFilm(prev => prev ? { ...prev, age_rating: rating } : prev);
          });

      
        
        // Age rating çek
        fetch(`https://api.themoviedb.org/3/movie/${filmData.tmdb_id}/release_dates?api_key=3e77300e9d3281aa02341af32f8fbc2b`)
          .then(r => r.json())
          .then(data => {
            const tr = data.results?.find((r: any) => r.iso_3166_1 === 'TR');
            const rating = tr?.release_dates?.[0]?.certification;
            if (rating) setFilm(prev => prev ? { ...prev, age_rating: rating } : prev);
          });

        fetch(`https://api.themoviedb.org/3/movie/${filmData.tmdb_id}/videos?api_key=3e77300e9d3281aa02341af32f8fbc2b&language=tr-TR`)
          .then(r => r.json())
          .then(data => {
            const trailer = data.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
            if (!trailer) {
              fetch(`https://api.themoviedb.org/3/movie/${filmData.tmdb_id}/videos?api_key=3e77300e9d3281aa02341af32f8fbc2b&language=en-US`)
                .then(r => r.json())
                .then(data2 => {
                  const t = data2.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
                  if (t) setTrailerKey(t.key);
                });
            } else {
              setTrailerKey(trailer.key);
            }
          });
      }
      

      const cinemaMap: Record<number, GroupedSessions> = {};
      sessionsData.forEach((s: SessionItem) => {
        if (!cinemaMap[s.cinema_id]) {
          const cinema = cinemasData.find((c: Cinema) => c.id === s.cinema_id);
          if (cinema) cinemaMap[s.cinema_id] = { cinema, sessions: [] };
        }
        if (cinemaMap[s.cinema_id]) cinemaMap[s.cinema_id].sessions.push(s);
      });
      setGrouped(Object.values(cinemaMap));
      setLoading(false);
    });
  }, [id]);

  const isAvrupa = (cinema: Cinema) => {
    const text = cinema.name + cinema.district + cinema.mall_name;
    return AVRUPA_KEYWORDS.some(k => text.includes(k));
  };

  const bolgeFiltered = grouped.filter(({ cinema }) => {
    if (bolge === 'avrupa') return isAvrupa(cinema);
    if (bolge === 'anadolu') return !isAvrupa(cinema);
    return true;
  });

  const avmListesi = Array.from(
    new Set(bolgeFiltered.map(({ cinema }) => cinema.mall_name).filter(Boolean))
  ).sort();

  const avmFiltered = selectedAvm
    ? bolgeFiltered.filter(({ cinema }) => cinema.mall_name === selectedAvm)
    : bolgeFiltered;

  const selectedCinemaData = avmFiltered.find(
    ({ cinema }) => cinema.id.toString() === selectedCinema
  );

  if (loading) return (
    <div className="min-h-screen bg-[#0d0d0f] flex items-center justify-center text-gray-500 text-sm">
      Yükleniyor...
    </div>
  );

  if (!film) return null;

  const posterSrc = film.poster_path?.startsWith('http')
    ? film.poster_path
    : film.poster_path
    ? 'https://image.tmdb.org/t/p/w342' + film.poster_path
    : null;

  return (
    <main className="min-h-screen bg-[#0d0d0f] text-white pb-16">

      {showTrailer && trailerKey && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={() => setShowTrailer(false)}>
          <div className="relative w-full max-w-4xl px-4" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowTrailer(false)} className="absolute -top-10 right-4 text-white text-2xl">✕</button>
            <div className="aspect-video">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
                allow="autoplay; encrypted-media"
                allowFullScreen
                className="rounded-2xl"
              />
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => router.back()}
        className="fixed top-[72px] left-4 z-40 w-9 h-9 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>

      {/* HERO */}
      <div className="relative bg-[#0d0d0f]">
        {film.backdrop_path && (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(https://image.tmdb.org/t/p/w1280${film.backdrop_path})` }}
            />
            <div className="absolute inset-0 bg-[#0d0d0f]/65 backdrop-blur-sm" />
          </>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0d0d0f] to-transparent" />

        <div className="relative flex gap-8 px-8 pt-10 pb-10 items-end max-w-6xl mx-auto">
          <div className="flex-shrink-0 w-[200px] h-[300px] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
            {posterSrc ? (
              <img src={posterSrc} alt={film.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[#1a1a1e] flex items-center justify-center text-4xl">🎬</div>
            )}
          </div>

          <div className="flex-1 min-w-0 pb-2">
            <h1 className="text-3xl font-bold text-white leading-tight mb-3">{film.title}</h1>

           <div className="flex items-center gap-2 mb-4">
            {film.age_rating && (
              <span className="text-xs font-bold bg-gray-700 text-white px-2 py-1 rounded-full">{film.age_rating}</span>
            )}
            <span className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 text-xs">─</span>
            <span className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
              </svg>
            </span>
          </div>

            <div className="flex flex-col gap-2 mb-5">
              {film.director && (
                <div className="text-sm text-gray-300">
                  <span className="text-gray-500">Yönetmen: </span>{film.director}
                </div>
              )}
              {film.cast_list && (
                <div className="text-sm text-gray-300">
                  <span className="text-gray-500">Oyuncular: </span>{film.cast_list}
                </div>
              )}
              {film.genres && (
                <div className="text-sm text-gray-300">
                  <span className="text-gray-500">Formatlar: </span>{film.genres.split(',').slice(0, 3).join(', ')}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button className="bg-[#FF7A00] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#e56e00] transition-colors">
                Hemen Bilet Al
              </button>
              {trailerKey && (
                <button
                  onClick={() => setShowTrailer(true)}
                  className="flex items-center gap-2 border border-white/30 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/10 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                  Fragmanı İzle
                </button>
              )}
            </div>

            {film.overview && (
              <p className="text-sm text-gray-400 leading-relaxed mt-4 max-w-2xl line-clamp-3">{film.overview}</p>
            )}

            <div className="flex items-center gap-6 mt-4 text-sm text-gray-500">
              {film.release_date && (
                <div className="flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  Vizyon Tarihi: {new Date(film.release_date).toLocaleDateString('tr-TR')}
                </div>
              )}
              {film.genres && (
                <div className="flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
                  </svg>
                  Tür: {film.genres.split(',')[0].trim()}
                </div>
              )}
              {film.runtime > 0 && (
                <div className="flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  {formatRuntime(film.runtime)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* İÇERİK */}
      <div className="px-8 mt-4 max-w-6xl mx-auto">

        <div className="flex gap-3 mb-8">
          <button className="flex-1 bg-[#FF7A00] text-white rounded-2xl py-3.5 text-sm font-semibold hover:bg-[#e56e00] transition-colors">
            Seans Bul ve Bilet Al
          </button>
          <button
            onClick={() => setLiked(l => !l)}
            className="w-12 h-12 bg-[#1a1a1e] border border-[#2a2a2e] rounded-2xl flex items-center justify-center flex-shrink-0"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={liked ? '#FF7A00' : 'none'} stroke={liked ? '#FF7A00' : '#888'} strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
          <button className="w-12 h-12 bg-[#1a1a1e] border border-[#2a2a2e] rounded-2xl flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </button>
        </div>

        <div className="h-px bg-[#1a1a1e] mb-8" />

        <h2 className="text-base font-semibold text-white mb-4">Sinema Seç</h2>

        <div className="mb-2">
          <button
            onClick={() => { setShowBolgeMenu(v => !v); setShowAvmMenu(false); }}
            className={'w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all ' + (bolge ? 'bg-[#FF7A00]/10 border-[#FF7A00]/60 text-[#FF7A00]' : 'bg-[#1a1a1e] border-[#2a2a2e] text-gray-400')}
          >
            <span>{bolge === 'avrupa' ? 'İstanbul (Avrupa)' : bolge === 'anadolu' ? 'İstanbul (Anadolu)' : 'Şehir'}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d={showBolgeMenu ? 'm18 15-6-6-6 6' : 'm6 9 6 6 6-6'} />
            </svg>
          </button>
          {showBolgeMenu && (
            <div className="mt-1 bg-[#1a1a1e] border border-[#2a2a2e] rounded-xl overflow-hidden">
              {[{ key: 'avrupa', label: 'İstanbul (Avrupa)' }, { key: 'anadolu', label: 'İstanbul (Anadolu)' }].map((b, i) => (
                <button key={b.key}
                  onClick={() => { setBolge(b.key); setSelectedAvm(''); setSelectedCinema(''); setShowBolgeMenu(false); }}
                  className={'w-full text-left px-4 py-3 text-sm transition-all ' + (i === 0 ? 'border-b border-[#2a2a2e] ' : '') + (bolge === b.key ? 'text-[#FF7A00] bg-[#FF7A00]/10' : 'text-gray-300 hover:bg-[#252528]')}
                >{b.label}</button>
              ))}
            </div>
          )}
        </div>

        {bolge && (
          <div className="mb-4">
            <button
              onClick={() => { setShowAvmMenu(v => !v); setShowBolgeMenu(false); }}
              className={'w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all ' + (selectedAvm ? 'bg-[#FF7A00]/10 border-[#FF7A00]/60 text-[#FF7A00]' : 'bg-[#1a1a1e] border-[#2a2a2e] text-gray-400')}
            >
              <span>{selectedAvm || 'Yer'}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d={showAvmMenu ? 'm18 15-6-6-6 6' : 'm6 9 6 6 6-6'} />
              </svg>
            </button>
            {showAvmMenu && (
              <div className="mt-1 bg-[#1a1a1e] border border-[#2a2a2e] rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                {selectedAvm && (
                  <button onClick={() => { setSelectedAvm(''); setSelectedCinema(''); setShowAvmMenu(false); }}
                    className="w-full text-left px-4 py-3 text-sm text-gray-500 border-b border-[#2a2a2e] hover:bg-[#252528]">Tümü</button>
                )}
                {avmListesi.map((avm, i) => (
                  <button key={avm}
                    onClick={() => {
                      setSelectedAvm(avm); setShowAvmMenu(false);
                      const match = bolgeFiltered.find(({ cinema }) => cinema.mall_name === avm);
                      if (match) setSelectedCinema(match.cinema.id.toString());
                      else setSelectedCinema('');
                    }}
                    className={'w-full text-left px-4 py-3 text-sm transition-all ' + (i < avmListesi.length - 1 ? 'border-b border-[#2a2a2e] ' : '') + (selectedAvm === avm ? 'text-[#FF7A00] bg-[#FF7A00]/10' : 'text-gray-300 hover:bg-[#252528]')}
                  >{avm}</button>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedCinema && (
          <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1">
            {dates.map((d, i) => (
              <button key={i} onClick={() => setSelectedDateIdx(i)}
                className={'flex-shrink-0 flex flex-col items-center px-3.5 py-2.5 rounded-xl border text-center transition-all ' + (selectedDateIdx === i ? 'bg-[#FF7A00] border-[#FF7A00] text-white' : 'bg-[#1a1a1e] border-[#2a2a2e] text-gray-400')}
              >
                <span className="text-xs font-medium">{d.label}</span>
                <span className="text-[11px] opacity-75 mt-0.5">{d.sub}</span>
              </button>
            ))}
          </div>
        )}

        {selectedCinema && selectedCinemaData && (
          <div className="mb-8">
            {Object.entries(
              selectedCinemaData.sessions
                .filter((s, i, arr) => arr.findIndex(x => x.time === s.time && x.hall_type === s.hall_type) === i)
                .sort((a, b) => a.time.localeCompare(b.time))
                .reduce((acc, s) => {
                  const key = s.hall_type || '2D';
                  if (!acc[key]) acc[key] = [];
                  acc[key].push(s);
                  return acc;
                }, {} as Record<string, typeof selectedCinemaData.sessions>)
            ).map(([hallType, sessions]) => (
              <div key={hallType} className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{hallType}</span>
                  <div className="flex-1 h-px bg-[#2a2a2e]" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {sessions.map((s) => (
                    <a key={s.id} href={s.ticket_url} target="_blank" rel="noopener noreferrer"
                      className="flex flex-col items-center bg-[#1a1a1e] border border-[#2a2a2e] hover:border-[#FF7A00] rounded-xl px-4 py-3 no-underline transition-all">
                      <span className="text-base font-bold text-white">{s.time}</span>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="h-px bg-[#1a1a1e] mb-8" />

        {benzerFilms.length > 0 && (
          <div className="mb-8">
            <h2 className="text-base font-semibold text-white mb-5">İlginizi Çekebilecek Filmler</h2>
            <div className="grid grid-cols-6 gap-5">
              {benzerFilms.map(f => (
                <Link key={f.id} href={'/film/' + f.id} className="no-underline group">
                  <div className="w-full aspect-[2/3] rounded-2xl overflow-hidden relative bg-[#1a1a1e]">
                    {f.poster_path ? (
                      <img
                        src={f.poster_path?.startsWith('http') ? f.poster_path : 'https://image.tmdb.org/t/p/w342' + f.poster_path}
                        alt={f.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600 text-3xl">🎬</div>
                    )}
                  </div>
                  <div className="mt-2">
                    <div className="text-xs font-semibold text-white line-clamp-2 group-hover:text-[#FF7A00] transition-colors">{f.title}</div>
                    <div className="text-[11px] text-gray-500 mt-1">
                      {f.runtime > 0 && `${Math.floor(f.runtime/60)} sa ${f.runtime%60} dk`}
                      {f.runtime > 0 && f.genres && ' · '}
                      {f.genres?.split(',')[0]?.trim()}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="h-px bg-[#1a1a1e] mb-8" />

        <h2 className="text-base font-semibold text-white mb-4">Yorumlar</h2>
        {[
          { name: 'Ahmet K.', date: '24 Nisan 2026', stars: 5, text: 'Çok iyi bir filmdi!' },
          { name: 'Selin Y.', date: '23 Nisan 2026', stars: 4, text: 'Güzel bir yapım.' },
        ].map((review) => (
          <div key={review.name} className="bg-[#1a1a1e] border border-[#2a2a2e] rounded-2xl p-4 mb-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-sm font-medium">{review.name}</div>
                <div className="text-xs text-gray-600">{review.date}</div>
              </div>
              <div className="text-yellow-400 text-xs tracking-wide">{'★'.repeat(review.stars)}</div>
            </div>
            <p className="text-sm text-gray-400">{review.text}</p>
          </div>
        ))}
      </div>
    </main>
  );
}