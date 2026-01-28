# UI/UX Preview & Editing Guide for BuildHaul

**Current Deployment**: https://buildhaul-3sgwq2hvd-mikemmivipcoms-projects.vercel.app

---

## 🎨 How to Preview & Edit UI

Unlike Replit or V0.dev (which have visual editors), BuildHaul is a **Next.js codebase** that requires:
1. **Local development** for instant preview
2. **Code editing** in VS Code / Cursor
3. **Git push** to deploy changes

---

## Option 1: Local Development (Recommended)

### Start Local Server (Hot Reload)

```bash
cd /Users/allbots/buildhaul

# Install dependencies (if not already)
npm install

# Start development server
npm run dev
```

**Opens at**: http://localhost:3000

**Features**:
- ✅ **Instant preview** - Changes show immediately
- ✅ **Hot reload** - Edit files, see updates in 1 second
- ✅ **Full functionality** - All features work locally
- ✅ **Dark mode toggle** - Test theme switching
- ✅ **No deployment needed** - Test before pushing

### Make UI Changes

1. **Open project** in VS Code or Cursor:
   ```bash
   cursor /Users/allbots/buildhaul
   # or
   code /Users/allbots/buildhaul
   ```

2. **Edit component files**:
   - Registration pages: `app/(auth)/register/driver/page.tsx`
   - Login page: `app/(auth)/login/page.tsx`
   - Dashboard: `app/(dashboard)/dashboard/*/page.tsx`
   - Components: `components/**/*.tsx`

3. **Save file** → Changes appear instantly in browser (http://localhost:3000)

---

## Option 2: Browser DevTools (Quick Tests)

### Test CSS Changes Live

1. **Open production site**: https://buildhaul-3sgwq2hvd-mikemmivipcoms-projects.vercel.app/register/driver
2. **Press F12** (open DevTools)
3. **Click Elements tab**
4. **Select element** (click the selector icon, then click on page element)
5. **Edit styles** in the Styles panel:
   - Change colors
   - Adjust spacing
   - Modify fonts
   - Test layouts

**Example**:
```css
/* In DevTools Styles panel, change: */
.bg-slate-50 {
  background-color: #0f172a; /* Make it dark */
}

.text-blue-900 {
  color: #fb923c; /* Change to orange */
}
```

6. **Copy working CSS** → Apply to actual files

**Note**: DevTools changes are temporary (refresh = lost)

---

## Option 3: Vercel Preview Deployments

### Test on Staging Before Production

Every branch gets its own preview URL:

1. **Create feature branch**:
   ```bash
   git checkout -b feature/new-ui-design
   ```

2. **Make changes** to UI files

3. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "feat: Update UI design"
   git push origin feature/new-ui-design
   ```

4. **Vercel auto-deploys** → Get preview URL:
   ```
   https://buildhaul-abc123xyz-mikemmivipcoms-projects.vercel.app
   ```

5. **Test preview** → If good, merge to main

**Benefits**:
- Test on real deployment
- Share preview URL with team
- No production impact

---

## 📁 Key UI Files to Edit

### Registration Pages

**Driver Registration**:
```
app/(auth)/register/driver/page.tsx
```
Lines 18-280: Full registration form

**Company Registration**:
```
app/(auth)/register/poster/page.tsx
```
Similar structure to driver registration

**Main Registration Hub**:
```
app/(auth)/register/page.tsx
```
Choose driver vs company

### Login Page

```
app/(auth)/login/page.tsx
```
Lines 18-150: Login form with dark mode

### Dashboard Pages

**Fleet Map** (GPS tracking):
```
app/(dashboard)/dashboard/fleet/page.tsx
components/maps/LiveFleetMap.tsx
```

**Earnings Dashboard**:
```
app/(dashboard)/dashboard/earnings/page.tsx
```

**Available Loads**:
```
app/(dashboard)/dashboard/available/page.tsx
```

### Reusable Components

**UI Components**:
```
components/ui/button.tsx         - Buttons
components/ui/input.tsx          - Text inputs
components/ui/card.tsx           - Card containers
components/ui/ThemeToggle.tsx    - Dark mode toggle
```

**Maps**:
```
components/maps/LiveFleetMap.tsx  - Mapbox fleet map
```

**Hooks**:
```
hooks/useLocationTracking.ts      - GPS tracking
```

---

## 🎨 Common UI Changes

### Change Colors

**File**: `app/globals.css` or inline in components

```css
/* Make primary blue -> orange */
.bg-blue-900 → .bg-orange-500
.text-blue-900 → .text-orange-500
.border-blue-900 → .border-orange-500

/* Make backgrounds darker */
.bg-slate-50 → .bg-slate-900
.bg-white → .bg-slate-800
```

### Change Fonts

**File**: `app/layout.tsx`

```typescript
// Currently using Inter
import { Inter } from 'next/font/google'

// Change to another font:
import { Poppins } from 'next/font/google'

const poppins = Poppins({
  weight: ['400', '600', '700'],
  subsets: ['latin']
})
```

### Change Spacing

**In component files**, modify Tailwind classes:

```tsx
// More padding
className="p-4" → className="p-8"

// More gap between elements
className="gap-4" → className="gap-6"

// Larger text
className="text-sm" → className="text-base"
```

### Add New Page

1. **Create file**: `app/(dashboard)/dashboard/newpage/page.tsx`

```tsx
export default function NewPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">New Page</h1>
      <p>Content here</p>
    </div>
  )
}
```

2. **Visit**: http://localhost:3000/dashboard/newpage

---

## 🔄 Workflow: Edit → Preview → Deploy

### 1. Start Local Dev Server

```bash
cd /Users/allbots/buildhaul
npm run dev
```

Open: http://localhost:3000

### 2. Make Changes

Edit any `.tsx` file in VS Code/Cursor

**Example** - Change button color in `app/(auth)/login/page.tsx`:

```tsx
// Find this line (around line 120):
className="bg-blue-900 hover:bg-blue-800"

