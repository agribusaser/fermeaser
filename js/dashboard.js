document.addEventListener("DOMContentLoaded", function () {

    // ===== KPI =====

    document.getElementById("quails-count").textContent = "120";

    document.getElementById("eggs-count").textContent = "95";

    document.getElementById("sales-count").textContent = "45 000 FC";

    document.getElementById("stock-count").textContent = "82%";


    // ===========================
    // Production
    // ===========================

    new Chart(

        document.getElementById('productionChart'),

        {

            type: 'line',

            data: {

                labels: [

                    'Lun',

                    'Mar',

                    'Mer',

                    'Jeu',

                    'Ven',

                    'Sam',

                    'Dim'

                ],

                datasets: [

                    {

                        label: 'Œufs',

                        data: [

                            85,

                            92,

                            88,

                            101,

                            96,

                            110,

                            105

                        ],

                        borderWidth:3,

                        tension:0.4,

                        fill:true

                    }

                ]

            },

            options:{

                responsive:true,

                plugins:{

                    legend:{

                        display:true

                    }

                }

            }

        }

    );


    // ===========================
    // Ventes
    // ===========================

    new Chart(

        document.getElementById('salesChart'),

        {

            type:'bar',

            data:{

                labels:[

                    'Jan',

                    'Fev',

                    'Mar',

                    'Avr',

                    'Mai',

                    'Juin'

                ],

                datasets:[

                    {

                        label:'Ventes (FC)',

                        data:[

                            120000,

                            180000,

                            150000,

                            240000,

                            210000,

                            290000

                        ],

                        borderWidth:1

                    }

                ]

            },

            options:{

                responsive:true

            }

        }

    );

});
