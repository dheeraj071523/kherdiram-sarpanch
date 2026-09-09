# होस्टिंग गाइड — पूरी तरह फ्री, स्टेप-बाय-स्टेप

## आपको चाहिए
- एक GitHub अकाउंट (मुफ़्त): https://github.com/signup
- उम्मीदवार की फोटो: `candidate-photo.jpg`
- लोगो: `candidate-logo.png`
- PWA आइकॉन: `icon-192.png` (192×192px) और `icon-512.png` (512×512px) — logo से बनवा सकते हैं (कोई भी फ्री टूल जैसे https://realfavicongenerator.net)

सभी फाइलें एक ही फोल्डर में रखें:
```
kherdiram-sarpanch/
├── index.html
├── manifest.json
├── sw.js
├── candidate-photo.jpg
├── candidate-logo.png
├── icon-192.png
└── icon-512.png
```
(`google-script.gs` अलग से Google Sheet में जाएगा, इस फोल्डर में रखने की ज़रूरत नहीं)

---

## भाग 1: GitHub Repository बनाना

1. https://github.com पर लॉगिन करें और ऊपर दाईं तरफ **"+"** → **"New repository"** पर क्लिक करें।
2. Repository name डालें, जैसे: `kherdiram-sarpanch`
3. **Public** चुनें (Pages फ्री टियर के लिए ज़रूरी)।
4. **"Create repository"** पर क्लिक करें।
5. अगले पेज पर **"uploading an existing file"** लिंक पर क्लिक करें।
6. अपने कंप्यूटर से सभी फाइलें (index.html, manifest.json, sw.js, फोटो, आइकॉन) एक साथ खींचकर (drag & drop) डालें।
7. नीचे **"Commit changes"** बटन दबाएं।

---

## भाग 2A: GitHub Pages से होस्ट करना (सबसे आसान)

1. अपनी Repository में जाएं → ऊपर **"Settings"** टैब खोलें।
2. बाईं तरफ मेनू में **"Pages"** पर क्लिक करें।
3. **"Branch"** के नीचे `main` चुनें और फोल्डर `/root` रखें → **"Save"** दबाएं।
4. 1-2 मिनट रुकें, पेज रीफ्रेश करें। ऊपर एक लिंक दिखेगी जैसे:
   `https://yourusername.github.io/kherdiram-sarpanch/`
5. यही आपकी लाइव वेबसाइट है — इसे WhatsApp पर शेयर करें।

---

## भाग 2B: Cloudflare Pages से होस्ट करना (unlimited traffic, तेज़ CDN)

1. https://pages.cloudflare.com पर जाकर फ्री अकाउंट बनाएं (या मौजूदा से लॉगिन करें)।
2. Dashboard में **"Workers & Pages"** → **"Create application"** → **"Pages"** → **"Connect to Git"** चुनें।
3. GitHub अकाउंट कनेक्ट करें और अपनी `kherdiram-sarpanch` repository चुनें।
4. Build settings में कुछ भी बदलने की ज़रूरत नहीं (Framework: **None**, Build command: खाली छोड़ें, Output directory: `/`)।
5. **"Save and Deploy"** दबाएं। 1 मिनट में आपकी साइट लाइव हो जाएगी, जैसे:
   `https://kherdiram-sarpanch.pages.dev`
6. चाहें तो बाद में अपना खुद का डोमेन (जैसे `kherdiram-sarpanch.in`) भी फ्री में जोड़ सकते हैं (Custom domains सेक्शन से)।

> दोनों विकल्प 100% फ्री हैं। Cloudflare Pages ज़्यादा तेज़ (global CDN) और unlimited bandwidth देता है; GitHub Pages सेटअप में सबसे आसान है।

---

## भाग 3: Google Sheet बैकएंड जोड़ना (शिकायत/सुझाव फॉर्म के लिए)

1. https://sheets.google.com पर जाकर एक नई Google Sheet बनाएं। नाम दें, जैसे: `Kherdiram Sarpanch Grievances`
2. ऊपर मेनू में **Extensions → Apps Script** पर क्लिक करें।
3. जो भी डिफ़ॉल्ट कोड (`function myFunction(){}`) वहां लिखा है, उसे पूरा मिटा दें।
4. `google-script.gs` फाइल का पूरा कोड कॉपी करके वहां पेस्ट करें।
5. ऊपर टूलबार में फंक्शन ड्रॉपडाउन से **`setupSheet`** चुनें और **▶ Run** बटन दबाएं (पहली बार परमिशन मांगेगा — अपने Google अकाउंट से "Allow" करें)। इससे Sheet में हेडर बन जाएंगे।
6. अब ऊपर दाईं तरफ **"Deploy" → "New deployment"** पर क्लिक करें।
7. Gear (⚙️) आइकॉन पर क्लिक करके Type में **"Web app"** चुनें।
8. सेटिंग्स:
   - **Execute as:** Me (आपका अकाउंट)
   - **Who has access:** Anyone
9. **"Deploy"** दबाएं। यह आपसे परमिशन फिर मांग सकता है — Allow करें।
10. एक URL मिलेगा जैसे `https://script.google.com/macros/s/XXXXXXXX/exec` — इसे कॉपी कर लें।
11. `index.html` फाइल खोलें, नीचे स्क्रिप्ट में यह लाइन ढूंढें:
    ```js
    const GOOGLE_SCRIPT_URL = "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";
    ```
    और उसकी जगह अपना कॉपी किया हुआ URL डालें:
    ```js
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/XXXXXXXX/exec";
    ```
12. अपडेटेड `index.html` फाइल दोबारा GitHub पर अपलोड करें (Repository में फाइल खोलें → पेंसिल आइकॉन ✏️ → कोड बदलें → Commit changes)। GitHub Pages/Cloudflare Pages अपने आप 1-2 मिनट में नई वेबसाइट अपडेट कर देंगे।

अब जब भी कोई फॉर्म भरेगा, एंट्री सीधे आपकी Google Sheet में आ जाएगी।

---

## सोशल मीडिया लिंक बाद में जोड़ना

`index.html` में "अभियान से जुड़ें" सेक्शन में यह लाइनें खोजें:
```html
<a href="#" data-social="instagram" ...>
<a href="#" data-social="facebook" ...>
```
जब आपके Instagram/Facebook पेज तैयार हों, तो `href="#"` को अपने पेज के लिंक से बदल दें और `text-ink/40 cursor-not-allowed`/`aria-disabled` हटाकर उसी रंग-शैली में बदल दें जैसे WhatsApp बटन है।

---

## आखिरी चेकलिस्ट
- [ ] `candidate-photo.jpg` और `candidate-logo.png` असली फोटो से बदलें
- [ ] `icon-192.png` और `icon-512.png` बनाकर अपलोड करें
- [ ] फ़ोन नंबर (`tel:+910000000000` — दो जगह) असली नंबर से बदलें
- [ ] Google Apps Script URL सेट करें
- [ ] मोबाइल पर खोलकर "Add to Home Screen" टेस्ट करें

---

## ⚠️ ज़रूरी: candidate-photo.jpg जोड़ना बाकी है

इस ZIP में आपका लोगो (`candidate-logo.png`, `icon-192.png`, `icon-512.png`) पहले से लगा हुआ है — यह नेवबार, फुटर और ऐप आइकॉन में अपने आप दिखेगा।

लेकिन **होम पेज पर बड़ी फोटो** (Hero सेक्शन और Splash Screen में) के लिए एक साफ, सीधी खींची हुई फोटो चाहिए — पोस्टर वाली फोटो के बजाय। जब आपके पास वह फोटो हो:
1. उसका नाम रखें: `candidate-photo.jpg`
2. उसे बाकी फाइलों के साथ उसी फोल्डर में डालें (index.html के बराबर में)
3. GitHub/Cloudflare पर दोबारा अपलोड कर दें

तब तक साइट एक placeholder फोटो दिखाएगी।

---

## ✅ इस वर्शन में क्या नया है

- **candidate-photo.jpg जोड़ दी गई है** — अब हीरो सेक्शन और स्प्लैश स्क्रीन में आपकी असली फोटो दिखेगी।
- **स्प्लैश स्क्रीन अब पूरी तरह भरोसेमंद है** — धीमे इंटरनेट पर भी यह तुरंत पूरी स्क्रीन पर दिखेगी, कोई आधी-अधूरी झलक या बीच में छोटी फोटो नहीं दिखेगी।
- **मोबाइल पर नाम अब हमेशा साफ दिखेगा** — बैकग्राउंड के रंग से मिलकर गायब होने की समस्या ठीक कर दी गई है।
- **"ऐप इंस्टॉल करें" का आसान पॉपअप** — साइट खुलने के कुछ सेकंड बाद अपने आप एक सरल पॉपअप दिखेगा:
  - Android/Chrome पर सिर्फ एक बटन दबाकर इंस्टॉल हो जाएगा
  - iPhone पर आसान 3 स्टेप बताए जाएंगे (Share बटन → Add to Home Screen → Add)
  - पॉपअप बंद करने पर 7 दिन तक दोबारा नहीं दिखेगा
