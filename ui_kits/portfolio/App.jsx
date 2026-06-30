/* global React, ReactDOM, Header, Footer, Hero, StatStrip, Work, Education, Culinary, Photography, About, Contact, Book, ProjectModal, MyLogs */
const { useState, useEffect } = React;

const PAGES = new Set(['home','work','education','culinary','photography','about','contact','mylogs']);

function pageFromHash() {
  const h = (window.location.hash || '').replace(/^#\/?/, '').toLowerCase();
  return PAGES.has(h) ? h : 'home';
}

function App() {
  const [page, setPage] = useState(pageFromHash);
  const [openProj, setOpenProj] = useState(null);

  useEffect(() => {
    const handler = () => setPage(pageFromHash());
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, [page, openProj]);

  useEffect(() => { window.scrollTo({top:0, behavior:'instant'}); }, [page]);

  const onNav = (id) => {
    if (id === 'home') {
      history.replaceState(null, '', window.location.pathname);
    } else {
      window.location.hash = id;
    }
    setPage(id);
  };

  return (
    <div>
      <Header active={page} onNav={onNav} />
      <main className="container">
        {page === 'home' && (
          <>
            <Hero onNav={onNav} />
            <StatStrip />
            <Work onOpen={setOpenProj} />
          </>
        )}
        {page === 'work' && <Work onOpen={setOpenProj} />}
        {page === 'education' && <Education onOpen={setOpenProj} />}
        {page === 'culinary' && <Culinary />}
        {page === 'photography' && <Photography />}
        {page === 'about' && <About />}
        {page === 'contact' && <Contact />}
        {page === 'mylogs' && <MyLogs />}
      </main>
      <Footer />
      <ProjectModal p={openProj} onClose={()=>setOpenProj(null)} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
