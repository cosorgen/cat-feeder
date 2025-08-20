# Cat Feeder Game 🐱🌭🚀

A fun interactive web game where users can feed a space cat hotdogs! The cat's head and eyes track your cursor, and you can drag and drop hotdogs into the cat's mouth. The game keeps track of a global counter of hotdogs fed across all users and sessions.

## Setup Instructions

### 0. Prerequisites

Make sure you have Node.js installed on your system. You can download it from [nodejs.org](https://nodejs.org/).

### 1. Install Dependencies

```bash
npm install
```

### 2. Supabase Database Setup

1. Go to [Supabase](https://supabase.com) and create a new project
2. In the SQL Editor, run the following query to create the hotdog counter table:

```sql
-- Create the hotdog counter table
CREATE TABLE hotdog_counter (
    id BIGSERIAL PRIMARY KEY,
    count BIGINT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial row
INSERT INTO hotdog_counter (count) VALUES (0);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE hotdog_counter ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow all operations
CREATE POLICY "Allow all operations on hotdog_counter" ON hotdog_counter
FOR ALL USING (true);
```

### 3. Configure Environment Variables

1. Copy the example environment file:

   ```bash
   copy .env.example .env
   ```

2. Edit the `.env` file and replace the placeholder values with your actual Supabase project details:

   ```
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

   You can find these values in your Supabase project settings under "API".

**Important**: The `.env` file is already included in `.gitignore` to prevent accidentally committing your secrets to version control.

### 4. Build and Run the Project

```bash
# Install dependencies
npm install

# Development mode (with hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## How to Play

1. **Move your mouse**: Watch the cat's head and eyes follow your cursor
2. **Drag hotdogs**: Click and drag hotdogs from the pile at the bottom
3. **Feed the cat**: Drop hotdogs near the cat's mouth to feed it
4. **Watch the counter**: See the global hotdog count increase with each feeding
5. **Keep playing**: New hotdogs automatically appear in the pile

## Development

### Environment Setup

- **Environment Variables**: Configure your Supabase credentials in `.env` file
- **Source files**: Edit files in the `src/` directory
- **Development server**: Run `npm run dev` for hot reload during development
- **Build**: Run `npm run build` to compile TypeScript and bundle for production
- **Types**: The project includes full TypeScript type definitions for better development experience

### Development Workflow

1. Make changes to TypeScript files in `src/`
2. The development server (`npm run dev`) will automatically reload your changes
3. For production builds, run `npm run build`
4. Test the production build with `npm run preview`

### Type Safety Benefits

The TypeScript version provides:

- **Compile-time error checking**: Catch errors before runtime
- **IntelliSense support**: Better autocomplete and documentation in editors
- **Refactoring safety**: Rename variables and functions with confidence
- **Interface definitions**: Clear contracts for data structures
- **Null safety**: Prevent common null/undefined errors

## Technical Details

### Cat Head Tracking

- The cat's face changes based on cursor position relative to the cat
- Four directions: up, down, left, right
- Smooth transitions between face and eye states

### Drag and Drop System

- Custom drag implementation (not using HTML5 drag API for better control)
- Touch support for mobile devices
- Visual feedback when hotdogs are over the drop zone
- Smooth animations for successful feeds

### Global Counter

- Stored in Supabase database for persistence across sessions
- Automatic fallback to localStorage if Supabase is unavailable
- Real-time updates when hotdogs are fed

### Responsive Design

- Adapts to different screen sizes
- Touch-friendly on mobile devices
- Maintains aspect ratios and positioning

## Customization

### Adding More Hotdog Types

1. Add new hotdog images to the `images/` folder
2. Update the `hotdogImages` array in `src/main.ts`
3. Rebuild the project with `npm run build`

### Changing Cat Behaviors

- Modify the direction detection logic in `getCursorDirection()` in `src/main.ts`
- Adjust animation timings in `styles.css`
- Add new cat states by creating new image assets

### Styling Changes

- Edit `styles.css` to change colors, animations, or layout
- Modify the UI elements in the `.ui-container` section
- Adjust responsive breakpoints for different devices

### TypeScript Configuration

- Modify `tsconfig.json` to change compilation settings
- Add new type definitions in `src/types.ts`
- Configure stricter type checking by modifying compiler options

## Troubleshooting

### Counter Not Working

- Check browser console for Supabase connection errors
- Verify your Supabase URL and API key in `src/config.ts`
- Ensure the database table was created correctly
- Game will fallback to localStorage if Supabase fails

### TypeScript Compilation Errors

- Check `tsconfig.json` for configuration issues
- Ensure all type imports are correct
- Run `npx tsc --noEmit` to check for type errors without building
- Make sure all dependencies are installed with `npm install`

### Images Not Loading

- Verify all image files are in the `images/` folder
- Check file names match exactly (case-sensitive)
- Ensure the web server can serve static files

### Drag and Drop Issues

- Clear browser cache and reload
- Check browser console for JavaScript errors
- Ensure the page is served via HTTP(S), not file:// protocol

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Requires JavaScript enabled
- Works best with mouse or touch input

## License

This project is open source. Feel free to modify and use for your own projects!
