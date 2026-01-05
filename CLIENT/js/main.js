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


// GET all
async function getPasswords() {
  const res = await fetch(`${API_BASE_URL}/passwords`);
  const data = await res.json();
  displayPasswords(data);
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
                method: "DELETE"
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
    headers: { 'Content-Type': 'application/json' },
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
    headers: { 'Content-Type': 'application/json' },
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
  await fetch(`${API_BASE_URL}/passwords/${id}`, { method: 'DELETE' });
  deleteIdInput.value = '';
  getPasswords();
}

// Event listeners
addButton.addEventListener('click', addPassword);
updateButton.addEventListener('click', updatePassword);
deleteButton.addEventListener('click', deletePassword);

// Load passwords on start
getPasswords();

function encryptPassword(password) {
    return CryptoJS.AES.encrypt(password, secretKey).toString();
}

function decryptPassword(cipherText) {
    const bytes = CryptoJS.AES.decrypt(cipherText, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
}
