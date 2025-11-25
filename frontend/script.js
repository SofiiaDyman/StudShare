// ===== КОНФІГУРАЦІЯ =====
const API_BASE = 'http://localhost:3000/api';
const ENDPOINTS = {
    listings: `${API_BASE}/listings`,
    auth: `${API_BASE}/auth`,
    favorites: `${API_BASE}/favorites`
};
const USE_API = true; // вимкни, якщо хочеш працювати лише з локальними даними

// ===== ГЕНЕРАЦІЯ УНІКАЛЬНОГО ID СТУДЕНТА =====
let currentStudentId = localStorage.getItem('studentId');
if (!currentStudentId) {
    currentStudentId = 'student_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('studentId', currentStudentId);
}
console.log('📱 Твій ID студента:', currentStudentId);

// ===== СТАН ПРИКЛАДУ =====
let allListings = [];
let authUser = null;
let favoriteIds = new Set();
let favoriteListings = [];

document.addEventListener('DOMContentLoaded', () => {
    initializePriceSlider();
    setupAuthForms();
    initApp();
});

async function initApp() {
    if (USE_API) {
        await fetchCurrentUser();
        await loadListingsFromAPI();
        if (authUser) {
            await loadFavoritesFromAPI();
        }
    } else {
        allListings = getMockListings();
        displayListings(allListings);
    }
    updateAuthUI();
}

// ===== ІНІЦІАЛІЗАЦІЯ ФІЛЬТРІВ =====
function initializePriceSlider() {
    // Функція залишена для сумісності, але тепер використовується input поле
    const priceInput = document.getElementById('filterPriceInput');
    if (priceInput) {
        // Валідація тільки при втраті фокусу, щоб не заважати вводу
        priceInput.addEventListener('blur', function() {
            let value = parseInt(this.value) || 0;
            if (value < 0) {
                this.value = 0;
            } else if (value > 15000) {
                this.value = 15000;
            } else {
                this.value = value;
            }
        });
        
        // Дозволяємо вводити будь-які символи, але перевіряємо при blur
        priceInput.addEventListener('input', function() {
            // Дозволяємо порожнє значення під час вводу
            if (this.value === '') {
                return;
            }
            // Перевіряємо, чи це число
            const numValue = parseInt(this.value);
            if (isNaN(numValue) && this.value !== '') {
                // Якщо не число і не порожнє, залишаємо попереднє значення
                return;
            }
        });
    }
}

// ===== ВІДОБРАЖЕННЯ ОГОЛОШЕНЬ =====
function displayListings(listings) {
    const container = document.getElementById('listingsContainer');

    if (!container) return;

    if (!listings || listings.length === 0) {
        container.innerHTML = `
            <div class="alert alert-info" style="border-radius: 15px; border: 1px solid #b8c5e8; background: #f0f4ff;">
                <strong>Оголошень не знайдено.</strong> Спробуй змінити параметри фільтрів.
            </div>
        `;
        return;
    }

    container.innerHTML = listings.map(generateListingCard).join('');
}

