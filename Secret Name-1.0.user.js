// ==UserScript==
// @name         Auto SimpleMMO 1 step
// @namespace    https://web.simple-mmo.com/
// @version      1.0
// @description  Plays SMMO for you
// @author       Cong Hieu
// @match        https://web.simple-mmo.com/travel*
// @match        http://web.simple-mmo.com/travel*
// @match        https://web.simple-mmo.com/jobs/view/*
// @match        http://web.simple-mmo.com/jobs/view/*
// @match        https://web.simple-mmo.com/npcs/attack/*
// @match        http://web.simple-mmo.com/npcs/attack/*
// @match        https://web.simple-mmo.com/crafting/material/gather/*
// @match        http://web.simple-mmo.com/crafting/material/gather/*
// ==/UserScript==

(function () {
  "use strict";
  let captchalog = "color:red; font-size:20px;";
  let warning = "color:orange; font-size:12px;";
  let lognote = "color:green; font-size:12px;";
  let captchaDetected = false; // Flag to track captcha detection

  function clearConsoleLog() {
    console.clear();
    console.log("Console was cleared.");
  }

  function getRandomOffset() {
    return Math.floor(Math.random() * 11) - 5;
  }

  function shortskip() {
    return Math.floor(Math.random() * 100) + 500;
  }

  function longwait() {
    return Math.floor(Math.random() * 200) + 1200;
  }

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function waitPageLoad(ms) {
    console.log("2. waiting page to load up");
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  function extractTravelTextId() {
    const elements = document.querySelectorAll("[x-html^='travel.']");
    for (const element of elements) {
      const xHtmlValue = element.getAttribute("x-html");
      const startIndex = xHtmlValue.indexOf("travel.") + "travel.".length;
      const endIndex = xHtmlValue.indexOf(" + '<a href");
      if (startIndex !== -1 && endIndex !== -1) {
        return xHtmlValue.substring(startIndex, endIndex);
      }
    }
    return null;
  }

  async function generate() {
    const generateButtons = document.querySelectorAll("button");
    for (const button of generateButtons) {
      if (button.textContent.includes("Quick generate another NPC")) {
        const rect = button.getBoundingClientRect();
        const offsetX = getRandomOffset();
        const offsetY = getRandomOffset();
        button.dispatchEvent(
          new MouseEvent("click", {
            bubbles: true,
            clientX: rect.left + rect.width / 2 + offsetX,
            clientY: rect.top + rect.height / 2 + offsetY,
          }),
        );
        console.log("-> Generating enemy");
        return true; // Indicate that the generate button was found and clicked
      }
    }
    return false; // Indicate that no generate button was found
  }
  async function checkTravelText() {
    const travelTextId = extractTravelTextId();
    if (!travelTextId) {
      console.log("%c No travel text ID found.", warning);
      await delay(shortskip());
      return false;
    }

    const travelTextElements = document.querySelectorAll("." + travelTextId);
    for (const element of travelTextElements) {
      if (element.innerText.includes("Woah! Hold up there.")) {
        await delay(shortskip());
        return true;
      } else {
        console.log("3. No travel captcha, continue");
      }
    }
    await delay(shortskip());
    return false;
  }

  async function checkTravelText2() {
    const element = document.querySelector("[x-html='battle_end.content']");
    if (element) {
      const content = element.innerText;
      if (content.includes("We just need to make sure that you are a human")) {
        console.log("Script stopped: captcha found in travel text.");
        await delay(shortskip());
        return true;
      }
    }
    await delay(shortskip());
    console.log("4. No battle captcha, continue");
    return false;
  }

  function playAudioFromLocalStorage() {
    const savedAudioSrc = localStorage.getItem("audioSrc");
    if (savedAudioSrc) {
      const audio = new Audio(savedAudioSrc);
      audio.play();
      console.log("Audio loaded and playing from localStorage");
    } else {
      console.log("No audio file found in localStorage");
    }
  }

  async function attack() {
    const attackbutton = document.querySelector(
      'a[onclick="clickAndDisable(this)"]',
    );
    if (attackbutton) {
      console.log("5. Enemy Spotted!!!");
      const rect = attackbutton.getBoundingClientRect();
      const offsetX = getRandomOffset();
      const offsetY = getRandomOffset();
      attackbutton.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          clientX: rect.left + rect.width / 2 + offsetX,
          clientY: rect.top + rect.height / 2 + offsetY,
        }),
      );
      console.log("-> Entering battlefield!!!");
      await delay(shortskip()); // wait for 1 second
      return true;
    } else {
      console.log("5. Area Clear!");
      await delay(shortskip()); // wait for 1 second
      return false;
    }
  }

  async function dmg() {
    if (captchaDetected) {
      return false;
    }

    const enemyHealthBar = document.querySelector(
      "#app > div.h-screen.flex.overflow-hidden.bg-gray-100 > div.flex.flex-col.w-0.flex-1.overflow-hidden.relative > main > div.web-app-container > div > div.rounded-lg.h-96 > div.h-4\\/5.flex.justify-center.items-center.flex-wrap.gap-2 > div:nth-child(2) > div.rounded-lg.w-36.bg-gray-100.h-4.mt-2.bg-opacity-40.flex.justify-center > div",
    );
    let enemyHealthWidth = enemyHealthBar ? enemyHealthBar.style.width : null;

    while (enemyHealthWidth !== "0%") {
      const dmgButton = document.querySelector(
        "#app > div.h-screen.flex.overflow-hidden.bg-gray-100 > div.flex.flex-col.w-0.flex-1.overflow-hidden.relative > main > div.web-app-container > div > div.rounded-lg.h-96 > div:nth-child(2) > button:nth-child(1)",
      );

      if (dmgButton) {
        // Wait until the button is enabled
        while (dmgButton.disabled) {
          await delay(shortskip()); // Adjust the delay as needed
        }

        // Check enemy health again before attacking
        enemyHealthWidth = enemyHealthBar ? enemyHealthBar.style.width : null;
        if (enemyHealthWidth === "0%") {
          break;
        }

        const rect = dmgButton.getBoundingClientRect();
        const offsetX = getRandomOffset();
        const offsetY = getRandomOffset();
        dmgButton.dispatchEvent(
          new MouseEvent("click", {
            bubbles: true,
            clientX: rect.left + rect.width / 2 + offsetX,
            clientY: rect.top + rect.height / 2 + offsetY,
          }),
        );
        console.log("-> Take This!!!");
        await delay(longwait());
      } else {
        await delay(shortskip());
        return false;
      }

      enemyHealthWidth = enemyHealthBar ? enemyHealthBar.style.width : null;
    }

    if (enemyHealthWidth === "0%") {
      console.log("-> Enemy Slain, leaving battlefield...");
      await delay(shortskip());

      if (await checkTravelText2()) {
        console.log("%c Battle captcha detected!!", captchalog);
        playAudioFromLocalStorage();
        captchaDetected = true;
        return false;
      }

      if (await generate()) {
        return false;
      }

      const endButton = document.querySelector(
        "#app > div.h-screen.flex.overflow-hidden.bg-gray-100 > div.flex.flex-col.w-0.flex-1.overflow-hidden.relative > main > div.web-app-container > div > div.relative.z-20 > div.fixed.inset-0.z-10.overflow-y-auto > div > div > div.mt-5.sm\\:mt-6 > a",
      );

      if (endButton) {
        const rect = endButton.getBoundingClientRect();
        const offsetX = getRandomOffset();
        const offsetY = getRandomOffset();
        endButton.dispatchEvent(
          new MouseEvent("click", {
            bubbles: true,
            clientX: rect.left + rect.width / 2 + offsetX,
            clientY: rect.top + rect.height / 2 + offsetY,
          }),
        );
        return true;
      } else {
        return false;
      }
    }
    return false;
  }

  async function mine() {
    const mineButton = document.querySelector(
      'button[x-on\\:click^="clicked=true;document.location=\'/crafting/material/gather/"]:not([disabled])',
    );
    if (mineButton) {
      console.log("6. Materials found!!!");
      const rect = mineButton.getBoundingClientRect();
      const offsetX = getRandomOffset();
      const offsetY = getRandomOffset();
      mineButton.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          clientX: rect.left + rect.width / 2 + offsetX,
          clientY: rect.top + rect.height / 2 + offsetY,
        }),
      );
      return true;
    } else {
      console.log("6. No materials found...");
      return false;
    }
  }

  async function gather(maxAttempts = 10) {
    let attemptCount = 0;
    while (attemptCount < maxAttempts) {
      const gatherButton = document.querySelector("#crafting_button");
      if (gatherButton) {
        // Wait until the button is enabled
        while (gatherButton.disabled) {
          await delay(shortskip()); // Adjust the delay as needed
        }

        // Add a random delay after the button is enabled
        const randomClickDelay = Math.floor(Math.random() * 500) + 500; // Random delay between 500 and 1000 milliseconds
        await delay(randomClickDelay);

        console.log("-> Gathering...");
        const rect = gatherButton.getBoundingClientRect();
        const offsetX = getRandomOffset();
        const offsetY = getRandomOffset();
        gatherButton.dispatchEvent(
          new MouseEvent("click", {
            bubbles: true,
            clientX: rect.left + rect.width / 2 + offsetX,
            clientY: rect.top + rect.height / 2 + offsetY,
          }),
        );
        await delay(shortskip());
        attemptCount++;
      } else {
        return false;
      }
    }
    console.log(
      `Max attempts reached (${maxAttempts}). Stopping gather function.`,
    );
    return false;
  }
  async function step() {
    const stepButtonSelector =
      "#complete-travel-container > div.relative.mt-2.rounded-lg > div > div > div.mx-2.pb-4.mt-6 > div.mt-2.text-center.flex.flex-col.items-center.justify-center.relative > div > div > div.relative > button:nth-child(3)";

    const waitForButtonEnabled = async () => {
      while (true) {
        const stepButton = document.querySelector(stepButtonSelector);
        if (stepButton && !stepButton.disabled) {
          console.log("%c7. Stepbutton found", "color:green;");
          return stepButton;
        }
        await delay(1000); // Adjust the delay as needed
      }
    };

    const enabledStepButton = await waitForButtonEnabled();
    if (enabledStepButton) {
      const randomClickDelay = Math.floor(Math.random() * 500) + 1000; // Random delay between 500 and 1000 milliseconds
      await delay(randomClickDelay); // Delay before clicking
      console.log("8. Taking a step...");
      const rect = enabledStepButton.getBoundingClientRect();
      const offsetX = getRandomOffset();
      const offsetY = getRandomOffset();
      enabledStepButton.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          clientX: rect.left + rect.width / 2 + offsetX,
          clientY: rect.top + rect.height / 2 + offsetY,
        }),
      );
      return true;
    } else {
      console.log("8. Cannot take a step.");
      return false;
    }
  }

