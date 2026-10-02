function renderTimeline(){
  const map=Object.fromEntries(DATA.timeline.map(x=>[x.id,x]));
  $("#timelineList").innerHTML=timelineOrder.map((id,i)=>{
    const e=map[id];return `<div class="timeline-item" draggable="true" data-timeid="${id}">
      <span class="timeline-index">${String(i+1).padStart(2,"0")}</span>
      <span class="timeline-time">${e.time}</span>
      <div class="timeline-copy"><strong>${e.title}</strong><p>${e.desc}</p></div>
      <div class="timeline-move"><button data-up="${id}" aria-label="Move up">↑</button><button data-down="${id}" aria-label="Move down">↓</button></div>
    </div>`;
  }).join("");
  initDrag();
  $$("[data-up]").forEach(b=>b.onclick=()=>moveTimeline(b.dataset.up,-1));
  $$("[data-down]").forEach(b=>b.onclick=()=>moveTimeline(b.dataset.down,1));
}
function moveTimeline(id,delta){
  const i=timelineOrder.indexOf(id),j=i+delta;
  if(j<0||j>=timelineOrder.length)return;
  [timelineOrder[i],timelineOrder[j]]=[timelineOrder[j],timelineOrder[i]];
  renderTimeline();
}
function initDrag(){
  let dragged=null;
  $$(".timeline-item").forEach(item=>{
    item.addEventListener("dragstart",()=>{dragged=item.dataset.timeid;item.classList.add("dragging")});
    item.addEventListener("dragend",()=>item.classList.remove("dragging"));
    item.addEventListener("dragover",e=>e.preventDefault());
    item.addEventListener("drop",e=>{
      e.preventDefault();
      const target=item.dataset.timeid;
      if(!dragged||dragged===target)return;
      const from=timelineOrder.indexOf(dragged),to=timelineOrder.indexOf(target);
      timelineOrder.splice(from,1);timelineOrder.splice(to,0,dragged);renderTimeline();
    });
  });
}
$("#shuffleTimelineBtn").onclick=()=>{timelineOrder.sort(()=>Math.random()-.5);renderTimeline();$("#timelineResult").className="timeline-result";$("#timelineResult").textContent=""};
$("#checkTimelineBtn").onclick=()=>{
  const correct=DATA.timeline.map(x=>x.id);
  const errors=timelineOrder.reduce((n,id,i)=>n+(id!==correct[i]),0);
  const box=$("#timelineResult");
  if(errors===0){
    box.className="timeline-result success";box.textContent="Timeline confirmed. Victor's claimed alibi cannot be true during the critical 10:29–10:46 window.";
    if(!state.timelineSolved){
      state.timelineSolved=true;addActivity("Night timeline reconstructed.");showNotification("Final accusation unlocked","Your reconstruction exposes a broken alibi. Build your case.");
    }
  }else{
    box.className="timeline-result error";box.textContent=`${errors} event${errors===1?" is":"s are"} out of position. Use the timestamps and evidence to try again.`;
  }
  updateUI();
};

function populateAccusation(){
  const sel=$("#accusedSelect");
  if(sel.options.length===1) DATA.suspects.forEach(s=>sel.add(new Option(s.name,s.id)));
  const critical=state.collected.filter(id=>DATA.evidence[id].critical);
  const box=$("#accusationEvidence");
  const checked=[...box.querySelectorAll("input:checked")].map(x=>x.value);
  box.innerHTML=critical.map(id=>`<label class="accuse-evidence"><input type="checkbox" value="${id}" ${checked.includes(id)?"checked":""}/><span>${DATA.evidence[id].title}</span></label>`).join("");
  $$(`#accusationEvidence input`).forEach(inp=>inp.onchange=()=>{
    const checks=$$("#accusationEvidence input:checked");
    if(checks.length>3){inp.checked=false;showNotification("Three clues only","Choose the three strongest pieces of evidence.");}
  });
}
function renderReadiness(){
  const p=progressData();
  const rows=[
    ["Crime scene",p.scene],["Rooms searched",p.rooms],["Suspects interviewed",p.interviews],["Reports reviewed",p.reports],["Deductions",p.deductions],["Timeline",p.timeline]
  ];
  $("#readinessRows").innerHTML=rows.map(([l,v])=>`<div class="readiness-row"><header><span>${l}</span><b>${Math.round(v*100)}%</b></header><div class="mini-track"><i style="width:${v*100}%"></i></div></div>`).join("");
  const ready=Math.round(rows.reduce((a,[,v])=>a+v,0)/rows.length*100);
  $("#readinessScore").textContent=`${ready}%`;
}
$("#accuseForm").onsubmit=e=>{
  e.preventDefault();
  const accused=$("#accusedSelect").value,motive=$("#motiveSelect").value,method=$("#methodSelect").value;
  const evid=$$("#accusationEvidence input:checked").map(x=>x.value);
  if(!accused||!motive||!method||evid.length!==3){
    showNotification("Case incomplete","Choose a suspect, motive, method, and exactly three supporting clues.");return;
  }
  startReveal({accused,motive,method,evid});
};

