/* global React, ReactDOM, Header, Footer, Hero, StatStrip, LiveStrip, Work, Education, Hobbies, About, Contact, ProjectModal, YouTubeFeed, LinkedInFeed */
const { useState, useEffect } = React;

function App() {
  const [page, setPage] = useState('home');
  const [openProj, setOpenProj] = useState(null);

  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, [page, openProj]);

  useEffect(() => { window.scrollTo({top:0, behavior:'instant'}); }, [page]);

  const onNav = (id) => setPage(id);

  return (
    <div>
      <Header active={page} onNav={onNav} />
      <LiveStrip />
      <main className="container">
        {page === 'home' && (
          <>
            <Hero onNav={onNav} />
            <StatStrip />
            <Work onOpen={setOpenProj} />
            <YouTubeFeed />
            <LinkedInFeed />
          </>
        )}
        {page === 'work'        && <Work onOpen={setOpenProj} />}
        {page === 'youtube'     && <YouTubeFeed />}
        {page === 'linkedin'    && <LinkedInFeed />}
        {page === 'education'   && <Education onOpen={setOpenProj} />}
        {page === 'hobbies'     && <Hobbies />}
        {page === 'about'       && <About />}
        {page === 'contact'     && <Contact />}
      </main>
      <Footer />
      <ProjectModal p={openProj} onClose={()=>setOpenProj(null)} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
