const DATA = {
  suspects: [
    {id:"eleanor", name:"Eleanor Blackwood", initials:"EB", role:"Wife", hook:"Adrian planned to change his will.", color:"widow",
      questions:[
        ["Where were you after dinner?","On the west terrace. I needed air. Thomas passed me there shortly before ten."],
        ["Were you arguing with Adrian?","Yes. About the will. That does not mean I killed him."],
        ["Did you enter the study tonight?","Not after dinner. Adrian told me he wanted to be alone."]
      ]},
    {id:"daniel", name:"Daniel Blackwood", initials:"DB", role:"Younger brother", hook:"A failing company and an unpaid family loan.",
      questions:[
        ["Where were you at 10:30 PM?","In the billiard room. I was on a call with an investor in London."],
        ["Did Adrian threaten to cut you off?","He threatened everyone with something. Mine happened to be money."],
        ["Did you see Victor leave?","For a few minutes, yes. I assumed he went for another drink."]
      ]},
    {id:"maya", name:"Dr. Maya Sen", initials:"MS", role:"Family physician", hook:"Her medical bag is missing a sealed research sample.",
      questions:[
        ["Why was your medical bag open?","Adrian asked me to bring it because he'd complained of palpitations earlier."],
        ["What is missing?","A sealed sample labelled VX-17. It's not a medication and it should never have left my bag."],
        ["When did you last see Adrian?","At dinner. He looked tense, but medically stable."]
      ]},
    {id:"victor", name:"Victor Hale", initials:"VH", role:"Business partner", hook:"Adrian had ordered a private audit of company finances.",
      questions:[
        ["Where were you after 10:15 PM?","Billiard room. Daniel can confirm it. I never went near Adrian's study."],
        ["Why did Adrian order an audit?","Routine governance. He was becoming paranoid about the company."],
        ["Did Adrian ask to meet you tonight?","No. We had nothing scheduled."]
      ],
      confrontation:["Your access card entered the east corridor at 10:31 PM.","Then the system is wrong. Those readers fail constantly. I still never entered the study."]
    },
    {id:"thomas", name:"Thomas Reed", initials:"TR", role:"Estate manager", hook:"He controls the manor's keys and security routines.",
      questions:[
        ["Who found Adrian?","I did, at 11:47. He had missed his usual night check-in."],
        ["Who can disable the corridor cameras?","My security console can. So can two admin tokens issued to Adrian and Victor."],
        ["Did you enter the study earlier?","At 8:40 to leave correspondence. Not again until I found him."]
      ]}
  ],
  rooms:[
    {id:"dining",name:"Dining Room",desc:"The last place all six people were together.",clue:"toast_photo",number:"01"},
    {id:"billiard",name:"Billiard Room",desc:"Daniel and Victor both claim to have spent the late evening here.",clue:"call_log",number:"02"},
    {id:"conservatory",name:"Conservatory",desc:"A quiet room connecting the west terrace and central hall.",clue:"torn_envelope",number:"03"},
    {id:"security",name:"Security Office",desc:"Camera feeds, access records, and administrative overrides.",clue:"access_log",number:"04"},
    {id:"library",name:"Library",desc:"Adrian's correspondence and company files are stored here.",clue:"audit",number:"05"},
    {id:"guest",name:"Guest Lounge",desc:"Coats, bags, and drinks were left unattended during dinner.",clue:"medical_bag",number:"06"}
  ],
  evidence:{
    body:{title:"Victim examination",type:"forensic",critical:false,icon:"AB",summary:"No obvious traumatic wound. Fingertips show faint discoloration inconsistent with a simple cardiac event.",detail:"Adrian appears to have collapsed beside his desk. The scene does not support the letter opener as the immediate cause of death."},
    glass:{title:"Whiskey glass",type:"physical",critical:true,icon:"WG",summary:"Half-full glass recovered from the desk. Rim wiped unevenly.",detail:"The glass contains trace residue that the field kit cannot identify. One smeared partial print remains low on the base."},
    desk:{title:"Stopped pocket watch",type:"physical",critical:false,icon:"PW",summary:"Adrian's pocket watch lies under the desk. It stopped at 10:42 PM.",detail:"The crystal is newly cracked. The watch likely struck the floor during a brief disturbance."},
    toast_photo:{title:"Dinner photograph",type:"physical",critical:false,icon:"PH",summary:"A timestamped photo places everyone at dinner at 9:07 PM.",detail:"The image establishes clothing, seating, and the last verified moment all six people were together."},
    call_log:{title:"Daniel's call log",type:"digital",critical:false,icon:"CL",summary:"An 18-minute international call began at 10:24 PM.",detail:"The telecom record supports Daniel's claim that he was speaking with an investor during most of the likely murder window."},
    torn_envelope:{title:"Torn envelope to Victor",type:"document",critical:true,icon:"TE",summary:"Recovered behind a conservatory planter. Addressed by Adrian to Victor Hale.",detail:"Inside: 'By morning, the board receives everything. Bring the ledger to my study tonight.' The lower half is torn away."},
    access_log:{title:"East corridor access log",type:"digital",critical:true,icon:"AC",summary:"Victor Hale's credential entered the east corridor at 10:31 PM.",detail:"The reader recorded Victor's personal access credential. He told you he never went near the study."},
    audit:{title:"Private financial audit",type:"document",critical:true,icon:"FA",summary:"Irregular transfers lead to an account controlled through Victor's finance office.",detail:"Adrian's handwritten note reads: 'VH knows. Confront tonight. Board tomorrow.'"},
    medical_bag:{title:"Dr. Sen's medical bag",type:"physical",critical:false,icon:"MB",summary:"One sealed research sample, VX-17, is missing.",detail:"The missing fictional research sample is initially suspicious. Dr. Sen says the bag was unattended in the guest lounge during dinner."},
    cctv_override:{title:"Security override record",type:"digital",critical:true,icon:"SO",summary:"East corridor camera disabled 10:29–10:46 using Victor's admin token.",detail:"The system records an authenticated override from Victor's finance-admin token, not Thomas's security console."},
    lab:{title:"Toxicology report",type:"forensic",critical:true,icon:"TX",summary:"Trace VX-17 found in Adrian's whiskey and blood sample.",detail:"The lab concludes Adrian ingested VX-17 shortly before death. The letter opener did not cause his death."},
    print:{title:"Latent print report",type:"forensic",critical:true,icon:"FP",summary:"Victor's partial print recovered from the lower base of the whiskey glass.",detail:"Placement is inconsistent with a normal toast grip and survives beneath an area that appears to have been deliberately wiped."},
    text:{title:"Adrian's final message",type:"digital",critical:true,icon:"TM",summary:"10:05 PM: 'Victor. Study at 10:30. Bring the ledger. No excuses.'",detail:"The message was delivered and opened on Victor's phone at 10:07 PM."}
  },
  reports:[
    {id:"lab",title:"Toxicology",body:["Cause of death: acute exposure to fictional compound VX-17.","Compound detected in both blood sample and whiskey residue.","Estimated collapse occurred between 10:40 PM and 10:50 PM."],stamp:"CAUSE REVISED"},
    {id:"cctv_override",title:"Security Systems",body:["East corridor camera manually disabled at 10:29 PM.","Feed restored at 10:46 PM.","Override authenticated with Victor Hale's admin token."],stamp:"AUTHENTICATED"},
    {id:"print",title:"Latent Prints",body:["Partial print recovered from lower base of whiskey tumbler.","Comparison identifies Victor Hale.","Upper rim shows signs of wiping."],stamp:"MATCH"}
  ],
  timeline:[
    {id:"dinner",time:"9:15 PM",title:"Dinner ends",desc:"Guests leave the dining room."},
    {id:"message",time:"10:05 PM",title:"Adrian messages Victor",desc:"He orders Victor to bring the ledger to the study."},
    {id:"call",time:"10:24 PM",title:"Daniel's investor call begins",desc:"The call places Daniel in the billiard room."},
    {id:"camera",time:"10:29 PM",title:"East camera disabled",desc:"Victor's admin token creates a blind spot."},
    {id:"access",time:"10:31 PM",title:"Victor enters east corridor",desc:"His credential is recorded near the study."},
    {id:"watch",time:"10:42 PM",title:"Pocket watch stops",desc:"A disturbance sends it to the floor."},
    {id:"restore",time:"10:46 PM",title:"Camera feed restored",desc:"The same admin token restores the feed."},
    {id:"found",time:"11:47 PM",title:"Body discovered",desc:"Thomas enters after Adrian misses a routine check-in."}
  ],
  deductions:[
    {id:"motive", needs:["audit","torn_envelope","text"],title:"A confrontation was planned",text:"Adrian discovered financial irregularities tied to Victor and summoned him to the study."},
    {id:"lie", needs:["access_log","text","cctv_override"],title:"Victor's alibi is false",text:"His message, access credential, and security token place him at the east corridor during the murder window."},
    {id:"method", needs:["lab","medical_bag","print"],title:"The whiskey was tampered with",text:"VX-17 came from the unattended medical bag, and Victor's print is on the wiped whiskey glass."}
  ]
};

