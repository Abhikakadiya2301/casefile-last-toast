const FINAL_CHALLENGES={
  alibi:{
    title:"Break the alibi",
    prompt:"Your movements do not match the evidence.",
    priorities:["access_log","cctv_override","text","print","call_log","toast_photo"]
  },
  motive:{
    title:"Expose the motive",
    prompt:"Adrian had a reason to confront you.",
    priorities:["audit","torn_envelope","text","call_log","toast_photo"]
  },
  method:{
    title:"Challenge the method",
    prompt:"The physical evidence tells a different story.",
    priorities:["lab","print","medical_bag","glass","body"]
  }
};

const FINAL_RESPONSES={
  victor:{
    alibi:"You keep treating a door log like an eyewitness. I told you—I was in the billiard room.",
    motive:"Adrian questioned everyone. An audit is not a motive for murder.",
    method:"People touched that glass all evening. And Maya was the one carrying VX-17."
  },
  eleanor:{
    alibi:"Thomas saw me on the terrace. I never returned to Adrian's study.",
    motive:"Yes, we argued about the will. That was a marriage falling apart, not a murder plan.",
    method:"I had no access to Maya's research sample, and I never handled Adrian's whiskey after dinner."
  },
  daniel:{
    alibi:"My investor call lasted eighteen minutes. The phone record is the one thing tonight that does not lie.",
    motive:"I needed Adrian's money, but killing him would have destroyed any chance of saving my company.",
    method:"I never went near Maya's bag, and I never served Adrian a drink."
  },
  maya:{
    alibi:"I was not in the east corridor during the critical window. My medical bag being unattended does not place me there.",
    motive:"Adrian was my patient. I had professional disagreements with him, not a reason to kill him.",
    method:"VX-17 came from my bag, yes. That tells you where the substance came from—not who put it in the glass."
  },
  thomas:{
    alibi:"I found Adrian at 11:47. Before that I was carrying out the estate routine, exactly as the staff logs show.",
    motive:"I managed Adrian's house, not his company. His financial problems gave me nothing to gain.",
    method:"I knew the security system, but the override did not come from my console. Check the authenticated token."
  }
};

const SUSPECT_IMAGES={
  eleanor:"assets/Eleanor Blackwood.png",
  daniel:"assets/Daniel Blackwood.png",
  maya:"assets/scenes/Mysterious Study Crime Scene Investigation.png",
  victor:"assets/Victor Hale.png",
  thomas:"assets/Thomas Reed.png"
};

const MOTIVE_LABELS={
  inheritance:"Inheritance dispute",
  blackmail:"Personal blackmail",
  embezzlement:"Hide financial embezzlement",
  revenge:"Revenge for an old betrayal"
};

const METHOD_LABELS={
  blade:"Letter opener attack",
  toxin:"Toxic agent introduced into his whiskey",
  medication:"Medication mix-up",
  fall:"Fatal fall staged in the study"
};

function challengeEvidence(kind){
  const selected=state.caseTheory?.evidence||[];
  const priority=FINAL_CHALLENGES[kind]?.priorities||[];
  return priority.find(id=>selected.includes(id)) || selected[["alibi","motive","method"].indexOf(kind)] || selected[0] || null;
}

function confrontationEntry(kind){
  const suspect=DATA.suspects.find(s=>s.id===state.caseTheory?.accused);
  const evidenceId=challengeEvidence(kind);
  const evidence=evidenceId?DATA.evidence[evidenceId]:null;
  const challenge=FINAL_CHALLENGES[kind];
  const response=FINAL_RESPONSES[suspect?.id]?.[kind] || "I have already told you everything I know.";

  return `<div class="confrontation-entry">
    <div class="confrontation-detective">
      <span>DETECTIVE · ${challenge.title.toUpperCase()}</span>
      <p>${challenge.prompt}${evidence?` <strong>${evidence.title}</strong> is now on the table.`:""}</p>
    </div>
    <div class="confrontation-response">
      <span>${suspect?.name?.toUpperCase()||"SUSPECT"}</span>
      <p>“${response}”</p>
    </div>
  </div>`;
}

