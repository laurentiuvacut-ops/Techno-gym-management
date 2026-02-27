# Ghid Configurare Stripe Webhook - Techno Gym

Pentru ca abonamentele să se activeze automat după plată, trebuie să configurezi manual Webhook-ul în panoul Stripe.

## Pasul 1: Adăugarea Endpoint-ului în Stripe
1. Intră în [Stripe Dashboard -> Developers -> Webhooks](https://dashboard.stripe.com/webhooks).
2. Dacă ești în faza de testare, verifică să fie activat switch-ul **"Test mode"** (dreapta sus).
3. Apasă pe butonul **"+ Add endpoint"**.
4. La **Endpoint URL**, introdu adresa site-ului tău urmată de calea webhook-ului:
   `https://technogymcraiova.com/api/stripe-webhook`
   *(Dacă folosești un alt domeniu temporar, pune domeniul respectiv)*.
5. La **Select events to listen to**, apasă pe **"+ Select events"** și caută:
   - `checkout.session.completed` (Acesta este cel mai important).
6. Apasă **"Add events"** și apoi **"Add endpoint"**.

## Pasul 2: Obținerea Cheilor (Secretelor)
După ce ai salvat endpoint-ul:
1. Vei vedea o secțiune numită **"Signing secret"**. Apasă pe **"Reveal"**.
2. Copiază acel cod (începe cu `whsec_...`).
3. Deschide fișierul tău local `.env.local` (sau setările de mediu de pe serverul de hosting).
4. Adaugă linia: `STRIPE_WEBHOOK_SECRET=codul_tau_copiat`

## Pasul 3: Cheia Master Firebase (Service Account)
Pentru ca serverul să poată scrie în baza de date fără restricții:
1. Mergi în [Consola Firebase -> Project Settings -> Service Accounts](https://console.firebase.google.com/project/_/settings/serviceaccounts/adminsdk).
2. Apasă **"Generate new private key"**.
3. Se va descărca un fișier JSON.
4. Conținutul acelui JSON trebuie pus în `.env.local` sub variabila:
   `FIREBASE_SERVICE_ACCOUNT_KEY='{"type": "service_account", ...}'`
   *(Asigură-te că tot JSON-ul este pe un singur rând și cuprins între ghilimele simple)*.

## Cum verifici dacă funcționează?
1. Mergi în Stripe Dashboard -> Webhooks.
2. Apasă pe Webhook-ul creat.
3. În tab-ul **"Succeeded"**, vei vedea log-urile tuturor plăților trimise către site-ul tău.
4. Statusul trebuie să fie `200 OK`.
