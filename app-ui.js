function progressData(){
  const scene = state.sceneSeen.length/3;
  const rooms = state.roomsSearched.length/DATA.rooms.length;
  const interviews = state.interviewed.length/DATA.suspects.length;
  const reports = state.reportsRead.length/DATA.reports.length;
  const deductions = state.deductions.length/DATA.deductions.length;
  const timeline = state.timelineSolved?1:0;
  const completed = state.complete?1:0;
  let p = Math.round(scene*10 + rooms*15 + interviews*15 + reports*15 + deductions*15 + timeline*15 + completed*15);
  p=Math.min(100,p);
  return {p,scene,rooms,interviews,reports,deductions,timeline,completed};
}
function phase(){
  const d=progressData();
  if(d.scene<1) return [1,"The Crime"];
  if(d.rooms<.5) return [2,"First Sweep"];
  if(d.interviews<1) return [3,"Meet the Suspects"];
  if(d.reports<1) return [4,"Evidence Analysis"];
  if(d.deductions<2/3) return [5,"Connect the Clues"];
  if(!d.timeline) return [6,"Reconstruct the Night"];
  if(!d.completed) return [7,"Make Your Accusation"];
  return [8,"Case Closed"];
}
function unlocks(){
  const d=progressData();
  return {
    reports: state.interviewed.length>=3 && state.collected.length>=6,
    board: state.reportsRead.length>=2,
    timeline: state.deductions.length>=2,
    accuse: state.timelineSolved
  }
}
function objective(){
  const d=progressData();
  if(d.scene<1) return ["Secure the crime scene","Inspect the victim, whiskey glass, and desk before leaving the study.",["Examine Adrian","Inspect whiskey glass","Search desk"],["body","glass","desk"].map(x=>state.sceneSeen.includes(x))];
  if(d.rooms<.5) return ["Search the manor","Search at least three rooms to uncover the first major leads.",["Search 3 rooms","Collect 6 clues"],[state.roomsSearched.length>=3,state.collected.length>=6]];
  if(d.interviews<1) return ["Question the guests","Interview all five suspects and listen for statements you can test against evidence.",DATA.suspects.map(s=>`Interview ${s.name.split(" ")[0]}`),DATA.suspects.map(s=>state.interviewed.includes(s.id))];
  if(d.reports<1) return ["Read the forensic reports","The lab and security team have returned results.",DATA.reports.map(r=>`Review ${r.title}`),DATA.reports.map(r=>state.reportsRead.includes(r.id))];
  if(d.deductions<2/3) return ["Connect the evidence","Use the evidence board to unlock at least two deductions.",["Unlock 2 deductions"],[state.deductions.length>=2]];
  if(!d.timeline) return ["Reconstruct the night","Put the recovered events in chronological order.",["Solve the timeline"],[state.timelineSolved]];
  if(!d.completed) return ["Build your accusation","Name the killer, motive, method, and three supporting clues.",["Submit your final accusation"],[false]];
  return ["Case closed","You reconstructed the murder of Adrian Blackwood.",["Review the final case file"],[true]];
}

function updateUI(){
  const d=progressData();
  const [phaseNo,phaseName]=phase();
  $("#progressPercent").textContent=`${d.p}%`;
  $("#progressFill").style.width=`${d.p}%`;
  $("#phaseLabel").textContent=`Phase ${phaseNo} — ${phaseName}`;
  $("#clueCount").textContent=state.collected.length;
  $("#clueTotal").textContent=Object.keys(DATA.evidence).length;
  $("#contradictionCount").textContent=Math.min(3,state.deductions.length+(state.confrontationSeen?1:0));
  $("#hintCount").textContent=state.hints;

  const u=unlocks();
  [["reports",u.reports],["board",u.board],["timeline",u.timeline],["accuse",u.accuse]].forEach(([view,ok])=>{
    const btn=$(`.nav-item[data-view="${view}"]`);
    if(!btn) return;
    btn.classList.toggle("locked",!ok);
    const b=btn.querySelector("b");
    if(b) b.textContent=ok?"OPEN":"LOCKED";
  });

  renderObjective();
  renderScene();
  renderRooms();
  renderSuspects();
  renderEvidence();
  renderReports();
  renderBoard();
  renderReadiness();
  renderActivity();
  populateAccusation();
  saveState();
}

function renderObjective(){
  const [title,text,items,done]=objective();
  const [n]=phase();
  $("#objectiveTitle").textContent=title;
  $("#objectiveText").textContent=text;
  $("#objectivePhase").textContent=`PHASE ${Math.min(n,7)}`;
  $("#objectiveChecklist").innerHTML=items.map((x,i)=>`<div class="check-item ${done[i]?"done":""}"><i>${done[i]?"✓":""}</i><span>${x}</span></div>`).join("");
}
function renderActivity(){
  $("#activityLog").innerHTML=state.activities.map(a=>`<div class="activity-entry">${a}</div>`).join("");
}
function navigate(view){
  const u=unlocks();
  if(["reports","board","timeline","accuse"].includes(view) && !u[view]){
    showNotification("Section locked","Continue your current investigation objective to unlock this section.");
    return;
  }
  currentView=view;
  $$(".view").forEach(v=>v.classList.remove("active"));
  $(`#view-${view}`).classList.add("active");
  $$(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
  const titles={briefing:"The Last Toast",scene:"Crime Scene",mansion:"Blackwood Manor",suspects:"Suspect Interviews",evidence:"Evidence Locker",reports:"Forensic Reports",board:"Evidence Board",timeline:"Night Timeline",accuse:"Final Accusation"};
  $("#viewTitle").textContent=titles[view]||"CASEFILE";
  $("#sidebar").classList.remove("open");
  window.scrollTo({top:0,behavior:"smooth"});
}
$$(".nav-item").forEach(b=>b.onclick=()=>navigate(b.dataset.view));
$$("[data-jump]").forEach(b=>b.onclick=()=>navigate(b.dataset.jump));
$("#menuBtn").onclick=()=>$("#sidebar").classList.toggle("open");
