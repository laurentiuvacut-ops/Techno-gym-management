# Checkpoint: Versiune Stabilă 1.2 - Securitate Stripe

Acest fișier marchează implementarea fluxului securizat de plăți server-side.

## Funcționalități incluse și verificate:
- **Autentificare (v1.1 Fix)**: ReCAPTCHA SMS Defense activat pentru deblocare ISP Digi.
- **Stripe Webhook (Nou)**: Actualizarea abonamentului se face acum DOAR pe server prin `src/app/api/stripe-webhook/route.ts`.
- **Securitate Firestore**: Regulile de securitate au fost blocate pentru a preveni modificarea manuală a datei de expirare din browser.
- **PWA Native Install**: Buton de instalare nativă pe Home Screen.

## Configurare necesară (.env.local):
1. **STRIPE_WEBHOOK_SECRET**: Obținut din Stripe Dashboard -> Webhooks -> Signing Secret (whsec_...).
2. **FIREBASE_SERVICE_ACCOUNT_KEY**: JSON-ul generat din Firebase Console -> Service Accounts -> Generate New Private Key.

**Data Snapshot:** 28 Februarie 2024 (Actualizat)
**Status:** Securizat (v1.2)
