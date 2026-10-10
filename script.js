/* =========================================
   DHARMBODH - MAIN SCRIPT
   Dynamic homepage content
   ========================================= */

function getIndiaToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

async function loadJSON(file) {
  const response = await fetch(file, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(file + " could not be loaded: " + response.status);
  }

  return response.json();
}

function asArray(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.items)) return data.items;
  if (data && Array.isArray(data.data)) return data.data;
  if (data && Array.isArray(data.festivals)) return data.festivals;
  if (data && Array.isArray(data.questions)) return data.questions;
  if (data && Array.isArray(data.mantras)) return data.mantras;
  if (data && Array.isArray(data.articles)) return data.articles;
  return [];
}

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

function dayIndex(items) {
  if (!items.length) return 0;

  const today = new Date(getIndiaToday() + "T00:00:00");
  const start = new Date(today.getFullYear(), 0, 1);

  return Math.floor((today - start) / 86400000) % items.length;
}

function findToday(items) {
  const today = getIndiaToday();

  return items.find(function (item) {
    const date = getValue(item, [
      "date",
      "day",
      "publishDate",
      "publishedAt"
    ]);

    return String(date).slice(0, 10) === today;
  });
}

function text(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value || "";
}

function clear(id) {
  const element = document.getElementById(id);
  if (element) element.innerHTML = "";
  return element;
}

/* =========================================
   TODAY'S FESTIVAL
   ========================================= */

async function loadTodayFestival() {
  try {
    const items = asArray(await loadJSON("festivals.json"));
    const festival = findToday(items);

    if (festival) {
      text(
        "festivalText",
        getValue(festival, ["name", "title", "festival"]) ||
        "आज का प्रमुख त्योहार"
      );
    } else {
      text("festivalText", "आज कोई प्रमुख त्योहार नहीं है");
    }
  } catch (error) {
    console.error("Festival error:", error);
    text("festivalText", "आज का त्योहार उपलब्ध नहीं है");
  }
}

/* =========================================
   TODAY'S DHARMA GYAN
   ========================================= */

async function loadDailyDharmaGyan() {
  try {
    const items = asArray(await loadJSON("dharma-gyan.json"));

    if (!items.length) throw new Error("No Dharma Gyan data");

    const item = findToday(items) || items[dayIndex(items)];

    const title = getValue(item, ["title", "name", "heading"]);
    const content = getValue(item, [
      "content",
      "description",
      "text",
      "meaning",
      "answer"
    ]);

    text(
      "knowledgeText",
      title && content ? title + " — " + content : (content || title)
    );
  } catch (error) {
    console.error("Dharma Gyan error:", error);
    text("knowledgeText", "धर्म ज्ञान उपलब्ध नहीं है।");
  }
}

/* =========================================
   TODAY'S MANTRA
   ========================================= */

async function loadDailyMantra() {
  try {
    const items = asArray(await loadJSON("mantras.json"));

    if (!items.length) throw new Error("No mantra data");

    const item = findToday(items) || items[dayIndex(items)];

    text(
      "mantraText",
      getValue(item, ["mantra", "text", "title", "name"]) ||
      "ॐ नमः शिवाय"
    );

    text(
      "mantraMeaning",
      getValue(item, ["meaning", "description", "benefit", "arth"])
    );
  } catch (error) {
    console.error("Mantra error:", error);
    text("mantraText", "ॐ नमः शिवाय");
    text("mantraMeaning", "");
  }
}

/* =========================================
   TODAY'S QUIZ
   ========================================= */

function getOptions(item) {
  const options = getValue(item, ["options", "choices"]);

  if (Array.isArray(options)) return options;

  if (options && typeof options === "object") {
    return Object.values(options);
  }

  return [];
}

function optionText(option) {
  if (typeof option === "string" || typeof option === "number") {
    return String(option);
  }

  return getValue(option, ["text", "label", "option", "answer"]);
}

