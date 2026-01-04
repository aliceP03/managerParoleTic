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

// Display passwords
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
      <p>Password: ${p.passwordEncrypted}</p>
      <p>Category: ${p.category}</p>
      <hr>
    `;
    passwordsContainer.appendChild(div);
  });
}

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
            <p>Password: ${decryptPassword(p.passwordEncrypted)}</p>
            <p>Category: ${p.category}</p>
            <hr>
        `;
        passwordsContainer.appendChild(div);
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

  const updated = {
    site: updateSiteInput.value,
    username: updateUsernameInput.value,
    passwordEncrypted: updatePasswordInput.value,
    category: updateCategoryInput.value
  };

  await fetch(`${API_BASE_URL}/passwords/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated)
  });

  updateIdInput.value = updateSiteInput.value = updateUsernameInput.value = updatePasswordInput.value = updateCategoryInput.value = '';
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
