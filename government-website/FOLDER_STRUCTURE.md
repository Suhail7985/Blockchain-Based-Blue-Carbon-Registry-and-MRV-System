# Government Website - Folder Structure

```
government-website/
│
├── public/                          # Static files
│   └── index.html                  # HTML template with meta tags
│
├── src/                            # Source code
│   ├── components/                 # Reusable components
│   │   ├── Header.jsx             # Header with navigation, accessibility
│   │   └── Footer.jsx             # Footer with links, contact, social
│   │
│   ├── sections/                   # Page sections
│   │   ├── Hero.jsx               # Hero section with CTAs
│   │   ├── About.jsx              # About (Vision, Mission, Objectives)
│   │   ├── Services.jsx           # Services grid cards
│   │   ├── Notifications.jsx      # Latest announcements
│   │   └── Statistics.jsx         # Statistics/Impact metrics
│   │
│   ├── pages/                      # Page components
│   │   └── Home.jsx               # Main home page
│   │
│   ├── App.js                      # Main app component with router
│   ├── App.css                     # Minimal custom styles
│   ├── index.js                    # React entry point
│   └── index.css                   # Tailwind imports + base styles
│
├── tailwind.config.js              # Tailwind CSS configuration
├── postcss.config.js               # PostCSS configuration
├── package.json                    # Dependencies and scripts
├── .gitignore                      # Git ignore rules
├── README.md                       # Project documentation
└── FOLDER_STRUCTURE.md            # This file

```

## Component Breakdown

### Header.jsx
- **Top Bar**: Logo, government name, accessibility controls
- **Accessibility**: Font size (A+/A-), dark mode toggle, language selector
- **Navigation**: Main menu items (Home, About, Services, etc.)
- **Actions**: Search, Sign In, Register buttons
- **Mobile**: Hamburger menu for mobile devices
- **Features**: Sticky header, ARIA labels, keyboard navigation

### Footer.jsx
- **Quick Links**: Navigation shortcuts
- **Policies**: Privacy, Terms, Accessibility, RTI
- **Contact**: Address, phone, email
- **Social Media**: Facebook, Twitter, YouTube, LinkedIn icons
- **Bottom Bar**: Copyright, legal links

### Hero.jsx
- **Background**: Gradient blue with subtle pattern
- **Content**: Welcome message, mission statement
- **CTAs**: "Explore Services" and "Citizen Login" buttons
- **Accessibility**: Proper heading hierarchy, ARIA labels

### About.jsx
- **Cards**: Vision, Mission, Key Objectives
- **Layout**: 3-column grid (responsive)
- **Icons**: Visual indicators for each section
- **Content**: Government department information

### Services.jsx
- **Grid**: 5 service cards in responsive grid
- **Services**: Registration, Verification, Grievance, Tracking, Dashboard
- **Features**: Icons, descriptions, "Learn More" links
- **Hover**: Subtle hover effects

### Notifications.jsx
- **List**: Latest announcements with dates
- **Categories**: Color-coded category badges
- **Actions**: PDF download buttons
- **Layout**: Scrollable list with "View All" link

### Statistics.jsx
- **Metrics**: 4 key statistics
- **Display**: Large numbers with icons
- **Layout**: 4-column grid (responsive)
- **Design**: Clean cards with gradients

## File Sizes & Optimization

- All components are lightweight and optimized
- Images/icons use React Icons (no image files)
- CSS is minimal (mostly Tailwind)
- No heavy animations or libraries

## Responsive Design

- **Mobile First**: Designed for mobile, enhanced for desktop
- **Breakpoints**: 
  - Mobile: < 640px
  - Tablet: 640px - 1024px  
  - Desktop: > 1024px
- **Flexible**: Works on all screen sizes and resolutions

## Accessibility Features

- Semantic HTML5 elements
- ARIA labels and roles
- Keyboard navigation
- Focus indicators
- Screen reader support
- Color contrast compliant
- Skip to main content link