function generateListingCard(listing) {
    // Власник — якщо залогінений через backend або локальний
    const isMyListing = authUser && listing.student_id === `user_${authUser.id}`;
    const utilitiesText = listing.utilities_included ? 'включені' : 'окремо';

    return `
        <div class="listing-card" data-listing-id="${listing.id}">
            <div class="row">
                <div class="col-md-8">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <h4>Шукаю співмешканця/співмешканку</h4>
                        ${isMyListing ? '<span class="badge bg-warning text-dark" style="height: fit-content; margin-left: 10px;">МОЄ 🏷️</span>' : ''}
                    </div>
                    
                    <p class="text-muted mb-2">
                        <span class="badge bg-info badge-custom">${listing.gender === 'хлопець' ? 'Хлопець' : 'Дівчина'}</span>
                        <span class="badge bg-success badge-custom">${listing.faculty}</span>
                        <span class="badge bg-warning text-dark badge-custom">${listing.course} курс</span>
                    </p>
                    <p><strong>Спеціальність:</strong> ${listing.specialty}</p>
                    <p><strong>Район:</strong> ${listing.district}</p>
                    <p><strong>Адреса:</strong> ${listing.address}</p>
                    <p><strong>Кімнат:</strong> ${listing.rooms_count} | <strong>Мешканців:</strong> ${listing.people_count}</p>
                    <p><strong>Комунальні:</strong> ${utilitiesText}</p>
                    ${listing.additional_info ? `<p class="mb-2"><strong>Додатково:</strong> ${listing.additional_info}</p>` : ''}
                    
                    <div class="contact-info">
                        <strong>Контакти:</strong><br>
                        📱 ${listing.contact_phone}<br>
                        ${listing.contact_telegram ? `💬 Telegram: ${listing.contact_telegram}<br>` : ''}
                        ${listing.contact_instagram ? `📷 Instagram: ${listing.contact_instagram}` : ''}
                    </div>
                    
                    ${isMyListing ? `
                        <div style="margin-top: 15px; display: flex; gap: 10px;">
                            <button class="btn btn-sm btn-warning" onclick="editListing(${listing.id})" style="padding: 10px 20px;">
                                ✏️ Редагувати
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deleteListing(${listing.id})" style="padding: 10px 20px;">
                                🗑️ Видалити
                            </button>
                        </div>
                    ` : ''}
                </div>
                
                <div class="col-md-4 text-end">
                    <div class="price-tag">${listing.price} грн/міс</div>
                    <small class="text-muted d-block mb-2">Опубліковано: ${formatDate(listing.created_at)}</small>
                    <div class="listing-actions">
                        ${renderFavoriteAction(listing)}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderFavoriteAction(listing) {
    if (!authUser) {
        return `<button class="btn-favorite" onclick="openAuthModal('login')">♡ Додати в обрані</button>`;
    }

    const isFavorite = favoriteIds.has(Number(listing.id));
    return `
        <button class="btn-favorite ${isFavorite ? 'active' : ''}" onclick="toggleFavorite(${listing.id})">
            ${isFavorite ? '❤️ В обраних' : '♡ Додати в обрані'}
        </button>
    `;
}

// ===== ФОРМАТУВАННЯ ДАТИ =====
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
}

// ===== ФІЛЬТРИ =====
function applyFilters() {
    displayListings(getFilteredListings());

    const container = document.getElementById('listingsContainer');
    if (container) {
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function resetFilters() {
    const priceInput = document.getElementById('filterPriceInput');
    if (priceInput) priceInput.value = 0;
    document.getElementById('filterDistrict').value = '';
    document.getElementById('filterFaculty').value = '';
    document.getElementById('filterGender').value = '';
    
    displayListings(allListings);
}

function getFilteredListings() {
    const priceInput = document.getElementById('filterPriceInput');
    const priceValue = priceInput ? priceInput.value : '0';
    const price = priceValue === '' || priceValue === '0' ? 0 : parseInt(priceValue);
    const district = document.getElementById('filterDistrict').value;
    const faculty = document.getElementById('filterFaculty').value;
    const gender = document.getElementById('filterGender').value;

    return allListings.filter(listing => {
        // Якщо price = 0, то фільтр по ціні не застосовується
        if (price > 0 && listing.price > price) return false;
        if (district && listing.district !== district) return false;
        if (faculty && listing.faculty !== faculty) return false;
        if (gender && listing.gender !== gender) return false;
        return true;
    });
}

// ===== ДОДАВАННЯ ОГОЛОШЕННЯ =====
async function submitListing() {
    const form = document.getElementById('addListingForm');
    
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    if (!authUser) {
        openAuthModal('login');
        return;
    }

    const formData = new FormData(form);
    
    const nextId = allListings.length ? Math.max(...allListings.map(l => Number(l.id) || 0)) + 1 : 1;
    const newListing = {
        student_id: authUser ? `user_${authUser.id}` : currentStudentId,
        gender: formData.get('gender'),
        faculty: formData.get('faculty'),
        course: parseInt(formData.get('course')),
        specialty: formData.get('specialty'),
        district: formData.get('district'),
        address: formData.get('address'),
        rooms_count: parseInt(formData.get('rooms_count')),
        people_count: parseInt(formData.get('people_count')),
        price: parseFloat(formData.get('price')),
        utilities_included: formData.get('utilities_included') === 'on',
        additional_info: formData.get('additional_info') || '',
        contact_phone: formData.get('contact_phone'),
        contact_telegram: formData.get('contact_telegram') || '',
        contact_instagram: formData.get('contact_instagram') || '',
        created_at: new Date().toISOString().split('T')[0]
    };

    if (!USE_API) {
        newListing.id = nextId;
    }

    if (USE_API) {
        await addListingAPI(newListing);
    } else {
        allListings.unshift(newListing);
        displayListings(allListings);
        form.reset();
        closeModalAndShowSuccess('✅ Оголошення успішно опубліковано!');
    }
}

// ===== РЕДАГУВАННЯ ОГОЛОШЕННЯ =====
function editListing(listingId) {
    const listing = allListings.find(l => l.id === listingId);
    
    if (!listing) {
        alert('❌ Оголошення не знайдено');
        return;
    }
    // Перевіряємо чи це МОЄ оголошення
    if (!authUser || listing.student_id !== `user_${authUser.id}`) {
        alert('❌ Ти можеш редагувати тільки своє оголошення!');
        return;
    }
    
    // Заповнюємо форму з даними оголошення
    const form = document.getElementById('addListingForm');
    form.querySelector('select[name="gender"]').value = listing.gender;
    form.querySelector('select[name="faculty"]').value = listing.faculty;
    form.querySelector('select[name="course"]').value = listing.course;
    form.querySelector('input[name="specialty"]').value = listing.specialty;
    form.querySelector('select[name="district"]').value = listing.district;
    form.querySelector('input[name="address"]').value = listing.address;
    form.querySelector('input[name="rooms_count"]').value = listing.rooms_count;
    form.querySelector('input[name="people_count"]').value = listing.people_count;
    form.querySelector('input[name="price"]').value = listing.price;
    form.querySelector('input[name="utilities_included"]').checked = listing.utilities_included;
    form.querySelector('textarea[name="additional_info"]').value = listing.additional_info;
    form.querySelector('input[name="contact_phone"]').value = listing.contact_phone;
    form.querySelector('input[name="contact_telegram"]').value = listing.contact_telegram;
    form.querySelector('input[name="contact_instagram"]').value = listing.contact_instagram;
    
    // Зберігаємо ID для оновлення
    form.dataset.editingListingId = listingId;
    
    // Змінюємо текст кнопки
    const submitBtn = document.querySelector('.modal-footer .btn-primary-custom');
    submitBtn.textContent = 'Оновити оголошення';
    
    // Відкриваємо модальне вікно
    const modal = new bootstrap.Modal(document.getElementById('addListingModal'));
    modal.show();
}

// ===== ОНОВЛЕННЯ / ДОДАВАННЯ ОГОЛОШЕННЯ =====
async function submitListingUpdated() {
    const form = document.getElementById('addListingForm');
    
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const formData = new FormData(form);
    const editingId = form.dataset.editingListingId;
    
    if (editingId) {
        // РЕДАГУВАННЯ
        const listingIndex = allListings.findIndex(l => l.id === parseInt(editingId));
        
        if (listingIndex !== -1) {
            const updatedListing = {
                ...allListings[listingIndex],
                gender: formData.get('gender'),
                faculty: formData.get('faculty'),
                course: parseInt(formData.get('course')),
                specialty: formData.get('specialty'),
                district: formData.get('district'),
                address: formData.get('address'),
                rooms_count: parseInt(formData.get('rooms_count')),
                people_count: parseInt(formData.get('people_count')),
                price: parseFloat(formData.get('price')),
                utilities_included: formData.get('utilities_included') === 'on',
                additional_info: formData.get('additional_info') || '',
                contact_phone: formData.get('contact_phone'),
                contact_telegram: formData.get('contact_telegram') || '',
                contact_instagram: formData.get('contact_instagram') || ''
            };

            if (USE_API) {
                await updateListingAPI(parseInt(editingId), updatedListing);
            } else {
                allListings[listingIndex] = updatedListing;
                displayListings(allListings);
            }

            form.reset();
            form.dataset.editingListingId = '';
            closeModalAndShowSuccess('✅ Оголошення успішно оновлено!');
            
            const submitBtn = document.querySelector('.modal-footer .btn-primary-custom');
            submitBtn.textContent = 'Опублікувати оголошення';
        }
    } else {
        await submitListing();
    }
}

// ===== ВИДАЛЕННЯ ОГОЛОШЕННЯ =====
async function deleteListing(listingId) {
    const listing = allListings.find(l => l.id === listingId);
    
    if (!listing) {
        alert('❌ Оголошення не знайдено');
        return;
    }
    // Перевіряємо чи це МОЄ оголошення
    if (!authUser || listing.student_id !== `user_${authUser.id}`) {
        alert('❌ Ти можеш видаляти тільки своє оголошення!');
        return;
    }
    
    if (confirm('❌ Ти впевнений що хочеш видалити це оголошення?')) {
        if (USE_API) {
            await deleteListingAPI(listingId);
        } else {
            allListings = allListings.filter(l => l.id !== listingId);
            displayListings(allListings);
        }
        showSuccessMessage('🗑️ Оголошення видалено!');
    }
}

// ===== ДОПОМІЖНІ ФУНКЦІЇ =====
function closeModalAndShowSuccess(message) {
    const modalElement = document.getElementById('addListingModal');
    const modal = bootstrap.Modal.getInstance(modalElement);
    if (modal) modal.hide();
    showSuccessMessage(message);
    setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 300);
}

function showSuccessMessage(message) {
    const messageEl = document.createElement('div');
    messageEl.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        z-index: 9999;
        padding: 20px 30px;
        border-radius: 15px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        background: linear-gradient(135deg, #c9ddc8 0%, #e8f5e9 100%);
        border: 1px solid #a5d6a7;
        color: #2e7d32;
        font-weight: 500;
        animation: slideIn 0.3s ease;
    `;
    messageEl.innerHTML = message;
    
    document.body.appendChild(messageEl);
    
    setTimeout(() => {
        messageEl.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => messageEl.remove(), 300);
    }, 3000);
}

