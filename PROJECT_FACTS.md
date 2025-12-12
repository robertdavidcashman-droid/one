# Project Facts - Lighthouse Optimization

## Framework & Structure
- **Next.js Version**: 14.2.0
- **Router**: App Router (`app/` directory)
- **TypeScript**: Yes (TypeScript 5.5.0)
- **Styling**: Tailwind CSS 3.4.0

## Current State
- **Images**: Need to check for `<img>` vs `next/image` usage
- **Fonts**: Need to check for font loading strategy
- **Third-party Scripts**: External social media links (Facebook, LinkedIn, Twitter, WhatsApp)
- **Navigation**: Client component with mobile menu (hamburger exists)
- **Footer**: Contains legal links (Privacy, Terms, Cookies, Complaints, etc.)

## Legal Links Found
- Privacy Policy: `/privacy`
- Terms: `/terms-and-conditions`
- Cookies: `/cookies`
- GDPR: `/gdpr` or `/g-d-p-r`
- Accessibility: `/accessibility`
- Complaints: `/complaints`
- Agency Terms: `/attendanceterms`

## Optimization Targets
1. Replace `<img>` with `next/image`
2. Optimize font loading with `next/font`
3. Move legal links from menu to footer only
4. Add security headers
5. Optimize client components
6. Add Lighthouse CI automation

