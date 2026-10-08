# Good enough. / Küçük bir dünya

7 Ekim 2026

## Deneyim

Ana sayfanın hero alanı, 21st.dev'deki **Orbit Delivery Hero** referansından Decent Devs için uyarlandı. İki satırlı “Good enough.” tipografisi, koyu zemin, lime vurgu ve Türkçe metinler kullanılıyor.

- Yakın kadrajda kürenin yaklaşık üst %60–70'i görülüyor; alt kenar yumuşak bir geçişle zemine karışıyor. Kamera dar ve geniş ekran arasında kesintisiz ölçekleniyor.
- Kürenin tamamına dağılmış **23 konum** var: beş hizmet ve 18 teknoloji/dil. React, Next.js, Rust, TypeScript, Python, Swift, Kotlin ve diğerleri küçük harita işaretleri olarak dönerek görünür oluyor.
- İşaretlerin tabanı ve ince direği gerçek yüzeye bağlı. Hizmet yazıları 13–14 px, teknoloji yazıları 12 px; ikonlar ve kontrastları artırıldı. Yazılar yalnızca ufka çok yaklaştığında hafifliyor; karakteri örten veya başka bir yazıyla çakışan etiket geri çekiliyor.
- **Web sitesi, web uygulaması, mobil uygulama, oyun, kurumsal uygulama** küre üzerinde farklı hedefler.
- Bir hedef seçilince küre kısa yönden döner; karakter yüzey üzerinde koşar, hedefe varınca durup selam verir. Noktalı çizgi rotayı gösterir.
- **23 konumun her biri için ayrı bir animasyon** bulunur. İlk ziyaret oyunla başlar; sonraki hedef, bulunulan konuma en yakın görülmemiş konumdur. Her varışta ilgili yedi saniyelik canlandırma açılır.
- Sürükleme ve ok tuşları turu keser. Bırakıldığında küre durulur; karakter bir konuma yakındaysa yaklaşık 1,35 saniyelik bekleme onu seçer. Konum işaretinin çevresindeki halka beklemeyi gösterir.
- Serbest modda bir işaretin üzerinde fareyle beklemek de aynı keşfi başlatır. İşaretler tıklanabilir; klavyede Tab ve Enter ile kullanılabilir.
- Elle bulunan konumun animasyonu bitince keşif **oradan yakındaki konuma** devam eder. Konumdan uzakta 20 saniye beklemek veya **Tura dön** düğmesine basmak da gerçek mevcut konumu başlangıç alır.
- Boşluk veya **Bir mola**, hareketi ve açık klibi duraklatır; devam edildiğinde aynı yerden sürer. Pencerenin kapatma düğmesi ve Escape serbest keşfe döndürür. Penceredeki ok sıradaki durağı seçer.
- Pencere modal değildir ve kendiliğinden odak almaz. Klavye odağı içerideyken sonraki durağa geçiş bekler. Ekran dışındaki klip ve tur süreleri durur. Kapatılan konum, ziyaretçi uzaklaşana kadar yeniden otomatik açılmaz.
- Telefonda yatay hareket küreyi döndürür; dikey kaydırma sayfayı kaydırır.
- “Fikrini anlat”, ziyaretçinin elle seçtiği proje türünü `/baslayalim?tur=...` ile forma taşır. Otomatik tur genel iletişim bağlantısını kullanır. Önceki taslak varsa yazılmış cevaplar korunur, yeni tür eklenir.
- Formun bütçe sorusu, bütçe özeti ve bütçe doğrulama alanı kaldırıldı. İlk temas ihtiyaç ve takvim üzerinden ilerliyor. Oyun projelerinin kendi işlev seçenekleri var.
- Film penceresindeki indirme bağlantısı kaldırıldı; oynatıcının indirme kontrolü gizlendi.

## Dosya düzeni

