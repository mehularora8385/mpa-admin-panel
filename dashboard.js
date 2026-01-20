
fetch("https://API_URL/api/att/stats")
.then(r=>r.json()).then(d=>{
 document.getElementById("total").innerHTML=d.total;
 document.getElementById("present").innerHTML=d.present;
 document.getElementById("verified").innerHTML=d.verified;
});