// ===== API ФУНКЦІЇ (для коли запустиш backend) =====
async function loadListingsFromAPI() {
    try {
        const response = await fetch(ENDPOINTS.listings, { credentials: 'include' });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        allListings = data || [];
        console.log(`✅ Завантажено ${allListings.length} оголошень з API`);
        displayListings(allListings);
    } catch (error) {
        console.error('❌ Помилка завантаження оголошень:', error);
        console.error('Перевір:');
        console.error('1. Чи запущений backend сервер? (http://localhost:3000)');
        console.error('2. Чи правильно налаштована база даних?');
        console.error('3. Відкрий консоль браузера (F12) для деталей');
        
        // Показуємо повідомлення користувачу
        const container = document.getElementById('listingsContainer');
        if (container) {
            container.innerHTML = `
                <div class="alert alert-warning" style="border-radius: 15px; border: 1px solid #ffc107; background: #fff3cd;">
                    <strong>⚠️ Не вдалося завантажити оголошення</strong><br>
                    <small>Перевір, чи запущений backend сервер на http://localhost:3000</small><br>
                    <small>Відкрий консоль браузера (F12) для деталей помилки</small>
                </div>
            `;
        }
    }
}

async function addListingAPI(listing) {
    try {
        const response = await fetch(ENDPOINTS.listings, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(listing)
        });
        
        if (!response.ok) throw new Error('Network error');
        
        await loadListingsFromAPI();
        document.getElementById('addListingForm').reset();
        closeModalAndShowSuccess('✅ Оголошення успішно опубліковано!');
    } catch (error) {
        console.error('Помилка додавання:', error);
        alert('❌ Помилка при додаванні оголошення');
    }
}

