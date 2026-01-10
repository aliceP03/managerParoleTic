const API_BASE_URL = 'http://localhost:8080';
// Cheia pentru criptare - demonstrativ
const secretKey = "my-super-secret-key"; 
const passwordsContainer = document.getElementById('passwords');
const addButton = document.getElementById('add-password');
const siteInput = document.getElementById('site');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const categoryInput = document.getElementById('category');
const updateButton = document.getElementById('update-password-btn');
const updateIdInput = document.getElementById('update-id');
const updateSiteInput = document.getElementById('update-site');
const updateUsernameInput = document.getElementById('update-username');
const updatePasswordInput = document.getElementById('update-password');
const updateCategoryInput = document.getElementById('update-category');
const deleteButton = document.getElementById('delete-password-btn');
const deleteIdInput = document.getElementById('delete-id');
const loginBtn = document.getElementById("login-btn");
const loginEmail = document.getElementById("login-email");
const loginPassword = document.getElementById("login-password");
const loginStatus = document.getElementById("login-status");
const registerBtn = document.getElementById("register-btn");
const registerEmail = document.getElementById("register-email");
const registerPassword = document.getElementById("register-password");
const registerStatus = document.getElementById("register-status");
const logoutBtn = document.getElementById("logout-btn");

async function register() {
  const email = registerEmail.value;
  const password = registerPassword.value;

  if(!email || !password){
    alert("Enter email and password");
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if(!res.ok){
      registerStatus.textContent = data.error;
      registerStatus.style.color = "red";
      return;
    }

    registerStatus.textContent = "Account created!";
    registerStatus.style.color = "green";

  } catch(err){
    registerStatus.textContent = "Register failed";
    registerStatus.style.color = "red";
  }
}

registerBtn.addEventListener("click", register);


//LOGIN
async function login() {
    const email = loginEmail.value;
    const password = loginPassword.value;

    const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
        // Salvezi token-ul
        localStorage.setItem("token", data.token);
        loginStatus.innerText = "Logat cu succes!";
        
        // ACUM FACI GET-ul pentru parole
        getPasswords(); 
    } else {
        loginStatus.innerText = "Eroare: " + data.error;
    }
}

//LOGOUT
function logout() {
    // Ștergem token-ul din stocarea locală
    localStorage.removeItem("token");
        alert("Te-ai delogat cu succes!");
        location.reload(); // Refresh la pagină pentru a goli lista de parole
}

// GET all
async function getPasswords() {
    const token = localStorage.getItem("token");
    
    // Verificăm dacă avem token înainte de a face cererea
    if (!token) {
        passwordsContainer.innerHTML = "<p>Te rugăm să te loghezi pentru a vedea parolele.</p>";
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/passwords`, {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (res.status === 401 || res.status === 403) {
            passwordsContainer.innerHTML = "<p>Sesiune expirată. Te rugăm să te reloghezi.</p>";
            localStorage.removeItem("token"); // Curățăm token-ul vechi
            return;
        }

        const data = await res.json();
        displayPasswords(data);
    } catch (error) {
        console.error("Eroare la preluarea parolelor:", error);
        passwordsContainer.innerHTML = "<p>Eroare de conexiune la server.</p>";
    }
}
function displayPasswords(data) {
    passwordsContainer.innerHTML = '';
    if (!data || data.length === 0) {
        passwordsContainer.innerHTML = '<p>No passwords</p>';
        return;
    }
    data.forEach(p => {
        const div = document.createElement('div');
        div.innerHTML = `
            <p>ID: ${p.id}</p>
            <p>Site: ${p.site}</p>
            <p>Username: ${p.username}</p>
            <p>Password: <span id="password-${p.id}">••••••••</span>
            <button id="toggle-${p.id}">Show</button> </p>
            <p>Category: ${p.category}</p>

            <button class="update-btn" data-id="${p.id}">Update</button>
            <button class="delete-btn" data-id="${p.id}">Delete</button>

            <hr>
        `;
        passwordsContainer.appendChild(div);

        // SHOW / HIDE password functionality
        const toggleBtn = document.getElementById(`toggle-${p.id}`);
        toggleBtn.addEventListener('click', () => {
            const passSpan = document.getElementById(`password-${p.id}`);
            if (toggleBtn.textContent === 'Show') {
                passSpan.textContent = decryptPassword(p.passwordEncrypted);
                toggleBtn.textContent = 'Hide';
            } else {
                passSpan.textContent = '••••••••';
                toggleBtn.textContent = 'Show';
            }
        });
    });

    attachActionButtons();
}
function attachActionButtons() {
    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
            const id = btn.getAttribute("data-id");

            if (!confirm("Esti sigur ca vrei sa stergi parola?")) return;

            await fetch(`${API_BASE_URL}/passwords/${id}`, {
              method: "DELETE",
              headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
  }
});


            getPasswords();
        });
    });

    document.querySelectorAll(".update-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = btn.getAttribute("data-id");

            // Pune ID-ul automat în formular
            updateIdInput.value = id;

            alert("ID ul este completat in campul de modificare.");
        });
    });
}


// POST
async function addPassword() {
  const newPass = {
    site: siteInput.value,
    username: usernameInput.value,
    passwordEncrypted: encryptPassword(passwordInput.value),
    category: categoryInput.value || 'General'
};
  if (!newPass.site || !newPass.username || !newPass.passwordEncrypted) {
    alert('Site, username and password required');
    return;
  }
  await fetch(`${API_BASE_URL}/passwords`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem("token")
    },
    body: JSON.stringify(newPass)
  });
  siteInput.value = usernameInput.value = passwordInput.value = categoryInput.value = '';
  getPasswords();
}

// PUT
async function updatePassword() {
  const id = updateIdInput.value;
  if (!id) { alert('Enter ID'); return; } 

 const updated = {};
 if (updateUsernameInput.value)
  updated.username = updateUsernameInput.value;
 if (updatePasswordInput.value)
  updated.passwordEncrypted = encryptPassword(updatePasswordInput.value);


  await fetch(`${API_BASE_URL}/passwords/${id}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem("token")
    },
    body: JSON.stringify(updated)
});

  
  updateIdInput.value = '';
  updateUsernameInput.value = '';
  updatePasswordInput.value = '';

  getPasswords();
}

// DELETE
async function deletePassword() {
  const id = deleteIdInput.value;
  if (!id) { alert('Enter ID'); return; }
  await fetch(`${API_BASE_URL}/passwords/${id}`, {
  method: "DELETE",
  headers: {
    "Authorization": "Bearer " + localStorage.getItem("token")
  }
});

  deleteIdInput.value = '';
  getPasswords();
}

// Event listeners
addButton.addEventListener('click', addPassword);
updateButton.addEventListener('click', updatePassword);
deleteButton.addEventListener('click', deletePassword);
loginBtn.addEventListener("click", login);
logoutBtn.addEventListener("click", logout);

// Load passwords on start
getPasswords();

function encryptPassword(password) {
    return CryptoJS.AES.encrypt(password, secretKey).toString();
}

function decryptPassword(cipherText) {
    const bytes = CryptoJS.AES.decrypt(cipherText, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
}