| Dosya | İşlev |
| --- | --- |
| `src/components/ui/orbit-delivery-hero.tsx` | Başlık, seçimler, etkileşim ve hafif istemci durumu |
| `src/components/ui/orbit-delivery-hero.module.css` | Bileşene özel responsive stiller |
| `src/components/ui/orbit/planet-scene.tsx` | Canvas, kamera, hedefler, rota ve yüzey hareketi |
| `src/components/ui/orbit/map-locations.tsx` | Yüzeye bağlı işaretler, ufuk geçişi ve etiket çakışma kontrolü |
| `src/components/ui/orbit/use-world-tour.ts` | Görünür süreyi izleyen, duraklatılabilir tur zamanlayıcıları |
| `src/components/ui/orbit/tour-window.tsx` | Odak çalmayan mini video penceresi |
| `src/lib/world-tour.ts` | Durak listesi, medya tanımları ve iptal edilebilir durum makinesi |
| `src/lib/location-routing.ts` | Küresel mesafe, yakın rota seçimi ve kararlı bekleme tespiti |
| `src/components/ui/orbit/world-frame.ts` | Responsive yakın kadraj |
| `src/components/ui/orbit/state.ts` | Three.js yüklenmeden kullanılabilen durum |
| `src/components/ui/orbit/motion.ts` | Küresel rota ve yaya hareketi |
| `src/components/ui/orbit/assets.ts` | GLB yükleme, hata yönetimi ve kaynak temizliği |
| `src/components/ui/orbit/courier*.ts*` | Koşu/idle geçişleri, çanta ve selamlama |
| `src/components/ui/orbit/run-cycle.ts` | Döngü sınırında kesilmeyen koşu animasyonu |
| `src/lib/hero-destinations.ts` | Hedef adları, açıklamalar, renkler ve koordinatlar |
| `public/hero/` | Yerel modeller, yüzey profili, decoder ve statik görsel |
| `remotion/tour/` | 23 bağımsız, kare bazlı animasyon |
| `public/hero/tour/` | Sessiz MP4 klipler, posterler ve üretim manifesti |

`@/*` zaten `src/*` dizinine eşleniyor. Bu nedenle istenen `/components/ui` yapısının bu projedeki doğru yeri **`src/components/ui`**. Aynı dizin `components.json` içinde `ui` alias'ı olarak tanımlandı; shadcn/21st bileşenleri tek bir import düzeni kullanır.

## Tailwind / shadcn

TypeScript ve React 19 mevcut. Three.js, `@react-three/fiber`, Three tipleri, Tailwind CSS 4 ve PostCSS eklentisi eklendi.

- `postcss.config.mjs`: `@tailwindcss/postcss`.
- `src/app/globals.css`: Tailwind theme/utilities, mevcut tasarım token'ları ve `tw` öneki. Mevcut reset kullanılıyor.
- `components.json`: shadcn `new-york`, RSC/TSX, Lucide, dizin alias'ları, `tw` öneki.
- `src/lib/utils.ts`: aynı öneki bilen `cn()`.

Yeni utility örneği: `tw:flex tw:items-center tw:gap-3`. Yeni shadcn bileşeni eklemek için:

```sh
npx shadcn@latest add button
```

Hero'yu kullanmak:

```tsx
import OrbitDeliveryHero from '@/components/ui/orbit-delivery-hero';

export default function Page() {
  return <OrbitDeliveryHero />;
}
```

Props: `className`, `theme` (`dark`, `light`, `auto`) ve `assetBaseUrl` (varsayılan `/hero/`). Alternatif asset tabanında `models/whimsical-world.glb`, `models/courier.glb` ve eşleşen `models/surface.json` bulunmalıdır. Film düğmesi uygulamanın mevcut `FilmProvider` bağlamını kullanır.

## Modeller ve üretim

