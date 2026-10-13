import { Article, Collection } from '../types';

export const INITIAL_COLLECTIONS: Collection[] = [
  { id: 'col-tech', name: 'Software & Architecture', iconName: 'Terminal', color: '#0284c7' },
  { id: 'col-mindset', name: 'Philosophy & Focus', iconName: 'Compass', color: '#d97706' },
  { id: 'col-design', name: 'Design & Aesthetics', iconName: 'Layers', color: '#7c3aed' },
  { id: 'col-essays', name: 'Longform Essays', iconName: 'BookOpen', color: '#059669' },
  { id: 'col-science', name: 'Systems & Complexities', iconName: 'Atom', color: '#dc2626' }
];

export const INITIAL_ARTICLES: Article[] = [
  {
    id: 'art-deep-focus',
    url: 'https://paulgraham.com/makersschedule.html',
    title: 'The Architecture of Deep Focus: Maker vs. Manager Schedules',
    author: 'Julian Thorne',
    siteName: 'Essays on Craft',
    domain: 'craftofwork.com',
    heroImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
    excerpt: 'One reason programmers and writers dislike meetings so much is that they work on a different kind of schedule than other people. A single distraction doesn’t just take fifteen minutes—it fractures the cognitive scaffold.',
    wordCount: 1420,
    readingTimeMinutes: 6,
    status: 'inbox',
    isFavorite: true,
    progress: 35,
    savedAt: '2026-10-12T14:30:00Z',
    collectionId: 'col-mindset',
    tags: ['Productivity', 'Deep Work', 'Engineering'],
    highlights: [
      {
        id: 'hl-1',
        text: 'A single meeting can blow a whole afternoon, by breaking it into two pieces each too small to do anything hard in.',
        color: 'amber',
        note: 'Crucial distinction. Protect morning blocks at all costs.',
        createdAt: '2026-10-12T16:15:00Z',
        paragraphIndex: 3
      },
      {
        id: 'hl-2',
        text: 'To someone on the manager schedule, having an appointment is merely a matter of finding an open slot. To someone on the maker schedule, it is an interruption of momentum.',
        color: 'emerald',
        createdAt: '2026-10-12T16:20:00Z',
        paragraphIndex: 7
      }
    ],
    personalNotes: [
      {
        id: 'note-1',
        content: 'Consider implementing a 4-hour silent morning window across the engineering team.',
        createdAt: '2026-10-12T16:22:00Z'
      }
    ],
    content: `
<h2>The Two Incompatible Tempos</h2>
<p>One reason why builders, architects, writers, and software engineers frequently express friction with standard workplace calendars is that they operate on a fundamentally divergent temporal structure. There are two primary types of schedules: the <strong>Manager's Schedule</strong> and the <strong>Maker's Schedule</strong>.</p>

<p>The manager's schedule is the traditional corporate default. It is cleanly partitioned into hour or half-hour segments. You change what you're doing every hour if need be. When you want to discuss something with someone, you simply find an unoccupied thirty-minute block on their calendar. Most powerful people sit on this schedule; it is the natural tempo of executive coordination.</p>

<blockquote>"A single meeting can blow a whole afternoon, by breaking it into two pieces each too small to do anything hard in."</blockquote>

<p>Most makers operate on an entirely different plane. For a novelist or software engineer, scheduling work in thirty-minute intervals is disastrous. You cannot start writing or architecting a distributed system without at least half a day uninterrupted. The mental model required to hold a complex code base or theoretical construct in active working memory takes twenty to thirty minutes simply to reconstruct.</p>

<h2>The Cognitive Cost of Context-Switching</h2>
<p>When you are operating on the maker’s schedule, an appointment is not merely a slot. It exerts a gravitational pull on the hours preceding it. If you know you have a status meeting at 2:30 PM, you will rarely initiate a difficult refactoring at 1:15 PM. You know you won't have time to sink into the problem, test the boundary conditions, and reach a resolution.</p>

<p>The result is that the maker ends up spending the intervening hour doing trivial tasks: checking correspondence, organizing folders, reading incidental news—essentially running in place until the meeting commences.</p>

<blockquote>"To someone on the manager schedule, having an appointment is merely a matter of finding an open slot. To someone on the maker schedule, it is an interruption of momentum."</blockquote>

<h2>Protecting Uninterrupted Horizons</h2>
<p>How can individuals and teams reconcile this friction? The most durable approach is not mutual hostility, but structural compartmentalization:</p>

<ul>
  <li><strong>Synchronous Reservoirs:</strong> Designate specific afternoons (e.g., Tuesday and Thursday from 2 PM to 5 PM) for office hours, collaborative design sessions, and administrative syncing.</li>
  <li><strong>Asynchronous Default:</strong> Default to high-fidelity written documentation, RFC proposals, and pull request reviews over conversational status checks.</li>
  <li><strong>Silent Monoliths:</strong> Reserve continuous 4-hour morning stretches with notifications disabled and calendars strictly guarded.</li>
</ul>

<p>When you grant craftspeople uninterrupted continuous hours, the speed and elegance of what they produce doesn’t just double—it fundamentally changes in category.</p>
`
  },
  {
    id: 'art-digital-gardens',
    url: 'https://maggieappleton.com/garden-history',
    title: 'Crafting Digital Gardens: Shifting from Streams to Topologies',
    author: 'Maggie Appleton & Tom Critchlow',
    siteName: 'Hyperlink Commons',
    domain: 'hyperlink.org',
    heroImage: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1200&q=80',
    excerpt: 'The web began as an interconnected web of hypertexts, but social algorithms compressed it into an ephemeral, river-like timeline. Digital gardening is an intentional reclamation of personal knowledge spaces.',
    wordCount: 1850,
    readingTimeMinutes: 8,
    status: 'reading',
    isFavorite: true,
    progress: 68,
    savedAt: '2026-10-11T09:12:00Z',
    collectionId: 'col-design',
    tags: ['Digital Garden', 'Knowledge Management', 'Web History'],
    highlights: [
      {
        id: 'hl-3',
        text: 'A garden is non-performative. It is not finished on publication; it grows through iterative pruning, re-linking, and refinement.',
        color: 'rose',
        note: 'Compare this to tweets or blog posts that are frozen in time.',
        createdAt: '2026-10-11T10:40:00Z',
        paragraphIndex: 2
      }
    ],
    content: `
<h2>The Exhaustion of the Stream</h2>
<p>For the past fifteen years, our digital consumption and publishing patterns have been dominated by the <strong>Stream</strong>. The stream is ephemeral, chronological, and reactive. Whatever was posted five minutes ago supersedes what was written five years ago, regardless of its truth, beauty, or utility.</p>

<p>In contrast, the <strong>Digital Garden</strong> represents an ethos of accumulation rather than ephemeral broadcasting. In a garden, ideas are seeds that sprout into seedlings, branch outward with linked references, and mature into evergreen essays over months or years.</p>

<blockquote>"A garden is non-performative. It is not finished on publication; it grows through iterative pruning, re-linking, and refinement."</blockquote>

<h2>Topological Thinking vs. Chronological Feeds</h2>
<p>When you organize thoughts topologically, concepts reside adjacent to related concepts regardless of when they were first conceived. A note on <em>Epistemic Humility</em> connects to <em>Bayesian Updating</em> and <em>System Dynamics</em>. You navigate through bidirectional pathways rather than reverse chronological feeds.</p>

<p>This alters your psychological relationship with what you learn:</p>
<ul>
  <li><strong>From Broadcast to Inhabitation:</strong> You are not writing to captivate an algorithmic audience; you are structuring an external cognitive habitat for your future self.</li>
  <li><strong>Low Friction Entry:</strong> Ideas can enter as fragmentary rough notes with explicit status badges (Seedling, Budding, Evergreen).</li>
  <li><strong>Compounding Returns:</strong> Notes written five years ago remain active touchstones that gain richness as new insights link to them.</li>
</ul>

<h2>Designing Personal Reading & Knowledge Vaults</h2>
<p>A true save-for-later library should not be a graveyard of unread bookmarks. It should be the composting soil of your intellectual garden. By highlighting passages, synthesizing marginalia, and organizing ideas into coherent thematic collections, passive reading transmutes into active creation.</p>
`
  },
  {
    id: 'art-marginalia',
    url: 'https://themarginalian.org/history-of-marginalia',
    title: 'The Lost Art of Marginalia: Why Great Thinkers Wrote in Book Margins',
    author: 'Maria Popova & Heather Jackson',
    siteName: 'The Marginalian',
    domain: 'themarginalian.org',
    heroImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80',
    excerpt: 'Marginalia is not vandalism; it is an active conversation between reader and author across centuries. From Voltaire to David Foster Wallace, the mark in the margin is where comprehension solidifies into original thought.',
    wordCount: 1650,
    readingTimeMinutes: 7,
    status: 'inbox',
    isFavorite: false,
    progress: 0,
    savedAt: '2026-10-10T18:22:00Z',
    collectionId: 'col-essays',
    tags: ['Reading Habits', 'Marginalia', 'Philosophy'],
    highlights: [],
    content: `
<h2>Conversation Across Eras</h2>
<p>To read without a pencil or an active highlighter is to merely allow someone else’s thoughts to drift through your head without leaving a trace. When you scribble a contentious exclamation point in the white margin of a philosophical volume, you are not merely recording agreement or disgust—you are claiming co-authorship of the intellectual experience.</p>

<p>Samuel Taylor Coleridge coined the term <em>marginalia</em> in 1819, though the practice stretches back to ancient monastic scriptoria. Fermat famously penned his Last Theorem in the margin of Arithmetica because the space was too narrow to contain his full proof.</p>

<blockquote>"Books become truly personal only when we leave the fingerprints of our consciousness upon their pages."</blockquote>

<h2>Passive Scrolling vs. Intentional Reading</h2>
<p>Modern internet reading has largely transformed into a frictionless ingestive stream. Articles are swiped past on glass screens; thousands of words flow across human retinas every day without lingering longer than thirty seconds in working memory.</p>

<p>When you save an article to a quiet, distraction-free reader and highlight a sentence that arrests your attention, something neurochemically distinct occurs. You pause the feed. You evaluate the syntax. You cross-examine the claim against your lived experience.</p>

<h3>Three Tiers of Marginal Notation</h3>
<ul>
  <li><strong>The Anchor:</strong> Marking evocative phrasing that encapsulates an elusive truth in memorable prose.</li>
  <li><strong>The Challenge:</strong> Questioning unstated premises or surfacing contradictory counterexamples.</li>
  <li><strong>The Synthesis:</strong> Bridging the author’s insight directly to your own current work, project, or existential inquiry.</li>
</ul>
`
  },
  {
    id: 'art-systems-resilience',
    url: 'https://longnow.org/seminars/pace-layering-architecture',
    title: 'Pace Layering: How Complex Civilizations & Systems Sustain Resilience',
    author: 'Stewart Brand',
    siteName: 'Long Now Foundation',
    domain: 'longnow.org',
    heroImage: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1200&q=80',
    excerpt: 'Healthy systems require multiple layers operating at vastly different speeds. Fashion and commerce innovate rapidly and absorb shocks, while governance and nature move like tectonic plates to preserve stability.',
    wordCount: 2200,
    readingTimeMinutes: 9,
    status: 'archived',
    isFavorite: true,
    progress: 100,
    savedAt: '2026-10-08T11:05:00Z',
    readAt: '2026-10-09T08:45:00Z',
    collectionId: 'col-science',
    tags: ['Systems Thinking', 'Long Now', 'Resilience'],
    highlights: [
      {
        id: 'hl-4',
        text: 'The fast layers learn, propose, and absorb shocks. The slow layers remember, integrate, and sustain continuity.',
        color: 'sky',
        note: 'Direct metaphor for software architecture: edge UI vs database schemas.',
        createdAt: '2026-10-09T08:20:00Z',
        paragraphIndex: 4
      }
    ],
    content: `
<h2>The Order of Civilization</h2>
<p>In 1999, Stewart Brand proposed a schematic model for how enduring civilizations survive shocks without collapsing into stagnation or anarchy. He arranged human enterprise into six nested levels of pace, ordered from fastest to slowest:</p>

<ol>
  <li><strong>Fashion / Art:</strong> Moves in seasons. High innovation, zero memory, rapid turnover.</li>
  <li><strong>Commerce:</strong> Moves in quarters and fiscal years. Allocates resources, takes calculated gambles.</li>
  <li><strong>Infrastructure:</strong> Moves in decades. Roads, electrical grids, internet protocols, public health standards.</li>
  <li><strong>Governance:</strong> Moves in generations. Constitutions, common law, regulatory safeguards.</li>
  <li><strong>Culture:</strong> Moves in centuries. Languages, fundamental worldviews, religious ethics.</li>
  <li><strong>Nature:</strong> Moves in millennia and epochs. Biogeochemical cycles, climate equilibrium, plate tectonics.</li>
</ol>

<blockquote>"The fast layers learn, propose, and absorb shocks. The slow layers remember, integrate, and sustain continuity."</blockquote>

<h2>When Layers Collide</h2>
<p>Systemic catastrophe arises when layers lose their boundaries or attempt to usurp each other's native velocities. If commerce dictates governance, long-term infrastructure decays in favor of short-term quarterly arbitrage. Conversely, if governance attempts to control fashion with glacial bureaucratic edicts, artistic dynamism suffocates.</p>

<p>In software engineering, we observe the exact same pace layering. The presentation layer (CSS, frontend frameworks) changes every eighteen months. Business logic models shift over five-year cycles. Relational storage paradigms and protocol baselines (TCP, HTTP, SQL) endure for forty years.</p>
`
  },
  {
    id: 'art-humane-software',
    url: 'https://robinsloan.com/notes/home-cooked-software',
    title: 'An Ode to Home-Cooked Software and Quiet Interfaces',
    author: 'Robin Sloan',
    siteName: 'Robin Sloan Notes',
    domain: 'robinsloan.com',
    heroImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
    excerpt: 'Not all software needs to scale to ten million monthly active users or monetize attention with slot-machine mechanics. Some tools can be cozy, quiet, handcrafted, and built for personal delight.',
    wordCount: 1300,
    readingTimeMinutes: 5,
    status: 'inbox',
    isFavorite: false,
    progress: 10,
    savedAt: '2026-10-13T04:00:00Z',
    collectionId: 'col-tech',
    tags: ['Software', 'Indie Web', 'Craft'],
    highlights: [],
    content: `
<h2>The Cooking Analogy</h2>
<p>We take it for granted that restaurant dining and industrial frozen meals exist alongside home cooking. Nobody says: <em>"Why are you making dinner for your family tonight? Don't you know Olive Garden has achieved higher operational efficiency at scale?"</em></p>

<p>Yet in software, the venture-backed doctrine frequently assumes that unless a tool is architected to conquer a global marketplace, its creation is an inefficient vanity. We have forgotten the profound satisfaction of <strong>Home-Cooked Software</strong>.</p>

<h2>Characteristics of Quiet Interfaces</h2>
<p>What makes a tool feel like a sanctuary rather than a casino?</p>
<ul>
  <li><strong>Absence of Urgent Red Dots:</strong> No unread count badges screaming for defensive zeroing.</li>
  <li><strong>No Interstitial Popups:</strong> No requests to subscribe to newsletters while you are in the middle of a paragraph.</li>
  <li><strong>Respect for Typography:</strong> Ample whitespace, generous line heights, and legibility that honors the optic nerve.</li>
  <li><strong>Offline First & Data Sovereignty:</strong> Your saved articles, notes, and highlights belong entirely to you, stored locally on your machine and easily exported into open plaintext formats.</li>
</ul>

<p>When software treats your attention as a sacred faculty rather than an extractable commodity, reading becomes an act of deliberate renewal.</p>
`
  }
];
