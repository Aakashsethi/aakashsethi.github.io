import React from 'react';
import { useEffect, useState } from 'react';
import { About } from './About.jsx';
import { Footer, Header } from './Chrome.jsx';
import { Contact } from './Contact.jsx';
import { Education } from './Education.jsx';
import { Hero, StatStrip } from './Hero.jsx';
import { Problems, TrustBar } from './HomeSections.jsx';
import { JobTailor } from './JobTailor.jsx';
import { Journey } from './Journey.jsx';
import { LinkedInFeed } from './LinkedInFeed.jsx';
import { LiveStrip } from './LiveStrip.jsx';
import { Newsletter } from './Newsletter.jsx';
import { ProjectModal } from './ProjectModal.jsx';
import { Scheduler } from './Scheduler.jsx';
import { Work } from './Work.jsx';
import { YouTubeFeed } from './YouTubeFeed.jsx';
import CursorGrid from './CursorGrid.jsx';

// Maps internal page id → URL hash fragment
const PAGE_TO_HASH = {
  home:      '',
  work:      'work',
  youtube:   'youtube',
  linkedin:  'mylogs',
  education: 'education',
  about:     'about',
  contact:   'contact',
  tailor:    'tailor',
  scheduler: 'scheduler',
  journey:   'journey',
};

// Reverse: hash fragment → internal page id
const HASH_TO_PAGE = Object.fromEntries(
  Object.entries(PAGE_TO_HASH).map(([k, v]) => [v, k])
);

function pageFromHash() {
  if (typeof window === 'undefined') return 'home';
  const hash = window.location.hash.replace('#', '').toLowerCase();
  return HASH_TO_PAGE[hash] || 'home';
}

function App() {
  const [page, setPage] = useState(pageFromHash);
  const [openProj, setOpenProj] = useState(null);

  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, [page, openProj]);

  useEffect(() => { window.scrollTo({top:0, behavior:'instant'}); }, [page]);

  // Sync back/forward browser buttons
  useEffect(() => {
    const onPop = () => setPage(pageFromHash());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const onNav = (id) => {
    setPage(id);
    const hash = PAGE_TO_HASH[id];
    const url = hash ? '/#' + hash : '/';
    history.pushState({ page: id }, '', url);
  };

  return (
    <div>
      <CursorGrid />
      <Header active={page} onNav={onNav} />
      <main className="container">
        {page === 'home' && (
          <>
            <Hero onNav={onNav} />
            <Work />
            <Newsletter />
          </>
        )}
        {page === 'work'        && <Work />}
        {page === 'youtube'     && <YouTubeFeed />}
        {page === 'linkedin'    && <LinkedInFeed />}
        {page === 'education'   && <Education onOpen={setOpenProj} />}
        {page === 'about'       && <About />}
        {page === 'contact'     && <Contact />}
        {page === 'tailor'      && <JobTailor />}
        {page === 'scheduler'   && <Scheduler />}
        {page === 'journey'     && <Journey />}
      </main>
      <Footer />
      <ProjectModal p={openProj} onClose={()=>setOpenProj(null)} />
    </div>
  );
}

export { App };
export default App;
