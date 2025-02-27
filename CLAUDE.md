# CLAUDE.md - Helper Guidelines

## Commands
- Build/Run: `bun dev` (all), `bun dev:web`, `bun dev:android`, `bun ios`
- Formatting: `bun format` (uses Biome)
- Database:
  - `bun db:generate` - Generate migrations
  - `bun migrate` - Apply migrations
  - `bun db:studio` - Launch Drizzle Studio

## Code Style Guidelines
- **Formatting**: 2-space indentation, organized imports
- **Components**: Use forwardRef pattern, set displayName
- **Naming**: PascalCase for components, camelCase for files
- **Styling**: Use Tailwind via NativeWind with `cn` utility
- **Types**: TypeScript throughout, export component prop types
- **Architecture**: Expo app with file-based routing (expo-router)
- **Cross-platform**: Separate .web.tsx and .native.tsx implementations
- **Data**: Drizzle ORM for database with schema validation

Follow existing patterns when creating new files or modifying components.