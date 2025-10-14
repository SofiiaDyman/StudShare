// ===== КОНФІГУРАЦІЯ =====
const API_URL = 'http://localhost:3000/api/listings';
const USE_API = false; // Змінити на true коли запустиш backend

// ===== ГЕНЕРАЦІЯ УНІКАЛЬНОГО ID СТУДЕНТА =====
let currentStudentId = localStorage.getItem('studentId');
if (!currentStudentId) {
    currentStudentId = 'student_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('studentId', currentStudentId);
}
console.log('📱 Твій ID студента:', currentStudentId);

// ===== ТИМЧАСОВІ ДАНІ (тестові оголошення) =====
let allListings = [
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

// ===== ІНІЦІАЛІЗАЦІЯ =====
document.addEventListener('DOMContentLoaded', function() {
    initializePriceSlider();
    if (USE_API) {
        loadListingsFromAPI();
    } else {
        displayListings(allListings);
    }
});

// ===== СЛАЙДЕР ЦІНИ =====
function initializePriceSlider() {
    const priceSlider = document.getElementById('filterPrice');
    const priceValue = document.getElementById('priceValue');
    
    if (priceSlider) {
        priceSlider.addEventListener('input', function() {
            priceValue.textContent = this.value;
        });
    }
}

// ===== ВІДОБРАЖЕННЯ ОГОЛОШЕНЬ =====
function displayListings(listings) {
    const container = document.getElementById('listingsContainer');
    
    if (!container) return;
    
    if (listings.length === 0) {
        container.innerHTML = `
            <div class="alert alert-info" style="border-radius: 15px; border: 1px solid #b8c5e8; background: #f0f4ff;">
                <strong>Оголошень не знайдено.</strong> Спробуйте змінити параметри фільтрів.
            </div>
        `;
        return;
    }
    
    container.innerHTML = listings.map(listing => {
        // Перевіряємо чи це МОЄ оголошення
        const isMyListing = listing.student_id === currentStudentId;
        
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
                        <p><strong>Комунальні:</strong> ${listing.utilities_included ? 'включені' : 'окремо'}</p>
                        ${listing.additional_info ? `<p class="mb-2"><strong>Додатково:</strong> ${listing.additional_info}</p>` : ''}
                        
                        <div class="contact-info">
                            <strong>Контакти:</strong><br>
                            📱 ${listing.contact_phone}<br>
                            ${listing.contact_telegram ? `💬 Telegram: ${listing.contact_telegram}<br>` : ''}
                            ${listing.contact_instagram ? `📷 Instagram: ${listing.contact_instagram}` : ''}
                        </div>
                        
                        <!-- КНОПКИ - видимі тільки для свого оголошення -->
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
                        <small class="text-muted">Опубліковано: ${formatDate(listing.created_at)}</small>
                    </div>
                </div>
            </div>
        `;
    }).join('');
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
    const price = parseInt(document.getElementById('filterPrice').value);
    const district = document.getElementById('filterDistrict').value;
    const faculty = document.getElementById('filterFaculty').value;
    const gender = document.getElementById('filterGender').value;

    let filtered = allListings.filter(listing => {
        if (price && listing.price > price) return false;
        if (district && listing.district !== district) return false;
        if (faculty && listing.faculty !== faculty) return false;
        if (gender && listing.gender !== gender) return false;
        return true;
    });

    displayListings(filtered);
    
    const container = document.getElementById('listingsContainer');
    if (container) {
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function resetFilters() {
    document.getElementById('filterPrice').value = 10000;
    document.getElementById('priceValue').textContent = '10000';
    document.getElementById('filterDistrict').value = '';
    document.getElementById('filterFaculty').value = '';
    document.getElementById('filterGender').value = '';
    
    displayListings(allListings);
}

// ===== ДОДАВАННЯ ОГОЛОШЕННЯ =====
function submitListing() {
    const form = document.getElementById('addListingForm');
    
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const formData = new FormData(form);
    
    const newListing = {
        id: Math.max(...allListings.map(l => l.id), 0) + 1,
        student_id: currentStudentId, // 🔑 ВАЖЛИВО: зберігаємо ID студента
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

    if (USE_API) {
        addListingAPI(newListing);
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
    if (listing.student_id !== currentStudentId) {
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
function submitListingUpdated() {
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
            allListings[listingIndex] = {
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
            
            displayListings(allListings);
            form.reset();
            form.dataset.editingListingId = '';
            closeModalAndShowSuccess('✅ Оголошення успішно оновлено!');
            
            const submitBtn = document.querySelector('.modal-footer .btn-primary-custom');
            submitBtn.textContent = 'Опублікувати оголошення';
        }
    } else {
        // ДОДАВАННЯ
        submitListing();
    }
}

// ===== ВИДАЛЕННЯ ОГОЛОШЕННЯ =====
function deleteListing(listingId) {
    const listing = allListings.find(l => l.id === listingId);
    
    if (!listing) {
        alert('❌ Оголошення не знайдено');
        return;
    }
    
    // Перевіряємо чи це МОЄ оголошення
    if (listing.student_id !== currentStudentId) {
        alert('❌ Ти можеш видаляти тільки своє оголошення!');
        return;
    }
    
    if (confirm('❌ Ти впевнений що хочеш видалити це оголошення?')) {
        allListings = allListings.filter(l => l.id !== listingId);
        displayListings(allListings);
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
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Network error');
        const data = await response.json();
        allListings = data;
        displayListings(allListings);
    } catch (error) {
        console.error('Помилка завантаження:', error);
    }
}

async function addListingAPI(listing) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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