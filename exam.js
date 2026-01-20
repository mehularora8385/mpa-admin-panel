
const API = "http://localhost:5000/api/exam";

function createExam(){
  fetch(API+"/create",{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify({
      exam_name:name.value,
      exam_code:code.value
    })
  }).then(r=>r.json()).then(d=>alert(d.message));
}

function uploadCSV(){
  let fd = new FormData();
  fd.append("file",csvFile.files[0]);

  fetch(API+"/upload",{
    method:"POST",
    body:fd
  }).then(r=>r.json()).then(d=>alert(d.message));
}

function loadExams(){
 fetch(API+"/list").then(r=>r.json()).then(data=>{
  let html="";
  data.forEach(e=>{
   html+=`
   <p>${e.exam_name} - ${e.status}
   <button onclick="change('${e.id}','ACTIVE')">ON</button>
   <button onclick="change('${e.id}','INACTIVE')">OFF</button></p>`;
  });
  examList.innerHTML=html;
 })
}

function change(id,status){
 fetch(API+"/status/"+id,{
  method:"PUT",
  headers:{ "Content-Type":"application/json" },
  body:JSON.stringify({status})
 })
 .then(r=>r.json()).then(loadExams);
}

loadExams();
