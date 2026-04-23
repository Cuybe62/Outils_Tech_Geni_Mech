"use client";

import { useEffect, useRef } from "react";
import { initSinBarsSimulator } from "./initSinBarsSimulator";

const simulatorMarkup = `
<div class="wrap">
  <div class="app">
    <aside class="panel pad">
      <div class="title">SIMULATEUR BARRE SINUS V4</div>
      <div class="subtitle">Métrologie · Mesure d’angle</div>
      <div class="field"><label>Pièce</label><select id="pieceSelect"></select></div>
      <div class="field"><label>Face sélectionnée</label><select id="faceSelect"></select></div>
      <div class="field"><label>Mode</label><select id="modeSelect"><option value="training">Mode entraînement</option><option value="inspection">Mode inspection</option></select></div>
      <div class="field"><label>Longueur barre sinus</label><select id="barLength"><option value="5">5.000 in</option><option value="10">10.000 in</option></select></div>
      <div class="field"><label>Orientation pièce: <span id="rotLabel">0.0°</span></label><input id="pieceRotation" type="range" min="-180" max="180" step="0.1" value="0"></div>
      <div class="field"><label>Rapporteur visuel: <span id="protLabel">0.0°</span></label><input id="protractorEstimate" type="range" min="0" max="90" step="0.1" value="0"><div class="small">Tu règles l’aiguille pour estimer l’angle observé.</div></div>
      <div class="field"><label>Lecture vraie de la face</label><div id="leftTrueAngle" class="badge">—</div></div>
      <div class="field"><label>Hauteur théorique</label><div id="leftTheoretical" class="badge">0.0000 in</div></div>
      <div class="field"><label>Face rapide</label><div class="face-buttons" id="faceButtons"></div></div>
    </aside>

    <main class="scene-panel">
      <div class="toolbar">
        <div class="stepbar panel">
          <div>1. Rapporteur</div><div>2. Positionnement</div><div>3. Réglage cales</div><div class="active">4. Inspection</div>
        </div>
        <div class="mode-switch">
          <button id="trainingBtn" class="active">Mode entraînement</button>
          <button id="inspectionBtn">Mode inspection</button>
          <button id="newCaseBtn">Nouveau cas</button>
        </div>
      </div>
      <div class="hint" id="hintBox">Réglez la hauteur des cales pour que la face sélectionnée soit horizontale. Utilisez le trusquin et le comparateur pour vérifier la planéité.</div>
      <canvas id="scene" width="1200" height="700"></canvas>
      <div class="bottom-stats panel pad">
        <div class="stat"><div class="k">Hauteur actuelle (cales)</div><div class="v" id="actualHeightStat">0.0000 in</div></div>
        <div class="stat"><div class="k">Hauteur théorique</div><div class="v" id="theoreticalHeightStat">0.0000 in</div></div>
        <div class="stat"><div class="k">Écart hauteur</div><div class="v" id="heightErrorStat">0.0000 in</div></div>
        <div class="stat"><div class="k">Écart angulaire</div><div class="v" id="angleErrorStat">0.000°</div></div>
      </div>
      <div class="middle-controls panel pad">
        <div class="subpanel">
          <div class="title" style="font-size:1rem">Positionnement</div>
          <div class="field"><label>Rotation pièce fine</label><button id="snapFaceBtn">Aligner automatiquement la face</button></div>
          <div class="field"><label>Trusquin X: <span id="gageXLabel">2.500 in</span></label><input id="gageX" type="range" min="-1" max="12" step="0.01" value="2.5"></div>
          <div class="field"><label>Trusquin Y: <span id="gageYLabel">3.000 in</span></label><input id="gageY" type="range" min="0" max="6" step="0.001" value="3"></div>
          <div class="field"><div style="display:flex;gap:8px;flex-wrap:wrap"><button id="zeroBtn" class="success">Mettre à zéro</button><button id="clearZeroBtn">Effacer zéro</button></div></div>
        </div>
        <div class="subpanel">
          <div class="title" style="font-size:1rem">Jeu de cales impériales</div>
          <div class="small">Clique une cale pour l’ajouter. Clique une cale verte pour la retirer.</div>
          <div class="stack-grid" id="blockGrid" style="margin-top:10px"></div>
          <div class="field"><label>Hauteur des cales (empilage)</label><div class="selected-stack" id="selectedStack"></div></div>
          <div class="field"><label>Entrée manuelle</label><input id="manualHeight" type="number" step="0.0001" placeholder="Ex: 2.8670"></div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><button id="autoSuggestionBtn">Suggestion auto</button><button id="clearBlocksBtn" class="danger">Effacer tout</button></div>
        </div>
        <div class="subpanel">
          <div class="title" style="font-size:1rem">Trusquin & comparateur</div>
          <div style="display:flex;justify-content:center;margin-top:8px"><canvas id="dialCanvas" width="220" height="220" style="width:220px;height:220px;background:transparent;border:none"></canvas></div>
          <div class="dial-value" id="dialValue">+0.0000 in</div>
          <div class="status">
            <div class="row"><span>Contact</span><strong id="contactValue">Non</strong></div>
            <div class="row"><span>Tendance</span><strong id="trendValue">—</strong></div>
            <div class="row"><span>Variation max</span><strong id="maxVarValue">0.0000 in</strong></div>
            <div class="row"><span>Variation min</span><strong id="minVarValue">0.0000 in</strong></div>
            <div class="row"><span>Variation totale</span><strong id="totalVarValue">0.0000 in</strong></div>
            <div class="row"><span>Évaluation</span><strong id="evalValue">—</strong></div>
          </div>
          <div class="legend-note">La pièce ne peut pas traverser la barre sinus. Le solveur la projette toujours au-dessus de la surface de support.</div>
        </div>
      </div>
    </main>

    <aside class="panel pad">
      <div class="title">Lecture atelier</div>
      <div class="subtitle">Infos utiles pendant l’inspection</div>
      <div class="status">
        <div class="row"><span>Face active</span><strong id="faceNameInfo">—</strong></div>
        <div class="row"><span>Angle cible</span><strong id="targetAngleInfo">—</strong></div>
        <div class="row"><span>Lecture rapporteur</span><strong id="protractorInfo">0.0°</strong></div>
        <div class="row"><span>Zéro comparateur</span><strong id="zeroInfo">Non défini</strong></div>
        <div class="row"><span>Face réellement touchée</span><strong id="hitFaceInfo">—</strong></div>
      </div>
      <div style="margin-top:16px"><div class="title" style="font-size:1rem">État</div><div id="statusBadge" class="badge warn" style="margin-top:8px">Prêt</div></div>
      <div style="margin-top:16px"><div class="title" style="font-size:1rem">Rappel</div><div class="small" style="line-height:1.5">1. Choisis une face.<br>2. Estime l’angle au rapporteur.<br>3. Ajuste les cales.<br>4. Mets le comparateur à zéro.<br>5. Balaye la face avec le trusquin.<br>6. Si la lecture varie, la face n’est pas plane par rapport à l’horizontale.</div></div>
    </aside>
  </div>
</div>`;

