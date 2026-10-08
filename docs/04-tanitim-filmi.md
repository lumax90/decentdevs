# Decent Devs — 60 saniyelik anlatımlı film

## Ana fikir

**Başlamak kolaylaştı. Güvenilir bir ürüne ulaşmak hâlâ özen ister.**

Film, aynı randevu uygulaması fikrini takip eder. İlk ekran, gerçek kullanım sorunları, tasarım kararları, mimari ve testler tek bir hikâyenin parçalarıdır.

Markanın farkı: deneyim, tasarım gözü ve AI hızını birleştirerek sonucun sorumluluğunu üstlenmek.

## Görsel akış

1. **Başlangıç:** Bir prompttan uygulama taslağı oluşur. İyimser ve meraklı giriş.
2. **Gerçek hayat:** Aynı saat için iki randevu isteği, kesilen bağlantı, erişim sınırları. Somut sorunlar üzerinden ürün düşüncesi.
3. **Tasarım karşılaştırması:** Aynı içerik, iki yaklaşım. Kalabalık ve hiyerarşisi belirsiz ilk çıktı; tutarlı, okunabilir ve açık bir kullanıcı akışı. Bunlar film için hazırlanmış temsili arayüzlerdir.
4. **Mimari karşılaştırması:** Doğrudan ve kontrolsüz bağlantılar; ardından doğrulama, yetki, işlem sınırları ve tutarlı veri. Bir randevu onaylanırken ikinci istek anlaşılır biçimde yönlendirilir.
5. **Neden biz?:** Tecrübe, tasarım gözü ve AI aynı üretim sürecinde birleşir. Doğru bağlam, kod inceleme, elle düzeltme ve test görünür olur.
6. **Sonuç:** Web, native mobil ve özel sistemlere uzanan bir ürün. İhtiyaçtan yayına kadar net adımlar.
7. **İmza:** Decent Devs. Good enough.

Karşılaştırmalar, üretimin farklı olgunluk seviyelerini gösterir. Görsel örnekler belirli bir AI sağlayıcısına veya gerçek bir müşteriye atfedilmez. “Kusursuz” gibi mutlak sonuç iddiaları yerine, doğrulanmış kararlar ve test edilen akışlar anlatılır.

## Seslendirme

Kaynak metin: `remotion/intro/script.json`.

Ton: doğal Türkçe, sakin güven, hafif bir tebessüm. Uzun bir kurumsal sunum hissi yerine doğrudan anlatım.

ElevenLabs, bölüm bölüm zaman damgalı konuşma üretir. Gerçek ses süreleri sahne uzunluklarını belirler; kurgu toplamda tam 3600 kare / 60 saniye kalır. Güncel Eleven v4 üretiminde her bölüm tam konuşma cümleleriyle gönderilir.

## Ses tasarımı

Python ile özgün, sıcak elektronik müzik; yazma, seçim, uyarı, doğrulama ve geçiş vurguları. Konuşma sırasında müzik otomatik olarak geri çekilir. Ses, müzik ve efektlerin ayrı kaynakları korunur.

Güncel ses: **Markus Kästler — Rich, Masculine & Confident** (`AbeORHEnJy68TSXZpg3m`). Model: **Eleven v4** (`eleven_v4`). Kullanıcının verdiği örnek ve ses profilindeki değerler esas alındı: stabilite **0,36**, benzerlik **1,0**, hız **1,0**. Dil otomatik algılanır. V4'ün desteklemediği `style` ve `use_speaker_boost` alanları isteğe eklenmez. Markus'un ses profili Almanca kökenlidir; bu filmde Türkçe metin Eleven v4 ile seslendirilir.

Üç noktalar kaldırıldı, gereksiz virgüller azaltıldı ve yarım ifadeler daha akıcı cümlelere dönüştürüldü. Yeni ses yaklaşık 51,68 saniyedir; 60 saniyelik kurguda ek hızlandırma kullanılmaz. Önceki renderlar `artifacts/intro/versions/before-markus-*` içinde yedeklendi. Kullanıcının beğendiği kısa ses referansı `artifacts/intro/reference-voice/markus-approved.mp3` dosyasıdır.

