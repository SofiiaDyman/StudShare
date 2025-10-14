// URL твого API (зміни коли запустиш backend)
const API_URL = 'http://localhost:3000/api/listings';

// Тимчасові дані для тестування (поки немає backend)
let allListings = [
    {
        id: 1,
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
    }
];

// Змінна для вибору режиму роботи
const USE_API = false; // Зміни на true коли запустиш backend

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
    
    priceSlider.addEventListener('input', function() {
        priceValue.textContent = this.value;
    });
}

// ===== ВІДОБРАЖЕННЯ ОГОЛОШЕНЬ =====
function displayListings(listings) {
    const container = document.getElementById('listingsContainer');
    
    if (listings.length === 0) {
        container.innerHTML = `
            <div class="alert alert-info" style="border-radius: 15px; border: 1px solid #b8c5e8; background: #f0f4ff;">
                <strong>Оголошень не знайдено.</strong> Спробуйте змінити параметри фільтрів.
            </div>
        `;
        return;
    }
    
    container.innerHTML = listings.map(listing => `
        <div class="listing-card">
            <div class="row">
                <div class="col-md-8">
                    <h4>Шукаю співмешканця/співмешканку</h4>
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
                </div>
                <div class="col-md-4 text-end">
                    <div class="price-tag">${listing.price} грн/міс</div>
                    <small class="text-muted">Опубліковано: ${formatDate(listing.created_at)}</small>
                </div>
            </div>
        </div>
    `).join('');
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

    if (USE_API) {
        applyFiltersAPI(price, district, faculty, gender);
    } else {
        let filtered = allListings.filter(listing => {
            if (price && listing.price > price) return false;
            if (district && listing.district !== district) return false;
            if (faculty && listing.faculty !== faculty) return false;
            if (gender && listing.gender !== gender) return false;
            return true;
        });
        displayListings(filtered);
    }
    
    document.getElementById('listingsContainer').scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
    });
}

function resetFilters() {
    document.getElementById('filterPrice').value = 10000;
    document.getElementById('priceValue').textContent = '10000';
    document.getElementById('filterDistrict').value = '';
    document.getElementById('filterFaculty').value = '';
    document.getElementById('filterGender').value = '';
    
    if (USE_API) {
        loadListingsFromAPI();
    } else {
        displayListings(allListings);
    }
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
        addListingAPI(newListing);
    } else {
        newListing.id = allListings.length + 1;
        newListing.created_at = new Date().toISOString().split('T')[0];
        allListings.unshift(newListing);
        displayListings(allListings);
        closeModalAndShowSuccess();
    }
    
    form.reset();
}

function closeModalAndShowSuccess() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('addListingModal'));
    modal.hide();
    showSuccessMessage();
    setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 300);
}

function showSuccessMessage() {
    const message = document.createElement('div');
    message.className = 'alert alert-success';
    message.style.cssText = `
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
    message.innerHTML = '✅ Оголошення успішно опубліковано!';
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => message.remove(), 300);
    }, 3000);
}

// ===== ФУНКЦІЇ ДЛЯ РОБОТИ З API =====
async function loadListingsFromAPI() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Network error');
        const data = await response.json();
        allListings = data;
        displayListings(allListings);
    } catch (error) {
        console.error('Помилка завантаження:', error);
        document.getElementById('listingsContainer').innerHTML = `
            <div class="alert alert-danger" style="border-radius: 15px;">
                <strong>Помилка!</strong> Не вдалося завантажити оголошення. 
                Перевірте чи запущений backend сервер.
            </div>
        `;
    }
}

async function addListingAPI(listing) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(listing)
        });
        
        if (!response.ok) throw new Error('Network error');
        
        await loadListingsFromAPI();
        closeModalAndShowSuccess();
    } catch (error) {
        console.error('Помилка додавання:', error);
        alert('Сталася помилка при додаванні оголошення');
    }
}

async function applyFiltersAPI(price, district, faculty, gender) {
    const params = new URLSearchParams();
    if (price) params.append('price', price);
    if (district) params.append('district', district);
    if (faculty) params.append('faculty', faculty);
    if (gender) params.append('gender', gender);
    
    try {
        const response = await fetch(`${API_URL}/filter?${params}`);
        if (!response.ok) throw new Error('Network error');
        const data = await response.json();
        displayListings(data);
    } catch (error) {
        console.error('Помилка фільтрації:', error);
    }
}