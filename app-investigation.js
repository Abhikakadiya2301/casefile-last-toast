const SCENE_EVIDENCE={body:"body",glass:"glass",desk:"text"};

// Migrate older saves where hotspot 03 collected the pocket-watch evidence.
if(state.collected.includes("desk")){
  state.collected=state.collected.filter(id=>id!=="desk");
  if(!state.collected.includes("text")) state.collected.push("text");
  saveState();
}

// The Crime Scene is intentionally image-only. Keep its evidence/state in sync
// so fresh games and older saves can still use the Evidence Board.
function syncImageOnlySceneEvidence({silent=false}={}){
  const sceneIds=["body","glass","desk"];
  const evidenceIds=["body","glass","text"];
  let changed=false;

  sceneIds.forEach(id=>{
    if(!state.sceneSeen.includes(id)){
      state.sceneSeen.push(id);
      changed=true;
    }
  });

  evidenceIds.forEach(id=>{
    if(!state.collected.includes(id)){
      state.collected.push(id);
      changed=true;
    }
  });

  // Repair room/report evidence for saves created before recent flow changes.
  state.roomsSearched.forEach(roomId=>{
    const room=DATA.rooms.find(r=>r.id===roomId);
    if(room && !state.collected.includes(room.clue)){
      state.collected.push(room.clue);
      changed=true;
    }
  });

  state.reportsRead.forEach(reportId=>{
    if(DATA.evidence[reportId] && !state.collected.includes(reportId)){
      state.collected.push(reportId);
      changed=true;
    }
  });

  if(state.roomsSearched.includes("security") && !state.collected.includes("cctv_override")){
    state.collected.push("cctv_override");
    changed=true;
  }

  if(changed){
    if(!silent && !state.activities.includes("Crime scene evidence logged from the initial examination.")){
      state.activities.unshift("Crime scene evidence logged from the initial examination.");
      state.activities=state.activities.slice(0,12);
    }
    saveState();
  }
  return changed;
}

const progressedBeyondScene=
  state.interviewed.length>0 ||
  state.reportsRead.length>0 ||
  state.roomsSearched.length>0 ||
  state.deductions.length>0;
if(progressedBeyondScene) syncImageOnlySceneEvidence({silent:true});

function renderScene(){
  const checklist=$("#sceneChecklist");
  if(!checklist) return;
  const labels={body:"Examine Adrian",glass:"Inspect whiskey glass",desk:"Open desk drawer"};
  checklist.innerHTML=Object.entries(labels).map(([id,l])=>`<div class="check-item ${state.sceneSeen.includes(id)?"done":""}"><i>${state.sceneSeen.includes(id)?"✓":""}</i><span>${l}</span></div>`).join("");
  $$("[data-scene]").forEach(btn=>btn.classList.toggle("seen",state.sceneSeen.includes(btn.dataset.scene)));
}
$$("[data-scene]").forEach(btn=>btn.onclick=()=>{
  const hotspotId=btn.dataset.scene;
  const evidenceId=SCENE_EVIDENCE[hotspotId]||hotspotId;
  if(!state.sceneSeen.includes(hotspotId)){
    state.sceneSeen.push(hotspotId); collect(evidenceId,false);
    if(state.sceneSeen.length===3) showNotification("Interviews unlocked","The initial scene is documented. Question all five suspects while forensics processes the physical evidence.");
  }
  openEvidence(evidenceId);
});

const ROOM_IMAGES={
  dining:"assets/Dinning room.png",
  billiard:"assets/Billiard Room.png",
  conservatory:"assets/moonlit_conservatory_mystery.png",
  security:"assets/Security Office.png",
  library:"assets/image-gen-6(1).png",
  guest:"assets/Mansion Lounge Mystery Crime Scene.png"
};

function renderRooms(){
  $("#roomGrid").innerHTML=DATA.rooms.map(r=>`
    <article class="room-card ${state.roomsSearched.includes(r.id)?"searched":""}">
      <img class="room-photo" src="${ROOM_IMAGES[r.id]}" alt="${r.name} investigation scene" loading="lazy" decoding="async">
      <div class="room-photo-shade"></div>
      <span class="room-number">${r.number}</span>
      <div class="room-card-content">
        <h3>${r.name}</h3>
        <p>${r.desc}</p>
        <button class="${state.roomsSearched.includes(r.id)?"ghost-btn":"primary-btn"} room-search" data-room="${r.id}">
          ${state.roomsSearched.includes(r.id)?"Review clue":"Search room"}
        </button>
      </div>
    </article>`).join("");
  $$(".room-search").forEach(btn=>btn.onclick=()=>{
    const r=DATA.rooms.find(x=>x.id===btn.dataset.room);
    if(!state.roomsSearched.includes(r.id)){
      state.roomsSearched.push(r.id);
      collect(r.clue,false);
      if(r.id==="security" && !state.collected.includes("cctv_override")){
        state.collected.push("cctv_override");
        addActivity(`Evidence collected: ${DATA.evidence.cctv_override.title}.`);
      }
      showNotification("Room searched",`${r.name}: ${DATA.evidence[r.clue].summary}`);
      if(state.roomsSearched.length===3) showNotification("Evidence board unlocked","You now have enough room evidence and forensic findings to start connecting the clues.");
    }
    openEvidence(r.clue,r.id);
    updateUI();
  });
}

