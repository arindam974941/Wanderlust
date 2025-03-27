 // Function to generate star rating
 function generateStars(rating) {
    let stars = "";
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="fas fa-star"></i> '; // Full star
        } else {
            stars += '<i class="far fa-star"></i> '; // Empty star
        }
    }
    return stars;
}
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script> 
