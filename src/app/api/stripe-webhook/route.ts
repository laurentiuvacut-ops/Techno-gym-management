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

function initAdmin() {
  if (admin.apps.length > 0) return admin.app();

  const rawKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!rawKey) {
    console.error('❌ Missing FIREBASE_SERVICE_ACCOUNT_KEY');
    return null;
  }

  try {
    const cleanedKey = rawKey.trim().replace(/^'|'$/g, '');
    const serviceAccount = JSON.parse(cleanedKey);
    
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }

    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error: any) {
    console.error('❌ Firebase Admin Init Failed:', error.message);
    return null;
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    if (!webhookSecret) throw new Error('Missing STRIPE_WEBHOOK_SECRET');
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`❌ Webhook Signature Error: ${err.message}`);
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.CheckoutSession;
    const userId = session.client_reference_id;
    
    let planId = null;
    try {
        const successUrl = new URL(session.success_url || '');
        planId = successUrl.searchParams.get('plan_id');
    } catch (e) {
        console.error('❌ Invalid Success URL');
    }

    if (!userId || !planId) {
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
    }

    const purchasedPlan = subscriptions.find(s => s.id === planId);
    if (!purchasedPlan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 400 });
    }

    try {
      const app = initAdmin();
      if (!app) throw new Error('Admin not initialized');
      
      const db = admin.firestore();
      const membersRef = db.collection('members');
      const querySnapshot = await membersRef.where('id', '==', userId).limit(1).get();

      if (querySnapshot.empty) {
        return NextResponse.json({ error: 'Member not found' }, { status: 404 });
      }

      const memberDoc = querySnapshot.docs[0];
      const memberData = memberDoc.data();
      const docId = memberDoc.id;

      const daysToAdd = purchasedPlan.durationDays || 30;
      let startDate = new Date();
      
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
        startDate = currentExpirationDate;
      } else {
        startDate = todayUtc;
      }

      const newExpirationDate = addDays(startDate, daysToAdd);
      
      await membersRef.doc(docId).update({
        expirationDate: format(newExpirationDate, 'yyyy-MM-dd'),
        subscriptionType: purchasedPlan.title,
        status: "Activ",
        lastPaymentId: session.id,
        lastPaymentAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return NextResponse.json({ success: true });
    } catch (error: any) {
      console.error('❌ DB Update Failed:', error.message);
      return NextResponse.json({ error: 'Processing error' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}