const simulatorStyles = `
.sinbars-root{font-family:Inter,Segoe UI,Arial,sans-serif;background:linear-gradient(180deg,#070b14,#0b1220 30%,#0b1220);color:#f1f5f9;padding:6px;border-radius:12px;height:calc(100vh - 230px);overflow:hidden}
.sinbars-root *{box-sizing:border-box}
.sinbars-root .wrap{max-width:1700px;height:100%;margin:0 auto;padding:8px}
.sinbars-root .app{display:grid;grid-template-columns:250px 1fr 250px;gap:8px;height:100%}
.sinbars-root .panel{background:linear-gradient(180deg,#121a2a,#182235);border:1px solid #263247;border-radius:14px;box-shadow:0 8px 20px rgba(0,0,0,.24)}
.sinbars-root .panel.pad{padding:10px;overflow:auto;min-height:0}
.sinbars-root .title{font-size:.95rem;font-weight:700;margin-bottom:4px}
.sinbars-root .subtitle{color:#94a3b8;font-size:.8rem;margin-bottom:8px}
.sinbars-root .stepbar{display:grid;grid-template-columns:repeat(4,1fr);overflow:hidden;border-radius:12px;border:1px solid #263247;background:#0f1727}
.sinbars-root .stepbar div{padding:8px 6px;text-align:center;color:#cbd5e1;border-right:1px solid #263247;font-weight:600;font-size:.78rem}
.sinbars-root .stepbar div:last-child{border-right:none}
.sinbars-root .stepbar .active{background:rgba(124,58,237,.18);color:#c4b5fd}
.sinbars-root .toolbar{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px}
.sinbars-root .mode-switch{display:flex;gap:6px;flex-wrap:wrap}
.sinbars-root button,.sinbars-root select,.sinbars-root input{font:inherit}
.sinbars-root button{background:#1d2940;color:#f1f5f9;border:1px solid #334155;border-radius:8px;padding:7px 8px;cursor:pointer;font-size:.8rem}
.sinbars-root button.success{background:#166534;border-color:#15803d}
.sinbars-root button.danger{background:#7f1d1d;border-color:#b91c1c}
.sinbars-root button.active{background:linear-gradient(180deg,#7c3aed,#6d28d9);border-color:#8b5cf6}
.sinbars-root .field{display:grid;gap:4px;margin-top:7px}
.sinbars-root .field label{font-size:.76rem;color:#cbd5e1;font-weight:600}
.sinbars-root input,.sinbars-root select{background:#0f1727;color:#f1f5f9;border:1px solid #263247;border-radius:8px;padding:7px 8px;width:100%;font-size:.8rem}
.sinbars-root input[type=range]{padding:0;accent-color:#8b5cf6}
.sinbars-root .small{font-size:.72rem;color:#94a3b8}
.sinbars-root .status{display:grid;gap:5px}
.sinbars-root .status .row{display:flex;justify-content:space-between;gap:8px;border-bottom:1px solid rgba(148,163,184,.12);padding:4px 0;font-size:.78rem}
.sinbars-root .badge{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:6px 10px;border:1px solid #263247;background:#0f1727;font-size:.78rem}
.sinbars-root .good{color:#86efac;border-color:#166534;background:rgba(34,197,94,.08)}
.sinbars-root .warn{color:#fcd34d;border-color:#92400e;background:rgba(245,158,11,.08)}
.sinbars-root .bad{color:#fca5a5;border-color:#7f1d1d;background:rgba(239,68,68,.08)}
.sinbars-root .scene-panel{display:grid;grid-template-rows:auto auto minmax(220px,38vh) auto auto;gap:8px;min-height:0}
.sinbars-root .hint{background:rgba(124,58,237,.12);border:1px solid rgba(129,140,248,.35);color:#dbeafe;padding:8px 10px;border-radius:10px;font-size:.78rem}
.sinbars-root canvas#scene{width:100%;height:min(38vh,330px);display:block;border-radius:12px;background:#d8dbe1;border:1px solid #bfc5d0}
.sinbars-root .bottom-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
.sinbars-root .stat{background:rgba(2,6,23,.35);border:1px solid #263247;border-radius:10px;padding:8px;text-align:center}
.sinbars-root .stat .k{color:#94a3b8;font-size:.7rem;margin-bottom:4px}
.sinbars-root .stat .v{font-weight:700;font-size:.85rem}
.sinbars-root .middle-controls{display:grid;grid-template-columns:220px 1fr 200px;gap:6px;min-height:0}
.sinbars-root .subpanel{background:linear-gradient(180deg,#111827,#101827);border:1px solid #263247;border-radius:10px;padding:8px;overflow:auto;min-height:0}
.sinbars-root .stack-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:6px}
.sinbars-root .stack-chip{padding:7px 6px;text-align:center;background:#d1d5db;color:#111827;border-radius:7px;border:1px solid #9ca3af;cursor:pointer;font-weight:600;font-size:.72rem}
.sinbars-root .selected-stack{display:flex;gap:6px;flex-wrap:wrap;align-items:center;min-height:32px}
.sinbars-root .sel{padding:6px 8px;border-radius:7px;background:#14532d;border:1px solid #15803d;cursor:pointer;font-size:.72rem}
.sinbars-root .dial-value{font-size:1.3rem;font-weight:800;text-align:center;color:#4ade80;margin:6px 0 4px}
.sinbars-root .legend-note{font-size:.7rem;color:#94a3b8;margin-top:6px}
.sinbars-root .face-buttons{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
.sinbars-root #dialCanvas{width:170px !important;height:170px !important}
@media (max-width:1400px){.sinbars-root{height:auto;max-height:none;overflow:visible}.sinbars-root .app{grid-template-columns:1fr;height:auto}.sinbars-root .middle-controls{grid-template-columns:1fr}.sinbars-root .stack-grid{grid-template-columns:repeat(5,1fr)}.sinbars-root .bottom-stats{grid-template-columns:repeat(2,1fr)}.sinbars-root canvas#scene{height:320px}}
`;

export default function SinBarsSimulator() {
  const rootRef = useRef(null);

  useEffect(() => {
    if (!rootRef.current) return;
    const dispose = initSinBarsSimulator(rootRef.current);
    return () => {
      if (typeof dispose === "function") dispose();
    };
  }, []);

  return (
    <div>
      <style jsx>{simulatorStyles}</style>
      <div ref={rootRef} className="sinbars-root" dangerouslySetInnerHTML={{ __html: simulatorMarkup }} />
    </div>
  );
}
