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
            console.log("Número de WhatsApp cargado:", whatsappNumber);
        } else {
            console.log("Usando número de WhatsApp por defecto:", whatsappNumber);
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
    
    if (carouselNav) {
        carouselNav.style.display = 'none';
    }
    
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
    
    if (productsData.length === 0) {
        showNoProductsMessage();
        return;
    }
    
    if (carouselNav) {
        carouselNav.style.display = 'flex';
    }
    
    productsData.forEach((product, index) => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        const whatsappText = encodeURIComponent(`${product.name} - $${product.price} USD`);
        const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappText}`;
        
        productCard.innerHTML = `
            <img src="${product.imageUrl || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-name rainbow-text">${product.name}</h3>
                <div class="product-price">
                    <i class="fas fa-tag"></i> $${product.price || '0.00'} USD
                </div>
                <p class="product-description">${product.description || 'Descripción no disponible'}</p>
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
            dot.dataset.index = index;
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
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (!carouselWrapper || productsData.length === 0) return;
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentSlide > 0) {
                goToSlide(currentSlide - 1);
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const maxSlide = Math.ceil(productsData.length / slidesPerView) - 1;
            if (currentSlide < maxSlide) {
                goToSlide(currentSlide + 1);
            }
        });
    }
    
    carouselWrapper.addEventListener('mousedown', startDrag);
    carouselWrapper.addEventListener('touchstart', startDrag);
    carouselWrapper.addEventListener('mouseup', endDrag);
    carouselWrapper.addEventListener('touchend', endDrag);
    carouselWrapper.addEventListener('mouseleave', endDrag);
    carouselWrapper.addEventListener('mousemove', drag);
    carouselWrapper.addEventListener('touchmove', drag);
}

function updateSlidesPerView() {
    if (window.innerWidth < 768) {
        slidesPerView = 1;
    } else if (window.innerWidth < 992) {
        slidesPerView = 2;
    } else {
        slidesPerView = 3;
    }
}

function goToSlide(slideIndex) {
    if (productsData.length === 0) return;
    
    const maxSlide = Math.ceil(productsData.length / slidesPerView) - 1;
    if (slideIndex < 0) slideIndex = 0;
    if (slideIndex > maxSlide) slideIndex = maxSlide;
    
    currentSlide = slideIndex;
    updateCarousel();
}

function updateCarousel() {
    const carouselWrapper = document.getElementById('carouselWrapper');
    if (!carouselWrapper || productsData.length === 0) return;
    
    const slideWidth = 100 / slidesPerView;
    const translateX = -currentSlide * slideWidth;
    
    carouselWrapper.style.transform = `translateX(${translateX}%)`;
    
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

function startDrag(event) {
    if (productsData.length === 0) return;
    
    isDragging = true;
    startPos = getPositionX(event);
    animationID = requestAnimationFrame(animation);
    
    const carouselWrapper = document.getElementById('carouselWrapper');
    if (carouselWrapper) {
        carouselWrapper.style.cursor = 'grabbing';
    }
}

function endDrag() {
    if (!isDragging || productsData.length === 0) return;
    
    isDragging = false;
    cancelAnimationFrame(animationID);
    
    const carouselWrapper = document.getElementById('carouselWrapper');
    if (carouselWrapper) {
        carouselWrapper.style.cursor = 'grab';
    }
    
    const movedBy = currentTranslate - prevTranslate;
    const slideWidth = 100 / slidesPerView;
    
    if (movedBy < -10 && currentSlide < Math.ceil(productsData.length / slidesPerView) - 1) {
        currentSlide += 1;
    }
    
    if (movedBy > 10 && currentSlide > 0) {
        currentSlide -= 1;
    }
    
    setPositionByIndex();
}

function drag(event) {
    if (isDragging && productsData.length > 0) {
        const currentPosition = getPositionX(event);
        currentTranslate = prevTranslate + currentPosition - startPos;
    }
}

function animation() {
    if (productsData.length > 0) {
        setSliderPosition();
    }
    if (isDragging) requestAnimationFrame(animation);
}

function setSliderPosition() {
    const carouselWrapper = document.getElementById('carouselWrapper');
    if (carouselWrapper) {
        carouselWrapper.style.transform = `translateX(${currentTranslate}%)`;
    }
}

function setPositionByIndex() {
    if (productsData.length === 0) return;
    
    const slideWidth = 100 / slidesPerView;
    currentTranslate = -currentSlide * slideWidth;
    prevTranslate = currentTranslate;
    setSliderPosition();
    updateCarousel();
}

function getPositionX(event) {
    return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
}

function initAudioPlayer() {
    const player = document.getElementById('musicPlayer');
    const toggleBtn = document.getElementById('togglePlayer');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const prevBtnMusic = document.getElementById('prevBtnMusic');
    const nextBtnMusic = document.getElementById('nextBtnMusic');
    const audio = document.getElementById('audioPlayer');
    
    if (!player || !audio || musicUrls.length === 0) {
        if (player) {
            player.style.display = 'none';
        }
        return;
    }
    
    let isPlaying = false;
    let currentTrack = 0;
    
    function loadTrack(index) {
        if (musicUrls[index]) {
            audio.src = musicUrls[index];
            if (isPlaying) {
                audio.play().catch(e => console.log('Error al reproducir:', e));
            }
        }
    }
    
    loadTrack(currentTrack);
    
    player.addEventListener('mouseenter', () => {
        isHovering = true;
        clearTimeout(hideTimer);
        showPlayer();
    });
    
    player.addEventListener('mouseleave', () => {
        isHovering = false;
        if (!player.classList.contains('hidden')) {
            startHideTimer();
        }
    });
    
    toggleBtn.addEventListener('click', () => {
        if (player.classList.contains('hidden')) {
            showPlayer();
            startHideTimer();
        } else {
            hidePlayer();
        }
    });
    
    playPauseBtn.addEventListener('click', () => {
        if (isPlaying) {
            audio.pause();
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        } else {
            audio.play().catch(e => {
                console.log('Error al reproducir:', e);
            });
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        }
        isPlaying = !isPlaying;
    });
    
    prevBtnMusic.addEventListener('click', () => {
        currentTrack = (currentTrack - 1 + musicUrls.length) % musicUrls.length;
        loadTrack(currentTrack);
        if (isPlaying) {
            audio.play();
        }
    });
    
    nextBtnMusic.addEventListener('click', () => {
        currentTrack = (currentTrack + 1) % musicUrls.length;
        loadTrack(currentTrack);
        if (isPlaying) {
            audio.play();
        }
    });
    
    audio.addEventListener('ended', () => {
        currentTrack = (currentTrack + 1) % musicUrls.length;
        loadTrack(currentTrack);
        if (isPlaying) {
            audio.play();
        }
    });
    
    document.body.addEventListener('click', function initAudio() {
        if (!isPlaying && musicUrls.length > 0) {
            audio.play().then(() => {
                isPlaying = true;
                playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            }).catch(e => {});
        }
        document.body.removeEventListener('click', initAudio);
    }, { once: true });
    
    startHideTimer();
}

function showPlayer() {
    const player = document.getElementById('musicPlayer');
    if (player) {
        player.classList.remove('hidden');
    }
}

function hidePlayer() {
    const player = document.getElementById('musicPlayer');
    if (player) {
        player.classList.add('hidden');
    }
}

function startHideTimer() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
        if (!isHovering) {
            hidePlayer();
        }
    }, 4000);
}

