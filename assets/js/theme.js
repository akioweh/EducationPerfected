// Custom theme code

if (document.getElementsByClassName('clean-gallery').length > 0) {
   baguetteBox.run('.clean-gallery', { animation: 'slideIn' });
}

if (document.getElementsByClassName('clean-product').length > 0) {
    window.onload = function() {
        vanillaZoom.init('#product-preview');
    };
}

for (let i = 0; i < localStorage.length; i++) {
    if (localStorage.getItem(localStorage.key(i)) !== null) {
        document.querySelector(':root').style.setProperty(localStorage.key(i), localStorage.getItem(localStorage.key(i)))
    }
}
