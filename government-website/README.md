# Government Website - Professional Portal

A professional, accessible government website built with React and Tailwind CSS, following official government website standards.

## Features

- ✅ **Professional Design**: Clean, official blue + white color theme
- ✅ **Accessibility**: WCAG compliant with ARIA labels, keyboard navigation, screen reader support
- ✅ **Responsive**: Mobile-first design that works on all screen sizes
- ✅ **Component-Based**: Modular, reusable components
- ✅ **Semantic HTML**: Proper HTML5 semantic elements
- ✅ **Minimal Animations**: Subtle transitions, no flashy effects
- ✅ **Sticky Header**: Navigation stays accessible while scrolling
- ✅ **Dark Mode**: Toggle for dark/light theme
- ✅ **Font Size Control**: Accessibility options for text size
- ✅ **Multi-language Ready**: Language selector framework

## Project Structure

```
government-website/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Header.jsx          # Header with navigation and accessibility
│   │   └── Footer.jsx          # Footer with links and contact info
│   ├── sections/
│   │   ├── Hero.jsx            # Hero section with CTAs
│   │   ├── About.jsx           # About section (Vision, Mission, Objectives)
│   │   ├── Services.jsx        # Services grid cards
│   │   ├── Notifications.jsx  # Latest announcements
│   │   └── Statistics.jsx     # Statistics/Impact section
│   ├── pages/
│   │   └── Home.jsx            # Main home page
│   ├── App.js                  # App router
│   ├── App.css                 # Minimal custom styles
│   └── index.js                # Entry point
├── tailwind.config.js          # Tailwind configuration
├── postcss.config.js           # PostCSS configuration
└── package.json
```

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

The app will open at `http://localhost:3000`

## Components

### Header Component
- Top government bar with logo and accessibility options
- Main navigation menu
- Mobile hamburger menu
- Sign In/Register buttons
- Sticky header on scroll
- Font size controls (A+, A-)
- Dark mode toggle
- Language selector

### Footer Component
- Quick links section
- Government policies
- Contact information
- Social media links
- Copyright and legal links

### Sections
1. **Hero**: Welcome message with CTAs
2. **About**: Vision, Mission, and Key Objectives
3. **Services**: Grid of service cards with icons
4. **Notifications**: Latest announcements with PDF download
5. **Statistics**: Impact metrics display

## Accessibility Features

- ✅ Semantic HTML5 elements
- ✅ ARIA labels and roles
- ✅ Keyboard navigation support
- ✅ Focus visible indicators
- ✅ Skip to main content link
- ✅ Screen reader friendly
- ✅ Color contrast compliant
- ✅ Font size controls
- ✅ Dark mode support

## Color Scheme

- **Primary Blue**: `#2563eb` (gov-blue-600)
- **Dark Blue**: `#1e40af` (gov-blue-800)
- **Light Blue**: `#eff6ff` (gov-blue-50)
- **White**: `#ffffff`
- **Gray**: Various shades for text and backgrounds

## Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Customization

### Change Colors
Edit `tailwind.config.js` to modify the color scheme:

```js
colors: {
  'gov-blue': {
    // Your custom blue shades
  },
}
```

### Update Content
Edit the respective component files:
- `src/sections/Hero.jsx` - Hero content
- `src/sections/About.jsx` - About section
- `src/sections/Services.jsx` - Services list
- `src/sections/Notifications.jsx` - Notifications
- `src/components/Header.jsx` - Navigation items
- `src/components/Footer.jsx` - Footer content

### Add New Sections
1. Create new component in `src/sections/`
2. Import and add to `src/pages/Home.jsx`
3. Add navigation link in `src/components/Header.jsx`

## Production Deployment

```bash
# Build for production
npm run build

# The build folder contains optimized production files
# Deploy to your hosting service (Vercel, Netlify, etc.)
```

## License

This project follows government website standards and best practices.
