// Carousel Navigation Logic
const carousel = document.querySelector('.carousel');
const images = document.querySelectorAll('.carousel-image');

let currentIndex = 0;

document.querySelector('#next-btn').addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % images.length;
    carousel.scrollLeft = images[currentIndex].offsetLeft;
});

document.querySelector('#prev-btn').addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    carousel.scrollLeft = images[currentIndex].offsetLeft;
});
