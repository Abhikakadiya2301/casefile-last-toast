function progressData(){
  const scene = state.sceneSeen.length/3;
  const rooms = state.roomsSearched.length/DATA.rooms.length;
  const interviews = state.interviewed.length/DATA.suspects.length;
  const reports = state.reportsRead.length/DATA.reports.length;
  const theory = (state.caseTheory?.validated || state.deductions.length>=2) ? 1 : 0;
  const completed = state.complete?1:0;
  let p = Math.round(scene*10 + rooms*20 + interviews*15 + reports*15 + theory*20 + completed*20);
  p=Math.min(100,p);
  return {p,scene,rooms,interviews,reports,theory,deductions:theory,completed};
}
function phase(){
  const d=progressData();
  if(d.scene<1) return [2,"The Crime"];
  if(d.interviews<1) return [3,"Interview the Suspects"];
  if(d.reports<1) return [4,"Review Forensic Reports"];
  if(d.rooms<.5) return [5,"Search the Manor"];
  if(!d.theory) return [7,"Build Your Theory"];
  if(!d.completed) return [8,"Make Your Accusation"];
  return [8,"Case Closed"];
}
function unlocks(){
  const d=progressData();
  const interviewsComplete=state.interviewed.length>=DATA.suspects.length;
  const reportsComplete=state.reportsRead.length>=DATA.reports.length;
  const manorProgress=state.roomsSearched.length>=3;
  return {
    reports: interviewsComplete,
    mansion: reportsComplete,
    board: reportsComplete && manorProgress,
    accuse: Boolean(state.caseTheory?.validated) || state.deductions.length>=2
  }
}
function objective(){
  const d=progressData();
  if(d.scene<1) return ["Secure the crime scene","Review the study before moving on to the people who were inside Blackwood Manor.",["Examine Adrian","Inspect whiskey glass","Search desk"],["body","glass","desk"].map(x=>state.sceneSeen.includes(x))];
  if(d.interviews<1) return ["Interview the suspects","Question all five suspects first. Once the interviews are complete, the forensic results will be ready for review.",DATA.suspects.map(s=>`Interview ${s.name.split(" ")[0]}`),DATA.suspects.map(s=>state.interviewed.includes(s.id))];
  if(d.reports<1) return ["Review the forensic reports","Forensics has returned the Toxicology Report and Latent Print Report. Review both before continuing the scene search.",DATA.reports.map(r=>`Review ${r.title}`),DATA.reports.map(r=>state.reportsRead.includes(r.id))];
  if(d.rooms<.5) return ["Search the manor","Use the suspect statements and forensic findings to test rooms, records, and objects around Blackwood Manor.",["Search 3 rooms","Collect 6 clues"],[state.roomsSearched.length>=3,state.collected.length>=6]];
  if(!d.theory) return ["Build your case theory","Choose who killed Adrian, the motive, and the method, then support the theory with exactly three pieces of evidence.",["Name the suspect","Choose the motive","Choose the method","Select 3 supporting clues"],[Boolean(state.caseTheory?.accused),Boolean(state.caseTheory?.motive),Boolean(state.caseTheory?.method),(state.caseTheory?.evidence||[]).length===3]];
  if(!d.completed) return ["Build your accusation","Your supported case theory is ready. Submit the final accusation and close the case.",["Submit your final accusation"],[false]];
  return ["Case closed","You reconstructed the murder of Adrian Blackwood.",["Review the final case file"],[true]];
}

function updateUI(){
  const d=progressData();
  const [phaseNo,phaseName]=phase();
  $("#progressPercent").textContent=`${d.p}%`;
  $("#progressFill").style.width=`${d.p}%`;
  $("#phaseLabel").textContent=`Step ${phaseNo} — ${phaseName}`;
  $("#clueCount").textContent=state.collected.length;
  $("#clueTotal").textContent=Object.keys(DATA.evidence).length;
  $("#contradictionCount").textContent=Math.min(3,state.deductions.length+(state.confrontationSeen?1:0));
  $("#hintCount").textContent=state.hints;

  const u=unlocks();
  [["mansion",u.mansion],["reports",u.reports],["board",u.board],["accuse",u.accuse]].forEach(([view,ok])=>{
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
  $("#objectivePhase").textContent=`STEP ${n}`;
  $("#objectiveChecklist").innerHTML=items.map((x,i)=>`<div class="check-item ${done[i]?"done":""}"><i>${done[i]?"✓":""}</i><span>${x}</span></div>`).join("");
}
function renderActivity(){
  $("#activityLog").innerHTML=state.activities.map(a=>`<div class="activity-entry">${a}</div>`).join("");
}
function navigate(view){
  const u=unlocks();
  if(["mansion","reports","board","accuse"].includes(view) && !u[view]){
    showNotification("Section locked","Continue your current investigation objective to unlock this section.");
    return;
  }
  const sceneSynced=view==="scene" && typeof syncImageOnlySceneEvidence==="function"
    ? syncImageOnlySceneEvidence()
    : false;
  currentView=view;
  $$(".view").forEach(v=>v.classList.remove("active"));
  $(`#view-${view}`).classList.add("active");
  $$(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
  const titles={briefing:"The Last Toast",scene:"Crime Scene",mansion:"Blackwood Manor",suspects:"Suspect Interviews",evidence:"Evidence Locker",reports:"Forensic Reports",board:"Build Your Theory",accuse:"Final Accusation"};
  $("#viewTitle").textContent=titles[view]||"CASEFILE";
  $("#sidebar").classList.remove("open");
  if(sceneSynced) updateUI();
  window.scrollTo({top:0,behavior:"smooth"});
}
$$(".nav-item").forEach(b=>b.onclick=()=>navigate(b.dataset.view));
$$("[data-jump]").forEach(b=>b.onclick=()=>navigate(b.dataset.jump));
$("#menuBtn").onclick=()=>$("#sidebar").classList.toggle("open");
