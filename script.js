/* =========================================
   DHARMBODH - MAIN SCRIPT
   Dynamic Homepage Content
   ========================================= */

document.addEventListener("DOMContentLoaded", function () {
  loadFestival();
  loadKnowledge();
  loadMantra();
  loadQuiz();
  loadArticles();
  setupMobileMenu();
});


/* =========================================
   INDIA DATE
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
   LOAD JSON
   ========================================= */

async function loadJSON(file) {
  const response = await fetch(file + "?v=" + Date.now());

  if (!response.ok) {
    throw new Error(file + " could not be loaded");
  }

  return await response.json();
}


/* =========================================
   ARRAY HELPER
   ========================================= */

function asArray(data) {
  if (Array.isArray(data)) return data;

  if (data && Array.isArray(data.items)) {
    return data.items;
  }

  if (data && Array.isArray(data.data)) {
    return data.data;
  }

  if (data && Array.isArray(data.festivals)) {
    return data.festivals;
  }

  if (data && Array.isArray(data.mantras)) {
    return data.mantras;
  }

  if (data && Array.isArray(data.questions)) {
    return data.questions;
  }

  if (data && Array.isArray(data.articles)) {
    return data.articles;
  }

  return [];
}


/* =========================================
   VALUE HELPER
   ========================================= */

function getValue(item, keys) {
  for (const key of keys) {
    if (
      item &&
      item[key] !== undefined &&
      item[key] !== null &&
      String(item[key]).trim() !== ""
    ) {
      return item[key];
    }
  }

  return "";
}


/* =========================================
   FIND TODAY'S ITEM
   ========================================= */

function findToday(items) {
  const today = getIndiaToday();

  return items.find(function (item) {

    const date = getValue(item, [
      "date",
      "day",
      "publishDate",
      "publishedAt"
    ]);

    return String(date).substring(0, 10) === today;
  });
}


/* =========================================
   GET DAY INDEX
   ========================================= */

function getDayIndex(items) {

  if (!items.length) {
    return 0;
  }

  const today = new Date(getIndiaToday() + "T00:00:00");

  const start = new Date(today.getFullYear(), 0, 1);

  const difference =
    Math.floor((today - start) / 86400000);

  return difference % items.length;
}


/* =========================================
   TODAY'S FESTIVAL
   ========================================= */

async function loadFestival() {

  const element = document.getElementById("festivalText");

  if (!element) return;

  try {

    const data = await loadJSON("festivals.json");

    const festivals = asArray(data);

    const todayFestival = findToday(festivals);

    /*
      केवल आज की तारीख वाला त्योहार दिखाएं।
      अगर आज त्योहार नहीं है तो अगला त्योहार
      गलत तरीके से "आज का त्योहार" में नहीं दिखेगा।
    */

    if (todayFestival) {

      const name = getValue(todayFestival, [
        "name",
        "title",
        "festival"
      ]);

      const url = getValue(todayFestival, [
        "url",
        "link"
      ]);

      if (url) {

        element.innerHTML =
          '<a href="' +
          url +
          '">' +
          name +
          "</a>";

      } else {

        element.textContent = name;
      }

    } else {

      element.textContent =
        "आज कोई प्रमुख त्योहार नहीं है।";

    }

  } catch (error) {

    console.error("Festival error:", error);

    element.textContent =
      "आज के त्योहार की जानकारी उपलब्ध नहीं है।";
  }
}


/* =========================================
   TODAY'S DHARMA KNOWLEDGE
   ========================================= */

async function loadKnowledge() {

  const element = document.getElementById("knowledgeText");

  if (!element) return;

  try {

    const data = await loadJSON("dharma-gyan.json");

    const items = asArray(data);

    if (!items.length) {

      element.textContent =
        "धर्म ज्ञान जल्द उपलब्ध होगा।";

      return;
    }

    const todayItem = findToday(items);

    const item =
      todayItem || items[getDayIndex(items)];

    const title = getValue(item, [
      "title",
      "name",
      "heading"
    ]);

    const text = getValue(item, [
      "content",
      "description",
      "text",
      "knowledge",
      "meaning"
    ]);

    if (title && text) {

      element.innerHTML =
        "<strong>" +
        title +
        "</strong><br>" +
        text;

    } else {

      element.textContent =
        text || title || "आज का धर्म ज्ञान उपलब्ध नहीं है।";
    }

  } catch (error) {

    console.error("Dharma knowledge error:", error);

    element.textContent =
      "धर्म ज्ञान लोड नहीं हो पाया।";
  }
}


/* =========================================
   TODAY'S MANTRA
   ========================================= */

async function loadMantra() {

  const mantraElement =
    document.getElementById("mantraText");

  const meaningElement =
    document.getElementById("mantraMeaning");

  if (!mantraElement) return;

  try {

    const data = await loadJSON("mantras.json");

    const mantras = asArray(data);

    if (!mantras.length) return;

    const todayMantra =
      findToday(mantras);

    const mantra =
      todayMantra ||
      mantras[getDayIndex(mantras)];

    const text = getValue(mantra, [
      "mantra",
      "text",
      "title",
      "name"
    ]);

    const meaning = getValue(mantra, [
      "meaning",
      "description",
      "arth"
    ]);

    mantraElement.textContent =
      text || "ॐ नमः शिवाय";

    if (meaningElement) {

      meaningElement.textContent =
        meaning || "";
    }

  } catch (error) {

    console.error("Mantra error:", error);

    mantraElement.textContent =
      "ॐ नमः शिवाय";
  }
}