/* ===========================
   ⭐ ESTRELLAS: MEJORAS AQUÍ
   =========================== */
function initStars() {
    const starsContainer = document.getElementById('stars-container');
    const starCount = 200;

    // 🎨 Colores neón tipo el gato
    const neonColors = ['#00ffff', '#00ff99', '#ff00ff', '#7a00ff', '#00aaff'];
    
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        
        const size = Math.random();
        if (size < 0.6) {
            star.classList.add('star', 'star-small');
        } else if (size < 0.9) {
            star.classList.add('star', 'star-medium');
        } else {
            star.classList.add('star', 'star-large');
        }
        
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 5}s`;

        // ✅ Color aleatorio (se usa en CSS con var(--star-color))
        const c = neonColors[Math.floor(Math.random() * neonColors.length)];
        star.style.setProperty('--star-color', c);

        // ✅ Movimiento extra suave (un poquito más)
        star.style.setProperty('--dx', `${(Math.random() * 14 - 7).toFixed(1)}px`); // -7..7
        star.style.setProperty('--dy', `${(Math.random() * 18 - 9).toFixed(1)}px`); // -9..9
        star.style.setProperty('--dur', `${(4 + Math.random() * 6).toFixed(2)}s`);  // 4..10s
        
        starsContainer.appendChild(star);
    }
}

function startShootingStars() {
    setInterval(() => {
        if (Math.random() > 0.7) {
            createShootingStar();
        }
    }, 3000);
}

function createShootingStar() {
    const shootingStar = document.createElement('div');
    shootingStar.classList.add('shooting-star');

    // 🎨 Color neón para la estrella fugaz
    const neonColors = ['#00ffff', '#00ff99', '#ff00ff', '#7a00ff', '#00aaff'];
    const c = neonColors[Math.floor(Math.random() * neonColors.length)];
    shootingStar.style.setProperty('--shoot-color', c);
    
    const startX = Math.random() * 100;
    const startY = Math.random() * 30;
    
    shootingStar.style.left = `${startX}%`;
    shootingStar.style.top = `${startY}%`;
    
    const duration = 1 + Math.random() * 2;
    shootingStar.style.animation = `shootingStar ${duration}s linear`;
    
    document.getElementById('stars-container').appendChild(shootingStar);
    
    setTimeout(() => {
        if (shootingStar.parentNode) {
            shootingStar.parentNode.removeChild(shootingStar);
        }
    }, duration * 1000);
}

document.addEventListener('DOMContentLoaded', function() {
    initStars();
    startShootingStars();
    fetchProductsAndMusic();
    
    window.addEventListener('resize', () => {
        if (productsData.length > 0) {
            updateSlidesPerView();
            updateCarousel();
        }
    });
});