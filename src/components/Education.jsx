import React from 'react';

const TRANSCRIPT = [
  { term: '2019 Spring', items: [
    { code: 'IS 601', name: 'Web Systems Development', cred: 3, grade: 'A' },
    { code: 'IS 661', name: 'User Experience Design', cred: 3, grade: 'A' },
    { code: 'IS 663', name: 'Systems Analysis & Design', cred: 3, grade: 'B+' },
  ]},
  { term: '2019 Fall', items: [
    { code: 'CS 675', name: 'Machine Learning', cred: 3, grade: 'B+' },
    { code: 'IS 631', name: 'Enterprise Database Management', cred: 3, grade: 'A' },
    { code: 'IS 665', name: 'Data Analytics for Information Systems', cred: 3, grade: 'A' },
  ]},
  { term: '2020 Spring', items: [
    { code: 'CS 602', name: 'Java Programming', cred: 3, grade: 'B+' },
    { code: 'IS 684', name: 'Business Process Innovation', cred: 3, grade: 'B' },
    { code: 'IS 688', name: 'Web Mining', cred: 3, grade: 'A' },
  ]},
  { term: '2020 Summer', items: [
    { code: 'IS 590', name: 'Graduate Co-Op Work Experience I', cred: 1, grade: 'S' },
  ]},
  { term: '2020 Fall', items: [
    { code: 'IS 591', name: 'Graduate Co-Op Work Experience II', cred: 1, grade: 'S' },
    { code: 'IS 677', name: 'Information System Principles', cred: 3, grade: 'C+' },
  ]},
];

// One ecosystem: the Operational Intelligence Platform.
// Each NJIT subject contributes one component to the platform.
const PLATFORM_PILLARS = [
  { id:'P1', layer:'Year 1 · Backbone', from:'CS 602 Java Programming',
    name:'Distributed Job Processing Platform',
    pitch:'Backend platform that accepts jobs — CSV imports, image processing, report generation, notifications — places them on queues, and processes them asynchronously with retries, dead-letter queues, and worker orchestration.',
    stack:['Java 21','Spring Boot','PostgreSQL','Redis','AWS SQS','EC2'],
    bullet:'Built a distributed asynchronous job-processing platform handling retries, dead-letter queues, and worker orchestration to improve throughput and resilience.',
    signal:'Backend architecture · reliability · concurrency',
    pri:1,
  },
  { id:'P2', layer:'Year 1 · Backbone', from:'IS 631 Enterprise Database Management',
    name:'Hot / Warm / Cold Data Tiering Engine',
    pitch:'Lifecycle engine that automatically moves records by access frequency — hot rows stay in Postgres partitions, warm rows move to compressed tables, cold rows archive to S3 — while keeping a unified analytics query layer.',
    stack:['PostgreSQL partitioning','S3 archive','Java workers','Analytics query layer'],
    bullet:'Designed lifecycle-based data tiering architecture that reduced operational query load while preserving long-term analytical access.',
    signal:'Database design · scale · enterprise thinking',
    pri:2,
  },
  { id:'P3', layer:'Year 2 · Intelligence', from:'CS 675 Machine Learning',
    name:'Supply Chain Disruption Predictor',
    pitch:'Predicts shipment delays, inventory shortages, and route anomalies. Trains on the operational and logistics features flowing in from the job platform; outputs ranked risk events that flow into the dashboard.',
    stack:['Python','scikit-learn','Pandas','Feature store'],
    bullet:'Developed predictive models using operational and logistics features to forecast disruptions and improve planning accuracy.',
    signal:'Applied ML with business relevance',
    pri:3,
  },
  { id:'P4', layer:'Year 2 · Intelligence', from:'IS 688 Web Mining',
    name:'Market Signal Intelligence Engine',
    pitch:'Mines job postings, company announcements, and market movement. Surfaces external shocks — a competitor opening a warehouse, a port strike, a hiring freeze — and feeds them as features into the disruption predictor.',
    stack:['Python','Scrapy','BM25 + dense retrieval','Postgres'],
    bullet:'Built a web-mining pipeline that ingests external signals and joins them to internal operational features for richer forecasting.',
    signal:'Web mining · analytics · product thinking',
    pri:4,
  },
  { id:'P5', layer:'Year 2 · Intelligence', from:'IS 665 Data Analytics + IS 661 UX Design',
    name:'Executive Decision Intelligence Dashboard',
    pitch:'Not just dashboards — dashboards that explain why metrics moved. Drill from a delayed-shipment KPI down to the model feature, the originating job, and the upstream web signal that flagged the risk.',
    stack:['React','TypeScript','Grafana / custom charts','Causal narratives'],
    bullet:'Shipped an end-to-end decision dashboard that pairs metric movement with causal explanation drawn from upstream platform telemetry.',
    signal:'End-to-end engineering and product sense',
    pri:5,
  },
];

