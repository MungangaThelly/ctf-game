# 🏆 Startup Security Showdown - CTF Game

> **Ett webbaserat Capture The Flag (CTF) spel för frontend-säkerhet**  
> Lär dig webbsäkerhet genom interaktiva utmaningar i en startup-miljö

![CTF Game Banner](https://via.placeholder.com/800x300/0a0a0a/00ff00?text=STARTUP+SECURITY+SHOWDOWN)

## 🎯 Varför detta projekt sticker ut

| Aspekt | Varför det är unikt |
|--------|-------------------|
| **🎮 Interaktivt lärande** | Spelifiering engagerar - investerare minns något de faktiskt spelade |
| **🔒 Praktisk säkerhet** | Riktiga sårbarheter i en kontrollerad miljö |
| **🚀 Startup-fokuserad** | Scenarios baserade på verkliga startup-teknologier |
| **👨‍🏫 Pedagogisk expertis** | Visar att du inte bara förstår attackerna - du kan lära ut dem |
| **💼 Affärsrelevant** | Direkt tillämpbart för Devotion Ventures portföljbolag |

## 🚀 Funktioner

### 🔥 Säkerhetsutmaningar
- **DOM-based XSS** - Exploatera osäker DOM-manipulation
- **JWT-manipulation** - Förfalska tokens för admin-åtkomst  
- **Authorization Bypass** - Kringgå bristfälliga behörighetskontroller
- **Open Redirect** - Utnyttja omdirigering för phishing-attacker
- **iframe Sandbox Escape** - Bryt dig ut ur säkerhetscontainrar

### 🎨 Hacker-themed UI
- Terminal-inspirerat gränssnitt med Matrix-effekter
- Real-time scoring och progress tracking
- Interaktiva kod-exempel med sårbar/säker jämförelse
- Glitch-effekter och neon-glow animationer

### 📊 Gamification
- Poängsystem med hint-penalties
- Tidsbonus för snabba lösningar
- Leaderboard med achievements
- Progress tracking med badges

### 📚 Utbildningsinnehåll
- OWASP Top 10 mappning
- CWE-referenser
- Verkliga säkerhetsincidenter
- Förebyggande tekniker
- Kod-exempel för säker utveckling

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework med App Router
- **TypeScript** - Type safety och developer experience
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Animationer och transitions

### UI Components
- **Lucide Icons** - Konsistent ikonografi
- **Custom Hacker UI** - Terminal, Matrix background, Glitch text
- **Responsive Design** - Fungerar på desktop och mobile

### State Management
- **localStorage** - Persistent progress tracking
- **Custom Game Store** - Centraliserad state management
- **Real-time Updates** - Live scoring och progress

### Security Features
- **Intentionally Vulnerable Components** - För utbildningssyfte
- **Safe Learning Environment** - Ingen risk för riktiga system
- **Input Validation Examples** - Visar säker vs osäker kod

## 🎮 Kom igång

### Installation
```bash
# Klona repository
git clone <repository-url>
cd ctf-game

# Installera dependencies
npm install

# Starta development server
npm run dev
```

### Spela spelet
1. Öppna `http://localhost:3000` i din browser
2. Klicka på "Start Hacking" för att börja
3. Välj en utmaning från `/challenges`
4. Exploatera sårbarheten och lär dig säkra alternativ
5. Tjäna poäng och klättra på leaderboard

## 🔒 Säkerhetsutmaningar

### 1. DOM-based XSS (Easy - 100p)
**Scenario:** Feedback-formulär med osäker DOM-manipulation  
**Mål:** Injicera och exekvera JavaScript-kod  
**Lärdom:** Input validation, textContent vs innerHTML, CSP

### 2. JWT Manipulation (Hard - 200p)  
**Scenario:** Admin-panel med svag token-validering  
**Mål:** Förfalska admin JWT token  
**Lärdom:** Signature verification, algorithm confusion, secure secrets

### 3. Authorization Bypass (Medium - 150p)
**Scenario:** Client-side behörighetskontroller  
**Mål:** Få admin-åtkomst utan rätt credentials  
**Lärdom:** Server-side validation, RBAC, principle of least privilege

### 4. Open Redirect (Easy - 100p)
**Scenario:** Login-system med ovaliderad redirect  
**Mål:** Omdirigera användare till extern malicious sajt  
**Lärdom:** URL validation, domain whitelisting, phishing prevention

### 5. iframe Sandbox Bypass (Hard - 250p)
**Scenario:** Embedded content med bristfällig sandboxing  
**Mål:** Kommunicera med parent window trots sandbox  
**Lärdom:** Sandbox attributes, postMessage security, CSP headers

## 🏆 Scoring & Achievements

### Poängsystem
- **Grundpoäng:** Baserat på svårighetsgrad
- **Hint-straff:** -20% per använd hint  
- **Tidsbonus:** Extra poäng för snabba lösningar
- **Perfekt run:** 1000+ poäng möjligt

### Achievement Badges
- 🔰 **Security Trainee** (0-20%)
- 🎯 **Novice Hacker** (20-40%)  
- 🥉 **Intermediate Hacker** (40-60%)
- 🥈 **Advanced Hacker** (60-80%)
- 🥇 **Elite Hacker** (80-100%)
- 🏆 **Master Hacker** (100% + high score)

## 📚 Utbildningsinnehåll

Besök `/learn` för djupgående guides om:
- **Vulnerability descriptions** med OWASP/CWE mappning
- **Real-world examples** från kända säkerhetsincidenter  
- **Prevention techniques** med kod-exempel
- **Impact analysis** för business understanding
- **Secure coding practices** för developers

## 🏗️ Projektstruktur

```
ctf-game/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── challenges/         # Individual challenge routes  
│   │   ├── leaderboard/        # Scoring and rankings
│   │   ├── learn/              # Educational content
│   │   └── globals.css         # Hacker theme styling
│   ├── components/
│   │   ├── Navigation.tsx      # Main navigation component
│   │   └── ui/hacker-ui.tsx    # Custom themed UI components
│   ├── lib/
│   │   ├── config.ts           # Game configuration & challenges
│   │   └── utils.ts            # Utility functions & helpers
│   ├── store/
│   │   └── gameStore.ts        # LocalStorage state management  
│   └── types/
│       └── game.ts             # TypeScript type definitions
├── package.json                # Dependencies and scripts
└── README.md                   # This file
```

## 💡 Affärstillämpningar

### För Startups
- **Developer onboarding** - Lär nya utvecklare säkerhetsgrunderna
- **Team building** - Säkerhetsutmaningar som social aktivitet  
- **Security awareness** - Gamified approach till säkerhetsutbildning
- **Recruitment tool** - Bedöm säkerhetskunskap hos kandidater

### För Devotion Ventures
- **Portfolio value-add** - Verktyg som alla portfolio companies kan använda
- **Risk reduction** - Proaktiv säkerhetsutbildning minskar incidents
- **Talent assessment** - Utvärdera teknisk kompetens på ett engagerande sätt
- **Thought leadership** - Positionera som innovation leaders inom säkerhet

## 🚀 Vidareutveckling

### Nästa features
- [ ] **Supabase integration** för real-time multiplayer leaderboard
- [ ] **GitHub OAuth** för seamless authentication  
- [ ] **Team challenges** med collaboration features
- [ ] **Custom challenge builder** för administrators
- [ ] **PWA support** för offline accessibility
- [ ] **Mobile-specific** security challenges
- [ ] **API security** scenarios (GraphQL/REST)
- [ ] **Cloud security** challenges (AWS/Azure)

### Monetization opportunities  
- **Enterprise SaaS** - Security training as a service
- **Certification program** - Issue security certificates
- **Custom content** - Tailored challenges for specific companies
- **White-label solution** - Rebrand for security consultancies

## 📈 Värdeproposition

**För utvecklare:**
✅ Lär dig säkerhet på ett roligt och engagerande sätt  
✅ Praktisk hands-on experience med verkliga sårbarheter  
✅ Progressiv svårighetsgrad från nybörjare till expert  
✅ Immediate feedback och detaljerade förklaringar  

**För företag:**
🎯 Öka säkerhetsmedvetenhet hos development teams  
🎯 Reduce security incidents genom proaktiv utbildning  
🎯 Attract security-minded developers med modern tools  
🎯 Benchmark technical security knowledge across teams  

## 🤝 Kontributions

Detta projekt är byggt som ett portfolio-projekt för att demonstrera:
- **Frontend security expertise** - Djup förståelse för web vulnerabilities
- **Full-stack development** - Complete application architecture  
- **UI/UX design** - Engaging and educational user experience
- **Product thinking** - Business applications och scalability considerations
- **Technical communication** - Ability to teach complex security concepts

---

> *"Security is not a product, but a process"* - Bruce Schneier

**Byggt med ❤️ för säker utveckling och continuous learning.**