const defaultState = {
  sceneSeen:[],
  roomsSearched:[],
  interviewed:[],
  confrontationSeen:false,
  reportsRead:[],
  deductions:[],
  timelineSolved:false,
  collected:[],
  activities:["Case opened. Adrian Blackwood found dead in his study."],
  hints:3,
  notes:"",
  complete:false
};

let state = loadState();
let currentView = "briefing";
let boardSelected = [];
let timelineOrder = [...DATA.timeline].sort(()=>Math.random()-.5).map(e=>e.id);
let revealIndex = 0;

const $ = sel => document.querySelector(sel);
const $$ = sel => [...document.querySelectorAll(sel)];

function loadState(){
  try{
    return {...defaultState, ...JSON.parse(localStorage.getItem("casefile-state")||"{}")};
  }catch{ return {...defaultState}; }
}
function saveState(){
  localStorage.setItem("casefile-state", JSON.stringify(state));
}
function addActivity(text){
  state.activities.unshift(text);
  state.activities = state.activities.slice(0,12);
  saveState();
  renderActivity();
}
function collect(id, notify=true){
  if(!state.collected.includes(id)){
    state.collected.push(id);
    addActivity(`Evidence collected: ${DATA.evidence[id].title}.`);
    if(notify) showNotification("New evidence", DATA.evidence[id].summary);
  }
  saveState();
  updateUI();
}
function showNotification(title,text){
  $("#notificationTitle").textContent=title;
  $("#notificationText").textContent=text;
  $("#notification").classList.remove("hidden");
  clearTimeout(showNotification.t);
  showNotification.t=setTimeout(()=>$("#notification").classList.add("hidden"),5200);
}
$("#notificationClose").onclick=()=>$("#notification").classList.add("hidden");
