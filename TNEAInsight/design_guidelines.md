# TNEA Insight Design Guidelines

## Design Approach Decision
**Selected Approach:** Hybrid (Reference-Based + Design System)
- **Primary Reference:** Notion-inspired for dashboard clarity and data organization
- **Secondary References:** Government portal aesthetics for trust and accessibility
- **Design System:** Material Design principles for form interactions and feedback

**Justification:** Educational/government platform requiring both professional credibility and modern usability. The bilingual nature demands clear visual hierarchy and consistent component behavior.

## Core Design Elements

### A. Color Palette
**Primary Colors:**
- Deep Blue: 220 85% 25% (trust, education, government authority)
- Light Blue: 220 70% 85% (backgrounds, secondary elements)

**Accent Colors:**
- Success Green: 142 76% 36% (verification, success states)
- Warning Orange: 25 95% 53% (alerts, pending states)

**Dark Mode:**
- Background: 220 15% 8%
- Surface: 220 12% 12%
- Text Primary: 0 0% 95%

### B. Typography
**Font Families:**
- Primary: Inter (Latin) + Noto Sans Tamil (Tamil script)
- Headings: 600-700 weight
- Body: 400-500 weight
- Data/Numbers: 500 weight (tabular figures)

**Hierarchy:**
- H1: 2.5rem (dashboard titles)
- H2: 2rem (section headers)
- H3: 1.5rem (subsections)
- Body: 1rem
- Small: 0.875rem (metadata, captions)

### C. Layout System
**Spacing Units:** Tailwind units 2, 4, 6, 8, 12
- Component padding: p-4, p-6
- Section margins: m-8, m-12
- Element gaps: gap-2, gap-4

**Grid System:**
- Desktop: 12-column with 8-unit gutters
- Mobile: Single column with 4-unit margins

### D. Component Library

**Navigation:**
- Top navigation bar with language toggle (Tamil/English switch)
- Sidebar navigation for dashboard sections (collapsible on mobile)
- Breadcrumb navigation for deep pages

**Data Display:**
- Tables with alternating row colors and hover states
- Cards for college information with clear visual hierarchy
- Charts using muted colors for historical data visualization
- Filter panels with clear grouping and reset options

**Forms:**
- Consistent form styling with floating labels
- Clear validation states with inline messaging
- Multi-step forms with progress indicators
- File upload areas with drag-and-drop styling

**Interactive Elements:**
- Primary buttons: Deep blue with white text
- Secondary buttons: Outlined style with blue border
- Icon buttons for actions (using Heroicons)
- Toggle switches for settings (dark mode, language)

**Feedback Components:**
- Toast notifications for actions
- Loading spinners for predictions and data fetching
- Progress bars for file uploads and verification
- Status badges for application states

### E. Page-Specific Treatments

**Student Dashboard:**
- Clean, data-focused layout with generous whitespace
- Card-based metrics display for quick insights
- Prominent search and filter controls
- Responsive tables that stack on mobile

**College Suggestion Tool:**
- Form-first layout with clear input grouping
- Results displayed as sortable cards
- Comparison features with side-by-side layouts
- Confidence score indicators using progress bars

**Admin Interface:**
- Dense information layout with sidebar navigation
- Bulk action controls clearly separated
- Status-driven color coding throughout
- Data export controls prominently placed

**Bilingual Considerations:**
- Consistent component behavior across both languages
- Tamil text using appropriate line height and spacing
- Language toggle accessible from all pages
- RTL-aware layouts where needed

### F. Responsive Behavior
- Mobile-first approach with progressive enhancement
- Sidebar navigation converts to bottom tab bar on mobile
- Tables become horizontally scrollable cards on small screens
- Multi-column forms stack to single column below tablet size

## Key Design Principles
1. **Trust through Consistency:** Government-appropriate color palette and reliable interactions
2. **Bilingual Clarity:** Equal treatment and readability for both Tamil and English content
3. **Data-Driven Hierarchy:** Clear visual emphasis on important information and actions
4. **Progressive Disclosure:** Complex features revealed through clear navigation and filtering
5. **Accessibility First:** High contrast ratios, keyboard navigation, and screen reader support

This design approach balances the professional credibility needed for educational counseling with the modern usability expected by students and administrators.