function toggleMenu() {
  const nav = document.querySelector(".nav-links");

  if (!nav) return;

  const isOpen = nav.classList.toggle("mobile-open");

  const button = document.querySelector(".menu");

  if (button) {
    button.setAttribute(
      "aria-expanded",
      isOpen ? "true" : "false"
    );

    button.setAttribute(
      "aria-label",
      isOpen ? "Close menu" : "Open menu"
    );
  }
}


function closeMobileMenu() {
  const nav = document.querySelector(".nav-links");

  if (!nav) return;

  nav.classList.remove("mobile-open");

  nav.querySelectorAll(".nav-dropdown-menu").forEach(function (m) {
    m.classList.remove("open");
  });

  const button = document.querySelector(".menu");

  if (button) {
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-label", "Open menu");
  }
}


function filterCards() {

  const searchBox = document.getElementById("searchBox");

  if (!searchBox) return;

  const query = searchBox.value
    .toLowerCase()
    .trim();

  document
    .querySelectorAll(".searchable")
    .forEach(function (card) {

      const text = card.innerText.toLowerCase();

      card.style.display =
        text.includes(query) ? "" : "none";

    });
}


/* =========================================
   INDIA TODAY DATE
   ========================================= */

function getIndiaToday() {

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());

}


/* =========================================
   TODAY'S FESTIVAL
   ========================================= */

function loadTodayFestival() {

  fetch("festivals.json")

    .then(function (response) {

      if (!response.ok) {

        throw new Error(
          "Unable to load festivals.json"
        );

      }

      return response.json();

    })

    .then(function (festivals) {

      const today = getIndiaToday();


      /*
       * IMPORTANT:
       * केवल आज की तारीख खोजें।
       * अगला festival नहीं दिखाएँ।
       */

      const todayFestival =
        festivals.find(function (festival) {

          return festival.date === today;

        });


      const nameElement =
        document.getElementById(
          "todayFestivalName"
        );


      const dateElement =
        document.getElementById(
          "todayFestivalDate"
        );


      const linkElement =
        document.getElementById(
          "todayFestivalLink"
        );


      if (!nameElement) {

        console.warn(
          "todayFestivalName element not found."
        );

        return;

      }


      /* ==============================
         TODAY FESTIVAL FOUND
         ============================== */

      if (todayFestival) {

        nameElement.textContent =
          todayFestival.name;


        if (dateElement) {

          dateElement.textContent =
            todayFestival.date;

        }


        if (linkElement) {

          if (todayFestival.url) {

            linkElement.href =
              todayFestival.url;

            linkElement.style.display =
              "inline-block";

          } else {

            linkElement.style.display =
              "none";

          }

        }

      }


      /* ==============================
         NO FESTIVAL TODAY
         ============================== */

      else {

        nameElement.textContent =
          "आज कोई प्रमुख त्योहार नहीं है";


        if (dateElement) {

          dateElement.textContent = "";

        }


        if (linkElement) {

          linkElement.style.display =
            "none";

        }

      }

    })


    .catch(function (error) {

      console.error(
        "Festival data error:",
        error
      );

    });

}


/* =========================================
   PAGE READY
   ========================================= */

document.addEventListener(
  "DOMContentLoaded",
  function () {


    /* ==============================
       CURRENT YEAR
       ============================== */

    const year =
      document.getElementById("year");

    if (year) {

      year.textContent =
        new Date().getFullYear();

    }


    /* ==============================
       NAV DROPDOWN
       ============================== */

    document
      .querySelectorAll(".nav-drop-btn")
      .forEach(function (btn) {

        btn.setAttribute(
          "aria-expanded",
          "false"
        );


        btn.addEventListener(
          "click",
          function (event) {

            event.preventDefault();

            event.stopPropagation();


            const menu =
              btn.nextElementSibling;

            if (!menu) return;


            const wasOpen =
              menu.classList.contains("open");


            document
              .querySelectorAll(
                ".nav-dropdown-menu"
              )
              .forEach(function (m) {

                m.classList.remove("open");

              });


            document
              .querySelectorAll(
                ".nav-drop-btn"
              )
              .forEach(function (b) {

                b.setAttribute(
                  "aria-expanded",
                  "false"
                );

              });


            if (!wasOpen) {

              menu.classList.add("open");

              btn.setAttribute(
                "aria-expanded",
                "true"
              );

            }

          }

        );

      });


    /* ==============================
       CLOSE MENU AFTER CLICK
       ============================== */

    document
      .querySelectorAll(
        ".nav-links > a, .nav-dropdown-menu a"
      )
      .forEach(function (link) {

        link.addEventListener(
          "click",
          function () {

            closeMobileMenu();

          }
        );

      });


    /* ==============================
       CLICK OUTSIDE MENU
       ============================== */

    document.addEventListener(
      "click",
      function (event) {

        const nav =
          document.querySelector(
            ".nav-links"
          );

        const menuButton =
          document.querySelector(
            ".menu"
          );


        if (!nav) return;


        if (
          !nav.contains(event.target) &&
          !(
            menuButton &&
            menuButton.contains(event.target)
          )
        ) {

          closeMobileMenu();

        }

      }
    );


    /* ==============================
       WINDOW RESIZE
       ============================== */

    window.addEventListener(
      "resize",
      function () {

        if (window.innerWidth > 900) {

          closeMobileMenu();

        }

      }
    );


    /* ==============================
       LOAD TODAY'S FESTIVAL
       ============================== */

    loadTodayFestival();

  }
);