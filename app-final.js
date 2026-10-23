function populateAccusation(){
  const sel=$("#accusedSelect");
  if(sel.options.length===1) DATA.suspects.forEach(s=>sel.add(new Option(s.name,s.id)));

  if(!sel.dataset.theoryHydrated && state.caseTheory?.validated){
    sel.value=state.caseTheory.accused||"";
    $("#motiveSelect").value=state.caseTheory.motive||"";
    $("#methodSelect").value=state.caseTheory.method||"";
    sel.dataset.theoryHydrated="true";
  }

  const critical=state.collected.filter(id=>DATA.evidence[id].critical);
  const box=$("#accusationEvidence");
  const current=[...box.querySelectorAll("input:checked")].map(x=>x.value);
  const theoryEvidence=(state.caseTheory?.validated?state.caseTheory.evidence:[])
    .filter(id=>critical.includes(id));
  const checked=current.length?current:theoryEvidence.slice(0,3);

  box.innerHTML=critical.map(id=>`<label class="accuse-evidence"><input type="checkbox" value="${id}" ${checked.includes(id)?"checked":""}/><span>${DATA.evidence[id].title}</span></label>`).join("");
  $(`#accusationEvidence input`).forEach(inp=>inp.onchange=()=>{
    const checks=$("#accusationEvidence input:checked");
    if(checks.length>3){inp.checked=false;showNotification("Three clues only","Choose the three strongest pieces of evidence.");}
  });
}
function renderReadiness(){
  const p=progressData();
  const rows=[
    ["Crime scene",p.scene],["Rooms searched",p.rooms],["Suspects interviewed",p.interviews],["Reports reviewed",p.reports],["Case theory",p.theory]
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
  if(d.scene<1) hint="Open the Crime Scene to log the initial evidence before moving deeper into the case.";
  else if(state.interviewed.length<DATA.suspects.length) hint="Interview every suspect first. Victor's account of his movements will matter later.";
  else if(state.reportsRead.length<DATA.reports.length) hint="Review both the Toxicology Report and Latent Print Report before searching the manor.";
  else if(state.roomsSearched.length<3) hint="The security office, library, and guest lounge contain especially useful evidence.";
  else if(!d.theory) hint="Build one theory that explains who killed Adrian, why they did it, and how. Choose three clues that collectively support those three parts.";
  else hint="Your supported theory is ready. Use the final accusation to lock in the killer, motive, method, and three strongest clues.";
  state.hints--; addActivity("Consulted detective for a hint."); showNotification("Detective consultation",hint); updateUI();
};

$("#resetBtn").onclick=()=>{
  if(confirm("Reset all CASEFILE progress on this device?")){
    localStorage.removeItem("casefile-state");state={...defaultState,sceneSeen:[],roomsSearched:[],interviewed:[],reportsRead:[],deductions:[],caseTheory:{accused:"",motive:"",method:"",evidence:[],validated:false},collected:[],activities:[defaultState.activities[0]]};boardSelected=[];navigate("briefing");updateUI();
  }
};

document.addEventListener("keydown",e=>{
  if(e.key==="Escape") $("#sidebar").classList.remove("open");
});

updateUI();
