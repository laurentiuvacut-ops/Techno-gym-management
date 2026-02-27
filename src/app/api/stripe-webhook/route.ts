
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import * as admin from 'firebase-admin';
import { subscriptions } from '@/lib/data';
import { addDays, format, isValid, differenceInCalendarDays } from 'date-fns';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Initialize Firebase Admin (Singleton pattern)
if (!admin.apps.length) {
  try {
    const rawKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!rawKey) {
        console.error('❌ CRITIC: Lipsește variabila FIREBASE_SERVICE_ACCOUNT_KEY din .env.local');
    } else {
        // Încercăm să curățăm eventualele caractere de control dacă a fost copiat greșit
        const serviceAccount = JSON.parse(rawKey);
        
        if (serviceAccount.project_id) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            console.log('✅ Firebase Admin inițializat cu succes pentru Webhook');
        } else {
            console.error('❌ Format JSON invalid pentru FIREBASE_SERVICE_ACCOUNT_KEY');
        }
    }
  } catch (error) {
    console.error('❌ Eroare la inițializarea Firebase Admin (Verifică formatul JSON):', error);
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    if (!webhookSecret) {
        console.error('❌ Lipsă STRIPE_WEBHOOK_SECRET în variabilele de mediu');
        throw new Error('Missing STRIPE_WEBHOOK_SECRET');
    }
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`❌ Verificarea semnăturii Webhook a eșuat: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  console.log(`🚀 Eveniment Stripe recepționat: ${event.type}`);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.CheckoutSession;
    const userId = session.client_reference_id;
    
    // Extragem plan_id din URL-ul de succes
    let planId = null;
    try {
        const successUrl = new URL(session.success_url || '');
        planId = successUrl.searchParams.get('plan_id');
    } catch (e) {
        console.error('❌ Nu s-a putut extrage plan_id din success_url');
    }

    console.log(`📦 Procesare plată pentru User: ${userId}, Plan: ${planId}`);

    if (!userId || !planId) {
      console.error('❌ Lipsesc metadatele necesare (userId sau planId)');
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
    }

    const purchasedPlan = subscriptions.find(s => s.id === planId);
    if (!purchasedPlan) {
      console.error(`❌ Planul nu a fost găsit în datele locale: ${planId}`);
      return NextResponse.json({ error: 'Plan not found' }, { status: 400 });
    }

    try {
      const db = admin.firestore();
      const membersRef = db.collection('members');
      
      // Căutăm membrul după câmpul 'id' (UID-ul Firebase)
      const querySnapshot = await membersRef.where('id', '==', userId).limit(1).get();

      if (querySnapshot.empty) {
        console.error(`❌ Nu s-a găsit documentul membrului pentru UID: ${userId}`);
        return NextResponse.json({ error: 'Member not found' }, { status: 404 });
      }

      const memberDoc = querySnapshot.docs[0];
      const memberData = memberDoc.data();
      const docId = memberDoc.id; // Acesta este numărul de telefon

      console.log(`👤 Membru identificat: ${docId}`);

      const daysToAdd = purchasedPlan.durationDays || 30;
      let startDate = new Date();
      
      // Verificăm dacă are un abonament activ pentru prelungire
      const expirationValue = memberData.expirationDate;
      let currentExpirationDate: Date | null = null;

      if (expirationValue && typeof expirationValue === 'string') {
          const parts = expirationValue.split('-').map(part => parseInt(part, 10));
          if (parts.length === 3 && !parts.some(isNaN)) {
            currentExpirationDate = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
          }
      }

      const today = new Date();
      const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

      if (currentExpirationDate && isValid(currentExpirationDate) && differenceInCalendarDays(currentExpirationDate, todayUtc) >= 0) {
        console.log(`⏳ Abonament activ. Prelungim de la: ${format(currentExpirationDate, 'yyyy-MM-dd')}`);
        startDate = currentExpirationDate;
      } else {
        console.log(`🆕 Abonament nou. Începem de azi: ${format(todayUtc, 'yyyy-MM-dd')}`);
        startDate = todayUtc;
      }

      const newExpirationDate = addDays(startDate, daysToAdd);
      const updatedData = {
        expirationDate: format(newExpirationDate, 'yyyy-MM-dd'),
        subscriptionType: purchasedPlan.title,
        status: "Activ",
        lastPaymentId: session.id,
        lastPaymentAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      console.log(`💾 Actualizare Firestore pentru ${docId}: Expiră la ${updatedData.expirationDate}`);
      
      await membersRef.doc(docId).update(updatedData);

      console.log('✅ Abonament actualizat cu succes în Firestore');
      return NextResponse.json({ success: true });
    } catch (error: any) {
      console.error('❌ Eroare la actualizarea bazei de date:', error);
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