function renderSuspects(){
  $("#suspectGrid").innerHTML=DATA.suspects.map(s=>`
    <article class="suspect-card">
      <div class="suspect-portrait">${s.initials}</div>
      <div class="suspect-body">
        ${state.interviewed.includes(s.id)?'<span class="interviewed-badge">INTERVIEWED</span>':""}
        <span class="role">${s.role}</span>
        <h3>${s.name}</h3>
        <p>${s.hook}</p>
        <button class="${state.interviewed.includes(s.id)?"ghost-btn":"primary-btn"} full suspect-open" data-suspect="${s.id}">
          ${state.interviewed.includes(s.id)?"Review interview":"Interview"}
        </button>
      </div>
    </article>`).join("");
  $$(".suspect-open").forEach(b=>b.onclick=()=>openInterview(b.dataset.suspect));
}
function openInterview(id){
  const s=DATA.suspects.find(x=>x.id===id);
  if(!state.interviewed.includes(id)){
    state.interviewed.push(id);
    addActivity(`Interviewed ${s.name}.`);
    if(state.interviewed.length===DATA.suspects.length) showNotification("Forensic reports ready","All five initial interviews are complete. Toxicology and latent print results are now available in Step 04.");
  }
  const canConfront=id==="victor" && state.collected.includes("access_log");
  $("#modalContent").innerHTML=`
    <p class="eyebrow">SUSPECT INTERVIEW · ${s.role.toUpperCase()}</p>
    <h3>${s.name}</h3>
    <p>${s.hook}</p>
    <div class="interview-list">
      ${s.questions.map((q,i)=>`<div><button class="question-btn" data-q="${i}">${q[0]}</button><div class="answer hidden" id="answer-${i}">${q[1]}</div></div>`).join("")}
      ${canConfront?`<div><button class="question-btn" data-confront>⚠ Confront with access log</button><div class="answer contradiction-answer hidden" id="confront-answer">${s.confrontation[1]}</div></div>`:""}
    </div>`;
  $("#modal").showModal();
  $$(".question-btn[data-q]").forEach(b=>b.onclick=()=> $(`#answer-${b.dataset.q}`).classList.toggle("hidden"));
  const c=$("[data-confront]");
  if(c)c.onclick=()=>{
    $("#confront-answer").classList.remove("hidden");
    if(!state.confrontationSeen){
      state.confrontationSeen=true;
      addActivity("Contradiction: Victor denied entering the east corridor despite his credential record.");
      showNotification("Contradiction detected","Victor's statement conflicts with the east corridor access log.");
      updateUI();
    }
  };
  updateUI();
}

function renderEvidence(filter="all"){
  const ids=state.collected.filter(id=>filter==="all"||DATA.evidence[id].type===filter);
  $("#evidenceGrid").innerHTML=ids.length?ids.map(id=>{
    const e=DATA.evidence[id];
    return `<article class="evidence-card ${e.critical?"critical":""}">
      <span class="evidence-type">${e.type}</span>
      <h4>${e.title}</h4><p>${e.summary}</p>
      <button data-evidence="${id}">Inspect →</button>
    </article>`;
  }).join(""):`<div class="empty-state">No evidence in this category yet.</div>`;
  $$("[data-evidence]").forEach(b=>b.onclick=()=>openEvidence(b.dataset.evidence));
}
$$(".filter").forEach(f=>f.onclick=()=>{
  $$(".filter").forEach(x=>x.classList.remove("active"));f.classList.add("active");renderEvidence(f.dataset.filter);
});
function openEvidence(id,roomId=null){
  const e=DATA.evidence[id];
  const room=roomId?DATA.rooms.find(r=>r.id===roomId):DATA.rooms.find(r=>r.clue===id);
  const isPhase2Review=Boolean(roomId);
  $("#modalContent").innerHTML=`
    <div class="evidence-detail ${isPhase2Review?"phase2-review":""}">
      ${isPhase2Review?"":`<div class="evidence-art">${e.icon}</div>`}
      <div>
        <p class="eyebrow">${e.type.toUpperCase()} EVIDENCE</p>
        <h3>${e.title}</h3>
        ${room?`<p class="clue-location">FOUND IN · ${room.name.toUpperCase()}</p>`:""}
        <p>${e.detail}</p>
        ${e.critical?'<span class="phase-chip">CRITICAL EVIDENCE</span>':""}
      </div>
    </div>`;
  $("#modal").showModal();
  updateUI();
}
$("#modalClose").onclick=()=>$("#modal").close();

