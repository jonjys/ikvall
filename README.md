# IKVÄLL

En mening blir en öppningsscen. Man spelar den direkt, och betalar 29 kr för att skicka en ren länk.

Tre stämningar: fest, tyst, grattis. Inget konto. Meningen sparas inte i en databas. Den följer med i länken, och Stripe låser just den meningen till just det köpet.

## Kör lokalt

```bash
npm install
npm run dev
```

Öppna http://localhost:3457

## Riktiga pengar

Lägg `STRIPE_SECRET_KEY` i `.env.local` och starta om.

- `sk_live_...` tar riktiga kort. Då måste sidan nås via https, eller så sätter du `NEXT_PUBLIC_SITE_URL` till den adressen.
- `sk_test_...` är testläge och syns på sidan. Kort: `4242 4242 4242 4242`, valfritt framtida datum, valfri CVC.

Första köpet skapar priset 29 SEK i Stripe (lookup key `ikvall`). 29 kr är vad kunden betalar. Länken skapas bara om beloppet är just 29 kronor och betalningen är dragen.

Utan nyckel går kvällen att spela. Skicka startar ingen betalning och låtsas inte att den gjorde det.

`SIGNING_SECRET` behövs bara om servern inte har en varaktig disk. Annars sparas den i `.data/signing-secret`. Byt den inte efter att folk har fått länkar.

`STRIPE_WEBHOOK_SECRET` behövs bara om du vill att Stripe ska bekräfta köpet mot `/api/webhook`. Själva länken skapas på sidan efter betalningen. Ladda om `/skickat?session_id=...` om du behöver den igen.

## Vercel

På Vercel finns ingen varaktig disk, så `SIGNING_SECRET` måste sättas där. Annars startas ingen betalning.

```bash
openssl rand -base64 32
```

Lägg värdet som `SIGNING_SECRET`, och `STRIPE_SECRET_KEY` som `sk_live_...` eller `sk_test_...`. Byggkommandot är `npm run build`. Vercel känner igen Next.js själv.

## Tester

```bash
npm test
npm run lint
```
