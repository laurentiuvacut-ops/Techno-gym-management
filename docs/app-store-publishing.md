# Ghid Publicare în App Store și Google Play

Aplicația Techno Gym este construită ca un PWA, ceea ce face publicarea în magazinele oficiale foarte accesibilă.

## 1. Google Play Store (Android)
Este cea mai simplă metodă și oferă cea mai bună experiență pe Android.

**Pași:**
1. Mergi pe [PWABuilder.com](https://www.pwabuilder.com/).
2. Introdu URL-ul aplicației tale publicate (ex: `https://technogymcraiova.com`).
3. Apasă pe **"Package for Store"** -> **Android**.
4. Configurează numele pachetului (ex: `com.technogym.craiova`).
5. Descarcă fișierul `.aab` și fișierul `assetlinks.json`.
6. Pune `assetlinks.json` în folderul `public/.well-known/` al site-ului tău (ajută la eliminarea barei de adrese din browser).
7. Creează un cont pe [Google Play Console](https://play.google.com/console/signup) (25$ taxă unică).
8. Încarcă fișierul `.aab`.

## 2. Apple App Store (iOS)
Apple necesită un wrapper nativ (Capacitor).

**Pași:**
1. Tot prin PWABuilder, selectează **iOS**.
2. Acesta va genera un proiect Xcode.
3. Vei avea nevoie de un Mac și de Xcode instalat.
4. Creează un cont pe [Apple Developer Program](https://developer.apple.com/programs/) (99$/an).
5. Trimite aplicația spre revizuire.

## Recomandări pentru Succes:
- **Iconițe de calitate:** Asigură-te că logo-ul tău este centrat și are spațiu de siguranță (safe area) pentru a nu fi tăiat când devine rotund pe Android.
- **Capturi de ecran:** Ambele magazine cer capturi de ecran din aplicație pe diferite dimensiuni de telefon.
- **Politica de confidențialitate:** Trebuie să ai o pagină pe site care explică cum folosești datele (telefon, nume).

Aplicația este deja configurată cu `apple-mobile-web-app-capable` și un `manifest.json` robust pentru a trece testele automate ale acestor platforme.