// Change to orange:
className="bg-orange-500 hover:bg-orange-600"
```

Save file → See change instantly at http://localhost:3000/login

### 3. Test Thoroughly

- ✅ Click all buttons
- ✅ Fill out forms
- ✅ Toggle dark mode
- ✅ Test responsive design (resize browser)
- ✅ Check mobile view (DevTools → Device toolbar)

### 4. Commit Changes

```bash
git add .
git commit -m "feat: Update button colors to orange theme"
```

### 5. Deploy to Production

```bash
git push origin main
```

Vercel auto-deploys in 2-3 minutes.

**Or** push to feature branch for preview:

```bash
git push origin feature/orange-theme
```

Get preview URL, test, then merge to main.

---

## 🚀 Quick Start Commands

### Preview Locally (Fastest)

```bash
cd /Users/allbots/buildhaul
npm run dev
```

Open: http://localhost:3000

### Build for Production (Test Build)

```bash
npm run build
npm run start
```

This simulates production build locally.

### Deploy to Vercel

```bash
git add .
git commit -m "feat: UI updates"
git push origin main
```

Wait 2-3 minutes, check production URL.

---

## 🎯 Comparison to Replit/V0

| Feature | Replit/V0 | BuildHaul (Next.js) |
|---------|-----------|---------------------|
| **Visual Editor** | ✅ Yes | ❌ No (code editor only) |
| **Instant Preview** | ✅ In-browser | ✅ Localhost (npm run dev) |
| **Hot Reload** | ✅ Yes | ✅ Yes |
| **Code Access** | ✅ Yes | ✅ Yes (full control) |
| **Deployment** | ✅ 1-click | ✅ Git push |
| **Production Ready** | ⚠️  Limited | ✅ Enterprise-grade |
| **Database Control** | ⚠️  Limited | ✅ Full Supabase access |
| **Custom Domain** | ⚠️  Paid | ✅ Free with Vercel |

**BuildHaul = More control, better production setup**

---

## 🛠️ Recommended Tools

### Code Editors

**Cursor** (AI-powered):
```bash
cursor /Users/allbots/buildhaul
```

**VS Code**:
```bash
code /Users/allbots/buildhaul
```

### Browser Extensions

- **React Developer Tools** - Inspect components
- **Tailwind CSS IntelliSense** - Autocomplete classes
- **Web Developer** - Test responsive design

### Design Preview Tools

**Figma** → Export designs → Implement in Next.js
**V0.dev** → Generate component code → Copy to BuildHaul

---

## 📱 Test Responsive Design

### In Browser DevTools

1. **F12** (open DevTools)
2. **Click device toolbar icon** (top-left)
3. **Select device**: iPhone 14, iPad, etc.
4. **Test all pages**

### In Code (Tailwind Responsive Classes)

```tsx
// Mobile: small padding, Desktop: large padding
className="p-4 md:p-8 lg:p-12"

// Mobile: stack vertically, Desktop: side-by-side
className="flex flex-col md:flex-row"

// Mobile: small text, Desktop: large text
className="text-sm md:text-base lg:text-lg"
```

---

## ✅ Next Steps

1. **Start local dev server**:
   ```bash
   cd /Users/allbots/buildhaul && npm run dev
   ```

2. **Open**: http://localhost:3000

3. **Browse pages**:
   - http://localhost:3000/register/driver
   - http://localhost:3000/login
   - http://localhost:3000/dashboard/fleet

4. **Make changes** to files in `app/` or `components/`

5. **See changes instantly** in browser

6. **When happy**, commit and push to deploy

---

**TL;DR**:
- **Preview**: `npm run dev` → http://localhost:3000
- **Edit**: VS Code/Cursor
- **Deploy**: `git push origin main`
- **No visual editor like V0, but hot reload = instant preview**
