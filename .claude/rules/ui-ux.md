# UI/UX & Aesthetic Guidelines

## Aesthetic Requirements
- **High Aesthetic Standard**: Every UI element must look premium and modern.
- **Theme**: Default is **Dark Mode**. Support for Light Mode via `theme-toggle.tsx`.
- **Styling**: Use **Vanilla CSS** in `app/globals.css`. Do not use TailwindCSS unless specifically requested.
- **Visual Effects**: Use glassmorphism, subtle gradients (`var(--gold)`, `var(--gold-soft)`), and smooth micro-animations.
- **Typography**: Modern browser fonts (Arial/Helvetica fallback) with consistent spacing.

## Language Requirements
- **Primary Language**: The user-facing UI must be in **Vietnamese**.
- **Admin Panel**: Also in Vietnamese.
- **Errors/Messages**: Friendly, clear, and professional Vietnamese.

## Layout & Components
- **Responsive**: Mobile-first design is critical as most traffic comes from mobile Facebook Ads.
- **Admins**: Use circular avatars and clear role descriptions (e.g., "Chuyên gia Kỹ thuật").
- **Metrics**: Use chips/pills for stock levels, prices, and status (`metric-success`, `metric-danger`).
- **Icons**: Use pure CSS icons or simple text/emoji indicators (e.g., 👤 for user, 🔑 for admin).
