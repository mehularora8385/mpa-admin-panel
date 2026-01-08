        function filterCandidates() {
             const exam = document.getElementById('candExamFilter').value;
             const centre = document.getElementById('candCentreFilter').value;
             const status = document.getElementById('candStatusFilter').value;
             const search = document.getElementById('candSearch').value.toLowerCase();
             
             const filtered = mockData.candidates.filter(cand => {
                 const matchesExam = !exam || cand.exam === exam;
                 const matchesCentre = !centre || cand.centre === centre;
                 const matchesSearch = cand.name.toLowerCase().includes(search) || cand.roll.toLowerCase().includes(search);
                 
                 let matchesStatus = true;
                 if (status === 'present_yes_verify_yes') {
                     matchesStatus = cand.present === 'Yes' && cand.verification === 'Yes';
                 } else if (status === 'present_yes_verify_no') {
                     matchesStatus = cand.present === 'Yes' && cand.verification === 'No';
                 } else if (status === 'present_no_verify_no') {
                     matchesStatus = cand.present === 'No' && cand.verification === 'No';
                 }
                 
                 return matchesExam && matchesCentre && matchesSearch && matchesStatus;
             });
             
             const tbody = document.getElementById('candidatesTableBody');
             tbody.innerHTML = filtered.map(cand => {
                 const presentBadge = cand.present === 'Yes' ? '<span class="badge badge-success">✓ Yes</span>' : '<span class="badge badge-danger">✗ No</span>';
                 const verificationBadge = cand.verification === 'Yes' ? '<span class="badge badge-success">✓ Yes</span>' : '<span class="badge badge-warning">⏳ No</span>';
                 return `<tr><td>${cand.name}</td><td>${cand.roll}</td><td>${cand.exam}</td><td>${cand.centre}</td><td>${cand.slot}</td><td>Present: ${presentBadge}<br>Verification: ${verificationBadge}</td></tr>`;
             }).join('');
         }