async function pageloadstep() {
  const stepButtonSelector =
    "#complete-travel-container > div.relative.mt-2.rounded-lg > div > div > div.mx-2.pb-4.mt-6 > div.mt-2.text-center.flex.flex-col.items-center.justify-center.relative > div > div > div.relative > button:nth-child(3)";

  const stepButton = document.querySelector(stepButtonSelector);
  if (stepButton && !stepButton.disabled) {
    // Button is enabled, click it
    const randomClickDelay = Math.floor(Math.random() * 500) + 1000; // Random delay between 500 and 1000 milliseconds
    await delay(randomClickDelay); // Delay before clicking
    const rect = stepButton.getBoundingClientRect();
    const offsetX = getRandomOffset();
    const offsetY = getRandomOffset();
    stepButton.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        clientX: rect.left + rect.width / 2 + offsetX,
        clientY: rect.top + rect.height / 2 + offsetY,
      }),
    );
    return true;
  } else {
    // Button is disabled, skip this function
    return false;
  }
}

  async function performActions() {
    console.log("1. Procedure starts here");
    await waitPageLoad(shortskip());
    const [isTravelText1Detected, isTravelText2Detected] = await Promise.all([
      checkTravelText(),
      checkTravelText2(),
    ]);

    if (isTravelText1Detected) {
      console.log("%c Travel Captcha Detected!!", captchalog);
      playAudioFromLocalStorage();
      return;
    }

    if (isTravelText2Detected) {
      console.log("%c Battle Captcha Detected!!", captchalog);
      playAudioFromLocalStorage();
      return;
    }
    await Promise.all([attack(), mine()]);
    while (await dmg()) {}
    while (await gather()) {}
    if (await step()) {
    }
    console.log("%c --------------THIS IS THE END--------------", lognote);
    performActions();
  }
  pageloadstep();
  performActions();
})();
