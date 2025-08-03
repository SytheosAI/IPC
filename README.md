# IPC - Inspections & Permit Control

A comprehensive permit submittal and tracking system with integrated Virtual Building Authority (VBA) for digital inspections.

## Features

### 🏛️ Permit Management
- **Dashboard**: Overview of all permit applications and statistics
- **Submittals**: Complete permit tracking with status management
- **Search & Filter**: Advanced filtering by status, category, and applicant
- **Document Management**: Track completeness and document counts
- **Progress Tracking**: Visual progress indicators for each application

### 🏗️ Virtual Building Authority (VBA)
- **Digital Inspections**: Real-time inspection management
- **AI-Powered Compliance**: Computer vision for automatic code violation detection
- **Mobile-First Design**: Optimized for field inspectors
- **Calendar Scheduling**: Full calendar integration for inspection scheduling
- **70+ Inspection Types**: Comprehensive inspection categories from pre-construction to final
- **Real-time Sync**: Offline-capable with automatic synchronization

### 🔧 Technical Features
- **Next.js 15**: Modern React framework with App Router
- **TypeScript**: Full type safety
- **Tailwind CSS**: Responsive, modern UI design
- **Responsive Design**: Mobile-first approach
- **Component Architecture**: Modular, reusable components

## Project Structure

```
app/
├── components/
│   ├── layout/          # Navigation and layout components
│   ├── dashboard/       # Dashboard-specific components
│   ├── submittals/      # Permit submittal components
│   └── vba/            # VBA inspection components
├── services/           # Business logic and data services
├── hooks/             # Custom React hooks
├── types/             # TypeScript type definitions
├── submittals/        # Permit submittal pages
└── vba/              # VBA inspection pages
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd IPC
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Navigation

- **Dashboard** (`/`): Main overview page with statistics and recent activities
- **Submittals** (`/submittals`): Permit application management
- **VBA** (`/vba`): Virtual Building Authority inspection platform

## VBA Features

### Inspection Management
- Create and manage inspection projects
- Schedule inspections using integrated calendar
- Track compliance scores and violations
- Real-time photo documentation
- Digital signatures and voice notes

### Mobile Capabilities
- Camera capture for documentation
- GPS location services
- Voice dictation for notes
- Offline synchronization
- Collaboration tools

### AI Integration
- Automatic compliance detection
- Computer vision analysis
- Confidence scoring
- Violation categorization

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Key Components

#### Dashboard
- Statistics overview
- Recent applications table
- Quick action cards

#### Submittals
- Permit tracking table
- Advanced search and filtering
- Status management
- Document tracking

#### VBA
- Inspection project management
- Calendar scheduling
- Mobile inspection tools
- AI compliance features

## Contributing

This project uses:
- ESLint for code linting
- TypeScript for type checking
- Tailwind CSS for styling
- Next.js App Router for routing

## License

Private project for HIVE239 organization.

---

Built with ❤️ for modern permit and inspection management.