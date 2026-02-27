# Ghid Configurare Stripe Webhook - Techno Gym

Pentru ca abonamentele să se activeze automat după plată, trebuie să configurezi manual Webhook-ul în panoul Stripe și să adaugi cheile de securitate.

## Pasul 1: Adăugarea Endpoint-ului în Stripe
1. Intră în [Stripe Dashboard -> Developers -> Webhooks](https://dashboard.stripe.com/webhooks).
2. Dacă ești în faza de testare, verifică să fie activat switch-ul **"Test mode"** (dreapta sus).
3. Apasă pe butonul **"+ Add endpoint"**.
4. La **Endpoint URL**, introdu adresa site-ului tău urmată de calea webhook-ului:
   `https://technogymcraiova.com/api/stripe-webhook`
5. La **Select events to listen to**, caută și adaugă:
   - `checkout.session.completed`
6. Apasă **"Add endpoint"**.

## Pasul 2: Obținerea Secretelor (STRIPE_WEBHOOK_SECRET)
După ce ai salvat endpoint-ul:
1. Apasă pe **"Reveal"** la secțiunea **"Signing secret"**.
2. Copiază codul (începe cu `whsec_...`).
3. Adaugă-l în `.env.local`: `STRIPE_WEBHOOK_SECRET=whsec_...`

## Pasul 3: Cheia Master Firebase (FIREBASE_SERVICE_ACCOUNT_KEY)
Aceasta este cheia care permite serverului să scrie în baza de date. 

**CUM SE SALVEAZĂ CORECT:**
1. Mergi în [Consola Firebase -> Project Settings -> Service Accounts](https://console.firebase.google.com/project/_/settings/serviceaccounts/adminsdk).
2. Apasă **"Generate new private key"**. Se va descărca un fișier `.json`.
3. Deschide fișierul `.json` și copiază TOT conținutul.
4. **IMPORTANT:** JSON-ul trebuie să fie pe un singur rând. Poți folosi un tool online de "Minify JSON" sau poți să îl lipești pur și simplu în `.env.local` între ghilimele simple, astfel:

```env
FIREBASE_SERVICE_ACCOUNT_KEY='{"type": "service_account", "project_id": "...", "private_key": "-----BEGIN PRIVATE KEY-----\n..."}'
```

*(Notă: Ghilimelele simple `'` de la început și sfârșit sunt obligatorii pentru a proteja ghilimelele duble din interiorul JSON-ului).*

## Verificare
Dacă totul este corect, după o plată de test în Stripe, tab-ul **"Succeeded"** din Webhook-ul Stripe ar trebui să afișeze `Status 200 OK`, iar membrul va avea data de expirare actualizată automat în aplicație.