/* =========================================
   TODAY'S QUIZ
   ========================================= */

async function loadQuiz() {

  const questionElement =
    document.getElementById("quizQuestion");

  const optionsElement =
    document.getElementById("quizOptions");

  const resultElement =
    document.getElementById("quizResult");

  if (!questionElement || !optionsElement) {
    return;
  }

  try {

    const data = await loadJSON("quiz.json");

    const questions = asArray(data);

    if (!questions.length) {

      questionElement.textContent =
        "आज की प्रश्नोत्तरी उपलब्ध नहीं है।";

      return;
    }

    const question =
      questions[getDayIndex(questions)];

    const questionText =
      getValue(question, [
        "question",
        "title",
        "text"
      ]);

    const options =
      question.options ||
      question.answers ||
      [];

    const correctAnswer =
      question.answer ??
      question.correctAnswer ??
      question.correct ??
      question.correctOption;

    questionElement.textContent =
      questionText || "आज का प्रश्न";

    optionsElement.innerHTML = "";

    options.forEach(function (option, index) {

      const button =
        document.createElement("button");

      button.className = "quiz-option";

      if (
        typeof option === "object" &&
        option !== null
      ) {

        button.textContent =
          option.text ||
          option.answer ||
          option.name ||
          "";

      } else {

        button.textContent =
          option;
      }

      button.addEventListener("click", function () {

        const selectedValue =
          typeof option === "object" &&
          option !== null
            ? (
                option.text ||
                option.answer ||
                option.name ||
                ""
              )
            : option;

        let isCorrect = false;

        if (
          typeof correctAnswer === "number"
        ) {

          isCorrect =
            index === correctAnswer ||
            index + 1 === correctAnswer;

        } else {

          isCorrect =
            String(selectedValue).trim() ===
            String(correctAnswer).trim();
        }

        const allButtons =
          optionsElement.querySelectorAll(
            ".quiz-option"
          );

        allButtons.forEach(function (btn) {
          btn.disabled = true;
        });

        if (resultElement) {

          resultElement.textContent =
            isCorrect
              ? "✅ सही उत्तर!"
              : "❌ गलत उत्तर!";
        }
      });

      optionsElement.appendChild(button);
    });

  } catch (error) {

    console.error("Quiz error:", error);

    questionElement.textContent =
      "प्रश्नोत्तरी लोड नहीं हो पाई।";
  }
}


/* =========================================
   LATEST ARTICLES
   ========================================= */

async function loadArticles() {

  const container =
    document.getElementById("latestArticles");

  if (!container) return;

  try {

    const data =
      await loadJSON("articles.json");

    const articles =
      asArray(data);

    if (!articles.length) {

      container.innerHTML =
        "<p>अभी कोई लेख उपलब्ध नहीं है।</p>";

      return;
    }

    /*
      Latest articles:
      अगर date मौजूद है तो newest पहले।
    */

    const sortedArticles =
      [...articles].sort(function (a, b) {

        const dateA =
          getValue(a, [
            "date",
            "publishedAt",
            "publishDate"
          ]);

        const dateB =
          getValue(b, [
            "date",
            "publishedAt",
            "publishDate"
          ]);

        return String(dateB).localeCompare(
          String(dateA)
        );
      });

    const latest =
      sortedArticles.slice(0, 6);

    container.innerHTML = "";

    latest.forEach(function (article) {

      const title =
        getValue(article, [
          "title",
          "name",
          "heading"
        ]);

      const description =
        getValue(article, [
          "description",
          "excerpt",
          "summary",
          "content"
        ]);

      const url =
        getValue(article, [
          "url",
          "link"
        ]);

      const card =
        document.createElement("article");

      card.className =
        "latest-article-card card";

      const heading =
        document.createElement("h3");

      if (url) {

        heading.innerHTML =
          '<a href="' +
          url +
          '">' +
          title +
          "</a>";

      } else {

        heading.textContent =
          title;
      }

      card.appendChild(heading);

      if (description) {

        const paragraph =
          document.createElement("p");

        paragraph.textContent =
          String(description)
            .substring(0, 160);

        card.appendChild(paragraph);
      }

      container.appendChild(card);
    });

  } catch (error) {

    console.error("Articles error:", error);

    container.innerHTML =
      "<p>लेख लोड नहीं हो पाए।</p>";
  }
}


/* =========================================
   MOBILE MENU
   ========================================= */

function setupMobileMenu() {

  const menuButton =
    document.querySelector(".menu-btn");

  const nav =
    document.querySelector(".nav");

  if (!menuButton || !nav) {
    return;
  }

  menuButton.addEventListener(
    "click",
    function () {

      nav.classList.toggle("mobile-open");

    }
  );
}