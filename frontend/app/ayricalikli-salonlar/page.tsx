'use client';

import Link from 'next/link';

const SALONLAR = [
  {
    slug: 'imax',
    name: 'IMAX',
    tagline: 'Bugüne Dek Yaratılmış "Gerçeğe En Yakın" Sinema Teknolojisi!',
    description: 'IMAX sinema sisteminin tüm bileşenleri, dünya çapındaki sinemaseverler tarafından en üst seviyede eğlence deneyimi olarak bilinen "IMAX Deneyimi"ni sunmak için özel olarak bir araya getirilmiştir. IMAX, bugüne dek yaratılmış "GERÇEĞE EN YAKIN" 3 boyutlu sinema teknolojisi ile "DÜNYANIN EN ETKİLEYİCİ FİLM DENEYİMİ"ni sunar.',
    color: 'from-blue-900 to-black',
    accentColor: 'text-blue-400',
    borderColor: 'border-blue-700/50',
    bgColor: 'bg-blue-900/20',
    emoji: '🎬',
    features: ['Dev IMAX Perdesi', 'Lazer Projeksiyon', '12 Kanallı Ses', '3D Teknolojisi'],
  },
  {
    slug: '4dx',
    name: '4DX',
    tagline: 'Çığır Açan Film Teknolojisi!',
    description: '4DX, izleyicileri filmin içine çeken devrimci bir sinema deneyimi sunar. Hareket eden koltuklar, rüzgar, yağmur, sis, koku ve ışık efektleriyle film izlemek bambaşka bir boyut kazanır. Tüm duyularınızla filmi hissedersiniz.',
    color: 'from-purple-900 to-black',
    accentColor: 'text-purple-400',
    borderColor: 'border-purple-700/50',
    bgColor: 'bg-purple-900/20',
    emoji: '💫',
    features: ['Hareketli Koltuklar', 'Rüzgar & Yağmur', 'Koku Efektleri', 'Işık Sistemleri'],
  },
  {
    slug: 'gold-class',
    name: 'Gold Class',
    tagline: 'Ev Rahatlığında Sinema Keyfi!',
    description: 'Gold Class, sinema deneyimini lüks bir ortamda yaşatır. Geniş deri koltuklar, kişisel servis ve özel menü seçenekleriyle film izlemek ayrıcalıklı bir deneyime dönüşür. Sınırlı koltuk kapasitesiyle sessiz ve konforlu bir ortam garantilenir.',
    color: 'from-yellow-900 to-black',
    accentColor: 'text-yellow-400',
    borderColor: 'border-yellow-700/50',
    bgColor: 'bg-yellow-900/20',
    emoji: '👑',
    features: ['Lüks Deri Koltuklar', 'Kişisel Servis', 'Özel Menü', 'Sınırlı Kapasite'],
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
    features: ['270° Görüş Açısı', 'Çok Perdeli Sistem', 'Yan Duvar Projeksiyon', 'Panoramik Deneyim'],
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
    features: ['4K Projeksiyon', 'Dolby Atmos Ses', 'Geniş Perde', 'Premium Koltuklar'],
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
    features: ['Senkronize Hareket', 'Titreşim Efekti', 'Film Bazlı Program', 'Güçlü Sürükleyicilik'],
  },
];

export default function AyricalikliSalonlarPage() {
  return (
    <main className="min-h-screen bg-[#0d0d0f] text-white">
      {/* Hero */}
      <div className="relative w-full h-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#FF7A00]/20 via-[#1a1a1e] to-[#FF7A00]/20" />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <h1 className="text-3xl font-bold text-white mb-2">Ayrıcalıklı Salonlar</h1>
          <p className="text-gray-400 text-sm">En gelişmiş sinema teknolojileri</p>
        </div>
      </div>

      {/* Salon kartları */}
      <div className="px-5 py-6 grid grid-cols-3 gap-5">
        {SALONLAR.map((salon) => (
          <Link
            key={salon.slug}
            href={`/ayricalikli-salonlar/${salon.slug}`}
            className="no-underline group"
          >
            <div className={`relative rounded-2xl overflow-hidden border ${salon.borderColor} bg-gradient-to-br ${salon.color} p-6 h-56 flex flex-col justify-between hover:scale-[1.02] transition-all duration-300`}>
              {/* Arka plan efekti */}
              <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-white to-transparent" />

              <div className="relative">
                <div className="text-4xl mb-3">{salon.emoji}</div>
                <h2 className={`text-2xl font-black ${salon.accentColor} mb-1`}>{salon.name}</h2>
                <p className="text-gray-300 text-xs leading-relaxed line-clamp-2">{salon.tagline}</p>
              </div>

              <div className="relative flex items-center justify-between">
                <div className="flex gap-1 flex-wrap">
                  {salon.features.slice(0, 2).map(f => (
                    <span key={f} className={`text-[10px] px-2 py-0.5 rounded-full ${salon.bgColor} ${salon.accentColor} border ${salon.borderColor}`}>
                      {f}
                    </span>
                  ))}
                </div>
                <div className={`text-xs font-medium ${salon.accentColor} group-hover:translate-x-1 transition-transform`}>
                  İncele →
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}