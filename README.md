# Smart Factory AI Seminar — Landing Page

Single-file HTML/CSS/JS landing page for the 22 Sep 2026 seminar. Attendees scan a table QR code and land here to browse all 8 product channels, watch demos, download materials, and reach out.

No build step, no dependencies except one Google Fonts link — just open `index.html` in a browser, or upload it to any host.

## Files

```
index.html   → the entire page (HTML + CSS + JS in one file)
README.md    → this file
```

If you add real PDFs, put them in an `assets/` folder next to `index.html`:

```
index.html
assets/
  thaibiz360-brochure.pdf
  soundcam-case-study.pdf
  company-prospectus.pdf
```

## Before going live — replace these placeholders

Everything below is marked `TODO` in the code (search for `TODO` to jump to each spot).

### 1. Videos

Open `index.html`, find the `CONFIG.videos` object near the top of the `<script>` tag, and replace each `VIDEO_ID_...` with the real YouTube video ID (the part after `watch?v=` in a YouTube URL):

```js
const CONFIG = {
  videos: {
    erp: "https://www.youtube.com/embed/VIDEO_ID_ERP",
    soundcam: "https://www.youtube.com/embed/VIDEO_ID_SOUNDCAM",
    counting: "https://www.youtube.com/embed/VIDEO_ID_COUNTING",
    vision: "https://www.youtube.com/embed/VIDEO_ID_VISION",
    sealing: "https://www.youtube.com/embed/VIDEO_ID_SEALING",
    maintenance: "https://www.youtube.com/embed/VIDEO_ID_MAINTENANCE",
    dashboard: "https://www.youtube.com/embed/VIDEO_ID_DASHBOARD",
    iot: "https://www.youtube.com/embed/VIDEO_ID_IOT",
  },
};
```

These power the "Watch demo" / "Watch intro video" / "YouTube video" buttons, which open in a pop-up modal.

### 2. Live dashboard demo links

Three sections link out to a real hosted dashboard instead of a video. Search for `demo.example.com` and replace with the real URLs:

| Section                 | Line to update                                           |
| ----------------------- | -------------------------------------------------------- |
| Predictive Maintenance  | `href="https://demo.example.com/predictive-maintenance"` |
| Smart Factory Dashboard | `href="https://demo.example.com/smart-factory"`          |
| Industrial IoT          | `href="https://demo.example.com/industrial-iot"`         |

### 3. Downloadable files

Search for `assets/` — there are 3 download links:

| File                             | Used by                                                                              |
| -------------------------------- | ------------------------------------------------------------------------------------ |
| `assets/thaibiz360-brochure.pdf` | ThaiBiz360 ERP → "Download brochure"                                                 |
| `assets/soundcam-case-study.pdf` | SoundCam AI → "Download case study"                                                  |
| `assets/company-prospectus.pdf`  | Hero section → "Download full prospectus" (a combined overview doc, if you have one) |

Just drop your real PDFs into an `assets/` folder with those exact names, or edit the `href` paths to point wherever the files actually live.

### 4. Contact section

Search for `yourlineid`, `contact@yourcompany.com`, and `www.yourcompany.com` near the bottom of the HTML (in the `#contact` section) and swap in the real LINE link, email address, and website. Also replace `https://forms.example.com/book-demo` with your real booking form/Calendly link.

### 5. Footer

Replace `YOUR COMPANY NAME` in the `<footer>` at the bottom with the real company name.

## Notes

- The side channel-navigation dots (right edge) hide automatically below 900px width, since most attendees will view this on a phone — the top progress bar takes over as the position indicator on mobile.
- All animations respect `prefers-reduced-motion` for accessibility.
- The boot sequence on load is capped at ~3.2 seconds even if something stalls, and can be skipped by tapping "Skip →".
- Everything is inline in one file on purpose, so it stays fast and portable for a QR-code scan-and-go use case — no server or build process required.
