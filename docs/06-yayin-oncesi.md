# Yayın notları — 8 Ekim 2026

## Mevcut durum

Site, 23 duraklı keşif, etkileşimli konseptler, onaylı film, WhatsApp ve bütçesiz proje formuyla hazırlandı. Proje kayıtları SQLite'a kalıcı olarak yazılır; e-posta/Slack bağlantıları bu ortamda henüz yapılandırılmadı. WhatsApp numarası yerel `.env.local` dosyasında bulunur.

## Yayın için tamamlanacak kurulum

1. **Sunucu ve veri diski:** Mevcut uygulama Node 24 ve tek uygulama örneğiyle çalışır. `DATA_DIR` kalıcı bir diske bağlanır. Docker seçilirse `compose.yaml` içindeki `brief-data` volume'ü hazırdır. Vercel seçilirse SQLite, harici bir veritabanına taşınır; barındırma seçimi henüz yapılmadı.
2. **Alan adı:** DNS ve HTTPS ayarları tamamlanır; `NEXT_PUBLIC_SITE_URL` gerçek kök URL'ye ayarlanarak build alınır. Canonical adresler ve sitemap bu değeri kullanır.
3. **WhatsApp:** `NEXT_PUBLIC_WHATSAPP_NUMBER` yayın build'ine eklenir. Müşterinin kendi WhatsApp'ından gerçek konuşmanın açıldığı kontrol edilir. İşletme içinden otomatik karşılama için Business uygulamasındaki karşılama mesajı ayarlanır.
4. **Yeni taleplerin stüdyoya iletilmesi:** Resend için `RESEND_API_KEY`, `EMAIL_FROM`, `LEAD_NOTIFICATION_EMAIL`; veya ekip bildirimi için `SLACK_WEBHOOK_URL` / `SLACK_BOT_TOKEN` + `SLACK_LEADS_CHANNEL` yapılandırılır. Resend'in gönderen adresi doğrulanır. `NEXT_PUBLIC_CONTACT_EMAIL` isteğe bağlı kamuya açık iletişim adresidir.
5. **Tekrar deneme ve saklama:** `RATE_LIMIT_SECRET` ve `CRON_SECRET` ayrı rastgele değerlerle ayarlanır. Dakikada bir `POST /api/internal/notifications` çağrısı yapılır; bu işlem bildirimleri tekrar dener ve 90 günlük saklama temizliğini çalıştırır. Proxy kullanılıyorsa `TRUST_PROXY_HEADERS`, gerçek proxy davranışına göre ayarlanır.
6. **Canlı kabul:** Gerçek alan adından bir proje formu gönderilir; kaydın, ekip bildiriminin ve etkinleştirildiyse müşteri e-postasının ulaştığı kontrol edilir. Kayıt, uygulama yeniden başlatıldığında da bulunmalıdır.

## Yerel doğrulama

Son kontrolde 29 birim/entegrasyon testi ve 28 masaüstü/mobil senaryosu doğrulandı. Üretim build'i ve bağımlılık taraması geçti. Merceğin komşu metinleri büyütmesi, formun bağlantı hatasından sonra güvenli tekrarı ve onaylı filmin dosyası ayrıca kontrol edildi.

Lighthouse mobil profili: **71 performans / 100 erişilebilirlik / 100 iyi uygulamalar / 100 SEO**. LCP **3,7 sn**, toplam engelleme **670 ms**, CLS **0,002**. İlk kontrolde engelleme 1.690 ms idi. 3B dünyanın mobil ilk yükleme maliyeti hâlâ iyileştirmeye açıktır; bu ölçüm yerel üretim sunucusuna aittir.

```sh
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Uçtan uca testler ayrı veritabanı ve 3101 portunu kullanır. Geliştirme adresi `http://localhost:3000`'dir. Lighthouse ölçümü üretim build'iyle yapılır; canlı CDN ve cihaz sonuçları dağıtımdan sonra ayrıca ölçülebilir.

Yayın filmi, yeniden üretim komutları ve kaynakları [tanıtım filmi notlarında](04-tanitim-filmi.md) kayıtlıdır. Yayın seçimi Markus + Digital Gravity'dir.
