let whatsappNumber = "522431268546"; // Valor por defecto
let currentSlide = 0;
let slidesPerView = 3;
let isDragging = false;
let startPos = 0;
let currentTranslate = 0;
let prevTranslate = 0;
let animationID = 0;
let hideTimer;
let isHovering = false;
let productsData = [];
let currentMusicIndex = 0;
let musicUrls = [];

async function fetchProductsAndMusic() {
    try {
        const response = await fetch('/main/products');

        if (!response.ok) {
            throw new Error('Error al cargar los productos');
        }

        const data = await response.json();
        if (data.number && data.number.trim() !== "") {
            whatsappNumber = data.number;
        }

        if (data.music && Array.isArray(data.music)) {
            musicUrls = data.music;
            if (musicUrls.length > 0) {
                initAudioPlayer();
            }
        }

        if (data.products && Array.isArray(data.products)) {
            productsData = data.products;
            if (productsData.length > 0) {
                createProductsCarousel();
            } else {
                showNoProductsMessage();
            }
        } else {
            showNoProductsMessage();
        }
    } catch (error) {
        console.error('Error:', error);
        showNoProductsMessage();
    }
}

function showNoProductsMessage() {
    const carouselWrapper = document.getElementById('carouselWrapper');
    const carouselNav = document.getElementById('carouselNav');

    if (carouselNav) carouselNav.style.display = 'none';

    if (carouselWrapper) {
        const existingMessage = document.getElementById('noProductsMessage');
        if (!existingMessage) {
            carouselWrapper.innerHTML = `
                <div class="no-products" id="noProductsMessage">
                    <i class="fas fa-exclamation-circle"></i>
                    <h3>Sin productos actualmente</h3>
                    <p>Estamos actualizando nuestro catálogo. Vuelve pronto.</p>
                </div>
            `;
        }
    }
}

function createProductsCarousel() {
    const carouselWrapper = document.getElementById('carouselWrapper');
    const navDots = document.getElementById('navDots');
    const carouselNav = document.getElementById('carouselNav');

    carouselWrapper.innerHTML = '';
    if (productsData.length === 0) return;

    if (carouselNav) carouselNav.style.display = 'flex';

    productsData.forEach((product, index) => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';

        const whatsappText = encodeURIComponent(`${product.name} - $${product.price} USD`);
        const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappText}`;

        productCard.innerHTML = `
            <img src="${product.imageUrl || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f'}" class="product-image">
            <div class="product-info">
                <h3 class="product-name rainbow-text">${product.name}</h3>
                <div class="product-price">$${product.price} USD</div>
                <p class="product-description">${product.description || ''}</p>
                <a href="${whatsappLink}" target="_blank" class="whatsapp-btn">
                    <i class="fab fa-whatsapp"></i> Comprar por WhatsApp
                </a>
            </div>
        `;
        carouselWrapper.appendChild(productCard);

        if (navDots) {
            const dot = document.createElement('div');
            dot.className = 'dot';
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(index));
            navDots.appendChild(dot);
        }
    });

    updateSlidesPerView();
    updateCarousel();
    setupCarouselEvents();
}

function setupCarouselEvents() {
    const carouselWrapper = document.getElementById('carouselWrapper');
    if (!carouselWrapper) return;

    carouselWrapper.addEventListener('mousedown', startDrag);
    carouselWrapper.addEventListener('touchstart', startDrag);
    carouselWrapper.addEventListener('mouseup', endDrag);
    carouselWrapper.addEventListener('touchend', endDrag);
    carouselWrapper.addEventListener('mouseleave', endDrag);
    carouselWrapper.addEventListener('mousemove', drag);
    carouselWrapper.addEventListener('touchmove', drag);
}

function updateSlidesPerView() {
    if (window.innerWidth < 768) slidesPerView = 1;
    else if (window.innerWidth < 992) slidesPerView = 2;
    else slidesPerView = 3;
}

function goToSlide(slideIndex) {
    currentSlide = slideIndex;
    updateCarousel();
}

function updateCarousel() {
    const carouselWrapper = document.getElementById('carouselWrapper');
    if (!carouselWrapper) return;
    const translateX = -currentSlide * (100 / slidesPerView);
    carouselWrapper.style.transform = `translateX(${translateX}%)`;
}

function startDrag(event) {
    isDragging = true;
    startPos = getPositionX(event);
    animationID = requestAnimationFrame(animation);
}

function endDrag() {
    isDragging = false;
    cancelAnimationFrame(animationID);
    prevTranslate = currentTranslate;
}

function drag(event) {
    if (!isDragging) return;
    const currentPosition = getPositionX(event);
    currentTranslate = prevTranslate + currentPosition - startPos;
}

function animation() {
    setSliderPosition();
    if (isDragging) requestAnimationFrame(animation);
}

function setSliderPosition() {
    const carouselWrapper = document.getElementById('carouselWrapper');
    if (carouselWrapper) {
        carouselWrapper.style.transform = `translateX(${currentTranslate}%)`;
    }
}

function getPositionX(event) {
    return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
}

/* ===================== ⭐ ESTRELLAS ===================== */

function initStars() {
    const starsContainer = document.getElementById('stars-container');
    const starCount = 200;

    const neonColors = ['#00ffff','#00ff99','#ff00ff','#7a00ff','#00aaff'];

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');

        const size = Math.random();
        if (size < 0.6) star.classList.add('star','star-small');
        else if (size < 0.9) star.classList.add('star','star-medium');
        else star.classList.add('star','star-large');

        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 5}s`;

        const c = neonColors[Math.floor(Math.random() * neonColors.length)];
        star.style.setProperty('--star-color', c);
        star.style.setProperty('--dx', `${(Math.random()*14-7).toFixed(1)}px`);
        star.style.setProperty('--dy', `${(Math.random()*18-9).toFixed(1)}px`);
        star.style.setProperty('--dur', `${(4+Math.random()*6).toFixed(2)}s`);

        starsContainer.appendChild(star);
    }
}

function startShootingStars() {
    setInterval(() => {
        if (Math.random() > 0.7) createShootingStar();
    }, 3000);
}

function createShootingStar() {
    const shootingStar = document.createElement('div');
    shootingStar.classList.add('shooting-star');

    const colors = ['#00ffff','#00ff99','#ff00ff','#7a00ff','#00aaff'];
    shootingStar.style.setProperty('--shoot-color',
        colors[Math.floor(Math.random()*colors.length)]
    );

    shootingStar.style.left = `${Math.random()*100}%`;
    shootingStar.style.top = `${Math.random()*30}%`;

    const duration = 1 + Math.random()*2;
    shootingStar.style.animation = `shootingStar ${duration}s linear`;

    document.getElementById('stars-container').appendChild(shootingStar);

    setTimeout(() => shootingStar.remove(), duration*1000);
}

/* ===================== INIT ===================== */

document.addEventListener('DOMContentLoaded', () => {
    initStars();
    startShootingStars();
    fetchProductsAndMusic();

    window.addEventListener('resize', () => {
        updateSlidesPerView();
        updateCarousel();
    });
});