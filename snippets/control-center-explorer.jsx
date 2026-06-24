/*
 * Control Center Explorer — embeds the canonical v13 Atlas HTML mockup
 * (OmniScape_v13_Atlas.html) in an iframe and maps capabilities to UI
 * locations in the reading panel. Tab sync via postMessage.
 */

const PHASES = [
  {
    id: 'layout',
    name: 'Layout',
    q: 'Where?',
    cls: 'os-phase-layout',
    kicker: 'Tab 1 · the footprint',
    title: 'Decide where the settlement lives',
    desc: 'Layout sets the silhouette — pattern, size, districts, and the zones every later layer inherits. It is the first read from the map view.',
    controls: [
      { n: 'Pattern strip', loc: 'Layout · top', d: 'Radial, Voronoi, Perlin, Axial, or Organic — the big shape of the place.' },
      { n: 'Settlement size & Num Nodes', loc: 'Layout · Settlement', d: 'Radius in centimetres and how many landmark nodes the pattern places.' },
      { n: 'Districts & Zones', loc: 'Layout · Zones table', d: 'Macro regions and weighted district tags (market, sacred, civic) that bias spawn.', v3: true },
      { n: 'Volumes & Anchors', loc: 'Canvas · edge docks', d: 'Inclusion / exclusion regions and fixed nodes you place by hand.' },
      { n: 'Atlas', loc: 'Canvas · fold-corner', d: 'Import a real place by name, file, or screenshot as the layout skeleton.', v3: true },
    ],
  },
  {
    id: 'build',
    name: 'Build',
    q: 'What?',
    cls: 'os-phase-build',
    kicker: 'Tab 2 · the fabric',
    title: 'Bring your own buildings',
    desc: 'Build is where your art lives. Assign meshes or Blueprints per tier; OmniScape places them with hand-built rhythm. Presets store the numbers — you bring the kit.',
    controls: [
      { n: 'Large / Medium / Small / Sprawl', loc: 'Build · tier tabs', d: 'Large is one landmark per node; medium and small fill the fabric and edges.' },
      { n: 'Asset slots (Mesh · Blueprint)', loc: 'Build · asset cards', d: 'Drop a static mesh for fast instancing or a Blueprint when you need logic.' },
      { n: 'Tier scale & per-node max', loc: 'Build · tier strip', d: 'Uniform size and how dense each node gets.' },
      { n: 'Cluster vs Roadside', loc: 'Build · placement', d: 'Rings around nodes, or plots that face and line the roads.' },
      { n: 'Edge Density (sprawl)', loc: 'Build · Sprawl tier', d: 'Fills the gaps between clusters and roads with small buildings.' },
    ],
  },
  {
    id: 'structure',
    name: 'Structure',
    q: 'How does it connect?',
    cls: 'os-phase-structure',
    kicker: 'Tab 3 · the connective tissue',
    title: 'Connect and enclose',
    desc: 'Structure ties the settlement together — roads that read like a real network, and walls that hug irregular sites with gates and towers.',
    controls: [
      { n: 'Roads — style & terrain', loc: 'Structure · Roads', d: 'Straight, curved, or natural; follow the ground, contour steep slopes, or level.' },
      { n: 'Road hierarchy', loc: 'Structure · Roads', d: 'Arterial, Collector, and Local classes with their own width and mesh.', v3: true },
      { n: 'Walls — shape & coverage', loc: 'Structure · Walls', d: 'Hull-hugging or grand ring, full loop or ruined gaps, angular to organic.' },
      { n: 'Gates, pillars & towers', loc: 'Structure · Walls', d: 'Auto, anchored, or evenly spaced gates; towers snap to the sharpest corners.', v3: true },
      { n: 'Landscape bake', loc: 'Structure · Terrain', d: 'Paint landscape layer weights from roads, pads, and walls.', beta: true },
    ],
  },
  {
    id: 'ambient',
    name: 'Ambient',
    q: 'Does it breathe?',
    cls: 'os-phase-ambient',
    kicker: 'Tab 4 · the life',
    title: 'Make it breathe',
    desc: 'Ambient is the final pass — vegetation, rock and debris that tell a story, plus optional fauna, audio, and a clean hand-off to your own PCG graphs.',
    controls: [
      { n: 'Flora layers', loc: 'Ambient · Flora', d: 'Vegetation, Rock, and Debris layers with density and distance bands.' },
      { n: 'Fauna', loc: 'Ambient · Fauna', d: 'Creature placement with building-distance rules and a global budget.', beta: true },
      { n: 'Audio zones', loc: 'Ambient · Audio', d: 'Per-zone ambient sound with real attenuation, sampled along roads.', beta: true },
      { n: 'PCG Hand-off', loc: 'Ambient · PCG', d: 'Export nodes, roads, walls, and footprints as tagged PCG point records.', beta: true },
    ],
  },
];

const PHASE_INDEX = { layout: 0, build: 1, structure: 2, ambient: 3 };

export const ControlCenterExplorer = () => {
  const [phase, setPhase] = useState(0);
  const iframeRef = useRef(null);
  const active = PHASES[phase];

  useEffect(() => {
    const onMsg = (e) => {
      if (!e.data || e.data.type !== 'omniscape-tab') return;
      const idx = PHASE_INDEX[e.data.phase];
      if (idx != null) setPhase(idx);
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, []);

  const setPhaseRemote = (idx) => {
    setPhase(idx);
    const win = iframeRef.current && iframeRef.current.contentWindow;
    if (win) win.postMessage({ type: 'omniscape-set-tab', phase: PHASES[idx].id }, '*');
  };

  return (
    <div className="os-explorer not-prose">
      <div className="os-explorer-device">
        <div className="os-cc-frame-wrap">
          <div className="os-cc-frame-label">
            <span>Control Center v13</span>
            <span className="os-cc-frame-badge">Canonical mockup</span>
          </div>
          <iframe
            ref={iframeRef}
            src="/control-center-mockup.html?embed=1"
            title="OmniScape Control Center — interactive mockup"
            className="os-cc-frame"
            loading="lazy"
          />
        </div>
      </div>

      <div className={'os-explorer-read ' + active.cls}>
        <div className="os-xr-phasebar" role="tablist" aria-label="Workflow phases">
          {PHASES.map((p, i) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={phase === i}
              data-active={phase === i}
              className={'os-xr-phase ' + p.cls}
              onClick={() => setPhaseRemote(i)}
            >
              <span className="os-xr-num">0{i + 1}</span>
              <span className="os-xr-name">{p.name}</span>
              <span className="os-xr-q">{p.q}</span>
            </button>
          ))}
        </div>

        <div className="os-xr-body">
          <p className="os-xr-kicker">{active.kicker}</p>
          <h3 className="os-xr-title">{active.title}</h3>
          <p className="os-xr-desc">{active.desc}</p>
          <p className="os-xr-hint">Click tabs in the panel — or use the phase buttons above — to explore each layer.</p>
          <div className="os-xr-controls">
            {active.controls.map((c) => (
              <div className="os-xr-ctrl" key={c.n}>
                <span className="os-xr-ctrl-name">
                  {c.n}
                  {c.beta ? <span className="os-xr-beta">BETA</span> : null}
                  {c.v3 ? <span className="os-xr-beta">v3.0</span> : null}
                </span>
                <span className="os-xr-ctrl-loc">{c.loc}</span>
                <span className="os-xr-ctrl-desc">{c.d}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlCenterExplorer;