function checkAnswer(selectedIndex, selected, item, buttons) {
  const answer = getValue(item, [
    "answer",
    "correctAnswer",
    "correct",
    "correct_option"
  ]);

  const options = getOptions(item);
  const normalizedAnswer = String(answer).trim().toLowerCase();
  const normalizedSelected = String(selected).trim().toLowerCase();
  const answerIndex = Number(answer);
  let correct = false;
  let correctAnswerText = "";

  // In quiz.json, numeric answers use zero-based option indexes.
  if (
    answer !== "" &&
    Number.isInteger(answerIndex) &&
    answerIndex >= 0 &&
    answerIndex < options.length
  ) {
    correct = selectedIndex === answerIndex;
    correctAnswerText = optionText(options[answerIndex]);
  } else {
    const matchingIndex = options.findIndex(function (option) {
      return optionText(option).trim().toLowerCase() === normalizedAnswer;
    });
    correct = normalizedSelected === normalizedAnswer;
    if (matchingIndex >= 0) {
      correctAnswerText = optionText(options[matchingIndex]);
    } else {
      correctAnswerText = String(answer || "");
    }
  }

  buttons.forEach(function (button) {
    button.disabled = true;
  });

  const result = document.getElementById("quizResult");

  if (result) {
    result.textContent = correct
      ? "सही उत्तर!"
      : correctAnswerText
        ? "सही उत्तर: " + correctAnswerText
        : "उत्तर दर्ज किया गया।";
  }
}

async function loadDailyQuiz() {
  try {
    const items = asArray(await loadJSON("quiz.json"));

    if (!items.length) throw new Error("No quiz data");

    const item = findToday(items) || items[dayIndex(items)];

    text(
      "quizQuestion",
      getValue(item, ["question", "q", "title", "text"]) ||
      "आज का प्रश्न उपलब्ध नहीं है।"
    );

    const container = clear("quizOptions");
    const result = document.getElementById("quizResult");

    if (result) result.textContent = "";

    if (!container) return;

    const options = getOptions(item);

    if (!options.length) {
      return;
    }

    const buttons = [];

    options.forEach(function (option, index) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "quiz-option";
      button.textContent = optionText(option) || ("विकल्प " + (index + 1));

      button.addEventListener("click", function () {
        checkAnswer(
          index,
          optionText(option) || String(index),
          item,
          buttons
        );
      });

      buttons.push(button);
      container.appendChild(button);
    });
  } catch (error) {
    console.error("Quiz error:", error);
    text("quizQuestion", "आज का प्रश्न उपलब्ध नहीं है।");
  }
}

/* =========================================
   LATEST ARTICLES
   ========================================= */

async function loadLatestArticles() {
  try {
    const items = asArray(await loadJSON("articles.json"));
    const container = clear("latestArticles");

    if (!container) return;
    if (!items.length) return;

    const sorted = items.slice().sort(function (a, b) {
      const dateA = getValue(a, ["date", "publishedAt", "publishDate"]);
      const dateB = getValue(b, ["date", "publishedAt", "publishDate"]);

      return String(dateB).localeCompare(String(dateA));
    });

    sorted.slice(0, 6).forEach(function (article) {
      const card = document.createElement("article");
      card.className = "latest-article-card";

      const title = getValue(article, ["title", "name", "heading"]);
      const description = getValue(article, [
        "description",
        "excerpt",
        "summary",
        "text"
      ]);
      const url = getValue(article, ["url", "link", "href"]);

      const heading = document.createElement("h3");

      if (url) {
        const link = document.createElement("a");
        link.href = url;
        link.textContent = title;
        heading.appendChild(link);
      } else {
        heading.textContent = title;
      }

      card.appendChild(heading);

      if (description) {
        const paragraph = document.createElement("p");
        paragraph.textContent = description;
        card.appendChild(paragraph);
      }

      container.appendChild(card);
    });
  } catch (error) {
    console.error("Articles error:", error);
  }
}

/* =========================================
   MOBILE MENU
   ========================================= */

function setupMenu() {
  const button = document.querySelector(".menu-btn");
  const nav = document.querySelector(".nav");

  if (!button || !nav) return;

  button.addEventListener("click", function () {
    const open = nav.classList.toggle("mobile-open");

    button.setAttribute("aria-expanded", open ? "true" : "false");
  });

  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      nav.classList.remove("mobile-open");
      button.setAttribute("aria-expanded", "false");
    });
  });
}

/* =========================================
   PAGE READY
   ========================================= */

document.addEventListener("DOMContentLoaded", function () {
  setupMenu();

  loadTodayFestival();
  loadDailyDharmaGyan();
  loadDailyMantra();
  loadDailyQuiz();
  loadLatestArticles();
});
