
function loadStats(exam){
 fetch("https://API_URL/api/stats?exam="+exam)
 .then(r=>r.json()).then(d=>{
  total.innerHTML=d.total;
  present.innerHTML=d.present;
  verified.innerHTML=d.verified;
 });
}

function syncAll(exam){
 fetch("https://API_URL/api/sync-all",{method:"POST"})
 .then(()=>alert("SYNC SENT"));
}

function logoutAll(exam){
 fetch("https://API_URL/api/logout-all",{method:"POST"})
 .then(()=>alert("LOGOUT SENT"));
}
