/*=========================================
FERME ASHER ERP
Dashboard JS Version 1
=========================================*/

document.addEventListener("DOMContentLoaded", () => {

    console.log("Ferme Asher ERP chargé.");

    // Données temporaires
    const dashboardData = {
        quails: 120,
        eggs: 95,
        sales: "45 000 FC",
        stock: "82%"
    };

    // Mise à jour des cartes
    document.getElementById("quails-count").textContent = dashboardData.quails;
    document.getElementById("eggs-count").textContent = dashboardData.eggs;
    document.getElementById("sales-count").textContent = dashboardData.sales;
    document.getElementById("stock-count").textContent = dashboardData.stock;

    // Animation simple des cartes
    const cards = document.querySelectorAll(".card");

    cards.forEach((card, index) => {

        card.style.opacity = "0";
        card.style.transform = "translateY(30px)";

        setTimeout(() => {

            card.style.transition = "0.6s";
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";

        }, index * 200);

    });

});
