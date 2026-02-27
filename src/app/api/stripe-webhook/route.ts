
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

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
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
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  console.log(`Received Stripe event: ${event.type}`);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.CheckoutSession;
    const userId = session.client_reference_id;
    
    // Extract plan_id from success_url
    const successUrl = new URL(session.success_url || '');
    const planId = successUrl.searchParams.get('plan_id');

    console.log(`Processing completion for User: ${userId}, Plan: ${planId}`);

    if (!userId || !planId) {
      console.error('Missing userId or planId in session');
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
    }

    const purchasedPlan = subscriptions.find(s => s.id === planId);
    if (!purchasedPlan) {
      console.error(`Plan not found: ${planId}`);
      return NextResponse.json({ error: 'Plan not found' }, { status: 400 });
    }

    try {
      const db = admin.firestore();
      const membersRef = db.collection('members');
      
      // Find the member document by their custom 'id' field (which is the Firebase UID)
      const querySnapshot = await membersRef.where('id', '==', userId).limit(1).get();

      if (querySnapshot.empty) {
        console.error(`Member document not found for UID: ${userId}`);
        return NextResponse.json({ error: 'Member not found' }, { status: 404 });
      }

      const memberDoc = querySnapshot.docs[0];
      const memberData = memberDoc.data();
      const docId = memberDoc.id; // This is the E.164 phone number

      console.log(`Found member document: ${docId}`);

      const daysToAdd = purchasedPlan.durationDays || 30;
      let startDate = new Date();
      
      const expirationValue = memberData.expirationDate;
      let currentExpirationDate: Date | null = null;

      if (expirationValue) {
        if (typeof expirationValue === 'string') {
          const parts = expirationValue.split('-').map(part => parseInt(part, 10));
          if (parts.length === 3 && !parts.some(isNaN)) {
            currentExpirationDate = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
          }
        } else if (expirationValue.toDate && typeof expirationValue.toDate === 'function') {
           currentExpirationDate = expirationValue.toDate();
        }
      }

      const today = new Date();
      const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

      // If existing subscription is still active, start new one from expiration date
      if (currentExpirationDate && isValid(currentExpirationDate) && differenceInCalendarDays(currentExpirationDate, todayUtc) >= 0) {
        startDate = currentExpirationDate;
      } else {
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

      console.log(`Updating member ${docId} with new expiration: ${updatedData.expirationDate}`);
      
      await membersRef.doc(docId).update(updatedData);

      console.log('Member updated successfully');
      return NextResponse.json({ success: true });
    } catch (error: any) {
      console.error('Error updating member in Firestore:', error);
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
