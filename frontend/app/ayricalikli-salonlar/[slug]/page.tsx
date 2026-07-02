'use client';

import { useParams, useRouter } from 'next/navigation';

const SALONLAR = [
  {
    slug: 'imax',
    name: 'IMAX',
    tagline: 'Bugüne Dek Yaratılmış "Gerçeğe En Yakın" Sinema Teknolojisi!',
    description: 'IMAX sinema sisteminin tüm bileşenleri, dünya çapındaki sinemaseverler tarafından en üst seviyede eğlence deneyimi olarak bilinen "IMAX Deneyimi"ni sunmak için özel olarak bir araya getirilmiştir. IMAX, bugüne dek yaratılmış "GERÇEĞE EN YAKIN" 3 boyutlu sinema teknolojisi ile "DÜNYANIN EN ETKİLEYİCİ FİLM DENEYİMİ"ni sunar. IMAX salonlarının eşsiz geometrik yapısı; gerçek hayattakinden daha büyük kristal netliğindeki 3 boyutlu görüntüler ve IMAX\'e özel dijital ses sistemi ile birleşerek kendinizi adeta filmin içinde hissetmenizi sağlar.',
    color: 'from-blue-900 to-black',
    accentColor: 'text-blue-400',
    borderColor: 'border-blue-700/50',
    bgColor: 'bg-blue-900/20',
    emoji: '🎬',
    features: [
      { name: 'Dev IMAX Perdesi', desc: 'Geniş Görüş Alanı' },
      { name: 'Lazer Projeksiyon', desc: 'Kristal Netliği' },
      { name: '12 Kanallı Ses', desc: 'Eşsiz Ses Deneyimi' },
      { name: '3D Teknolojisi', desc: 'Derinlik Hissi' },
    ],
  },
  {
    slug: '4dx',
    name: '4DX',
    tagline: 'Çığır Açan Film Teknolojisi!',
    description: '4DX, izleyicileri filmin içine çeken devrimci bir sinema deneyimi sunar. Hareket eden koltuklar, rüzgar, yağmur, sis, koku ve ışık efektleriyle film izlemek bambaşka bir boyut kazanır. Tüm duyularınızla filmi hissedersiniz. 4DX teknolojisi, filmin her sahnesine özel efektlerle sizi aksiyonun tam ortasına taşır.',
    color: 'from-purple-900 to-black',
    accentColor: 'text-purple-400',
    borderColor: 'border-purple-700/50',
    bgColor: 'bg-purple-900/20',
    emoji: '💫',
    features: [
      { name: 'Hareketli Koltuklar', desc: 'Sahneyle Senkron' },
      { name: 'Rüzgar & Yağmur', desc: 'Atmosfer Efektleri' },
      { name: 'Koku Efektleri', desc: 'Tüm Duyular' },
      { name: 'Işık Sistemleri', desc: 'Görsel Efektler' },
    ],
  },
  {
    slug: 'gold-class',
    name: 'Gold Class',
    tagline: 'Ev Rahatlığında Sinema Keyfi!',
    description: 'Gold Class, sinema deneyimini lüks bir ortamda yaşatır. Geniş deri koltuklar, kişisel servis ve özel menü seçenekleriyle film izlemek ayrıcalıklı bir deneyime dönüşür. Sınırlı koltuk kapasitesiyle sessiz ve konforlu bir ortam garantilenir. Her misafire özel hizmet anlayışıyla Gold Class, sinema izlemenin en lüks halidir.',
    color: 'from-yellow-900 to-black',
    accentColor: 'text-yellow-400',
    borderColor: 'border-yellow-700/50',
    bgColor: 'bg-yellow-900/20',
    emoji: '👑',
    features: [
      { name: 'Lüks Deri Koltuklar', desc: 'Tam Yatar Pozisyon' },
      { name: 'Kişisel Servis', desc: 'Koltukta Sipariş' },
      { name: 'Özel Menü', desc: 'Gurme Seçenekler' },
      { name: 'Sınırlı Kapasite', desc: 'Sessiz Ortam' },
    ],
  },
  {
    slug: 'screenx',
    name: 'ScreenX',
    tagline: '270 Derecelik Panoramik Sinema Deneyimi!',
    description: 'ScreenX, 270 derecelik çok perdeli projeksiyon sistemiyle sinemanın sınırlarını ortadan kaldırır. Ana perde yanı sıra yan duvarlar da görüntüyü yansıtarak sizi filmin tam ortasına taşır. Bu eşsiz panoramik deneyimle sinema izlemek hiç olmadığı kadar sürükleyici hale gelir.',
    color: 'from-green-900 to-black',
    accentColor: 'text-green-400',
    borderColor: 'border-green-700/50',
    bgColor: 'bg-green-900/20',
    emoji: '🎭',
    features: [
      { name: '270° Görüş Açısı', desc: 'Tam Çevre Görüntü' },
      { name: 'Çok Perdeli Sistem', desc: '3 Perde Birden' },
      { name: 'Yan Duvar Projeksiyon', desc: 'Sürükleyici Deneyim' },
      { name: 'Panoramik Görüntü', desc: 'Eşsiz Perspektif' },
    ],
  },
  {
    slug: 'premium-cinema',
    name: 'Premium Cinema',
    tagline: 'Üstün Görüntü ve Ses Kalitesi!',
    description: 'Premium Cinema, en yüksek kaliteli projeksiyon ve ses sistemleriyle donatılmış özel salonlarda film izleme deneyimi sunar. Geniş perdeler, kristal netliğinde görüntü ve mükemmel ses kalitesiyle her film unutulmaz bir deneyime dönüşür.',
    color: 'from-red-900 to-black',
    accentColor: 'text-red-400',
    borderColor: 'border-red-700/50',
    bgColor: 'bg-red-900/20',
    emoji: '🎥',
    features: [
      { name: '4K Projeksiyon', desc: 'Ultra Netlik' },
      { name: 'Dolby Atmos', desc: 'Çevresel Ses' },
      { name: 'Geniş Perde', desc: 'Büyük Format' },
      { name: 'Premium Koltuklar', desc: 'Konforlu Oturma' },
    ],
  },
  {
    slug: 'dbox',
    name: 'D-BOX',
    tagline: 'Hareketi Hissettiren Sinema!',
    description: 'D-BOX teknolojisi, filmin her sahnesine özel programlanmış hareket ve titreşim efektleriyle sizi aksiyonun tam içine çeker. Koltuklar film şeridiyle senkronize hareket ederek eşsiz bir sürükleyicilik sunar.',
    color: 'from-cyan-900 to-black',
    accentColor: 'text-cyan-400',
    borderColor: 'border-cyan-700/50',
    bgColor: 'bg-cyan-900/20',
    emoji: '⚡',
    features: [
      { name: 'Senkronize Hareket', desc: 'Film ile Uyumlu' },
      { name: 'Titreşim Efekti', desc: 'Güçlü Hissetme' },
      { name: 'Film Bazlı Program', desc: 'Özel Kodlama' },
      { name: 'Güçlü Motor', desc: 'Yüksek Performans' },
    ],
  },
];

