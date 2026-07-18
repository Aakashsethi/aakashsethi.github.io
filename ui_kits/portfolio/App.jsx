/* global React, ReactDOM, Header, Footer, Hero, StatStrip, LiveStrip, Work, Education, About, Contact, ProjectModal, YouTubeFeed, LinkedInFeed, Newsletter, TrustBar, Problems */
const { useState, useEffect } = React;

// Maps internal page id → URL hash fragment
const PAGE_TO_HASH = {
  home:      '',
  work:      'work',
  youtube:   'youtube',
  linkedin:  'mylogs',
  education: 'education',
  about:     'about',
  contact:   'contact',
};

// Reverse: hash fragment → internal page id
const HASH_TO_PAGE = Object.fromEntries(
  Object.entries(PAGE_TO_HASH).map(([k, v]) => [v, k])
);

function pageFromHash() {
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
      <Header active={page} onNav={onNav} />
      <LiveStrip />
      <main className="container">
        {page === 'home' && (
          <>
            <Hero onNav={onNav} />
            <StatStrip />
            <TrustBar />
            <Problems />
            <Work />
            <YouTubeFeed />
            <LinkedInFeed />
            <Newsletter />
          </>
        )}
        {page === 'work'        && <Work />}
        {page === 'youtube'     && <YouTubeFeed />}
        {page === 'linkedin'    && <LinkedInFeed />}
        {page === 'education'   && <Education onOpen={setOpenProj} />}
        {page === 'about'       && <About />}
        {page === 'contact'     && <Contact />}
      </main>
      <Footer />
      <ProjectModal p={openProj} onClose={()=>setOpenProj(null)} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