Referans modeller: [fadeichev2121/planet](https://github.com/fadeichev2121/planet), sabit revizyon `b3f70fbf4b577845b1d9d5947c9410fb4d925dae`. Kaynak ve SHA-256 değerleri `public/hero/assets.json` içinde. Referanstaki koşu döngüsü, yüzey takipçisi, çanta süspansiyonu ve selamlama, tipli modüllere uyarlandı.

```sh
npm run hero:assets
npm run hero:surface
```

İlk komut modelleri indirir ve Three paketindeki Draco decoder'ını yerelleştirir. İkinci komut model geometrisinden 128 × 65 örneklik yüzey profili çıkarır. Bu işlem geliştirme aşamasında yapılır; ziyaretçinin tarayıcısı yalnızca küçük bir haritayı enterpole eder.

Çalışan site üzerinden statik yedek görsel ve ekran görüntüleri:

```sh
npm run dev
# Ayrı terminal:
npm run hero:poster
npm run hero:capture
```

Bu araç kurulu Chrome'u kullanır. Alternatif sunucu `HERO_REVIEW_URL` ile seçilebilir. Yakın kadrajın statik görselleri `public/hero/world-closeup.webp` ve `public/hero/world-closeup-mobile.webp`; kontrol görüntüleri `artifacts/hero/` altında.

## Durak animasyonları

Her klip **Remotion** ile 640 × 360, 30 FPS, 210 kare olarak üretilir. Site küçük, sessiz H.264 videolar oynatır. Tipografi yerel fontlardan, sahneler özgün SVG ve kare bazlı hareketlerden oluşur. Üretim aracı ve çalışma etiketi ziyaretçiye gösterilmez; pencere konum adını ve müşteri odaklı başlığını içerir.

| Durak | Canlandırma |
| --- | --- |
| Oyun | Kort, iki oyuncu, top sekmeleri, ralli ve sayı |
| React | Bileşenler, durum değişimleri ve güncellenen arayüz |
| Mobil | Telefon içindeki rota ve tamamlanma bildirimi |
| Next.js | İsteğin sunucuya gidip sayfaya parça parça dönüşmesi |
| Rust | Dişli ve iş kuyruğundan geçen, doğrulanan görevler |
| Web | Masaüstünden tablete ve telefona uyarlanan bitki mağazası |
| PostgreSQL | Sorgu, kayıtların gelişi ve sonuç tablosu |
| Kurumsal | Yeni bir siparişin iş akışında tamamlanması |
| Web uygulaması | Takvimde saat seçimi ve randevu oluşturma |
| Node.js | Bir mesajın farklı ekranlara eşzamanlı ulaşması |
| Python | Dağınık kayıtların temizlenip grafiğe dönüşmesi |
| TypeScript | Veri türlerine uygun parçaların eşleşmesi |
| Flutter | iOS ve Android ekranlarının birlikte güncellenmesi |
| Go | Paralel işlerin birlikte tamamlanması |
| Swift | Fotoğraf kaydırma ve bir anı kaydetme |
| Kotlin | Liste ve not düzenleme |
| C# | Sipariş miktarıyla birlikte güncellenen stok |
| .NET | Satış, depo ve destek arasında kayıt akışı |
| Redis | Yakın bellekte tutulan bilginin tekrar çağrılması |
| Docker | Uygulama parçalarının paketlenip yayına taşınması |
| Unity | Platformlarda zıplayıp ışıkları toplayan karakter |
| GraphQL | Sadece istenen alanlarla oluşturulan profil |
| WebGL | Yüzeyi değişen, dönen üç boyutlu nesne |

```sh
npm run hero:tour-studio
npm run hero:tour-render
# Sadece değişen klipler:
npm run hero:tour-render -- --scene=tennis,react
# Canlı turun bütün duraklarını görüntüle:
node scripts/hero/capture-tour.mjs
node scripts/hero/capture-tour.mjs --mobile
```

Render aracı yalnızca gereken yerel fontları paketler; tamamlanmış videoyu yayın klasörüne kopyalar. Özet görsel ve canlı ekran görüntüleri `artifacts/hero/tour/` altındadır. Medya yenilendiğinde `tourMedia()` içindeki sürüm parametresi önbellek güncellemesi için artırılabilir.

Tur akışı `travelling → settling → preview → departing` şeklindedir. Her yolculuğun artan bir `visit` değeri vardır; eski klip veya varış geri çağrıları yeni yolu değiştiremez. Medya hatası veya takılı kalan istek turu kilitlemez. Rota, küre üzerindeki açısal mesafeye ve ziyaret geçmişine göre seçilir. Bütün konumlar görülünce geçmiş yenilenir; aynı konum hemen tekrarlanmaz.

`mapPoint`, karakterin gerçek konumunu modelin başlangıç koordinat sisteminde tutar. Serbest keşfe dönüşte sabit liste indeksi kullanılmaz. Bekleme eşiği 0,20 radyanlık yakınlık ve düşük hareket hızını birlikte kontrol eder; sürükleme, aday değişmesi ve klavye ile işaret seçimi otomatik beklemeyi keser.

## Yükleme ve erişilebilirlik

Başlık, metinler ve bağlantılar HTML'de bulunur. Three.js ve Canvas ayrı bir istemci parçası olarak ilk boyamadan sonra yüklenir. Modeller aynı kaynaktan sunulur. Ekran dışındayken, sekme gizliyken ve film/menü açıkken render döngüsü durur. Piksel oranı cihaz ve kare hızına göre sınırlandırılır.

Azaltılmış hareket tercihinde otomatik animasyon kapalıdır; hedef seçimi anlık uygulanır. Kullanıcı “Devam” ile hareketi kendisi açabilir. WebGL veya dosya yükleme hatasında statik dünya ve proje seçimi kullanılabilir kalır; tekrar yükleme düğmesi sahneyi yeniden kurar. Sürükleme iptalinde pointer capture ve atalet temizlenir; ayrılırken modeller, texture'lar ve mixer'lar serbest bırakılır.

Görünen işaretler klavyeyle erişilebilir düğmelerdir. Arkadaki ve kadraj dışındaki işaretler odak sırasından çıkarılır. Odak bir işaretteyken otomatik hareket kontrolü ele almaz. Hareket kontrolü ve canlı hedef durumu açıklamalıdır.
