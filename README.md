# Cortex Linux Website

The official website for [Cortex Linux](https://github.com/cortexlinux/cortex) - the AI-native operating system that simplifies software installation using natural language.

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Routing**: Wouter
- **Animations**: Framer Motion

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with features, pricing, and community info |
| `/faq` | Frequently asked questions |
| `/beta` | Interactive demo - try Cortex with your own API key |

## Beta Demo Page (`/beta`)

The beta page allows users to experience Cortex Linux capabilities directly in the browser:

### Features
- **Natural Language Input**: Enter commands like "install docker" or "set up python for ML"
- **Multi-Provider Support**: Choose between Anthropic Claude or OpenAI GPT-4
- **Client-Side API Calls**: Your API keys never leave your browser
- **Terminal-Style Output**: See generated commands in a familiar terminal interface
- **Copy to Clipboard**: Easy one-click copy for generated commands
- **Dry Run Mode**: Preview commands without execution

### Privacy
- API keys are stored in localStorage only
- All API calls are made directly from the browser to Anthropic/OpenAI
- No data is sent to Cortex servers

## Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/cortexlinux/website.git
cd website

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
website/
├── client/
│   ├── src/
│   │   ├── components/ui/    # Shadcn UI components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utilities
│   │   ├── pages/            # Page components
│   │   │   ├── beta.tsx      # Beta demo page
│   │   │   ├── faq.tsx       # FAQ page
│   │   │   └── not-found.tsx # 404 page
│   │   ├── sections/         # Homepage sections
│   │   ├── App.tsx           # Main app with routing
│   │   └── main.tsx          # Entry point
│   └── index.html
├── server/                   # Express server (for API proxying)
└── shared/                   # Shared types/schemas
```

## Environment Variables

No environment variables required for local development. The beta page uses client-provided API keys.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Related Projects

- [Cortex Linux CLI](https://github.com/cortexlinux/cortex) - The main Cortex Linux project

## License

This project is part of the Cortex Linux ecosystem. See the main repository for license information.

---

Built by [AI Venture Holdings LLC](https://cortexlinux.com)
