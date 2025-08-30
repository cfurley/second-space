# Second Space - Design System & Implementation Guide

## Overview

Second Space is a dark-themed web application that maintains mobile app aesthetics with a complementary browser extension for drag-and-drop content saving. The design emphasizes clean typography, subtle glass effects, and intuitive content organization.

## Color Palette

### Primary Colors
```css
--background: #000000           /* Main background */
--primary: #1D1D1D             /* Primary accent color */
--accent: #7A7A7A              /* Secondary accent */
--text-primary: #FFFFFF        /* Primary text */
--text-secondary: #7A7A7A      /* Secondary text */
```

### Glass Effect Colors
```css
--glass-light: rgba(255,255,255,0.05)    /* Subtle glass effect */
--glass-medium: rgba(255,255,255,0.1)    /* Active states */
--glass-heavy: rgba(255,255,255,0.15)    /* Selected states */
--glass-border: rgba(255,255,255,0.1)    /* Glass borders */
--glass-border-active: rgba(255,255,255,0.2)  /* Active borders */
```

### State Colors
```css
--success: #22c55e             /* Success states */
--success-bg: rgba(34,197,94,0.2)  /* Success backgrounds */
--hover-transform: translateY(-2px)  /* Hover elevation */
```

## Typography

### Font Family
- **Primary**: 'JetBrains Mono', monospace
- **Fallback**: monospace

### Font Weights
- **Normal**: 400
- **Medium**: 500  
- **Semibold**: 600
- **Bold**: 700

### Font Sizes
- **Base**: 14px (0.875rem)
- **Small**: 0.75rem (12px)
- **Regular**: 0.85rem (13.6px)
- **Medium**: 0.9rem (14.4px)
- **Large**: 1.1rem (17.6px)
- **XL**: 1.2rem (19.2px)
- **2XL**: 1.4rem (22.4px)
- **3XL**: 1.8rem (28.8px)
- **4XL**: 2.2rem (35.2px)
- **5XL**: 2.5rem (40px)

## Layout Specifications

### Website Layout
```css
/* Header */
--header-height: 76px
--header-padding: 20px 40px
--header-backdrop-blur: 20px

/* Sidebar */
--sidebar-width: 280px
--sidebar-padding: 30px 0

/* Content Area */
--content-padding: 40px
--content-grid-gap: 20px
--content-min-column-width: 250px

/* Floating Elements */
--floating-menu-position: 30px /* from bottom-right */
--floating-button-size: 56px
--floating-button-gap: 15px
```

### Browser Extension
```css
--extension-width: 320px
--extension-border-radius: 16px
--extension-backdrop-blur: 20px
--extension-shadow: 0 10px 40px rgba(0,0,0,0.5)
--drag-area-height: 120px
--space-grid-columns: 2
```

## Component Library

### 1. Header Component
```css
.header {
  height: 76px;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.4rem;
  font-weight: 700;
  color: white;
}

.header-nav {
  display: flex;
  gap: 30px;
  font-size: 0.9rem;
  color: #7A7A7A;
}

.header-nav .active {
  color: white;
}
```

### 2. Search Bar
```css
.search-bar {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 8px 16px;
  color: white;
  width: 200px;
  font-size: 0.85rem;
}
```

### 3. Sidebar Navigation
```css
.sidebar {
  width: 280px;
  background: rgba(0, 0, 0, 0.98);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  padding: 30px 0;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  margin-bottom: 8px;
  border-radius: 8px;
  color: #7A7A7A;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.sidebar-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.sidebar-item.active {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}
```

### 4. Content Cards
```css
.content-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  color: white;
  transition: all 0.2s;
  cursor: pointer;
}

.content-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.content-card.link {
  border-left: 3px solid #7A7A7A;
}

.content-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.75rem;
  color: #7A7A7A;
}
```

### 5. Filter Buttons
```css
.filter-btn {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.85rem;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.filter-btn.active {
  background: #1D1D1D;
  border: 1px solid transparent;
}
```

### 6. Floating Action Buttons
```css
.floating-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.floating-btn.primary {
  background: #1D1D1D;
  color: white;
}

.floating-btn.secondary {
  background: white;
  color: #1D1D1D;
}

.floating-btn:hover {
  transform: scale(1.1);
}
```

## Browser Extension Components

### 1. Extension Panel
```css
.extension-mockup {
  width: 320px;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
}
```

### 2. Drag & Drop Area
```css
.drag-drop-area {
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  transition: all 0.3s ease;
}

.drag-drop-area.active {
  border-color: white;
  background: rgba(255, 255, 255, 0.05);
}
```

### 3. Space Selector
```css
.space-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.space-option:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.space-option.selected {
  background: rgba(255, 255, 255, 0.15);
  border-color: white;
}
```

### 4. Extension States

#### Default State
```css
.drag-area-default {
  border: 2px dashed rgba(255,255,255,0.3);
  background: rgba(255,255,255,0.08);
  color: #7A7A7A;
}
```

#### Active State
```css
.drag-area-active {
  border: 2px dashed white;
  background: rgba(255,255,255,0.15);
  color: white;
}
```

#### Success State
```css
.drag-area-success {
  border: 2px solid #22c55e;
  background: rgba(34,197,94,0.2);
  color: #22c55e;
}
```

## Grid Systems

### Masonry Grid (Pinterest-style)
```css
.masonry-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}
```

### Space Selector Grid
```css
.space-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
```

## Animation & Transitions

### Standard Transitions
```css
/* Default transition for interactive elements */
transition: all 0.2s ease;

/* Hover elevation effect */
transform: translateY(-2px);

/* Scale effect for buttons */
transform: scale(1.1);

/* Backdrop blur for glass effects */
backdrop-filter: blur(20px);
```

## Implementation Guidelines

### 1. Responsive Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

### 2. Glass Effect Implementation
Use `backdrop-filter: blur(20px)` combined with semi-transparent backgrounds for glass effects.

### 3. Content Grid Behavior
- Minimum column width: 250px
- Automatically adjusts columns based on screen width
- Maintains 20px gap between items

### 4. Accessibility Requirements
- All interactive elements must have proper focus states
- Color contrast ratios must meet WCAG AA standards
- Keyboard navigation support for all functionality

### 5. Performance Considerations
- Lazy load content cards for large datasets
- Optimize backdrop blur usage for performance
- Use CSS transforms for animations (hardware accelerated)

### 6. Browser Extension Integration
- Detect drag events on any webpage
- Show full-screen overlay during drag operations
- Provide visual feedback for successful saves
- Handle various content types (images, links, text)

## Development Setup

### Required Dependencies
```json
{
  "react": "^18.0.0",
  "lucide-react": "latest",
  "motion/react": "latest"
}
```

### Font Loading
```css
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');
```

## Component Hierarchy

```
App
├── Header
│   ├── Logo
│   ├── Navigation
│   ├── SearchBar
│   └── UserProfile
├── MainLayout
│   ├── Sidebar
│   │   ├── SidebarSection
│   │   └── SidebarItem
│   └── ContentArea
│       ├── ContentHeader
│       ├── FilterBar
│       └── MasonryGrid
│           └── ContentCard
└── FloatingMenu
    └── FloatingButton
```

## Testing Guidelines

### Visual Testing
- Test all glass effects across different backgrounds
- Verify hover states and transitions
- Check responsive behavior at all breakpoints

### Functionality Testing
- Drag and drop operations
- Content filtering and searching
- Space navigation and selection

### Browser Compatibility
- Chrome (primary target for extension)
- Firefox, Safari, Edge for web application
- Mobile browsers for responsive design