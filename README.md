# decent devs.

**Good enough.**

Butik bir dijital stüdyo için Türkçe, responsive ve etkileşimli bir site. Next.js 16 / React 19, TypeScript, yerel yazı tipleri, etkileşimli 3B dünya ve Markus seslendirmesi + Digital Gravity müzikli Remotion filmi.

## Çalıştırma

Node.js **24 LTS** ve npm gerekir. Bu ortamda Node taşınabilir olarak kuruldu; Windows'ta doğrudan:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/dev.ps1
```

Node PATH üzerinde mevcutsa:

```sh
npm install
npm run dev
```

Yerel önizleme: **http://localhost:3000**

```sh
npm run build
npm run start
```

## İçerik ve deneyimler

- `/` — 23 konum ve her konuma özel animasyonlarla 3B keşif; etkileşimli oyun alanı, hizmetler, film, yaklaşım.
- `/laboratuvar/orbit` — ekleme, tamamlama ve filtreleme işlemleri olan görev uygulaması konsepti.
- `/laboratuvar/sakin` — sekme arka planda olsa da geçen zamanı doğru hesaplayan odak sayacı.
- `/laboratuvar/luma` — özgün SVG ürün çizimi, renk ve ışık kontrolleri.
- `/hizmetler/*` — özgün metinler, SSS ve yapılandırılmış verilerle dört statik hizmet sayfası.
- `/baslayalim` — bütçe sorusu olmadan koşullu ihtiyaç/takvim soruları, canlı özet, taslak devamı, sunucu kaydı ve indirilebilir brief. Hero seçimi `?tur=...` ile aktarılır.
- `/gizlilik` — kullanılan veri ve servislerin açık anlatımı.

İlk vitrindeki işler **konsept çalışma** olarak etiketlidir. Paylaşılabilir gerçek müşteri malzemesi geldiğinde `src/lib/content.ts` ve yeni iş sayfaları üzerinden eklenebilir. Ekip büyüklüğü marka iletişiminde kullanılmaz.

Metinler: `src/lib/content.ts` · Marka/alan adı: `src/lib/site.ts` · Form seçenekleri: `src/lib/brief.ts` · Görsel dil: `src/app/globals.css`.

Önceki `docs/01-*` ve `docs/02-*` dosyaları erken tartışmanın arşividir. Seçilen kimlik `docs/03-decent-devs.md` içinde kayıtlıdır.

### Yeni hero ve UI altyapısı

Seçilen marka işareti **04**: yumuşak D gövdesi, `>` ve `|` gözler, çok hafif ve simetrik tebessümlü alt çizgi. Web arayüzü ve Remotion sahneleri `src/components/brand.tsx` bileşenini paylaşır. Favicon `public/icon.svg` içindedir.

Paylaşım görseli, Apple simgesi ve film kapakları `npm run brand:render` ile hazırlanır. `npm run brand:render -- --film`, filmin görsellerini de günceller ve mevcut onaylı Markus + Digital Gravity sesini doğrudan taşır; çözümlenmiş sesin SHA-256 eşitliğini kontrol eder. Üretim kayıtları ve önceki görseller `artifacts/brand/04/` altında tutulur.

Hero: `src/components/ui/orbit-delivery-hero.tsx` · Hedefler: `src/lib/hero-destinations.ts` · Stiller: bileşenin `.module.css` dosyası.

Three.js / React Three Fiber, Tailwind CSS 4 ve shadcn uyumlu `components.json` kurulu. UI dizini `src/components/ui`; Tailwind utility'leri `tw:` öneki kullanır. Model üretimi, hareket, form aktarımı ve kullanım ayrıntıları: [Etkileşimli hero](docs/05-etkilesimli-hero.md).

Konumlar ve medya: `src/lib/world-tour.ts` · Yakın rota/bekleme: `src/lib/location-routing.ts` · Animasyonlar: `remotion/tour/` · Üretim: `npm run hero:tour-render`. Elle bir konuma yaklaşarak kısa süre beklemek, işaretin üzerinde durmak veya işarete tıklamak ilgili canlandırmayı açar. Keşif, bulunulan yerden en yakın görülmemiş konumla devam eder.

Sloganın üzerindeki mercek, Hyperiux Vault'un Liquid Glass Cursor bileşeninden uyarlandı: `src/components/ui/liquid-glass-cursor.tsx`. Motion yayları, SVG kırılma haritası ve renk ayrışması kullanır. `liquid-slogan.tsx` içindeki aynı boyutta italik **is not**, yüzeyle aynı siyah renktedir; yalnızca mercekteki kopyası aydınlanır. Etkinleşme alanı slogandır; merceğin optik kaynağı üstteki kısa notu ve alttaki açıklamaları da kapsar, böylece camın içine giren her metin birlikte büyür. Fareyle gezinme, dokunup gezdirme ve klavyeyle odaklanıp ok tuşlarını kullanma desteklenir. Azaltılmış hareket tercihinde mercek gecikmesiz takip eder.

### WhatsApp hızlı iletişim

`NEXT_PUBLIC_WHATSAPP_NUMBER` alanına yayınlanacak **iş numarası**, ülke koduyla birlikte girilir. Alan boş veya geçersizken balon gösterilmez. Numara eklendikten sonra yeniden build/deploy yapılır; Docker build argümanı da hazırdır.

Sağ alttaki lime balon, koyu bir karşılama paneli açar:

> Merhaba! Aklındaki projeyi kısaca anlat, ilk fırsatta dönüş yapalım.

WhatsApp bağlantısı ziyaretçinin mesaj kutusunu “Merhaba Decent Devs! Bir projem hakkında görüşmek istiyorum.” metniyle açar. Ziyaretçi Gönder'e basar. WhatsApp içinden ayrıca otomatik yanıt istenirse Business uygulamasının **Karşılama mesajı** özelliğine karşılama metni girilir.

Bileşen: `src/components/whatsapp-contact.tsx` · Metinler ve numara doğrulama: `src/lib/whatsapp.ts`. İletişim balonu API veya harici widget hizmeti kullanmaz. Açılış, kapanış ve ikon geçişleri Motion ile yapılır; azaltılmış hareket tercihine uyar. WhatsApp simgesi Bootstrap Icons'tan alınmıştır (MIT, `public/licenses/bootstrap-icons.txt`).

## Gerçek talep akışı

`.env.example` dosyasını `.env.local` olarak kopyalayıp gerekli alanları doldurun. Gizli anahtarlar sunucu tarafında kullanılır.

1. Form aynı kaynaktan JSON kabul eder; sunucuda boyut ve şema kontrolü yapılır.
2. Talep ve bildirim işleri tek SQLite işlemiyle kaydedilir.
3. Aynı gönderim anahtarının tekrarı aynı referansı döndürür. Değiştirilmiş içerikle aynı anahtarın kullanımı reddedilir.
4. Yanıtın ardından bildirim kuyruğu işlenir. Servis hataları brief kaydını kaybettirmez.
5. Müşteri kendi proje özetini Markdown olarak indirebilir.

Varsayılan veri konumu: `.data/briefs.sqlite`. Bu klasör Git ve Docker build bağlamından hariçtir. Yerel geliştirmede bildirim anahtarları olmadan kayıt ve indirme çalışır; başarı ekranı bunun bir yerel önizleme olduğunu açıklar.

### E-posta

- `RESEND_API_KEY` ve doğrulanmış gönderici için `EMAIL_FROM`.
- Stüdyoya ayrıca kopya için `LEAD_NOTIFICATION_EMAIL`.
- Resend gönderimleri tekrar denemelerde sabit idempotency anahtarı kullanır.

### Slack

Ekip içi bildirim için **`SLACK_WEBHOOK_URL`** veya **`SLACK_BOT_TOKEN` + `SLACK_LEADS_CHANNEL`** yeterlidir. Müşteri metni Slack'te `plain_text` olarak gönderilir.

Varsayılan `SLACK_INVITE_MODE=manual`, müşterinin Slack tercihini ekip bildirimine ekler.

**Enterprise otomatik davet:**

- `SLACK_INVITE_MODE=enterprise`
- `SLACK_ADMIN_TOKEN` (`admin.users:write`, Enterprise planı)
- `SLACK_BOT_TOKEN` (özel kanal oluşturma/okuma/davet ve mevcut üyeyi e-postayla bulmak için ilgili izinler: `groups:write`, `groups:read`, `users:read.email`; ayrıca bildirim kullanılıyorsa `chat:write`)
- `SLACK_TEAM_ID`

Müşteri bu seçeneği işaretlediyse özel proje kanalı oluşturulur, kimliği kaydedilir ve tek kanallı misafir daveti gönderilir. Mevcut çalışma alanı üyeleri kullanıcı kimlikleriyle kanala davet edilir. Müşteri daveti kabul ederek katılır. Diğer Slack planlarında mevcut entegrasyon ekip bildirimini ve davet talebini taşır.

### Bildirimlerin yeniden denenmesi ve bakım

Kaynak proje üzerinden:

```sh
npm run notifications:retry
npm run leads:export
```

İkinci komut brief'leri `.data/exports/` altına yazar. Dışa aktarılan dosyalar ayrıca yönetilmelidir; uygulama içindeki 90 günlük temizleme dışa aktarımlara uygulanmaz.

Üretimde bir zamanlayıcıyı dakikada bir şu isteği gönderecek şekilde ayarlayın:

```sh
curl -X POST https://decentdevs.com/api/internal/notifications \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

`CRON_SECRET` ayarlanmadığında bu bakım uç noktası kapalıdır. Her çağrı en fazla dört işi alır. İşler süreli kilitle korunur; hatalar artan beklemeyle yeniden denenir, sekiz başarısız deneme sonrası operatör incelemesi için kayıtta kalır. Yapılandırılmamış servisler deneme hakkı tüketmez. Bakım, 90 günü geçen talepleri ve ilişkili kuyruk kayıtlarını temizler.

Gizlilik notunun işletmenin gerçek unvanı, iletişim adresi ve operasyonel saklama pratiğiyle yayında eşleşmesi gerekir.

## Arşivdeki kısa film

İlk 20 saniyelik çalışma: **`public/film/decent-devs.mp4`** — 1920×1080, 30 FPS, 600 video karesi, stereo AAC ses. Kaynakları ve aşağıdaki komutlar arşiv çalışmasına aittir. Sitenin kullandığı 60 saniyelik film bir sonraki bölümde kayıtlıdır.

- `remotion/root.tsx`: beş sahne, kare bazlı animasyonlar, sosyal kart ve uygulama simgesi.
- `scripts/generate_audio.py`: Python standart kütüphanesiyle özgün synth/pad, pluck, hafif perküsyon ve geçiş sesleri. Harici sample veya müzik API'si kullanmaz.
- Ses komutu bu Windows ortamındaki taşınabilir Python'u otomatik bulur. Başka bir kurulum için `PYTHON_BIN` ile Python yolunu belirtebilirsiniz.
- `public/audio/studio-score.wav`: 20 saniye, 48 kHz stereo kaynak.
- `public/film/captions-tr.vtt`: Türkçe altyazı.
- `public/fonts/`: Remotion için yerel fontlar ve lisans.

```sh
npm run audio:generate
npm run film:studio
npm run film:render
npm run film:poster
```

Windows'ta mevcut Chrome'u kullanmak için render komutuna şu argüman eklenebilir:

```powershell
npm run film:render -- --browser-executable="C:\Program Files\Google\Chrome\Application\chrome.exe"
```

Sosyal paylaşım görseli ve Apple simgesi:

```sh
npx remotion still remotion/index.ts SocialCard public/og.png
npx remotion still remotion/index.ts AppIcon public/apple-icon.png
```

## Yayındaki anlatımlı tanıtım filmi

Onaylı 60 saniyelik / 1080p / 60 FPS film **Markus seslendirmesi + Digital Gravity** içerir. Ek efektlerin kazancı sıfırdır; müzik konuşma sırasında geri çekilir. Tarayıcı standart MP4 oynatır; Remotion çalışma zamanı yüklenmez.

Güncel ses **Markus Kästler / Eleven v4**, üretim ayarları stabilite 0,36, benzerlik 1,0 ve hız 1,0'dır.

- Yayın videosu: `public/film/intro/music-previews/decent-devs-digital-gravity-voice-music.mp4`
- Altyazı: `public/film/intro/decent-devs-intro-markus-v4.vtt`
- Kapak: `public/film/intro/poster-04.jpg`
- Mobil kapak: `public/film/intro/poster-04-mobile.webp` (`npm run intro:poster` ile hazırlanır)
- Kullanıldığı yer: `src/components/film.tsx`

Ses kaynaklarının bulunduğu çalışma ortamında onaylı miks `npm run intro:approved` ile yeniden oluşturulur. Bu komut `--no-fx` kullanır. Kaynak Digital Gravity dosyası `artifacts/intro/music-candidates/digital-gravity/source.wav` altındadır; yerel üretim kaynakları Git dışında tutulur. `intro:prepare` ve `intro:render` sahne/temel ses üretim hattıdır; son yayın miksini oluşturmak için ardından `intro:approved` çalıştırılır. Ayrıntılar: [Tanıtım filmi notları](docs/04-tanitim-filmi.md).

## SEO ve erişilebilirlik

Ana ve hizmet sayfaları statik HTML üretir. Sayfa başlıkları, açıklamalar, canonical URL'ler, Open Graph görseli, `Organization`, `Service`, `BreadcrumbList`, `CreativeWork`, sitemap ve robots tanımlıdır. İngilizce içerik yayımlandığında gerçek çevirilerle `/en/` ve `hreflang` eklenebilir.

Menü ve film pencereleri klavyeyle kapanır; form hataları alanlara bağlıdır; mobil düzenler, azaltılmış hareket tercihi ve kendi sunucumuzdan yüklenen fontlar desteklenir.

## Kontroller

```sh
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Bu Windows ortamında kurulu Chrome ile:

```powershell
$env:PLAYWRIGHT_CHROME = '1'
npm run test:e2e
```

Uçtan uca testler **3101** portunda ayrı üretim sunucusu ve `artifacts/e2e-data` veritabanı kullanır. E-posta/Slack anahtarları test ortamında boşaltılır. Test kapsamı; gerçek demo etkileşimleri, film, form devamı/gönderimi/indirme, API tekrarları, statik SEO ve otomatik WCAG kontrolleridir.

### Yayın öncesi son kontrol — 8 Ekim 2026

- 29 birim/entegrasyon testi ve 28 masaüstü/mobil senaryosu doğrulandı; son hero değişikliklerinde ilgili 10 senaryo tekrar geçti.
- Bağlantı kesilince cevapları koruyan yeniden gönderim, kayıt sırasında tutarlı form durumu ve başarı başlığına klavye odağı kontrol edildi.
- Mercek yalnızca sloganda etkinleşir; içine giren komşu metinlerin konum ve büyütme oranı masaüstü/mobilde doğrulandı.
- Küre, ilk içerik boyandıktan ve görünür olduktan sonra hazırlanır. Doku yüklemeleri parçalara ayrılır; tüm sahnenin shader hazırlığı tamamlanınca animasyon başlar.
- Üretim build'inde Lighthouse mobil ölçümü: **Performans 71 · Erişilebilirlik 100 · İyi uygulamalar 100 · SEO 100**. LCP **3,7 sn**, toplam engelleme süresi **670 ms**, CLS **0,002**. Ön kontroldeki engelleme süresi 1.690 ms idi. Ağır 3B ilk yükleme, mobil performans için geliştirmeye açık noktadır.
- Üretim bağımlılık taramasında bilinen açık bulunmadı. Onaylı film 60 saniye / 1080p60, Markus + Digital Gravity olarak doğrulandı.

### Konum bazlı keşif doğrulaması — 7 Ekim 2026

- 23 konumun tamamı için ayrı animasyon ve poster üretildi; canlı tur bütün konumları tekrar etmeden dolaştı.
- Elle yaklaştırıp bekleme, işaret üzerinde bekleme ve tıklama çalışıyor; devam rotası gerçek konuma göre seçiliyor.
- Üretim derlemesi, tip kontrolü, hareket/rota/bekleme testleri ve 26 masaüstü/mobil tarayıcı senaryosu doğrulandı.
- Pencerelerde müşteri odaklı başlıklar kullanılıyor; üretim notları kaldırıldı.

### Önceki otomatik keşif turu doğrulaması — 7 Ekim 2026

- Üretim derlemesi ve TypeScript kontrolü başarılı.
- 8 hareket/tur testi ve 24 masaüstü/mobil tarayıcı senaryosu doğrulandı.
- Sekiz durağın tamamı her iki ekran profilinde canlı izlendi; klipler 7 saniye ve sessiz.
- Sürükleyerek devralma, 20 saniyelik bekleme sonrası devam, duraklatma, ekran dışı bekleme ve video hatasında sonraki durağa geçiş kontrol edildi.

### Önceki hero revizyonu — 7 Ekim 2026

- TypeScript ve üretim derlemesi başarılı.
- 20 birim/entegrasyon testi ve 20 masaüstü/mobil tarayıcı testi başarılı.
- Hedefe varış, duraklatma, forma tür aktarımı, bütçesiz brief, 3B yükleme hatasından kurtarma, azaltılmış hareket ve WCAG kontrolleri geçti.

### Önceki sürüm ölçümü — 6 Ekim 2026

- Üretim derlemesi ve TypeScript kontrolü başarılı.
- 16 birim/entegrasyon testi ve 16 masaüstü/mobil tarayıcı testi başarılı.
- Yerel üretim sunucusunda Lighthouse 13.5 mobil profili: **Performans 91 · Erişilebilirlik 100 · İyi uygulamalar 100 · SEO 100**.
- Aynı laboratuvar ölçümünde: LCP 3,04 sn, toplam engelleme süresi 76 ms, CLS 0.
- Render edilen film: 600 video karesi, 1920×1080, H.264, stereo 48 kHz AAC.

## Dağıtım

Bu sürüm **Node 24 ve kalıcı disk kullanan tek uygulama örneği** için hazırlanmıştır. Docker imajı Next.js standalone çıktısını çalıştırır; SQLite verisi `brief-data` volume'ünde tutulur.

```sh
cp .env.example .env
docker compose up --build -d
```

Alan adı/TLS yönlendirmesini 3000 portundaki uygulamaya yapın. `NEXT_PUBLIC_SITE_URL` ve isteğe bağlı `NEXT_PUBLIC_CONTACT_EMAIL` derleme zamanı değerleridir. `RATE_LIMIT_SECRET` ve `CRON_SECRET` için ayrı uzun rastgele değerler belirleyin. `TRUST_PROXY_HEADERS=true` yalnızca `X-Forwarded-For` başlığını güvenilir biçimde yeniden yazan bir reverse proxy arkasında kullanılmalıdır.

Yayına bağlanacak gerçek değerler: alan adı/DNS, kalıcı veri diski, bildirim alacak stüdyo adresi veya Slack kanalı ve zamanlanmış bildirim bakımı. WhatsApp numarası yayın ortamında `NEXT_PUBLIC_WHATSAPP_NUMBER` build değişkenine de girilmelidir. Güncel durum ve kurulum sırası: [Yayın notları](docs/06-yayin-oncesi.md).
