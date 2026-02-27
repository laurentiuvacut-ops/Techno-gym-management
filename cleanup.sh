#!/bin/bash
# Techno Gym - Script de curățare cod redundant
# FIX #10, #11, #16, #19

echo "🚀 Pornire proces de curățare..."

# 1. Ștergere componente nefolosite (HARDCODED/REDUNDANT)
rm -f src/components/weekly-activity-chart.tsx
rm -f src/components/days-remaining-chart.tsx

# 2. Ștergere fișiere Firebase nefolosite
rm -f src/firebase/non-blocking-login.tsx

# 3. Ștergere directoare duplicate din rădăcină (Next.js folosește DOAR src/)
rm -rf app/
rm -rf components/
rm -rf hooks/
rm -rf contexts/
rm -rf firebase/

echo "✅ Cleanup complet! Proiectul este acum curat."