async function updateListingAPI(id, listing) {
    const response = await fetch(`${ENDPOINTS.listings}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(listing)
    });

    if (!response.ok) {
        console.error('Помилка оновлення');
        alert('❌ Не вдалося оновити оголошення');
        return;
    }

    await loadListingsFromAPI();
}

async function deleteListingAPI(id) {
    const response = await fetch(`${ENDPOINTS.listings}/${id}`, {
        method: 'DELETE',
        credentials: 'include'
    });

    if (!response.ok) {
        console.error('Помилка видалення');
        alert('❌ Не вдалося видалити оголошення');
        return;
    }

    await loadListingsFromAPI();
}

// ===== AUTH =====
function setupAuthForms() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(loginForm);
            await login(formData.get('email'), formData.get('password'));
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(registerForm);
            await register({
                full_name: formData.get('full_name'),
                email: formData.get('email'),
                password: formData.get('password')
            });
        });
    }
}

function switchAuthMode(mode) {
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.mode === mode);
    });

    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm && registerForm) {
        loginForm.classList.toggle('d-none', mode !== 'login');
        registerForm.classList.toggle('d-none', mode !== 'register');
    }
}

function openAuthModal(mode = 'login') {
    switchAuthMode(mode);
    const modalEl = document.getElementById('authModal');
    if (!modalEl) return;
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
}

function openAddListingModal() {
    if (!authUser) {
        openAuthModal('login');
        return;
    }

    const form = document.getElementById('addListingForm');
    if (form) {
        form.reset();
        delete form.dataset.editingListingId;
    }

    const submitBtn = document.querySelector('.modal-footer .btn-primary-custom');
    if (submitBtn) submitBtn.textContent = 'Опублікувати оголошення';

    const modalEl = document.getElementById('addListingModal');
    if (!modalEl) return;
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

function closeAuthModal() {
    const modalEl = document.getElementById('authModal');
    if (!modalEl) return;
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal?.hide();
}

async function register(payload) {
    try {
        const response = await fetch(`${ENDPOINTS.auth}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Не вдалося створити аккаунт');
        }

        const data = await response.json();
        authUser = data.user;
        await loadFavoritesFromAPI();
        updateAuthUI();
        closeAuthModal();
        showSuccessMessage('🎉 Реєстрація успішна!');
    } catch (error) {
        alert(error.message);
    }
}

