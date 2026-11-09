(function () {
  "use strict";

  var menuBtn = document.getElementById("menuBtn");
  var nav = document.getElementById("siteNav");

  if (menuBtn && nav) {
    var setMenu = function (open) {
      nav.classList.toggle("is-open", open);
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.textContent = open ? "Close" : "Menu";
    };

    menuBtn.addEventListener("click", function () {
      setMenu(!nav.classList.contains("is-open"));
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        setMenu(false);
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        setMenu(false);
        menuBtn.focus();
      }
    });

    document.addEventListener("click", function (event) {
      if (!nav.classList.contains("is-open")) return;
      if (!nav.contains(event.target) && !menuBtn.contains(event.target)) {
        setMenu(false);
      }
    });

    window.addEventListener("resize", function () {
      if (window.matchMedia("(min-width: 981px)").matches) {
        setMenu(false);
      }
    });
  }

  var year = document.getElementById("year");
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  var form = document.getElementById("bookingForm");
  if (!form) return;

  var outcome = document.getElementById("outcome");
  var outcomeMessage = document.getElementById("outcomeMessage");
  var waLink = document.getElementById("waLink");
  var mailLink = document.getElementById("mailLink");
  var copyBtn = document.getElementById("copyBtn");
  var copyStatus = document.getElementById("copyStatus");
  var editBtn = document.getElementById("editBtn");

  var fields = {
    name: document.getElementById("name"),
    email: document.getElementById("email"),
    phone: document.getElementById("phone"),
    country: document.getElementById("country"),
    meeting: document.getElementById("meeting"),
    goal: document.getElementById("goal")
  };

  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function wrapperFor(name) {
    return form.querySelector('[data-field="' + name + '"]');
  }

  function setError(name, message) {
    var wrapper = wrapperFor(name);
    if (!wrapper) return;
    wrapper.classList.add("has-error");
    var error = wrapper.querySelector(".field__error");
    if (error && message) {
      error.textContent = message;
    }
    var control = wrapper.querySelector("input, select, textarea");
    if (control) {
      control.setAttribute("aria-invalid", "true");
    }
  }

  function clearErrors() {
    form.querySelectorAll(".has-error").forEach(function (wrapper) {
      wrapper.classList.remove("has-error");
    });
    form.querySelectorAll("[aria-invalid]").forEach(function (control) {
      control.removeAttribute("aria-invalid");
    });
  }

  function checkedServices() {
    return Array.prototype.slice
      .call(form.querySelectorAll('input[name="service"]:checked'))
      .map(function (box) {
        return box.value;
      });
  }

  var wantedService = new URLSearchParams(window.location.search).get("service");
  if (wantedService) {
    var wanted = wantedService.trim().toLowerCase();
    Array.prototype.forEach.call(
      form.querySelectorAll('input[name="service"]'),
      function (box) {
        if (box.value.toLowerCase() === wanted) {
          box.checked = true;
        }
      }
    );
  }

  form.addEventListener("input", function (event) {
    var wrapper = event.target.closest("[data-field]");
    if (wrapper) {
      wrapper.classList.remove("has-error");
      var control = wrapper.querySelector("input, select, textarea");
      if (control) control.removeAttribute("aria-invalid");
    }
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    clearErrors();

    var firstInvalid = null;
    var invalidCount = 0;

    var name = fields.name.value.trim();
    var email = fields.email.value.trim();
    var phone = fields.phone.value.trim();
    var country = fields.country.value.trim();
    var goal = fields.goal.value.trim();
    var services = checkedServices();

    if (!name) {
      setError("name");
      firstInvalid = firstInvalid || fields.name;
      invalidCount += 1;
    }

    if (!email && !phone) {
      setError("email", "Add an email address or a phone number so I can reply.");
      firstInvalid = firstInvalid || fields.email;
      invalidCount += 1;
    } else if (email && !emailPattern.test(email)) {
      setError(
        "email",
        "That email address looks incomplete. Check for a missing @ or a typo."
      );
      firstInvalid = firstInvalid || fields.email;
      invalidCount += 1;
    }

    if (!services.length) {
      setError("services");
      firstInvalid =
        firstInvalid || form.querySelector('input[name="service"]');
      invalidCount += 1;
    }

    if (invalidCount > 0) {
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    var lines = ["Consultation request", "", "Name: " + name];
    if (email) lines.push("Email: " + email);
    if (phone) lines.push("Phone or WhatsApp: " + phone);
    if (country) lines.push("Country: " + country);
    lines.push("Interested in: " + services.join(", "));
    if (fields.meeting.value) lines.push("Preferred: " + fields.meeting.value);
    if (goal) {
      lines.push("", "Family question:", goal);
    }

    var message = lines.join("\n");

    outcomeMessage.textContent = message;
    waLink.href = "https://wa.me/233246296828?text=" + encodeURIComponent(message);
    mailLink.href =
      "mailto:bekoedanso68@gmail.com?subject=" +
      encodeURIComponent("Consultation request from " + name) +
      "&body=" +
      encodeURIComponent(message);

    copyStatus.textContent = "";
    form.hidden = true;
    outcome.hidden = false;
    outcome.focus({ preventScroll: true });
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    outcome.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start"
    });
  });

  copyBtn.addEventListener("click", function () {
    var text = outcomeMessage.textContent;

    function selectMessage() {
      var range = document.createRange();
      range.selectNodeContents(outcomeMessage);
      var selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }

    function legacyCopy() {
      try {
        selectMessage();
        return document.execCommand("copy");
      } catch (error) {
        return false;
      }
    }

    function announce(copied) {
      copyStatus.textContent = copied
        ? "Copied. Paste it into WhatsApp or an email."
        : "Copying was blocked. The message is selected: use your browser's Copy, or press Ctrl + C on a computer.";
      if (!copied) selectMessage();
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () {
          announce(true);
        },
        function () {
          announce(legacyCopy());
        }
      );
      return;
    }

    announce(legacyCopy());
  });

  editBtn.addEventListener("click", function () {
    outcome.hidden = true;
    form.hidden = false;
    fields.name.focus();
  });
})();