// Supporting coursework — context, not flagship.
const SUPPORTING = [
  { code:'IS 601', name:'Web Systems Development',  role:'Web tier scaffolding for the dashboard.' },
  { code:'IS 663', name:'Systems Analysis & Design', role:'C4 + capacity model for the platform.' },
  { code:'IS 684', name:'Business Process Innovation', role:'Mapped the warehouse processes the platform automates.' },
  { code:'IS 677', name:'Information System Principles', role:'Audit, change-control, governance layer.' },
  { code:'IS 590', name:'Graduate Co-Op I',  role:'First production rollout to a regional logistics partner.' },
  { code:'IS 591', name:'Graduate Co-Op II', role:'Second co-op — operational tuning + customer #2.' },
];

function Education({ onOpen }) {
  return (
    <section id="education">
      <header className="section-head">
        <span className="eyebrow">EDUCATION · NJIT 2019–2020 · M.S. INFORMATION SYSTEMS</span>
        <h2 className="section-title">
          One ecosystem, not five school projects.
        </h2>
        <p className="section-lede">
          My coursework is packaged as a single evolving product —
          the <strong>Operational Intelligence Platform</strong>, aimed at
          mid-sized warehouses, regional logistics firms, distributors, and food
          operations. Year 1 builds the technical backbone. Year 2 turns it into
          business intelligence. Every NJIT subject contributes one component.
        </p>
      </header>

      {/* Architecture flow */}
      <div style={{padding:'var(--sp-6)',background:'var(--bg-elev)',border:'1px solid var(--border)',borderRadius:12,marginBottom:'var(--sp-10)'}}>
        <div className="eyebrow" style={{marginBottom:'var(--sp-4)'}}>Architecture flow</div>
        <div style={{display:'flex',alignItems:'center',gap:'var(--sp-3)',flexWrap:'wrap',fontFamily:'var(--font-mono)',fontSize:13,color:'var(--fg-2)'}}>
          <span className="tag">backend ingests operational data</span>
          <span style={{color:'var(--term-700)'}}>→</span>
          <span className="tag">tiering manages storage lifecycle</span>
          <span style={{color:'var(--term-700)'}}>→</span>
          <span className="tag">ML predicts disruptions</span>
          <span style={{color:'var(--term-700)'}}>→</span>
          <span className="tag">web mining adds external signals</span>
          <span style={{color:'var(--term-700)'}}>→</span>
          <span className="tag">dashboard explains operational performance</span>
        </div>
        <p className="muted small" style={{marginTop:'var(--sp-4)',maxWidth:680}}>
          Target customers: regional logistics firms, warehouses, distributors,
          food operations. Solves delay prediction, inventory anomalies, labor
          bottlenecks, and operational reporting — closer to a real business
          than five isolated school projects.
        </p>
      </div>

      {/* Year 1 */}
      <div className="eyebrow" style={{marginBottom:'var(--sp-4)'}}>Year 1 — Build the technical backbone</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(440px,1fr))',gap:'var(--sp-4)',marginBottom:'var(--sp-10)'}}>
        {PLATFORM_PILLARS.filter(p=>p.layer.startsWith('Year 1')).map(p => (
          <PillarCard key={p.id} p={p} onOpen={onOpen} />
        ))}
      </div>

      {/* Year 2 */}
      <div className="eyebrow" style={{marginBottom:'var(--sp-4)'}}>Year 2 — Turn backend into business intelligence</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(440px,1fr))',gap:'var(--sp-4)',marginBottom:'var(--sp-10)'}}>
        {PLATFORM_PILLARS.filter(p=>p.layer.startsWith('Year 2')).map(p => (
          <PillarCard key={p.id} p={p} onOpen={onOpen} />
        ))}
      </div>

      {/* Top 5 callout */}
      <div style={{padding:'var(--sp-6)',border:'1px solid var(--border)',borderRadius:12,marginBottom:'var(--sp-10)'}}>
        <div className="eyebrow" style={{marginBottom:'var(--sp-4)'}}>Top 5 to lead with for Microsoft / Amazon / JPMorgan</div>
        <ol style={{margin:0,paddingLeft:18,display:'grid',gap:'var(--sp-2)',fontSize:14,color:'var(--fg-1)'}}>
          {PLATFORM_PILLARS.slice().sort((a,b)=>a.pri-b.pri).map(p => (
            <li key={p.id}>
              <strong>{p.name}</strong> <span className="muted">— {p.signal}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Supporting coursework */}
      <div className="eyebrow" style={{marginBottom:'var(--sp-4)'}}>Supporting coursework — the connective tissue</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'var(--sp-3)',marginBottom:'var(--sp-10)'}}>
        {SUPPORTING.map(s => (
          <div key={s.code} style={{padding:'var(--sp-4)',border:'1px solid var(--border)',borderRadius:8,background:'var(--bg-elev)'}}>
            <div className="mono small" style={{color:'var(--term-700)'}}>{s.code} · {s.name}</div>
            <div style={{fontSize:13,color:'var(--fg-2)',marginTop:'var(--sp-2)'}}>{s.role}</div>
          </div>
        ))}
      </div>

      {/* Transcript ledger */}
      <details style={{border:'1px solid var(--border)',borderRadius:8,padding:'var(--sp-4) var(--sp-5)'}}>
        <summary style={{cursor:'pointer',fontFamily:'var(--font-mono)',fontSize:12,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--fg-2)'}}>
          Full transcript ledger — 32 credits · GPA 3.60
        </summary>
        <div style={{marginTop:'var(--sp-4)',display:'grid',gap:'var(--sp-4)'}}>
          {TRANSCRIPT.map(block => (
            <div key={block.term}>
              <div className="eyebrow" style={{marginBottom:'var(--sp-2)'}}>{block.term}</div>
              <table style={{width:'100%',fontSize:13,borderCollapse:'collapse',fontFamily:'var(--font-mono)'}}>
                <tbody>
                  {block.items.map(it => (
                    <tr key={it.code} style={{borderTop:'1px solid var(--border)'}}>
                      <td style={{padding:'6px 8px',color:'var(--term-700)'}}>{it.code}</td>
                      <td style={{padding:'6px 8px',color:'var(--fg-1)'}}>{it.name}</td>
                      <td style={{padding:'6px 8px',color:'var(--fg-2)',textAlign:'right'}}>{it.cred} cr</td>
                      <td style={{padding:'6px 8px',color:'var(--fg-1)',textAlign:'right',width:60}}>{it.grade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </details>

      <p className="muted small mono" style={{marginTop:'var(--sp-6)'}}>
        Source: NJIT Office of the Registrar · transcript issued 12-JAN-2021
      </p>
    </section>
  );
}

function PillarCard({ p, onOpen }) {
  return (
    <a className="proj" href="#" style={{padding:'var(--sp-6)'}}
       onClick={(e)=>{ e.preventDefault();
         onOpen({
           id: p.id,
           eyebrow: `${p.layer} · from ${p.from}`,
           title: p.name,
           desc: p.pitch + '\n\nResume bullet — ' + p.bullet + '\n\nSignal — ' + p.signal,
           tags: p.stack,
           status: 'shipping',
           repo: null,
         });
       }}>
      <div className="proj-meta">
        <span className="eyebrow">{p.id} · from {p.from}</span>
        <span className="pill pill-live">● Platform pillar</span>
      </div>
      <h3 className="proj-title" style={{fontSize:20}}>
        {p.name}
        <span className="proj-arrow">→</span>
      </h3>
      <p className="proj-desc" style={{fontSize:13.5}}>{p.pitch}</p>
      <div className="proj-tags" style={{marginTop:'var(--sp-3)'}}>
        {p.stack.slice(0,6).map(t => <span key={t} className="tag">{t}</span>)}
      </div>
      <div style={{marginTop:'var(--sp-3)',paddingTop:'var(--sp-3)',borderTop:'1px dashed var(--border)',fontSize:12,color:'var(--fg-2)',lineHeight:1.55}}>
        <strong style={{color:'var(--fg-1)'}}>Resume bullet —</strong> {p.bullet}
      </div>
    </a>
  );
}

export { Education };
