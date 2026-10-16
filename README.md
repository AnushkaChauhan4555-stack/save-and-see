1.What Was Built:
Complete breakdown of features: distraction-free 4-theme reader, active multi-color marginalia highlighter, dedicated highlights vault, real-time multi-field search, Web Speech audio player, and Obsidian/Notion markdown export.
Current Stage Reached:
Production-ready client-side SPA (v1.0) with offline-first persistence, zero build warnings, and strict TypeScript verification.
2.Tech Stack:
Tabular summary covering React 19, TypeScript 7, Vite 8, Tailwind CSS v4, Google Fonts (Newsreader, Lora, Plus Jakarta Sans, JetBrains Mono), Lucide Icons, and native Browser APIs (Web Speech, Range, Blob).
3.How to Run Locally:
Step-by-step setup (git clone, npm install, npm run dev, npm run build).
4.Keyboard Shortcuts Reference:
Quick table of all keyboard actions (j/k, Enter/r, a/e, s, /, n, h, Esc, ?).
5.Important Technical Decisions:
Client-side data sovereignty and offline-first storage model.
Safe token-based search highlighting and contextual snippet extraction.
6.Known Issues & Browser Limitations:
Browser CORS security constraints on direct external web scraping (and why manual text/newsletter pasting is supported).
Operating system-dependent speech synthesis voice qualities.
Browser localStorage quota considerations for massive libraries.
