# KTS - AI Render & Image Processing Platform

Modern Next.js 15 application for AI-powered architectural rendering, image processing, and virtual tours.

## 🚀 Features

- **AI Rendering**: Exterior & Interior rendering with Gemini AI
- **Image Upscaling**: High-quality image upscaling
- **Virtual Tours**: 360° virtual tour generation
- **Image Editing**: Built-in image editor with filters
- **Color Adjustment**: Advanced color grading tools
- **History Management**: Track and restore previous renders

## 📁 Project Structure

```
kts/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Main entry point (40 lines)
│   └── layout.tsx         # Root layout
│
├── components/            # Feature-based organization
│   ├── landing/          # Landing page
│   ├── main-app/         # Main app shell
│   ├── render/           # Image upload & rendering
│   ├── editor/           # Image editor components
│   ├── modals/           # Modal dialogs
│   ├── history/          # History panels
│   ├── tabs/             # Tab components
│   ├── ui/               # Shared UI components
│   └── icons/            # Icon system
│
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
├── services/              # API services
├── types/                 # TypeScript types
└── constants/             # App constants
```

## 🛠️ Tech Stack

- **Framework**: Next.js 16.0.7 (App Router)
- **Runtime**: React 19.2.0
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 4.x
- **Build Tool**: Turbopack
- **AI Service**: Google Gemini API

## 📦 Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

## 🎨 Theme System

Supports multiple themes:

- Dark
- Light
- Orange
- Green
- Architect
- Xmas

## 📚 Documentation

- [REFACTOR_SUMMARY.md](./REFACTOR_SUMMARY.md) - Complete refactoring documentation

## 🔑 Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
```

## 🏗️ Architecture Highlights

- **Component-based**: Modular, reusable components
- **Type-safe**: Full TypeScript coverage
- **Performance**: Optimized with Turbopack & code splitting
- **Scalable**: Feature-based folder structure
- **Modern**: Latest React patterns & hooks

## 📝 Key Improvements (from v1)

- ✅ Reduced page.tsx from **3093 → 40 lines** (98.7% reduction)
- ✅ Organized components into **8 feature folders**
- ✅ Implemented **barrel exports** for clean imports
- ✅ Fixed **302 TypeScript errors**
- ✅ Applied **Next.js 15 best practices**

## 🤝 Contributing

Contributions are welcome! Please follow the existing code structure and conventions.

## 📄 License

MIT

## Deploy on Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-repo)

Check out [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