function renderReports(){
  $("#reportGrid").innerHTML=DATA.reports.map(r=>`<article class="report-card report-image-card ${state.reportsRead.includes(r.id)?"reviewed":""}">
    <h3>${r.title}</h3>
    <img class="report-image-art" src="${r.image}" alt="${r.title}" loading="lazy" decoding="async">
    <button class="ghost-btn report-read" data-report="${r.id}">${state.reportsRead.includes(r.id)?"Reviewed":"Mark reviewed"}</button>
    <span class="report-stamp">${r.stamp}</span>
  </article>`).join("");
  document.querySelectorAll(".report-read").forEach(b=>b.onclick=()=>{
    const id=b.dataset.report;
    if(!state.reportsRead.includes(id)){
      state.reportsRead.push(id);
      collect(id,false);
      addActivity(`Reviewed report: ${DATA.reports.find(r=>r.id===id).title}.`);
      if(state.reportsRead.length===DATA.reports.length) showNotification("Mansion unlocked","Both forensic reports are reviewed. Search Blackwood Manor and test the suspects' statements against the evidence.");
      updateUI();
    }
  });
}

const THEORY_SUPPORT={
  accused:{
    victor:["access_log","cctv_override","print","text","torn_envelope","audit"]
  },
  motive:{
    embezzlement:["audit","torn_envelope","text"]
  },
  method:{
    toxin:["lab","print","medical_bag","glass"]
  }
};

function supportsTheoryPillar(group,value,evidenceIds){
  const supported=THEORY_SUPPORT[group]?.[value]||[];
  return evidenceIds.some(id=>supported.includes(id));
}

function renderBoard(){
  const usable=state.collected.filter(id=>DATA.evidence[id]);

  const accusedSelect=$("#theoryAccusedSelect");
  if(accusedSelect && accusedSelect.options.length===1){
    DATA.suspects.forEach(s=>accusedSelect.add(new Option(s.name,s.id)));
  }

  if(accusedSelect && !accusedSelect.dataset.hydrated){
    accusedSelect.value=state.caseTheory?.accused||"";
    $("#theoryMotiveSelect").value=state.caseTheory?.motive||"";
    $("#theoryMethodSelect").value=state.caseTheory?.method||"";
    accusedSelect.dataset.hydrated="true";
  }

  boardSelected=boardSelected.filter(id=>usable.includes(id)).slice(0,3);

  $("#boardEvidence").innerHTML=usable.length?usable.map((id,i)=>{
    const e=DATA.evidence[id];
    return `<button class="board-card ${boardSelected.includes(id)?"selected":""}" style="--rot:${[-1.2,.8,-.4,1.1,-.8,.5][i%6]}deg" data-board="${id}">
      <strong>${e.title}</strong>
      <small>${e.summary}</small>
      <span class="board-evidence-type">${e.type}</span>
    </button>`;
  }).join(""):`<div class="empty-state">No evidence is available yet. Continue the investigation.</div>`;

  $$(".board-card").forEach(b=>b.onclick=()=>{
    const id=b.dataset.board;
    if(boardSelected.includes(id)) boardSelected=boardSelected.filter(x=>x!==id);
    else if(boardSelected.length<3) boardSelected.push(id);
    else showNotification("Three-clue limit","Remove one clue before adding another.");
    renderBoard();
  });

  $("#boardSelection").innerHTML=[0,1,2].map(i=>boardSelected[i]
    ?`<div class="selection-slot filled"><strong>${DATA.evidence[boardSelected[i]].title}</strong><small>${DATA.evidence[boardSelected[i]].type}</small></div>`
    :`<div class="selection-slot">Select supporting evidence</div>`
  ).join("");

  const result=$("#theoryResult");
  if(state.caseTheory?.validated){
    result.className="theory-result success";
    result.innerHTML="<strong>Theory supported</strong><span>Your evidence supports the suspect, motive, and method. The timeline is unlocked.</span>";
  }else if(!result.textContent.trim()){
    result.className="theory-result";
  }
}

$("#testTheoryBtn").onclick=()=>{
  const accused=$("#theoryAccusedSelect").value;
  const motive=$("#theoryMotiveSelect").value;
  const method=$("#theoryMethodSelect").value;
  const evidence=[...boardSelected];

  if(!accused||!motive||!method||evidence.length!==3){
    showNotification("Theory incomplete","Choose a suspect, motive, method, and exactly three supporting pieces of evidence.");
    return;
  }

  const pillars={
    accused:supportsTheoryPillar("accused",accused,evidence),
    motive:supportsTheoryPillar("motive",motive,evidence),
    method:supportsTheoryPillar("method",method,evidence)
  };
  const supportedCount=Object.values(pillars).filter(Boolean).length;
  const validated=supportedCount===3;

  state.caseTheory={accused,motive,method,evidence,validated};

  const result=$("#theoryResult");
  if(validated){
    result.className="theory-result success";
    result.innerHTML="<strong>Theory supported</strong><span>Your three clues collectively support who did it, why, and how. Reconstruct the timeline next.</span>";
    if(!state.activities.includes("Preliminary case theory supported by evidence.")){
      addActivity("Preliminary case theory supported by evidence.");
    }
    showNotification("Timeline unlocked","Your preliminary theory is supported by the evidence. Reconstruct the night to test it.");
  }else{
    result.className="theory-result error";
    result.innerHTML=`<strong>Theory needs more support</strong><span>Your selected evidence currently supports ${supportedCount} of 3 pillars. Reconsider the suspect, motive, method, or evidence.</span>`;
    saveState();
  }

  updateUI();
};