function renderFinalConfrontation(){
  const nameEl=$("#confrontationName");
  if(!nameEl) return;

  const theory=state.caseTheory||{};
  const suspect=DATA.suspects.find(s=>s.id===theory.accused);
  if(!theory.validated || !suspect){
    nameEl.textContent="Theory required";
    $("#confrontationOpening").innerHTML="<p>Return to Step 07 and build a supported case theory first.</p>";
    return;
  }

  const portrait=$("#confrontationPortrait");
  portrait.src=SUSPECT_IMAGES[suspect.id]||"";
  portrait.alt=`${suspect.name} confrontation`;
  $("#confrontationName").textContent=suspect.name;
  $("#confrontationRole").textContent=suspect.role;
  $("#confrontationOpening").innerHTML=`<p>You have brought <strong>${suspect.name}</strong> back into the room. Your theory is already on record. Now pressure the three points that matter most: <strong>alibi, motive, and method</strong>.</p>`;

  $("#confrontationTheory").innerHTML=`
    <div><span>Suspect</span><strong>${suspect.name}</strong></div>
    <div><span>Motive</span><strong>${MOTIVE_LABELS[theory.motive]||theory.motive}</strong></div>
    <div><span>Method</span><strong>${METHOD_LABELS[theory.method]||theory.method}</strong></div>`;

  $("#confrontationEvidence").innerHTML=(theory.evidence||[]).map(id=>{
    const e=DATA.evidence[id];
    return e?`<div class="confrontation-evidence-item"><span>${e.type}</span><strong>${e.title}</strong></div>`:"";
  }).join("");

  const completed=[...(state.finalConfrontation||[])];
  $$(".confrontation-move").forEach(btn=>{
    const done=completed.includes(btn.dataset.finalConfront);
    btn.classList.toggle("completed",done);
    btn.disabled=done;
    if(done) btn.querySelector("small").textContent="Challenge presented ✓";
  });

  $("#confrontationTranscript").innerHTML=completed.length
    ? completed.map(confrontationEntry).join("")
    : '<div class="confrontation-empty">Choose a confrontation move. The suspect’s response will be recorded here.</div>';

  const count=completed.length;
  $("#confrontationProgress").textContent=`${count}/3`;
  $("#confrontationProgressBar").style.width=`${Math.min(100,count/3*100)}%`;

  const lock=$("#lockAccusationBtn");
  lock.disabled=count<3;
  lock.textContent=count<3?`Complete ${3-count} more challenge${3-count===1?"":"s"}`:"Lock final accusation";
}

function populateAccusation(){
  renderFinalConfrontation();
}

function renderReadiness(){
  // Step 08 now uses the confrontation progress meter instead of the old readiness form.
}

$$(".confrontation-move").forEach(btn=>btn.onclick=()=>{
  const kind=btn.dataset.finalConfront;
  if(!state.caseTheory?.validated || !FINAL_CHALLENGES[kind]) return;
  state.finalConfrontation=state.finalConfrontation||[];
  if(!state.finalConfrontation.includes(kind)){
    state.finalConfrontation.push(kind);
    addActivity(`Final confrontation: ${FINAL_CHALLENGES[kind].title}.`);
    saveState();
  }
  renderFinalConfrontation();
});

$("#reviseTheoryBtn").onclick=()=>navigate("board");

$("#lockAccusationBtn").onclick=()=>{
  if((state.finalConfrontation||[]).length<3){
    showNotification("Confrontation incomplete","Challenge the suspect on alibi, motive, and method before locking the accusation.");
    return;
  }
  const theory=state.caseTheory;
  startReveal({
    accused:theory.accused,
    motive:theory.motive,
    method:theory.method,
    evid:[...(theory.evidence||[])]
  });
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
  revealIndex=0;
  $("#revealSteps").innerHTML="";
  $("#revealVerdict").classList.add("hidden");
  $("#revealNextBtn").classList.remove("hidden");
  $("#revealCloseBtn").classList.add("hidden");
  $("#revealNextBtn").textContent="Reveal next event";
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
        <p><strong>Your accusation:</strong> ${correct?"Correct killer, motive, and method.":"Your theory did not fully match the reconstruction."} ${strong}/3 of your submitted clues were strong supporting evidence.</p>`;
      $("#revealVerdict").classList.remove("hidden");
      $("#revealNextBtn").classList.add("hidden");
      $("#revealCloseBtn").classList.remove("hidden");
      if(!state.complete){
        state.complete=true;
        addActivity("Case closed: Victor Hale identified as Adrian Blackwood's killer.");
        updateUI();
      }
    }
  };
}

$("#revealCloseBtn").onclick=()=>$("#revealModal").close();

$("#notesBtn").onclick=()=>{
  $("#caseNotes").value=state.notes||"";
  $("#notesModal").showModal();
};
$("#notesClose").onclick=()=>$("#notesModal").close();
$("#caseNotes").addEventListener("input",e=>{
  state.notes=e.target.value;
  saveState();
});

$("#hintBtn").onclick=()=>{
  if(state.hints<=0){
    showNotification("No consultations left","You have used all three detective consultations.");
    return;
  }
  const d=progressData();
  let hint="";
  if(d.scene<1) hint="Open the Crime Scene to log the initial evidence before moving deeper into the case.";
  else if(state.interviewed.length<DATA.suspects.length) hint="Interview every suspect first. Victor's account of his movements will matter later.";
  else if(state.reportsRead.length<DATA.reports.length) hint="Review both the Toxicology Report and Latent Print Report before searching the manor.";
  else if(state.roomsSearched.length<3) hint="The security office, library, and guest lounge contain especially useful evidence.";
  else if(!d.theory) hint="Build one theory that explains who killed Adrian, why they did it, and how. Choose three clues that collectively support those three parts.";
  else if((state.finalConfrontation||[]).length<3) hint="Do not choose new evidence here. Pressure your suspect on all three points: alibi, motive, and method.";
  else hint="The confrontation is complete. Lock your accusation when you are ready to see the reconstruction.";
  state.hints--;
  addActivity("Consulted detective for a hint.");
  showNotification("Detective consultation",hint);
  updateUI();
};

$("#resetBtn").onclick=()=>{
  if(confirm("Reset all CASEFILE progress on this device?")){
    clearCaseState();
    state=freshDefaultState();
    boardSelected=[];
    navigate("briefing");
    updateUI();
  }
};

document.addEventListener("keydown",e=>{
  if(e.key==="Escape") $("#sidebar").classList.remove("open");
});

updateUI();