export default function SalonDetayPage() {
  const { slug } = useParams();
  const router = useRouter();
  const salon = SALONLAR.find(s => s.slug === slug);

  if (!salon) return (
    <div className="min-h-screen bg-[#0d0d0f] flex items-center justify-center text-gray-500">
      Salon bulunamadı
    </div>
  );

  return (
    <main className="min-h-screen bg-[#0d0d0f] text-white pb-16">
      {/* Hero */}
      <div className={`relative w-full h-64 bg-gradient-to-br ${salon.color} overflow-hidden`}>
        <div className="absolute inset-0 opacity-20 bg-gradient-to-t from-black to-transparent" />
        <button
          onClick={() => router.back()}
          className="absolute top-5 left-5 w-9 h-9 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 z-10"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-6xl mb-4">{salon.emoji}</div>
          <h1 className={`text-5xl font-black ${salon.accentColor}`}>{salon.name}</h1>
        </div>
      </div>

      <div className="px-5 py-6">
        {/* Tagline */}
        <h2 className="text-xl font-bold text-white mb-3">{salon.name} Sinema Sistemi</h2>
        <p className="text-sm text-gray-400 leading-relaxed mb-8">{salon.description}</p>

        {/* Özellikler grid */}
        <h3 className={`text-sm font-semibold ${salon.accentColor} mb-4 uppercase tracking-wide`}>Özellikler</h3>
        <div className="grid grid-cols-2 gap-3 mb-8">
          {salon.features.map(f => (
            <div key={f.name} className={`${salon.bgColor} border ${salon.borderColor} rounded-2xl p-4`}>
              <div className={`text-sm font-bold ${salon.accentColor} mb-1`}>{f.name}</div>
              <div className="text-xs text-gray-500">{f.desc}</div>
            </div>
          ))}
        </div>

        {/* Filmlere git */}
        <div className={`${salon.bgColor} border ${salon.borderColor} rounded-2xl p-5`}>
          <div className="text-sm font-semibold text-white mb-1">{salon.name} Filmlerini Keşfet</div>
          <div className="text-xs text-gray-500 mb-4">{salon.name} salonlarında gösterilen filmleri bul</div>
          <button
            onClick={() => router.push('/?filtre=imax')}
            className="w-full bg-[#FF7A00] text-white rounded-xl py-3 text-sm font-semibold"
          >
            Filmleri Gör
          </button>
        </div>
      </div>
    </main>
  );
}