Ana müzik, kaydırma ve onay efektleri de ElevenLabs kaynaklıdır. Python; zamanlama, ilave küçük vurgular, konuşmaya bağlı müzik kısma ve miks için kullanılır. Son miks iki geçişli loudness işlemiyle yaklaşık −16 LUFS seviyesine getirilir.

Önceki Sarah sesli sürüm ve ses kaynakları `artifacts/intro/revisions/sarah-v1/` içinde saklanır.

Çıktılar: 1080p MP4, Türkçe altyazı, kapak karesi, seslendirme metni ve yeniden üretilebilir Remotion/Python kaynakları.

## Görsel yönetim — referans sonrası

İncelenen referans: Lukas Margerie, “How to Make Insane Motion Graphics With Opus 5.5”, https://www.youtube.com/watch?v=747ZnEtsRbg . Bölüm akışı, örnek storyboard kareleri ve 4:09 / 10:55 / 16:35 / 18:20 çevresindeki motion rules, marka, yönetmenlik ve eleştiri örnekleri incelendi.

- Tek, tanınabilir ana nesne: randevu kartı. Prompttan arayüze, arayüzden veri modeline taşınır.
- Her 2–4 saniyede anlatıyı ilerleten yeni bir aksiyon: yazma, çoğalma, karşılaştırma, katman açılması, doğrulama.
- Aynı yön ve hareket enerjisini koruyan geçişler; yakın plan ve geniş plan arasında kamera değişimi.
- Tipografi konuşmanın vurgularını taşır. Metnin ve arayüzün aynı anda rekabet etmesi engellenir.
- Film kareleri yalnızca zamana bağlı hesaplanır; render sırasında rastgelelik, bağımsız CSS animasyonu veya geçmiş kareye bağlı durum kullanılmaz.
- 120 BPM referans ritmi, gerçek ses uzunluklarıyla düzenlenen kesmeler ve olaylara bağlı efektler.
- Tam render öncesinde temas sayfası: okunabilirlik, sahne çeşitliliği, aynı nesnenin sürekliliği ve ses senkronu kontrol edilir.

## Üretim

```sh
npm run intro:voices
npm run intro:narrate
npm run intro:sound
npm run intro:prepare
npm run intro:contact-sheet
npm run intro:render
npm run intro:verify
```

Markus / v4 sürümünü ayrı dosya olarak üretmek ve kontrol etmek için:

```sh
npm run intro:render -- --output public/film/intro/decent-devs-intro-markus-v4.mp4
npm run intro:verify -- public/film/intro/decent-devs-intro-markus-v4.mp4
```

- Güncel video: `public/film/intro/decent-devs-intro-markus-v4.mp4`
- Önceki videolar: `public/film/intro/decent-devs-intro.mp4`, `public/film/intro/decent-devs-intro-tr.mp4`
- Altyazı: `public/film/intro/captions-tr.vtt`
- Kapak: `public/film/intro/poster.jpg`
- Metin: `public/film/intro/narration.txt`
- Kaynaklar: `remotion/intro/`
- Ses katmanları, API önbelleği ve inceleme kareleri: `artifacts/intro/`

Seslendirme isteği metin, ses veya ayarlar değişmediyse önbellekten kullanılır. `--force` aynı sesleri yeniden üretir ve yeniden kredi kullanabilir. `intro:sound` mevcut kaynakları korur; erişilemeyen müzik/efekt katmanları Python ile tamamlanır. `intro:prepare` sesleri sahnelere yerleştirir, altyazıları gerçek konuşma zamanlarından çıkarır ve miksi hazırlar.

Doğrulama raporu video dosyasının SHA-256 değerini, ses kimliğini, modelini ve ayarlarını birlikte kaydeder. Böylece sohbet geçmişi geri alınsa da hangi video dosyasının hangi sesle üretildiği izlenebilir.

`npm run intro:render -- --clean` altyazısız bir kopya üretebilir. İlk görsel çalışma için `--animatic` seçeneği belirgin şekilde etiketlenmiş bir animatik oluşturur.
