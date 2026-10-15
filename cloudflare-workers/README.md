# Cloudflare Worker — WHMCS SSO (הוראות פריסה)

הקבצים כאן מיישמים Worker שמייצר קישור כניסה חד‑פעמי ל‑WHMCS באמצעות קריאת ה‑WHMCS API.

נא לבצע את השלבים הבאים:

1. צור Worker חדש ב‑Cloudflare (Workers &gt; Create Service). ניתן לתת שם כגון `whmcs-sso`.

2. העלה את הקוד `worker.js` (או העתק/הדבק משם) והשתמש ב־module format (הקובץ כבר מייצא default).

3. הוסף ב־Settings (Variables) את ההגדרות הבאות (Secrets/Environment Variables):
   - WHMCS_API_IDENTIFIER — ה־API Identifier שלך (WHMCS API)
   - WHMCS_API_SECRET — ה‑API Secret
   - WHMCS_BASE_URL — ה־URL הבסיסי של ה‑WHMCS שלך, למשל `https://billing.lev-tech.net`
   - WORKER_SECRET_TOKEN — סוד פנימי שהאתר ישלח ב־Authorization: Bearer <token>

   שים לב: אין לשים ערכים אלה בקוד. השתמש ב־Cloudflare UI כדי להוסיף Secrets.

4. פריסת Worker: פרסם את ה‑Worker (Deploy). Cloudflare יספק URL ציבורי: למשל `https://whmcs-sso.YOUR_ACCOUNT.workers.dev`.

5. עדכן את דף ה‑client (public/client/index.html): החלף את `WORKER_URL` ב‑URL של ה‑Worker + `/whmcs-login` או המסלול המתאים.

6. קריאה מאובטחת: הדפדפן יקריא ל‑Worker באמצעות POST. חשוב להוסיף Authorization header:

   fetch(WORKER_URL, { method:'POST', headers: { 'Content-Type':'application/json', 'Authorization': 'Bearer YOUR_WORKER_SECRET_TOKEN' }, body: JSON.stringify({ identifier: 'client@example.com' }) })

   ודא שה‑YOUR_WORKER_SECRET_TOKEN תואם ל‑WORKER_SECRET_TOKEN שנקבע ב‑Cloudflare.

7. בדיקות:
   - שלח בקשה עם דוא"ל/clientid תקין.
   - בדוק ש‑Worker מחזיר JSON עם `loginlink` או שדה URL.
   - לחיצה על הקישור תפתח את WHMCS וככל הנראה תעביר את הלקוח מחובר.

8. הערות טכניות ושיפורים אפשריים:
   - אם ה‑WHMCS שלך לא תומך ב־CreateClientLoginLink, יש להתאים את `action` שנשלח ב‑worker.js לפי ה‑API שלך.
   - הוספת rate limiting ב‑Worker (KV או Durable Objects) מומלצת למניעת שימוש לרעה.
   - אפשר להוסיף בדיקת CSRF קצרה באמצעות cookie/session באתר לפני קריאה ל‑Worker.

9. DNS / כתובת פנימית:
   - אם ברצונך שדף הלקוחות יהיה זמין ב‑client.lev-tech.net, ניתן להגדיר GitHub Pages או Cloudflare Pages/route ולכוון CNAME/DNS accordingly. אם אתה משתמש ב‑Cloudflare gateway, ניתן גם לפרסם Worker בחבילות Routes כך שהנתיב יהיה `https://client.lev-tech.net/whmcs-login`.

אם תרצה, אני יכול:
- להוסיף בדף ה‑client קריאת Authorization header אוטומטית (באמצעות fetch עם token) אך אסור לי להכניס token פה.
- לעזור בפריסה ב‑Cloudflare ועזרה בהגדרת Secrets.

אישור לביצוע הבא:
אם תרצה שאוסיף התאמות נוספות (למשל פתיחת iframe במקום חלון חדש, או בדיקת X‑Frame headers), אמור "אשר עדכון iframe" / "אשר עדכון redirect".
