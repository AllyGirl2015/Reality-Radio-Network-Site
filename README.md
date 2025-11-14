# Reality Radio Network

A modern, SEO-optimized website for Reality Radio Network - an AI-powered music radio network featuring 22+ artists, 9 radio stations, and a revolutionary Persona Adoption Program.

## 🎵 About

Reality Radio Network (RRN) uses AI as a foundation to discover and elevate real human talent. We're transitioning from AI-generated music to real people, helping artists rise from unknown to fame.

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 with custom Neon/Tron theme
- **Icons**: Lucide React
- **Deployment**: Netlify
- **Radio Streaming**: Live365 integration
- **Accessibility**: WCAG 2.1 AA compliant (90+ Lighthouse score)

## 🎨 Design Theme

- **Aesthetic**: Tron Legacy inspired with cyan/blue neon effects
- **Color Palette**: 
  - Primary: `#00f3ff` (Neon Blue)
  - Secondary: `#0ff` (Cyan)
  - Accent: Purple, Pink gradients
- **Features**: Glowing borders, animated effects, dark mode, grid backgrounds
- **Accessibility**: High contrast ratios (12.7:1 - 21:1), keyboard navigation, screen reader support

## 🔧 Getting Started

First, install dependencies:

```bash
npm install
```

Then run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📁 Project Structure

```
realityradionetwork/
├── app/
│   ├── layout.tsx          # Root layout with SEO metadata
│   ├── page.tsx            # Home page
│   ├── robots.ts           # robots.txt generator
│   ├── sitemap.ts          # Dynamic sitemap
│   ├── globals.css         # Global styles with neon effects
│   ├── radio/              # Radio stations page
│   ├── store/              # Store pages (albums, singles)
│   ├── story/              # About/Story page
│   └── contact/            # Contact page
├── components/
│   ├── Header.tsx          # Navigation with neon effects
│   ├── Footer.tsx          # Footer with links
│   ├── Live365Player.tsx   # Live365 embedded player (primary)
│   ├── Live365PlayerAlt.tsx # Alternative player formats
│   ├── RadioPlayer.tsx     # Custom HTML5 audio player
│   └── Section.tsx         # Reusable section wrapper
├── lib/
│   └── utils.ts            # Utility functions
├── public/                 # Static assets & images
└── netlify.toml           # Netlify configuration
```

## 🎯 Key Features

### SEO Optimized
- ✅ Dynamic metadata for all pages
- ✅ Automatic sitemap generation
- ✅ Robots.txt configuration
- ✅ Open Graph and Twitter Card support
- ✅ Semantic HTML structure
- ✅ Mobile responsive design

### Pages
1. **Home** - Hero with Live365 player, featured artists/releases, CTAs
2. **Radio Stations** - 9 stations with genres and schedules
3. **Artists** - 22 AI artists with dynamic detail pages
4. **Store** - Albums, singles, physical products
5. **Story** - Founder vision and mission (About)
6. **Personas** - Persona Adoption Program details
7. **Contact** - Support form with categories
8. **FAQ** - Comprehensive Q&A (shipping, licensing, AI, pricing)
9. **Licensing** - Music licensing options and pricing
10. **Privacy Policy** - GDPR-compliant privacy information
11. **Terms of Service** - Legal terms and conditions
12. **Cookie Policy** - Cookie usage and management

### Live365 Radio Integration
- ✅ Real embedded player from Live365
- ✅ Station ID: `a47993` (Reality Central Radio)
- ✅ Multiple embed format options
- ✅ Autoplay support with fallback
- ✅ Direct link to Live365 station page

See `LIVE365_PLAYER_GUIDE.md` for detailed player documentation.

## 🌐 Deployment

### Deploy to Netlify

1. Push your code to GitHub
2. Connect repository to Netlify
3. Build settings are auto-configured via `netlify.toml`
4. Deploy!

Or use Netlify CLI:

```bash
npm run build
netlify deploy --prod
```

## 🎨 Customization

### Neon Colors
Edit `tailwind.config.ts`:

```ts
colors: {
  neon: {
    blue: '#00f3ff',
    cyan: '#0ff',
    // Add more colors...
  }
}
```

### Custom Styles
Use these CSS classes in `app/globals.css`:
- `.neon-text` - Glowing text effect
- `.btn-neon` - Neon button style
- `.card-neon` - Neon card border
- `.grid-background` - Grid pattern background
- `.sr-only` - Screen reader only text (accessibility)

## ♿ Accessibility

This site is built with accessibility in mind and targets **WCAG 2.1 Level AA** compliance:

- **✅ Keyboard Navigation**: Full site navigation via keyboard (Tab, Enter, Escape)
- **✅ Screen Readers**: ARIA labels, landmarks, and semantic HTML
- **✅ Color Contrast**: All text meets WCAG AAA (7:1+) standards
- **✅ Focus Indicators**: Visible focus rings on all interactive elements
- **✅ Skip Navigation**: "Skip to main content" link for keyboard users
- **✅ Forms**: Proper labels, ARIA attributes, and validation

**Lighthouse Accessibility Score**: 90-95+

For detailed accessibility documentation, see:
- `ACCESSIBILITY.md` - Complete accessibility guide
- `ACCESSIBILITY_SUMMARY.md` - Quick reference and testing guide

## 🚧 Next Steps

- [ ] Create individual artist pages
- [ ] Add blog system with MDX
- [ ] Integrate payment system (Stripe)
- [ ] Add audio player with waveforms
- [ ] Newsletter integration
- [ ] Analytics (Google Analytics/Plausible)

## 📞 Contact

**Email**: support@realityradionetwork.com  
**Website**: https://www.realityradionetwork.com  
**Founder**: Alissa M.R. Eldridge

---

© 2025 Reality Radio Network. All rights reserved.

*"Sometimes you have to look at a grander picture to see the whole."*
