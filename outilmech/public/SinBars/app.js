(() => {
  const scene = document.getElementById("scene");
  const ctx = scene.getContext("2d");
  const dialCanvas = document.getElementById("dialCanvas");
  const dctx = dialCanvas.getContext("2d");
  const $ = id => document.getElementById(id);

  const PIECES = [
    {name:"Pièce 1 - Bloc à multiples angles",points:[[-1.8,-0.8],[1.8,-0.8],[1.3,0.95],[-0.8,1.5],[-1.9,0.2]],faceLabels:["Base","Chanfrein droit","Dessus","Chanfrein gauche","Retour"]},
    {name:"Pièce 2 - Coin irrégulier",points:[[-2.1,-0.7],[1.5,-0.95],[2.0,0.15],[0.8,1.35],[-1.5,1.1],[-2.2,0.0]],faceLabels:["Base","Petit côté","Grande pente","Dessus","Flanc","Retour"]},
    {name:"Pièce 3 - 4 faces utiles",points:[[-1.8,-1.0],[1.9,-1.0],[2.1,0.2],[1.0,1.5],[-0.9,1.7],[-1.9,0.5],[-2.0,-0.1]],faceLabels:["Base","Flanc droit","Pente droite","Dessus","Pente gauche","Flanc gauche","Retour"]}
  ];
  const BLOCKS = [4.000,3.000,2.000,1.500,1.000,0.750,0.500,0.400,0.300,0.200,0.150,0.100,0.050,0.020,0.010,0.005,0.002,0.001];
  const state = {mode:"training",pieceIndex:0,faceIndex:0,barLength:5,pieceRotation:0,protractorEstimate:0,selectedBlocks:[],manualHeight:"",gageX:3.25,gageY:3.215,zeroOffset:null,maxReading:0,minReading:0,initializedStats:false};

  const rad = d => d*Math.PI/180;
  const deg = r => r*180/Math.PI;
  const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
  const fmtIn = (v,d=4)=>`${Number(v).toFixed(d)} in`;
  const fmtDeg = (v,d=3)=>`${Number(v).toFixed(d)}°`;

  function rotatePoint(p, angDeg){
    const a = rad(angDeg), c = Math.cos(a), s = Math.sin(a);
    return {x:p.x*c - p.y*s, y:p.x*s + p.y*c};
  }
  function currentPiece(){ return PIECES[state.pieceIndex]; }
  function edgeData(points,i){
    const a = points[i], b = points[(i+1)%points.length];
    const vx = b.x-a.x, vy=b.y-a.y;
    return {a,b,vx,vy,angle:deg(Math.atan2(vy,vx)),len:Math.hypot(vx,vy)};
  }
  function normalizeFaceAngle(a){
    while(a>90) a-=180;
    while(a<=-90) a+=180;
    return a;
  }
  function localPiecePoints(){ return currentPiece().points.map(([x,y])=>({x,y})); }
  function orientedPiecePoints(){ return localPiecePoints().map(p=>rotatePoint(p,state.pieceRotation)); }
  function activeRawFaceAngle(){ return edgeData(orientedPiecePoints(), state.faceIndex).angle; }
  function activeTargetAngleAbs(){ return Math.abs(normalizeFaceAngle(activeRawFaceAngle())); }
  function theoreticalHeight(){ return state.barLength * Math.sin(rad(activeTargetAngleAbs())); }
  function currentHeight(){
    if(state.selectedBlocks.length) return state.selectedBlocks.reduce((a,b)=>a+b,0);
    const m = parseFloat(state.manualHeight);
    if(!Number.isNaN(m)) return m;
    return 0;
  }
  function autoPack(target){
    let remaining = Math.round(target*10000)/10000;
    const chosen = [];
    for(const b of BLOCKS){
      while(remaining >= b - 0.00005 && chosen.length < 10){
        chosen.push(b);
        remaining = Math.round((remaining-b)*10000)/10000;
        if(Math.abs(remaining)<0.00005){remaining=0;break;}
      }
      if(remaining===0) break;
    }
    return {chosen,total:chosen.reduce((a,b)=>a+b,0),remaining};
  }
  function barAngleFromHeight(h){ return deg(Math.asin(clamp(h/state.barLength,-1,1))); }

  function supportSolveWorldPoints(){
    const raw = localPiecePoints().map(p=>rotatePoint(p,state.pieceRotation));
    const faceAngle = normalizeFaceAngle(edgeData(raw,state.faceIndex).angle);
    const h = currentHeight();
    const barAngle = barAngleFromHeight(h);
    const sign = faceAngle >= 0 ? 1 : -1;
    const carryAngle = -sign * barAngle;
    const pts = localPiecePoints().map(p=>rotatePoint(p,state.pieceRotation + carryAngle));
    const m = Math.tan(rad(carryAngle));
    let minGap = Infinity;
    for(const p of pts){
      const gap = p.y - m*p.x;
      if(gap < minGap) minGap = gap;
    }
    const translated = pts.map(p=>({x:p.x, y:p.y - minGap}));
    return {points:translated,carryAngle,barAngle};
  }

  function topSurfaceAtX(pts,x){
    let best = null;
    for(let i=0;i<pts.length;i++){
      const a=pts[i], b=pts[(i+1)%pts.length];
      const minX=Math.min(a.x,b.x), maxX=Math.max(a.x,b.x);
      if(x < minX - 1e-9 || x > maxX + 1e-9) continue;
      if(Math.abs(b.x-a.x) < 1e-9) continue;
      const t=(x-a.x)/(b.x-a.x);
      if(t < -1e-9 || t > 1+1e-9) continue;
      const y = a.y + t*(b.y-a.y);
      if(!best || y > best.y) best = {y,faceIndex:i,t,a,b};
    }
    return best;
  }

  function dialMeasurement(){
    const geom = supportSolveWorldPoints();
    const hit = topSurfaceAtX(geom.points, state.gageX);
    if(!hit) return {contact:false,reading:0,raw:0,hitFace:null,topY:null};
    const contact = state.gageY <= hit.y + 0.0005;
    const raw = contact ? (hit.y - state.gageY) : 0;
    const reading = state.zeroOffset == null ? raw : raw - state.zeroOffset;
    return {contact,reading,raw,hitFace:hit.faceIndex,topY:hit.y};
  }

  function resetSweepStats(r=0){ state.maxReading = r; state.minReading = r; state.initializedStats = true; }

  function toScene(pt,bounds){
    const padL=80, padR=280, padT=60, padB=90;
    const usableW=scene.width-padL-padR, usableH=scene.height-padT-padB;
    const scale=Math.min(usableW/Math.max(1e-6,bounds.maxX-bounds.minX), usableH/Math.max(1e-6,bounds.maxY-bounds.minY));
    return {x:padL+(pt.x-bounds.minX)*scale, y:scene.height-padB-(pt.y-bounds.minY)*scale, scale};
  }

  function drawProtractor(cx,cy,r,angle){
    ctx.save(); ctx.translate(cx,cy);
    ctx.beginPath(); ctx.arc(0,0,r,Math.PI,2*Math.PI); ctx.fillStyle="#162033"; ctx.fill(); ctx.strokeStyle="#64748b"; ctx.lineWidth=2; ctx.stroke();
    for(let a=0;a<=180;a+=2){
      const rr = a%10===0 ? r-14 : (a%5===0 ? r-10 : r-5);
      const ang = Math.PI + rad(a);
      ctx.beginPath(); ctx.moveTo(Math.cos(ang)*rr,Math.sin(ang)*rr); ctx.lineTo(Math.cos(ang)*r,Math.sin(ang)*r); ctx.strokeStyle="#cbd5e1"; ctx.lineWidth=a%10===0?2:1; ctx.stroke();
      if(a<180 && a%15===0){
        const tr=r-24;
        ctx.fillStyle="#f8fafc"; ctx.font="11px Inter, sans-serif"; ctx.textAlign="center"; ctx.textBaseline="middle";
        ctx.fillText(String(Math.round(a/2)), Math.cos(ang)*tr, Math.sin(ang)*tr);
      }
    }
    const needle = Math.PI + rad(angle*2);
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(Math.cos(needle)*(r-18), Math.sin(needle)*(r-18)); ctx.strokeStyle="#ef4444"; ctx.lineWidth=3; ctx.stroke();
    ctx.beginPath(); ctx.arc(0,0,5,0,Math.PI*2); ctx.fillStyle="#ef4444"; ctx.fill();
    ctx.restore();
  }

  function drawDial(reading){
    dctx.clearRect(0,0,dialCanvas.width,dialCanvas.height);
    const cx=110, cy=110, r=92;
    dctx.beginPath(); dctx.arc(cx,cy,r,0,Math.PI*2); dctx.fillStyle="#f8fafc"; dctx.fill(); dctx.lineWidth=4; dctx.strokeStyle="#1f2937"; dctx.stroke();
    for(let i=0;i<100;i++){
      const ang=-Math.PI/2 + i*(Math.PI*2/100);
      const outer=r-6, inner=i%10===0 ? r-20 : r-12;
      dctx.beginPath(); dctx.moveTo(cx+Math.cos(ang)*inner, cy+Math.sin(ang)*inner); dctx.lineTo(cx+Math.cos(ang)*outer, cy+Math.sin(ang)*outer); dctx.strokeStyle="#111827"; dctx.lineWidth=i%10===0?2:1; dctx.stroke();
    }
    [-20,-15,-10,-5,0,5,10,15,20].forEach(v=>{
      const frac=(v+20)/40, ang=-Math.PI*0.75 + frac*(Math.PI*1.5), rr=r-34;
      dctx.fillStyle="#111827"; dctx.font="16px Inter, sans-serif"; dctx.textAlign="center"; dctx.textBaseline="middle";
      dctx.fillText(String(v), cx+Math.cos(ang)*rr, cy+Math.sin(ang)*rr);
    });
    const clamped=clamp(reading,-0.020,0.020), frac=(clamped+0.020)/0.040, needle=-Math.PI*0.75 + frac*(Math.PI*1.5);
    dctx.beginPath(); dctx.moveTo(cx,cy); dctx.lineTo(cx+Math.cos(needle)*(r-24), cy+Math.sin(needle)*(r-24)); dctx.strokeStyle="#111827"; dctx.lineWidth=4; dctx.stroke();
    dctx.beginPath(); dctx.arc(cx,cy,6,0,Math.PI*2); dctx.fillStyle="#111827"; dctx.fill();
    dctx.fillStyle="#111827"; dctx.font="14px Inter, sans-serif"; dctx.textAlign="center"; dctx.fillText("0.0001 in", cx, cy+62);
  }

  function drawScene(){
    ctx.clearRect(0,0,scene.width,scene.height);
    const geom=supportSolveWorldPoints(), pts=geom.points, hit=dialMeasurement();
    let minX=Infinity, maxX=-Infinity, maxY=-Infinity;
    pts.forEach(p=>{ minX=Math.min(minX,p.x); maxX=Math.max(maxX,p.x); maxY=Math.max(maxY,p.y); });
    const bounds={minX:Math.min(minX-2,-1.5), maxX:Math.max(maxX+6,state.barLength+4), minY:-0.5, maxY:maxY+2.5};
    const barStart={x:0,y:0}, barEnd={x:state.barLength,y:Math.tan(rad(geom.carryAngle))*state.barLength};
    const tableY=toScene({x:0,y:-0.08},bounds).y;
    const pBar0=toScene(barStart,bounds), pBar1=toScene(barEnd,bounds);

    ctx.fillStyle="#adb2bb"; ctx.fillRect(0,tableY+8,scene.width,28);

    const thick=14, dx=pBar1.x-pBar0.x, dy=pBar1.y-pBar0.y, len=Math.hypot(dx,dy)||1, nx=-dy/len, ny=dx/len;
    ctx.beginPath(); ctx.moveTo(pBar0.x,pBar0.y); ctx.lineTo(pBar1.x,pBar1.y); ctx.lineTo(pBar1.x+nx*thick,pBar1.y+ny*thick); ctx.lineTo(pBar0.x+nx*thick,pBar0.y+ny*thick); ctx.closePath();
    const grad=ctx.createLinearGradient(pBar0.x,pBar0.y,pBar1.x,pBar1.y); grad.addColorStop(0,"#d6d8dd"); grad.addColorStop(.5,"#aeb4bc"); grad.addColorStop(1,"#8b939d");
    ctx.fillStyle=grad; ctx.fill(); ctx.strokeStyle="#5b6470"; ctx.lineWidth=2; ctx.stroke();

    const rollerR=22;
    function drawRoller(p){
      ctx.beginPath(); ctx.arc(p.x,p.y+2,rollerR,0,Math.PI*2); ctx.fillStyle="#575c66"; ctx.fill(); ctx.strokeStyle="#23272f"; ctx.lineWidth=3; ctx.stroke();
      ctx.beginPath(); ctx.arc(p.x,p.y+2,rollerR*0.65,0,Math.PI*2); ctx.fillStyle="#1f232a"; ctx.fill();
    }
    drawRoller(pBar0); drawRoller(pBar1);

    const baseW=68, baseH=34;
    ctx.fillStyle="#8f949d"; ctx.fillRect(pBar0.x-baseW/2, tableY-baseH+12, baseW, baseH); ctx.fillRect(pBar1.x-baseW/2, tableY-baseH+12, baseW, baseH);
    ctx.strokeStyle="#5b6470"; ctx.strokeRect(pBar0.x-baseW/2, tableY-baseH+12, baseW, baseH); ctx.strokeRect(pBar1.x-baseW/2, tableY-baseH+12, baseW, baseH);

    const h=currentHeight(), stackBaseX=pBar0.x-18, stackTopY=pBar0.y, stackBottomY=tableY+12;
    if(h>0.00001){
      const pixelH=stackBottomY-stackTopY, parts=state.selectedBlocks.length ? [...state.selectedBlocks] : [h];
      let cursorY=stackBottomY;
      parts.forEach((b,idx)=>{
        const frac=b/h, segH=Math.max(12,pixelH*frac);
        cursorY -= segH;
        const g=ctx.createLinearGradient(stackBaseX-42,cursorY,stackBaseX+42,cursorY+segH);
        g.addColorStop(0, idx%2===0 ? "#d9d9db" : "#2a2d33"); g.addColorStop(1, idx%2===0 ? "#a9aaae" : "#111827");
        ctx.fillStyle=g; ctx.fillRect(stackBaseX-42,cursorY,84,segH); ctx.strokeStyle="#1f2937"; ctx.strokeRect(stackBaseX-42,cursorY,84,segH);
        ctx.fillStyle=idx%2===0 ? "#111827" : "#f8fafc"; ctx.font="12px Inter,sans-serif"; ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillText(Number(b).toFixed(3), stackBaseX, cursorY+segH/2);
      });
      ctx.strokeStyle="#1f2937"; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(stackBaseX-70,stackTopY); ctx.lineTo(stackBaseX-70,stackBottomY); ctx.moveTo(stackBaseX-76,stackTopY); ctx.lineTo(stackBaseX-64,stackTopY); ctx.moveTo(stackBaseX-76,stackBottomY); ctx.lineTo(stackBaseX-64,stackBottomY); ctx.stroke();
      ctx.fillStyle="#111827"; ctx.font="bold 20px Inter,sans-serif"; ctx.fillText("H", stackBaseX-70, (stackTopY+stackBottomY)/2);
    }

    const screenPts=pts.map(p=>toScene(p,bounds));
    ctx.beginPath(); screenPts.forEach((p,i)=> i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y)); ctx.closePath();
    const pg=ctx.createLinearGradient(0,0,scene.width,scene.height); pg.addColorStop(0,"rgba(176,196,255,.75)"); pg.addColorStop(1,"rgba(122,153,233,.75)");
    ctx.fillStyle=pg; ctx.fill(); ctx.lineWidth=4; ctx.strokeStyle="#1e40af"; ctx.stroke();

    if(hit.hitFace != null){
      const a=toScene(pts[hit.hitFace],bounds), b=toScene(pts[(hit.hitFace+1)%pts.length],bounds);
      ctx.strokeStyle="#3b82f6"; ctx.lineWidth=6; ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
    }

    const gx=toScene({x:state.gageX,y:0},bounds).x, gy=toScene({x:0,y:state.gageY},bounds).y, standX=gx+210, standBaseY=tableY+10, standTopY=100;
    const sg=ctx.createLinearGradient(standX-20,standTopY,standX+20,standBaseY); sg.addColorStop(0,"#d5d7dc"); sg.addColorStop(1,"#6d727c");
    ctx.fillStyle=sg; ctx.fillRect(standX-12,standTopY,24,standBaseY-standTopY); ctx.strokeStyle="#424956"; ctx.strokeRect(standX-12,standTopY,24,standBaseY-standTopY);
    ctx.fillStyle="#2a2f38"; ctx.fillRect(standX-46,standBaseY-36,92,36); ctx.strokeStyle="#111827"; ctx.strokeRect(standX-46,standBaseY-36,92,36);

    const armY=gy;
    ctx.fillStyle="#6d727c"; ctx.fillRect(gx+40,armY-8,standX-gx-40,16); ctx.strokeStyle="#2d3340"; ctx.strokeRect(gx+40,armY-8,standX-gx-40,16);
    ctx.fillStyle="#2a2f38"; ctx.fillRect(standX-18,armY-18,36,36); ctx.strokeRect(standX-18,armY-18,36,36);
    ctx.strokeStyle="#2d3340"; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(gx+40,armY); ctx.lineTo(gx,armY); ctx.stroke();
    ctx.beginPath(); ctx.arc(gx,armY,6,0,Math.PI*2); ctx.fillStyle=hit.contact ? "#ef4444" : "#9ca3af"; ctx.fill();

    if(hit.topY != null){
      const hp=toScene({x:state.gageX,y:hit.topY},bounds);
      ctx.beginPath(); ctx.arc(hp.x,hp.y,6,0,Math.PI*2); ctx.fillStyle="#ef4444"; ctx.fill();
      ctx.setLineDash([7,6]); ctx.strokeStyle="#ef4444"; ctx.beginPath(); ctx.moveTo(gx,armY); ctx.lineTo(hp.x,hp.y); ctx.stroke(); ctx.setLineDash([]);
    }

    drawProtractor(scene.width-160,180,100,state.protractorEstimate);
    ctx.fillStyle="#1f2937"; ctx.font="14px Inter,sans-serif"; ctx.fillText("Rapporteur visuel", scene.width-225,305);
  }

  function renderBlocks(){
    const grid=$("blockGrid"); grid.innerHTML="";
    BLOCKS.forEach(v=>{
      const btn=document.createElement("button");
      btn.className="stack-chip"; btn.textContent=v.toFixed(3);
      btn.onclick=()=>{ state.selectedBlocks.push(v); state.manualHeight=""; $("manualHeight").value=""; refresh(true); };
      grid.appendChild(btn);
    });
  }
  function renderSelectedBlocks(){
    const box=$("selectedStack"); box.innerHTML="";
    if(!state.selectedBlocks.length){
      const span=document.createElement("span"); span.className="small"; span.textContent="Aucune cale sélectionnée."; box.appendChild(span); return;
    }
    state.selectedBlocks.forEach((v,i)=>{
      const el=document.createElement("div"); el.className="sel"; el.textContent=v.toFixed(3);
      el.onclick=()=>{ state.selectedBlocks.splice(i,1); refresh(true); };
      box.appendChild(el);
    });
  }
  function renderFaceButtons(){
    const box=$("faceButtons"); box.innerHTML="";
    currentPiece().faceLabels.forEach((name,i)=>{
      const b=document.createElement("button"); b.textContent=String(i+1);
      if(i===state.faceIndex) b.classList.add("active");
      b.onclick=()=>{ state.faceIndex=i; $("faceSelect").value=i; refresh(true); };
      box.appendChild(b);
    });
  }
  function populateSelectors(){
    $("pieceSelect").innerHTML = PIECES.map((p,i)=>`<option value="${i}">${p.name}</option>`).join("");
    $("pieceSelect").value = state.pieceIndex;
    $("faceSelect").innerHTML = currentPiece().faceLabels.map((n,i)=>`<option value="${i}">${n}</option>`).join("");
    $("faceSelect").value = state.faceIndex;
    renderFaceButtons();
  }
  function applyAutoSuggestion(){
    const pack=autoPack(theoreticalHeight());
    state.selectedBlocks=[...pack.chosen]; state.manualHeight=""; $("manualHeight").value=""; refresh(true);
  }

  function updateStatusUI(meas){
    const target=activeTargetAngleAbs(), theor=theoreticalHeight(), actualH=currentHeight(), angleErr=barAngleFromHeight(actualH)-target, heightErr=actualH-theor;
    $("actualHeightStat").textContent=fmtIn(actualH); $("theoreticalHeightStat").textContent=fmtIn(theor);
    $("heightErrorStat").textContent=`${heightErr>=0?"+":""}${heightErr.toFixed(4)} in`;
    $("angleErrorStat").textContent=`${angleErr>=0?"+":""}${angleErr.toFixed(3)}°`;
    $("leftTheoretical").textContent=fmtIn(theor); $("leftTrueAngle").textContent=state.mode==="inspection" ? "Masqué" : fmtDeg(target,2);
    $("faceNameInfo").textContent=currentPiece().faceLabels[state.faceIndex];
    $("targetAngleInfo").textContent=state.mode==="inspection" ? "Masqué" : fmtDeg(target,2);
    $("protractorInfo").textContent=`${state.protractorEstimate.toFixed(1)}°`;
    $("zeroInfo").textContent=state.zeroOffset==null ? "Non défini" : fmtIn(state.zeroOffset);
    $("hitFaceInfo").textContent=meas.hitFace==null ? "Aucune" : currentPiece().faceLabels[meas.hitFace];
    drawDial(meas.reading);
    $("dialValue").textContent=`${meas.reading>=0?"+":""}${meas.reading.toFixed(4)} in`;
    $("contactValue").textContent=meas.contact ? "En contact" : "Hors contact";
    let trend="Stable"; if(meas.reading>0.0002) trend="En hausse ↗"; else if(meas.reading<-0.0002) trend="En baisse ↘"; $("trendValue").textContent=trend;
    $("maxVarValue").textContent=fmtIn(state.maxReading); $("minVarValue").textContent=fmtIn(state.minReading); $("totalVarValue").textContent=fmtIn(state.maxReading-state.minReading);
    let evalTxt="Surface plane", evalClass="good";
    const spread=state.maxReading-state.minReading;
    if(!meas.contact){ evalTxt="Pas de contact"; evalClass="bad"; }
    else if(spread>0.002){ evalTxt="Variation forte"; evalClass="bad"; }
    else if(spread>0.0008){ evalTxt="Légère variation"; evalClass="warn"; }
    $("evalValue").textContent=evalTxt;
    const status=$("statusBadge"); status.className="badge "+evalClass; status.textContent=evalTxt;
    $("hintBox").textContent = state.mode==="inspection"
      ? "Mode inspection: l’angle réel est masqué. Utilise le rapporteur, les cales et le balayage du comparateur pour juger la face."
      : "Réglez la hauteur des cales pour que la face sélectionnée soit horizontale. Utilisez le trusquin et le comparateur pour vérifier la planéité.";
  }

  function refresh(resetStats=false){
    state.pieceIndex=Number($("pieceSelect").value); state.faceIndex=Number($("faceSelect").value); state.mode=$("modeSelect").value; state.barLength=Number($("barLength").value);
    state.pieceRotation=Number($("pieceRotation").value); state.protractorEstimate=Number($("protractorEstimate").value); state.manualHeight=$("manualHeight").value;
    state.gageX=Number($("gageX").value); state.gageY=Number($("gageY").value);
    $("rotLabel").textContent=`${state.pieceRotation.toFixed(1)}°`; $("protLabel").textContent=`${state.protractorEstimate.toFixed(1)}°`;
    $("gageXLabel").textContent=fmtIn(state.gageX,3); $("gageYLabel").textContent=fmtIn(state.gageY,3);
    $("trainingBtn").classList.toggle("active", state.mode==="training"); $("inspectionBtn").classList.toggle("active", state.mode==="inspection");
    populateSelectors(); renderSelectedBlocks();
    const meas=dialMeasurement();
    if(resetStats || !state.initializedStats) resetSweepStats(meas.reading);
    else { state.maxReading=Math.max(state.maxReading, meas.reading); state.minReading=Math.min(state.minReading, meas.reading); }
    updateStatusUI(meas); drawScene();
  }

  $("pieceSelect").addEventListener("change",()=>{ state.faceIndex=0; populateSelectors(); refresh(true); });
  $("faceSelect").addEventListener("change",()=>refresh(true));
  $("modeSelect").addEventListener("change",()=>refresh(true));
  $("barLength").addEventListener("change",()=>refresh(true));
  $("pieceRotation").addEventListener("input",()=>refresh(true));
  $("protractorEstimate").addEventListener("input",()=>refresh());
  $("manualHeight").addEventListener("input",()=>{ state.selectedBlocks=[]; refresh(true); });
  $("gageX").addEventListener("input",()=>refresh());
  $("gageY").addEventListener("input",()=>refresh());
  $("trainingBtn").onclick=()=>{ $("modeSelect").value="training"; refresh(true); };
  $("inspectionBtn").onclick=()=>{ $("modeSelect").value="inspection"; refresh(true); };
  $("zeroBtn").onclick=()=>{ const m=dialMeasurement(); state.zeroOffset=m.raw; resetSweepStats(0); refresh(); };
  $("clearZeroBtn").onclick=()=>{ state.zeroOffset=null; refresh(true); };
  $("autoSuggestionBtn").onclick=()=>applyAutoSuggestion();
  $("clearBlocksBtn").onclick=()=>{ state.selectedBlocks=[]; state.manualHeight=""; $("manualHeight").value=""; refresh(true); };
  $("snapFaceBtn").onclick=()=>{ const current=activeRawFaceAngle(); state.pieceRotation -= normalizeFaceAngle(current); $("pieceRotation").value=state.pieceRotation; refresh(true); };
  $("newCaseBtn").onclick=()=>{
    state.pieceIndex=Math.floor(Math.random()*PIECES.length);
    state.faceIndex=Math.floor(Math.random()*PIECES[state.pieceIndex].faceLabels.length);
    state.pieceRotation=Number((Math.random()*120-60).toFixed(1));
    state.protractorEstimate=Number((Math.random()*60).toFixed(1));
    state.selectedBlocks=[]; state.manualHeight=""; state.zeroOffset=null;
    $("manualHeight").value=""; $("pieceRotation").value=state.pieceRotation; $("protractorEstimate").value=state.protractorEstimate; $("pieceSelect").value=state.pieceIndex; populateSelectors(); $("faceSelect").value=state.faceIndex;
    refresh(true);
  };

  renderBlocks(); populateSelectors(); applyAutoSuggestion(); $("protractorEstimate").value=activeTargetAngleAbs().toFixed(1); state.protractorEstimate=Number($("protractorEstimate").value); refresh(true);
})();
