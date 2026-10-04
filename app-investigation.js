function renderScene(){
  const labels={body:"Examine Adrian",glass:"Inspect whiskey glass",desk:"Search desk"};
  $("#sceneChecklist").innerHTML=Object.entries(labels).map(([id,l])=>`<div class="check-item ${state.sceneSeen.includes(id)?"done":""}"><i>${state.sceneSeen.includes(id)?"✓":""}</i><span>${l}</span></div>`).join("");
  $$("[data-scene]").forEach(btn=>btn.classList.toggle("seen",state.sceneSeen.includes(btn.dataset.scene)));
}
$$("[data-scene]").forEach(btn=>btn.onclick=()=>{
  const id=btn.dataset.scene;
  if(!state.sceneSeen.includes(id)){
    state.sceneSeen.push(id); collect(id,false);
    if(state.sceneSeen.length===3) showNotification("Case update","The obvious weapon does not fit the scene. Search the manor for context.");
  }
  openEvidence(id);
});

function renderRooms(){
  const roomImages={
    dining:"assets/Dinning room.png",
    billiard:"assets/Billiard Room.png",
    conservatory:"assets/moonlit_conservatory_mystery.png",
    security:"assets/Security Office.png",
    library:"assets/image-gen-6(1).png",
    guest:"assets/Mansion Lounge Mystery Crime Scene.png"
  };
  $("#roomGrid").innerHTML=DATA.rooms.map(r=>`
    <article class="room-card ${state.roomsSearched.includes(r.id)?"searched":""}">
      <img class="room-photo" src="${roomImages[r.id]}" alt="${r.name} investigation scene" loading="lazy" decoding="async">
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
      showNotification("Room searched",`${r.name}: ${DATA.evidence[r.clue].summary}`);
      if(state.roomsSearched.length===3) showNotification("Interviews advised","You have enough context to begin testing the guests' stories.");
    }
    openEvidence(r.clue);
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
    if(state.interviewed.length===3 && state.collected.length>=6) showNotification("Forensics unlocked","Preliminary lab and security reports are now available.");
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
function openEvidence(id){
  const e=DATA.evidence[id];
  $("#modalContent").innerHTML=`<div class="evidence-detail">
    <div class="evidence-art">${e.icon}</div>
    <div><p class="eyebrow">${e.type.toUpperCase()} EVIDENCE</p><h3>${e.title}</h3><p>${e.detail}</p>${e.critical?'<span class="phase-chip">CRITICAL EVIDENCE</span>':""}</div>
  </div>`;
  $("#modal").showModal();
  updateUI();
}
$("#modalClose").onclick=()=>$("#modal").close();

function renderReports(){
  $("#reportGrid").innerHTML=DATA.reports.map(r=>`<article class="report-card">
    <h3>${r.title}</h3>
    <ul>${r.body.map(x=>`<li>${x}</li>`).join("")}</ul>
    <button class="ghost-btn report-read" data-report="${r.id}">${state.reportsRead.includes(r.id)?"Reviewed":"Mark reviewed"}</button>
    <span class="report-stamp">${r.stamp}</span>
  </article>`).join("");
  $$(".report-read").forEach(b=>b.onclick=()=>{
    const id=b.dataset.report;
    if(!state.reportsRead.includes(id)){
      state.reportsRead.push(id);
      collect(id,false);
      addActivity(`Reviewed report: ${DATA.reports.find(r=>r.id===id).title}.`);
      if(state.reportsRead.length===2) showNotification("Evidence board unlocked","You now have enough verified evidence to start connecting clues.");
      updateUI();
    }
  });
}

function renderBoard(){
  const usable=state.collected.filter(id=>DATA.evidence[id].critical || ["medical_bag","call_log"].includes(id));
  $("#boardEvidence").innerHTML=usable.map((id,i)=>{
    const e=DATA.evidence[id];
    return `<button class="board-card ${boardSelected.includes(id)?"selected":""}" style="--rot:${[-1.2,.8,-.4,1.1,-.8,.5][i%6]}deg" data-board="${id}">
      <strong>${e.title}</strong><small>${e.summary}</small>
    </button>`;
  }).join("");
  $$(".board-card").forEach(b=>b.onclick=()=>{
    const id=b.dataset.board;
    if(boardSelected.includes(id)) boardSelected=boardSelected.filter(x=>x!==id);
    else if(boardSelected.length<3) boardSelected.push(id);
    else showNotification("Three-clue limit","Remove one clue before adding another.");
    renderBoard();
  });
  $("#boardSelection").innerHTML=[0,1,2].map(i=>boardSelected[i]?`<div class="selection-slot filled">${DATA.evidence[boardSelected[i]].title}</div>`:`<div class="selection-slot">Select evidence</div>`).join("");
  $("#deductionList").innerHTML=state.deductions.length?state.deductions.map(id=>{
    const d=DATA.deductions.find(x=>x.id===id);return `<div class="deduction"><strong>${d.title}</strong><p>${d.text}</p></div>`;
  }).join(""):`<p class="muted">No deductions unlocked yet.</p>`;
}
$("#testDeductionBtn").onclick=()=>{
  const found=DATA.deductions.find(d=>d.needs.every(x=>boardSelected.includes(x)));
  if(found){
    if(!state.deductions.includes(found.id)){
      state.deductions.push(found.id);
      addActivity(`Deduction unlocked: ${found.title}.`);
      showNotification("Deduction unlocked",found.text);
      if(state.deductions.length===2) showNotification("Timeline unlocked","You have enough connections to reconstruct the night.");
    } else showNotification("Already discovered","You've already logged this deduction.");
    boardSelected=[];
  }else{
    showNotification("Connection unproven","These clues do not yet support a verified deduction. Try another combination.");
  }
  updateUI();
};
