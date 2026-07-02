'use client';

import { useEffect, useState } from 'react';

interface Cinema {
  id: number;
  name: string;
  brand: string;
  mall_name: string;
  district: string;
  website_url: string;
  scraper_id: string;
}

const AVRUPA_DISTRICTS = ['Şişli', 'Beşiktaş', 'Fatih', 'Bakırköy', 'Bahçelievler', 'Güngören', 'Eyüp', 'Kağıthane', 'Sarıyer', 'Beylikdüzü', 'Avcılar', 'Küçükçekmece', 'Bağcılar', 'Esenler', 'Sultangazi', 'Gaziosmanpaşa', 'Arnavutköy', 'Başakşehir', 'Esenyurt', 'Büyükçekmece', 'Levent', 'İstinye', 'Florya'];
const ANADOLU_DISTRICTS = ['Kadıköy', 'Üsküdar', 'Maltepe', 'Kartal', 'Pendik', 'Ümraniye', 'Beykoz', 'Çekmeköy', 'Sancaktepe', 'Sultanbeyli', 'Tuzla', 'Ataşehir', 'Adalar'];

// Hangi sinemalarda hangi özellikler var - scraper_id'ye göre
const CINEMA_FEATURES: Record<string, string[]> = {
  'cineverse_i̇stinyepark_avm': ['IMAX', 'GOLD CLASS'],
  'cineverse_kanyon_avm': ['SCREENX'],
  'cineverse_capacity_avm': ['4DX'],
  'cineverse_sarıyer': ['IMAX', 'GOLD CLASS', 'SCREENX'],
  'akasya': ['IMAX', '4DX', 'GOLD CLASS', 'SCREENX'],
  'akbati': ['MPX', 'DBOX'],
  'zorlu-center': ['GOLD CLASS'],
  'istinyepark': ['IMAX', 'GOLD CLASS', 'SCREENX', 'PREMIUM CINEMA'],
};

const FEATURE_COLORS: Record<string, string> = {
  'IMAX': 'bg-blue-900/50 text-blue-300 border-blue-700/50',
  '4DX': 'bg-purple-900/50 text-purple-300 border-purple-700/50',
  'GOLD CLASS': 'bg-yellow-900/50 text-yellow-300 border-yellow-700/50',
  'SCREENX': 'bg-green-900/50 text-green-300 border-green-700/50',
  'PREMIUM CINEMA': 'bg-red-900/50 text-red-300 border-red-700/50',
  'MPX': 'bg-orange-900/50 text-orange-300 border-orange-700/50',
  'DBOX': 'bg-cyan-900/50 text-cyan-300 border-cyan-700/50',
};