const REVEAL = [
  ["10:05 PM","The summons","Adrian orders Victor to bring the financial ledger to his study. Victor opens the message two minutes later."],
  ["10:29 PM","The blind spot","The east corridor camera is deliberately disabled using Victor's authenticated admin token."],
  ["10:31 PM","The broken alibi","Victor's personal credential enters the east corridor, directly contradicting his interview statement."],
  ["10:42 PM","The disturbance","During the confrontation, Adrian's pocket watch hits the floor and stops. The lab places his collapse within minutes."],
  ["10:46 PM","The cover-up","The corridor feed returns. The whiskey glass has been partly wiped, but Victor's print remains on its lower base."],
  ["11:47 PM","The discovery","Thomas finds Adrian dead. The letter opener appears important, but toxicology later proves it was a staged distraction."]
];
function startReveal(acc){
  revealIndex=0;$("#revealSteps").innerHTML="";$("#revealVerdict").classList.add("hidden");$("#revealNextBtn").classList.remove("hidden");$("#revealCloseBtn").classList.add("hidden");
  $("#revealModal").showModal();
  $("#revealNextBtn").onclick=()=>{
    if(revealIndex<REVEAL.length){
      const [t,h,p]=REVEAL[revealIndex++];
      $("#revealSteps").insertAdjacentHTML("beforeend",`<div class="reveal-step"><time>${t}</time><strong>${h}</strong><p>${p}</p></div>`);
      if(revealIndex===REVEAL.length) $("#revealNextBtn").textContent="Reveal the killer";
    }else{
      const correct=acc.accused==="victor"&&acc.motive==="embezzlement"&&acc.method==="toxin";
      const keyEvidence=["audit","access_log","cctv_override","lab","print","text","torn_envelope"];
      const strong=acc.evid.filter(x=>keyEvidence.includes(x)).length;
      $("#revealVerdict").innerHTML=`<p class="eyebrow">CASE CLOSED</p><h2>Victor Hale</h2>
        <p>Adrian uncovered financial transfers tied to Victor's office and planned to expose them to the board. Victor met him in the study, used the stolen VX-17 sample to contaminate Adrian's whiskey, disabled the corridor camera, then tried to erase the trail and misdirect attention toward Dr. Sen and the letter opener.</p>
        <p><strong>Your accusation:</strong> ${correct?"Correct killer, motive, and method.":"Your theory did not fully match the reconstruction."} ${strong}/3 of your selected clues were strong supporting evidence.</p>`;
      $("#revealVerdict").classList.remove("hidden");$("#revealNextBtn").classList.add("hidden");$("#revealCloseBtn").classList.remove("hidden");
      if(!state.complete){state.complete=true;addActivity("Case closed: Victor Hale identified as Adrian Blackwood's killer.");updateUI();}
    }
  };
}
$("#revealCloseBtn").onclick=()=>$("#revealModal").close();

$("#notesBtn").onclick=()=>{$("#caseNotes").value=state.notes||"";$("#notesModal").showModal()};
$("#notesClose").onclick=()=>$("#notesModal").close();
$("#caseNotes").addEventListener("input",e=>{state.notes=e.target.value;saveState()});

$("#hintBtn").onclick=()=>{
  if(state.hints<=0){showNotification("No consultations left","You have used all three detective consultations.");return}
  const d=progressData(); let hint="";
  if(d.scene<1) hint="The study contains exactly three points worth inspecting before you leave.";
  else if(state.collected.length<6) hint="The security office and library contain unusually important records.";
  else if(state.interviewed.length<5) hint="Ask Victor where he was after 10:15 PM, then compare that claim with the access log.";
  else if(state.reportsRead.length<3) hint="Read the toxicology and security reports together. The cause of death and the camera outage overlap.";
  else if(state.deductions.length<2) hint="Try connecting Adrian's message, Victor's access log, and the security override.";
  else if(!state.timelineSolved) hint="The times are literal. Put the message before the camera outage, then follow the security records.";
  else hint="A strong accusation should prove motive, presence, and method with separate pieces of evidence.";
  state.hints--; addActivity("Consulted detective for a hint."); showNotification("Detective consultation",hint); updateUI();
};

$("#resetBtn").onclick=()=>{
  if(confirm("Reset all CASEFILE progress on this device?")){
    localStorage.removeItem("casefile-state");state={...defaultState,sceneSeen:[],roomsSearched:[],interviewed:[],reportsRead:[],deductions:[],collected:[],activities:[defaultState.activities[0]]};boardSelected=[];timelineOrder=[...DATA.timeline].sort(()=>Math.random()-.5).map(e=>e.id);navigate("briefing");updateUI();renderTimeline();
  }
};

document.addEventListener("keydown",e=>{
  if(e.key==="Escape") $("#sidebar").classList.remove("open");
});

renderTimeline();
updateUI();