async function login(email, password) {
    try {
        const response = await fetch(`${ENDPOINTS.auth}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Невірні облікові дані');
        }

        const data = await response.json();
        authUser = data.user;
        await loadFavoritesFromAPI();
        updateAuthUI();
        closeAuthModal();
        showSuccessMessage('👋 Вітаємо, вхід успішний!');
    } catch (error) {
        alert(error.message);
    }
}

async function logout() {
    try {
        await fetch(`${ENDPOINTS.auth}/logout`, {
            method: 'POST',
            credentials: 'include'
        });
    } finally {
        authUser = null;
        favoriteIds.clear();
        favoriteListings = [];
        updateAuthUI();
        renderFavoritesPanel();
        hideFavoritesPanel();
        showSuccessMessage('👋 До зустрічі!');
    }
}

async function fetchCurrentUser() {
    try {
        const response = await fetch(`${ENDPOINTS.auth}/me`, {
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            authUser = data.user;
        } else {
            authUser = null;
        }
    } catch (error) {
        console.warn('Не вдалося отримати користувача', error);
        authUser = null;
    }
}

// ===== FAVORITES =====
async function loadFavoritesFromAPI() {
    if (!authUser) return;

    try {
        const response = await fetch(ENDPOINTS.favorites, { credentials: 'include' });
        if (!response.ok) throw new Error('Network error');

        const data = await response.json();
        favoriteListings = data;
        favoriteIds = new Set(data.map(item => Number(item.id)));
        renderFavoritesPanel();
        displayListings(getFilteredListings());
    } catch (error) {
        console.error('Помилка отримання обраних:', error);
    }
}

async function toggleFavorite(listingId) {
    if (!authUser) {
        openAuthModal('login');
        return;
    }

    const isFavorite = favoriteIds.has(Number(listingId));
    const method = isFavorite ? 'DELETE' : 'POST';

    try {
        const response = await fetch(`${ENDPOINTS.favorites}/${listingId}`, {
            method,
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Не вдалося оновити обране');

        await loadFavoritesFromAPI();
        showSuccessMessage(isFavorite ? '❤️ Видалено з обраних' : '❤️ Додано до обраних');
    } catch (error) {
        alert(error.message);
    }
}

function renderFavoritesPanel() {
    const container = document.getElementById('favoritesContainer');
    if (!container) return;

    if (!authUser) {
        container.innerHTML = `
            <div class="alert alert-info">
                Увійди, щоб бачити свої збережені оголошення.
            </div>
        `;
        return;
    }

    if (favoriteListings.length === 0) {
        container.innerHTML = `
            <div class="alert alert-warning">
                Поки що немає обраних оголошень. Натисни «Додати в обрані» на картці.
            </div>
        `;
        return;
    }

    container.innerHTML = favoriteListings.map(generateListingCard).join('');
}

function showFavoritesPanel() {
    const panel = document.getElementById('favoritesSection');
    if (!panel) return;
    panel.classList.remove('d-none');
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function hideFavoritesPanel() {
    const panel = document.getElementById('favoritesSection');
    if (!panel) return;
    panel.classList.add('d-none');
}

function updateAuthUI() {
    const authControls = document.getElementById('authControls');
    const favoritesToggle = document.getElementById('favoritesToggle');

    if (!authControls) return;

    if (authUser) {
        authControls.innerHTML = `
            <div class="dropdown">
                <button class="btn btn-outline-auth dropdown-toggle" data-bs-toggle="dropdown">
                    ${authUser.full_name || authUser.email}
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                    <li><button class="dropdown-item" type="button" onclick="showFavoritesPanel()">Мої обрані</button></li>
                    <li><button class="dropdown-item" type="button" onclick="logout()">Вийти</button></li>
                </ul>
            </div>
        `;
        favoritesToggle?.classList.remove('d-none');
    } else {
        authControls.innerHTML = `
            <button class="btn btn-outline-auth" onclick="openAuthModal('login')">
                Увійти
            </button>
            <button class="btn btn-outline-auth" onclick="openAuthModal('register')">
                Зареєструватись
            </button>
        `;
        favoritesToggle?.classList.add('d-none');
    }
}

// ===== MOCK DATA ДЛЯ ОФЛАЙН РЕЖИМУ =====
function getMockListings() {
    return [
        {
            id: 1,
            student_id: 'student_sample_1',
            gender: 'дівчина',
            faculty: 'Прикладної математики та інформатики',
            course: 3,
            specialty: 'Комп\'ютерні науки',
            district: 'Франківський',
            address: 'вул. Наукова, 15',
            rooms_count: 2,
            people_count: 1,
            price: 2500,
            utilities_included: true,
            additional_info: 'Тиха квартира, поблизу університет.',
            contact_phone: '+380 67 123 4567',
            contact_telegram: '@example_user',
            contact_instagram: '@example_user',
            created_at: '2024-03-15'
        },
        {
            id: 2,
            student_id: 'student_sample_2',
            gender: 'хлопець',
            faculty: 'Економічний',
            course: 2,
            specialty: 'Економіка',
            district: 'Сихівський',
            address: 'вул. Стрийська, 201',
            rooms_count: 3,
            people_count: 2,
            price: 2000,
            utilities_included: false,
            additional_info: 'Велика квартира, є Wi-Fi, пральна машина.',
            contact_phone: '+380 95 987 6543',
            contact_telegram: '@student_lviv',
            contact_instagram: '',
            created_at: '2024-03-20'
        },
        {
            id: 3,
            student_id: 'student_sample_3',
            gender: 'дівчина',
            faculty: 'Філологічний',
            course: 4,
            specialty: 'Українська мова',
            district: 'Галицький',
            address: 'вул. Коперника, 7',
            rooms_count: 2,
            people_count: 1,
            price: 3000,
            utilities_included: true,
            additional_info: 'Центр міста, поруч бібліотека.',
            contact_phone: '+380 98 765 4321',
            contact_telegram: '@studentka_lnu',
            contact_instagram: '@student_life',
            created_at: '2024-03-22'
        }
    ];
}

// Після генерації currentStudentId
authUser = {
    id: 1,
    full_name: 'Тестовий Користувач',
    email: 'test@example.com'
};
