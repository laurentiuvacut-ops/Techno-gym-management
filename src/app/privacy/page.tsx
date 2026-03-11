'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
      <div className="max-w-[720px] mx-auto px-6 py-12 md:py-20">
        <Button asChild variant="ghost" className="mb-8 -ml-4 gap-2 text-muted-foreground hover:text-primary transition-colors">
          <Link href="/">
            <ArrowLeft className="w-4 h-4" /> Înapoi la Acasă
          </Link>
        </Button>

        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">
            Politica de Confidențialitate
          </h1>
          <p className="text-muted-foreground text-sm uppercase tracking-widest font-medium">
            Techno Gym Craiova — Ultima actualizare: Martie 2026
          </p>
        </header>

        <article className="space-y-10 leading-relaxed text-zinc-400">
          <section>
            <h2 className="text-xl font-bold text-primary mb-4 uppercase tracking-wide">1. Introducere</h2>
            <p>
              Techno Gym Craiova („noi", „al nostru") operează aplicația mobilă Techno Gym și site-ul web technogymcraiova.com. Această politică de confidențialitate descrie modul în care colectăm, utilizăm și protejăm informațiile dumneavoastră personale.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-4 uppercase tracking-wide">2. Date pe care le colectăm</h2>
            <p>Colectăm următoarele informații atunci când utilizați aplicația noastră:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong className="text-zinc-200 font-semibold">Număr de telefon</strong> — pentru autentificare prin SMS și identificarea contului</li>
              <li><strong className="text-zinc-200 font-semibold">Nume</strong> — pentru personalizarea experienței și identificarea membrilor</li>
              <li><strong className="text-zinc-200 font-semibold">Date despre abonament</strong> — tip abonament, data de început, data de expirare</li>
              <li><strong className="text-zinc-200 font-semibold">Jurnal de antrenament</strong> — exerciții, seturi, repetări, greutăți (introduse voluntar de utilizator)</li>
              <li><strong className="text-zinc-200 font-semibold">Feedback și evaluări</strong> — opinii transmise voluntar despre serviciile noastre</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-4 uppercase tracking-wide">3. Cum utilizăm datele</h2>
            <p>Datele colectate sunt utilizate exclusiv pentru:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Autentificarea și accesul securizat în aplicație</li>
              <li>Gestionarea abonamentului și controlul accesului în sală</li>
              <li>Urmărirea progresului personal de antrenament</li>
              <li>Trimiterea de notificări SMS despre expirarea abonamentului (cu 2 zile înainte)</li>
              <li>Îmbunătățirea serviciilor noastre pe baza feedback-ului primit</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-4 uppercase tracking-wide">4. Stocarea datelor</h2>
            <p>
              Datele sunt stocate securizat folosind serviciile Google Firebase (Firestore și Authentication), care respectă standardele GDPR și sunt certificate SOC 2 și ISO 27001. Serverele sunt localizate în Uniunea Europeană.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-4 uppercase tracking-wide">5. Partajarea datelor</h2>
            <p>Nu vindem, nu închiriem și nu partajăm datele dumneavoastră personale cu terțe părți, cu excepția:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong className="text-zinc-200 font-semibold">Google Firebase</strong> — infrastructura de stocare și autentificare</li>
              <li><strong className="text-zinc-200 font-semibold">Servicii SMS</strong> — pentru trimiterea codurilor de verificare și notificărilor</li>
              <li><strong className="text-zinc-200 font-semibold">Autorități legale</strong> — doar dacă suntem obligați prin lege</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-4 uppercase tracking-wide">6. Drepturile dumneavoastră (GDPR)</h2>
            <p>Conform Regulamentului General privind Protecția Datelor (GDPR), aveți dreptul de a:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Accesa datele personale pe care le deținem despre dumneavoastră</li>
              <li>Solicita rectificarea datelor incorecte</li>
              <li>Solicita ștergerea datelor personale („dreptul de a fi uitat")</li>
              <li>Restricționa sau obiecta la prelucrarea datelor</li>
              <li>Solicita portabilitatea datelor</li>
              <li>Depune o plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-4 uppercase tracking-wide">7. Securitate</h2>
            <p>
              Implementăm măsuri tehnice și organizatorice adecvate pentru protejarea datelor, inclusiv: criptare în tranzit (HTTPS/TLS), autentificare prin SMS cu cod unic, și acces restricționat la baza de date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-4 uppercase tracking-wide">8. Retenția datelor</h2>
            <p>
              Păstrăm datele dumneavoastră atât timp cât aveți un cont activ. După dezactivarea contului sau la cerere, datele personale vor fi șterse în termen de 30 de zile.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-4 uppercase tracking-wide">9. Utilizatori minori</h2>
            <p>
              Aplicația noastră nu este destinată persoanelor sub 16 ani. Nu colectăm cu bună știință date de la minori sub această vârstă.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-4 uppercase tracking-wide">10. Modificări ale politicii</h2>
            <p>
              Ne rezervăm dreptul de a actualiza această politică. Modificările vor fi publicate pe această pagină cu data actualizării. Continuarea utilizării aplicației după modificări constituie acceptarea noii politici.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-4 uppercase tracking-wide">11. Contact</h2>
            <p>Pentru orice întrebări sau solicitări legate de datele dumneavoastră personale:</p>
            <ul className="list-none space-y-3 mt-4">
              <li><strong className="text-zinc-200">Email:</strong> <a href="mailto:laurentiuvacut@gmail.com" className="text-primary hover:underline transition-all">laurentiuvacut@gmail.com</a></li>
              <li><strong className="text-zinc-200">Locație:</strong> Techno Gym, Craiova, România</li>
              <li><strong className="text-zinc-200">Website:</strong> <a href="https://technogymcraiova.com" className="text-primary hover:underline transition-all">technogymcraiova.com</a></li>
            </ul>
          </section>
        </article>

        <footer className="mt-20 pt-8 border-t border-white/5 text-zinc-600 text-sm">
          <p>&copy; 2026 Techno Gym Craiova. Toate drepturile rezervate.</p>
        </footer>
      </div>
    </div>
  );
}
