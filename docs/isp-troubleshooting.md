# Ghid Depanare Autentificare SMS (Digi/ISP Fix)

Dacă utilizatorii primesc erori de tip `auth/operation-not-allowed` sau `error-code:-39` la login, urmează acești pași tehnici:

## 1. Verificare Consola Firebase
- Mergi la **Authentication** -> **Settings** -> **reCAPTCHA**.
- Asigură-te că **reCAPTCHA SMS Defense** este activat.
- Modul trebuie să fie **AUDIT** (sau **ENFORCE** dacă riscul de fraudă este scăzut).
- Scorul de risc (threshold) recomandat: **0.5**.

## 2. Configurație SDK (Implementată)
- Aplicația folosește Firebase JS SDK v11.x.
- Se utilizează `RecaptchaVerifier` în mod invizibil, cu fallback automat.
- Funcția de **Hard Reset** (butonul „Resetare Conexiune”) curăță Service Workers și Cache-ul browserului pentru a elimina DNS-urile „agățate”.

## 3. Domenii Autorizate
- Verifică în **Authentication** -> **Settings** -> **Authorized Domains** că domeniul tău (`technogymcraiova.com`) este listat.

## 4. Recomandare Utilizator
- Dacă eroarea persistă, utilizatorul ar trebui să încerce să treacă temporar pe **Date Mobile** (pentru a schimba IP-ul de ieșire ISP) și să apese butonul de **Resetare Conexiune** din pagina de login.