export default function SinemalarPage() {
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [loading, setLoading] = useState(true);
  const [sehir, setSehir] = useState('');
  const [showSehirMenu, setShowSehirMenu] = useState(false);
  const [ozellik, setOzellik] = useState('');
  const [showOzellikMenu, setShowOzellikMenu] = useState(false);
  const [arama, setArama] = useState('');

  useEffect(() => {
    fetch('http://localhost:8000/api/cinemas/')
      .then(r => r.json())
      .then(data => {
        setCinemas(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const isAvrupa = (c: Cinema) => {
    return AVRUPA_DISTRICTS.some(d => c.district.includes(d)) ||
      ['Hilltown', 'Historia', 'Kale', 'Zorlu', 'Cevahir', 'Kanyon', 'Aqua', 'Avlu', 'Axis', 'Marmara Park', 'ÖzdilekPark', 'İstinye', 'Capacity'].some(k => (c.mall_name + c.name).includes(k));
  };

  const isAnadolu = (c: Cinema) => {
    return ANADOLU_DISTRICTS.some(d => c.district.includes(d)) ||
      ['Akasya', 'Akbatı', 'Akyaka', 'Pendorya', 'Nautilus', 'Vadistanbul', 'Acarkent', 'Coliseum'].some(k => (c.mall_name + c.name).includes(k));
  };

  const getFeatures = (c: Cinema) => CINEMA_FEATURES[c.scraper_id] || [];

  const filtered = cinemas.filter(c => {
    if (sehir === 'avrupa' && !isAvrupa(c)) return false;
    if (sehir === 'anadolu' && !isAnadolu(c)) return false;
    if (ozellik && !getFeatures(c).includes(ozellik)) return false;
    if (arama && !c.name.toLowerCase().includes(arama.toLowerCase()) &&
        !c.mall_name.toLowerCase().includes(arama.toLowerCase())) return false;
    return true;
  });

  const cleanName = (name: string) =>
    name.replace('Paribu Cineverse ', '').replace('Cinetime ', '').replace('Cineverse ', '').trim();

  const sehirLabel = sehir === 'avrupa' ? 'İstanbul (Avrupa)' : sehir === 'anadolu' ? 'İstanbul (Anadolu)' : 'Şehir Seç';
  const ozellikLabel = ozellik || 'Ayrıcalıklı Salon Seç';

  return (
    <main className="min-h-screen bg-[#0d0d0f] text-white">
      {/* Hero banner */}
      <div className="relative w-full h-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d0f] via-[#1a1a1e] to-[#0d0d0f]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-3xl font-bold text-white">Sinema Salonları</h1>
        </div>
      </div>

      <div className="px-5 py-5">
        {/* Filtreler */}
        <div className="flex gap-3 mb-6">
          {/* Şehir */}
          <div className="relative">
            <button
              onClick={() => { setShowSehirMenu(v => !v); setShowOzellikMenu(false); }}
              className={
                'flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ' +
                (sehir ? 'bg-[#FF7A00]/10 border-[#FF7A00]/60 text-[#FF7A00]' : 'bg-[#1a1a1e] border-[#2a2a2e] text-gray-400')
              }
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              {sehirLabel}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d={showSehirMenu ? 'm18 15-6-6-6 6' : 'm6 9 6 6 6-6'} />
              </svg>
            </button>
            {showSehirMenu && (
              <div className="absolute top-full left-0 mt-1 bg-[#1e1e22] border border-[#2a2a2e] rounded-xl overflow-hidden z-20 shadow-xl w-52">
                {sehir && (
                  <button onClick={() => { setSehir(''); setShowSehirMenu(false); }}
                    className="w-full text-left px-4 py-3 text-sm text-gray-500 border-b border-[#2a2a2e] hover:bg-[#252528]">
                    Tümü
                  </button>
                )}
                {[
                  { key: 'avrupa', label: 'İstanbul (Avrupa)' },
                  { key: 'anadolu', label: 'İstanbul (Anadolu)' },
                ].map((s, i) => (
                  <button key={s.key}
                    onClick={() => { setSehir(s.key); setShowSehirMenu(false); }}
                    className={
                      'w-full text-left px-4 py-3 text-sm transition-all ' +
                      (i === 0 ? 'border-b border-[#2a2a2e] ' : '') +
                      (sehir === s.key ? 'text-[#FF7A00] bg-[#FF7A00]/10' : 'text-gray-300 hover:bg-[#252528]')
                    }
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Ayrıcalıklı Salon */}
          <div className="relative">
            <button
              onClick={() => { setShowOzellikMenu(v => !v); setShowSehirMenu(false); }}
              className={
                'flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ' +
                (ozellik ? 'bg-[#FF7A00]/10 border-[#FF7A00]/60 text-[#FF7A00]' : 'bg-[#1a1a1e] border-[#2a2a2e] text-gray-400')
              }
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              {ozellikLabel}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d={showOzellikMenu ? 'm18 15-6-6-6 6' : 'm6 9 6 6 6-6'} />
              </svg>
            </button>
            {showOzellikMenu && (
              <div className="absolute top-full left-0 mt-1 bg-[#1e1e22] border border-[#2a2a2e] rounded-xl overflow-hidden z-20 shadow-xl w-52">
                {ozellik && (
                  <button onClick={() => { setOzellik(''); setShowOzellikMenu(false); }}
                    className="w-full text-left px-4 py-3 text-sm text-gray-500 border-b border-[#2a2a2e] hover:bg-[#252528]">
                    Tümü
                  </button>
                )}
                {['IMAX', '4DX', 'GOLD CLASS', 'SCREENX', 'PREMIUM CINEMA', 'MPX', 'DBOX'].map((o, i, arr) => (
                  <button key={o}
                    onClick={() => { setOzellik(o); setShowOzellikMenu(false); }}
                    className={
                      'w-full text-left px-4 py-3 text-sm transition-all ' +
                      (i < arr.length - 1 ? 'border-b border-[#2a2a2e] ' : '') +
                      (ozellik === o ? 'text-[#FF7A00] bg-[#FF7A00]/10' : 'text-gray-300 hover:bg-[#252528]')
                    }
                  >
                    {o}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Arama */}
          <div className="flex-1 bg-[#1a1a1e] border border-[#2a2a2e] rounded-xl flex items-center gap-2 px-3">
            <svg className="opacity-40 flex-shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              value={arama}
              onChange={e => setArama(e.target.value)}
              className="bg-transparent outline-none text-white text-sm py-2.5 w-full placeholder-[#555]"
              placeholder="Salon ara..."
            />
          </div>
        </div>

        {/* Sinema sayısı */}
        <div className="text-xs text-gray-500 mb-4">{filtered.length} sinema bulundu</div>

        {/* Sinema grid */}
        {loading ? (
          <div className="grid grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-[#1a1a1e] rounded-2xl p-4 h-32 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-gray-500 py-16 text-sm">Sinema bulunamadı</div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {filtered.map(cinema => {
              const features = getFeatures(cinema);
              return (<a
                
                  key={cinema.id}
                  href={cinema.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#1a1a1e] border border-[#2a2a2e] rounded-2xl p-4 no-underline hover:border-[#FF7A00]/40 transition-all group"
                >
                  {/* Brand badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={
                      'text-[10px] font-semibold px-2 py-0.5 rounded-full ' +
                      (cinema.brand === 'Paribu Cineverse' ? 'bg-blue-900/40 text-blue-300' :
                       cinema.brand === 'Cinetime' ? 'bg-green-900/40 text-green-300' :
                       'bg-purple-900/40 text-purple-300')
                    }>
                      {cinema.brand}
                    </span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" className="group-hover:stroke-[#FF7A00] transition-all">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                  </div>

                  {/* İsim */}
                  <div className="text-sm font-semibold text-white mb-1 leading-snug group-hover:text-[#FF7A00] transition-all">
                    {cleanName(cinema.name)}
                  </div>

                  {/* AVM ve ilçe */}
                  <div className="text-xs text-gray-500 mb-3">
                    {cinema.mall_name !== cinema.name ? cinema.mall_name + ' · ' : ''}{cinema.district}
                  </div>

                  {/* Özellikler */}
                  {features.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {features.map(f => (
                        <span key={f} className={
                          'text-[9px] font-bold px-1.5 py-0.5 rounded border ' +
                          (FEATURE_COLORS[f] || 'bg-gray-800 text-gray-400 border-gray-700')
                        }>
                          {f}
                        </span>
                      ))}
                    </div>
                  )}
                </a>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}