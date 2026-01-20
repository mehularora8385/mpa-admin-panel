
function loadClient(exam){
 fetch("https://API_URL/api/client-stats/"+exam)
 .then(r=>r.json()).then(d=>{
  console.log(d);
 });
}
