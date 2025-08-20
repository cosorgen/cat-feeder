# Cat Feeder Game 🐱🌭🚀

A fun interactive web game where users can feed a space cat hotdogs! The cat's head and eyes track your cursor, and you can drag and drop hotdogs into the cat's mouth. The game keeps track of a global counter of hotdogs fed across all users and sessions.

**Now built with TypeScript for better type safety and developer experience!**

## Features

- **Cursor Tracking**: The cat's head and eyes follow your mouse cursor
- **Drag & Drop**: Drag hotdogs from the pile to feed the cat
- **Global Counter**: Tracks total hotdogs fed across all users (stored in Supabase)
- **Responsive Design**: Works on desktop and mobile devices
- **Space Theme**: Beautiful space background with cat graphics
- **Smooth Animations**: Eating animations and visual feedback
- **TypeScript**: Full type safety and modern development experience

## Files Structure

```
cat-feeder/
├── index.html          # Main HTML file
├── styles.css          # Game styling
├── src/                # TypeScript source files
│   ├── main.ts         # Main game logic
│   ├── config.ts       # Supabase configuration
│   └── types.ts        # Type definitions
├── dist/               # Compiled JavaScript files (generated)
│   ├── main.js         # Compiled main game logic
│   ├── config.js       # Compiled configuration
│   └── types.js        # Compiled type definitions
├── tsconfig.json       # TypeScript configuration
├── package.json        # Node.js dependencies and scripts
├── build.bat/.sh       # Build scripts for Windows/Unix
├── images/             # Game assets
│   ├── cat_bg.jpg      # Space background
│   ├── cat_face_*.png  # Cat faces (up, down, left, right)
│   ├── cat_eyes_*.png  # Cat eyes (up, down, left, right)
│   └── glizzy_*.png    # Hotdog images
└── artwork/            # Source artwork files
```

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

### 3. Configure the Game

1. Open `src/config.ts`
2. Replace the placeholder values with your Supabase project details:
   - `YOUR_SUPABASE_URL` → Your Supabase project URL
   - `YOUR_SUPABASE_ANON_KEY` → Your Supabase anon/public key

You can find these values in your Supabase project settings under "API".

### 4. Build the Project

Build the TypeScript files to JavaScript:

```bash
# Using npm script
npm run build

# Or using TypeScript compiler directly
npx tsc

# Or using the provided build scripts
# Windows:
build.bat

# Unix/Linux/macOS:
./build.sh
```

### 5. Run the Game

1. Open `index.html` in a web browser
2. Or serve the files using a local web server:

   ```bash
   # Using Python 3
   python -m http.server 8000

   # Using Node.js (if you have http-server installed)
   npx http-server

   # Using VS Code Live Server extension
   Right-click index.html → "Open with Live Server"
   ```

## How to Play

1. **Move your mouse**: Watch the cat's head and eyes follow your cursor
2. **Drag hotdogs**: Click and drag hotdogs from the pile at the bottom
3. **Feed the cat**: Drop hotdogs near the cat's mouth to feed it
4. **Watch the counter**: See the global hotdog count increase with each feeding
5. **Keep playing**: New hotdogs automatically appear in the pile

## Development

### TypeScript Development

- **Source files**: Edit files in the `src/` directory
- **Build**: Run `npm run build` or `npx tsc` to compile TypeScript to JavaScript
- **Watch mode**: Run `npm run watch` to automatically recompile on file changes
- **Types**: The project includes full TypeScript type definitions for better development experience

### Development Workflow

1. Make changes to TypeScript files in `src/`
2. Run `npm run build` to compile to JavaScript
3. Open `index.html` in your browser to test
4. Repeat as needed

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
