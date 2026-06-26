/*
 * MALLORCA DELUXE Chatbot – Widget engine (framework-free, ~no dependencies)
 * ---------------------------------------------------------------------------
 * Reads window.MDC_CONFIG (injected by WordPress) and window.MDC_FLOWS
 * (assets/js/mdc-flows.js) and renders a guided, path-based chat widget.
 *
 * Public surface (for diagnostics / tests): window.MDC
 *   MDC.open(), MDC.close(), MDC.setLang('de'|'en'|'es'), MDC.getState()
 */
(function (w, d) {
  "use strict";

  if (w.__MDC_BOOTED__) { return; }

  /* ----------------------------- helpers ----------------------------- */
  function el(tag, attrs, children) {
    var node = d.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === null || v === undefined || v === false) { return; }
        if (k === "class") { node.className = v; }
        else if (k === "text") { node.textContent = v; }
        else if (k === "html") { node.innerHTML = v; }
        else if (k.indexOf("on") === 0 && typeof v === "function") {
          node.addEventListener(k.slice(2).toLowerCase(), v);
        } else if (k === "dataset") {
          Object.keys(v).forEach(function (dk) { node.dataset[dk] = v[dk]; });
        } else {
          node.setAttribute(k, v);
        }
      });
    }
    (children || []).forEach(function (c) {
      if (c === null || c === undefined) { return; }
      node.appendChild(typeof c === "string" ? d.createTextNode(c) : c);
    });
    return node;
  }

  function emailValid(s) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(s).trim());
  }
  function phoneValid(s) {
    var t = String(s).trim();
    if (!/^[+0-9()\/\s.\-]{6,}$/.test(t)) { return false; }
    var digits = t.replace(/\D/g, "");
    return digits.length >= 6 && digits.length <= 16;
  }
  function escAttr(s) { return String(s).replace(/"/g, "&quot;"); }

  /* ----------------------------- engine ------------------------------ */
  function Widget(config, flows) {
    this.cfg = config;
    this.F = flows;
    this.nodes = flows.nodes;
    // inject id into each node for convenience
    Object.keys(this.nodes).forEach((function (k) { this.nodes[k].id = k; }).bind(this));

    this.lang = this.resolveLang();
    this.context = this.resolveContext();
    this.open = false;
    this.booted = false;
    this.reset();
    this.build();
  }

  Widget.prototype.t = function (key) {
    var u = this.F.ui[this.lang] || this.F.ui.de;
    return (u && u[key] !== undefined) ? u[key] : ((this.F.ui.de && this.F.ui.de[key]) || key);
  };
  Widget.prototype.tr = function (obj) {
    if (!obj) { return ""; }
    if (typeof obj === "string") { return obj; }
    return obj[this.lang] || obj.de || obj.en || "";
  };

  Widget.prototype.resolveLang = function () {
    var langs = this.cfg.languages && this.cfg.languages.length ? this.cfg.languages : this.F.langs;
    // 1) Follow the website/page language (<html lang>) when auto-detect is on,
    //    so switching the site language (e.g. /en/, /es/) also switches the
    //    chatbot. This is the highest-priority signal by design.
    if (this.cfg.autoDetect) {
      var pageLang = "";
      try { pageLang = (document.documentElement.getAttribute("lang") || "").slice(0, 2).toLowerCase(); } catch (e) {}
      if (pageLang && langs.indexOf(pageLang) > -1) { return pageLang; }
    }
    // 2) A manual in-widget choice remembered in this browser.
    var stored = null;
    try { stored = w.localStorage.getItem("mdc_lang"); } catch (e) {}
    if (stored && langs.indexOf(stored) > -1) { return stored; }
    // 3) Browser language (auto-detect fallback when the page language is unknown).
    if (this.cfg.autoDetect) {
      var nav = (w.navigator && (w.navigator.language || w.navigator.userLanguage)) || "";
      var pref = nav.slice(0, 2).toLowerCase();
      if (langs.indexOf(pref) > -1) { return pref; }
    }
    // 4) Configured default, then first available language.
    if (this.cfg.defaultLang && langs.indexOf(this.cfg.defaultLang) > -1) { return this.cfg.defaultLang; }
    return langs[0] || "de";
  };

  Widget.prototype.resolveContext = function () {
    var c = this.cfg.context || "home";
    if (c === "property" || c === "home") { return c; }
    return "home";
  };

  Widget.prototype.entryId = function () {
    return this.F.entries[this.context] || this.F.entries.home;
  };

  Widget.prototype.reset = function () {
    this.answers = {};
    this.committed = [];      // [{nodeId,key,value,label}]
    this.currentId = null;
    this.flowType = null;
    this.submitted = false;
    this.startedAt = nowIso();
    if (this.body) {
      this.body.innerHTML = "";
      if (this.interaction) { this.clearInteraction(); this.body.appendChild(this.interaction); }
    }
  };

  function nowIso() {
    try { return new Date().toISOString(); } catch (e) { return ""; }
  }

  /* ----------------------------- DOM build --------------------------- */
  Widget.prototype.build = function () {
    var self = this;
    var pos = this.cfg.position === "left" ? "mdc-left" : "mdc-right";

    this.root = el("div", { class: "mdc-root " + pos, dir: "ltr", dataset: { mdc: "root" } });
    // theme variables
    if (this.cfg.primaryColor) { this.root.style.setProperty("--mdc-primary", this.cfg.primaryColor); }
    if (this.cfg.accentColor) { this.root.style.setProperty("--mdc-accent", this.cfg.accentColor); }

    /* Launcher */
    this.launcher = el("button", {
      type: "button", class: "mdc-launcher", "aria-label": this.t("open"),
      dataset: { mdc: "launcher" }, onclick: function () { self.toggle(); }
    }, [
      el("img", { class: "mdc-launcher-avatar", src: this.cfg.avatarUrl || "", alt: "", "aria-hidden": "true" }),
      el("span", { class: "mdc-launcher-icon", "aria-hidden": "true", html: chatIcon() }),
      el("span", { class: "mdc-launcher-badge", "aria-hidden": "true", text: "1" })
    ]);

    this.teaser = el("div", { class: "mdc-teaser", dataset: { mdc: "teaser" }, role: "status" }, [
      el("button", { type: "button", class: "mdc-teaser-close", "aria-label": this.t("close"),
        onclick: function (e) { e.stopPropagation(); self.hideTeaser(true); }, text: "×" }),
      el("img", { class: "mdc-teaser-avatar", src: this.cfg.avatarUrl || "", alt: "" }),
      el("span", { class: "mdc-teaser-text", text: this.t("launcherTeaser") })
    ]);
    this.teaser.addEventListener("click", function () { self.toggle(); });

    /* Panel */
    this.panel = el("section", {
      class: "mdc-panel", role: "dialog", "aria-label": (this.cfg.brandName || "MALLORCA DELUXE"),
      dataset: { mdc: "panel" }, "aria-hidden": "true"
    }, [ this.buildHeader(), this.buildBody(), this.buildFooter() ]);

    this.root.appendChild(this.teaser);
    this.root.appendChild(this.panel);
    this.root.appendChild(this.launcher);
    d.body.appendChild(this.root);

    // keyboard: ESC closes
    d.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && self.open) { self.close(); }
    });

    this.booted = true;
    if (this.cfg.greetingTeaser !== false) {
      w.setTimeout(function () { if (!self.open) { self.root.classList.add("mdc-teaser-on"); } }, 1200);
    }
  };

  Widget.prototype.buildHeader = function () {
    var self = this;
    this.langSwitch = el("div", { class: "mdc-langs", role: "group", "aria-label": this.t("langLabel") });
    (this.cfg.languages || this.F.langs).forEach(function (lg) {
      var b = el("button", {
        type: "button", class: "mdc-lang" + (lg === self.lang ? " is-active" : ""),
        dataset: { mdc: "lang-" + lg, lang: lg }, text: lg.toUpperCase(),
        "aria-pressed": lg === self.lang ? "true" : "false",
        onclick: function () { self.setLang(lg); }
      });
      self.langSwitch.appendChild(b);
    });

    return el("header", { class: "mdc-header" }, [
      this.langSwitch,
      el("button", { type: "button", class: "mdc-icon-btn mdc-close", "aria-label": this.t("close"),
        dataset: { mdc: "close" }, onclick: function () { self.close(); }, html: "&#10005;" }),
      el("img", { class: "mdc-header-avatar", src: this.cfg.avatarUrl || "", alt: this.cfg.brandName || "" })
    ]);
  };

  Widget.prototype.buildBody = function () {
    this.body = el("div", { class: "mdc-body", dataset: { mdc: "body" }, role: "log",
      "aria-live": "polite", "aria-atomic": "false" });
    // The interaction (options/form/consent) lives INSIDE the scrollable body and
    // always stays as its last child, so long option lists scroll naturally.
    this.interaction = el("div", { class: "mdc-interaction", dataset: { mdc: "interaction" } });
    this.body.appendChild(this.interaction);
    return this.body;
  };

  Widget.prototype.buildFooter = function () {
    var self = this;
    this.footer = el("footer", { class: "mdc-footer" }, [
      el("button", { type: "button", class: "mdc-restart", dataset: { mdc: "restart" },
        onclick: function () { self.restart(); }, html: refreshIcon() + "<span>" + escHtml(this.t("restart")) + "</span>" })
    ]);
    return this.footer;
  };

  /* ----------------------------- open/close -------------------------- */
  Widget.prototype.toggle = function () { this.open ? this.close() : this.openPanel(); };
  Widget.prototype.openPanel = function () {
    this.open = true;
    this.root.classList.add("mdc-open");
    this.panel.setAttribute("aria-hidden", "false");
    this.hideTeaser(false);
    if (!this.currentId) { this.goTo(this.entryId()); }
    var self = this;
    w.setTimeout(function () {
      var f = self.interaction.querySelector("input,button,select,textarea");
      if (f) { try { f.focus(); } catch (e) {} }
    }, 60);
  };
  Widget.prototype.close = function () {
    this.open = false;
    this.root.classList.remove("mdc-open");
    this.panel.setAttribute("aria-hidden", "true");
    try { this.launcher.focus(); } catch (e) {}
  };
  Widget.prototype.hideTeaser = function (dismiss) {
    this.root.classList.remove("mdc-teaser-on");
    if (dismiss) { this.teaserDismissed = true; }
  };

  Widget.prototype.setLang = function (lg) {
    if (lg === this.lang) { return; }
    var langs = this.cfg.languages || this.F.langs;
    if (langs.indexOf(lg) < 0) { return; }
    this.lang = lg;
    try { w.localStorage.setItem("mdc_lang", lg); } catch (e) {}
    // update header chrome
    var btns = this.langSwitch.querySelectorAll(".mdc-lang");
    for (var i = 0; i < btns.length; i++) {
      var active = btns[i].dataset.lang === lg;
      btns[i].classList.toggle("is-active", active);
      btns[i].setAttribute("aria-pressed", active ? "true" : "false");
    }
    var online = this.panel.querySelector('[data-mdc="online"]');
    if (online) { online.textContent = this.t("online"); }
    var restart = this.footer.querySelector('[data-mdc="restart"] span');
    if (restart) { restart.textContent = this.t("restart"); }
    // restart conversation in the new language
    this.restart();
  };

  Widget.prototype.restart = function () {
    this.reset();
    if (this.open) { this.goTo(this.entryId()); }
  };

  /* ----------------------------- navigation -------------------------- */
  Widget.prototype.goTo = function (nodeId) {
    var node = this.nodes[nodeId];
    if (!node) { return; }
    this.currentId = nodeId;
    if (node.flow && node.flow !== "entry") { this.flowType = node.flow; }
    this.root.classList.toggle("mdc-ended", node.type === "end");
    this.renderNode(node, false);
  };

  // Render a node moving forward (with typing animation for bot bubbles)
  Widget.prototype.renderNode = function (node, instant) {
    var self = this;
    var bots = botTexts(node);
    this.clearInteraction();
    sequenceBot(this, bots, instant, function () {
      // after bot bubbles, render interaction or auto-advance
      if (node.type === "message") { self.goTo(node.next); return; }
      if (node.type === "dynamic") { self.renderDynamic(node, instant); return; }
      if (node.type === "end") { self.renderEnd(node); return; }
      self.renderInteraction(node);
    });
  };

  function botTexts(node) {
    if (!node.bot) { return []; }
    return node.bot;
  }

  // Renders dynamic region texts based on a previous answer, then advances
  Widget.prototype.renderDynamic = function (node, instant) {
    var self = this;
    var ref = this.answers[node.from];
    var vals = Array.isArray(ref) ? ref : (ref ? [ref] : []);
    var texts = [];
    vals.forEach(function (v) {
      if (node.map && node.map[v]) { texts.push(node.map[v]); }
    });
    sequenceBot(this, texts, instant, function () { self.goTo(node.next); });
  };

  /* ----------------------------- interactions ------------------------ */
  Widget.prototype.clearInteraction = function () { this.interaction.innerHTML = ""; };

  Widget.prototype.renderInteraction = function (node) {
    this.clearInteraction();
    switch (node.type) {
      case "single": this.renderSingle(node); break;
      case "multi": this.renderMulti(node); break;
      case "form": this.renderForm(node); break;
      case "consent": this.renderConsent(node); break;
      default: return;
    }
    this.scrollQuestionIntoView();
  };

  Widget.prototype.renderSingle = function (node) {
    var self = this;
    var wrap = el("div", { class: "mdc-options", dataset: { mdc: "options" } });
    node.options.forEach(function (opt) {
      wrap.appendChild(el("button", {
        type: "button", class: "mdc-chip", dataset: { mdc: "opt", value: opt.v },
        text: self.tr(opt.l), onclick: function () { self.chooseSingle(node, opt); }
      }));
    });
    this.interaction.appendChild(wrap);
    this.appendBackIfPossible();
  };

  Widget.prototype.chooseSingle = function (node, opt) {
    this.answers[node.key] = opt.v;
    this.pushUser(this.tr(opt.l));
    this.committed.push({ nodeId: node.id, key: node.key, value: opt.v, label: this.tr(opt.l) });
    var nextId = opt.next || node.next;
    var self = this;
    if (opt.note) {
      sequenceBot(this, [opt.note], false, function () { self.goTo(nextId); });
    } else {
      this.goTo(nextId);
    }
  };

  Widget.prototype.renderMulti = function (node) {
    var self = this;
    var selected = {};
    var wrap = el("div", { class: "mdc-options mdc-multi", dataset: { mdc: "options" } });
    node.options.forEach(function (opt) {
      var chip = el("button", {
        type: "button", class: "mdc-chip mdc-chip-check", dataset: { mdc: "opt", value: opt.v },
        "aria-pressed": "false",
        onclick: function () {
          var on = !selected[opt.v];
          selected[opt.v] = on;
          chip.classList.toggle("is-selected", on);
          chip.setAttribute("aria-pressed", on ? "true" : "false");
          updateBtn();
        }
      }, [ el("span", { class: "mdc-check", "aria-hidden": "true" }), el("span", { text: self.tr(opt.l) }) ]);
      wrap.appendChild(chip);
    });

    var hint = el("div", { class: "mdc-multi-hint", text: this.t("multiHint") });
    var err = el("div", { class: "mdc-error", dataset: { mdc: "error" }, "aria-live": "assertive" });
    var nextBtn = el("button", {
      type: "button", class: "mdc-primary-btn", dataset: { mdc: "multi-next" }, text: this.t("next"),
      onclick: function () {
        var values = node.options.map(function (o) { return o.v; }).filter(function (v) { return selected[v]; });
        if ((node.min || 0) > 0 && values.length < node.min) {
          err.textContent = self.t("selectAtLeastOne"); return;
        }
        err.textContent = "";
        self.answers[node.key] = values;
        var labels = node.options.filter(function (o) { return selected[o.v]; }).map(function (o) { return self.tr(o.l); });
        self.pushUser(labels.length ? labels.join(" · ") : "—");
        self.committed.push({ nodeId: node.id, key: node.key, value: values, label: labels.join(" · ") });
        self.goTo(node.next);
      }
    });
    function updateBtn() {
      var count = Object.keys(selected).filter(function (k) { return selected[k]; }).length;
      nextBtn.textContent = count > 0 ? self.t("next") + " (" + count + ")" : self.t("next");
    }

    this.interaction.appendChild(wrap);
    this.interaction.appendChild(hint);
    this.interaction.appendChild(err);
    var row = el("div", { class: "mdc-actions" }, [ nextBtn ]);
    this.interaction.appendChild(row);
    this.appendBackIfPossible(row);
  };

  Widget.prototype.renderForm = function (node) {
    var self = this;
    var form = el("form", { class: "mdc-form", dataset: { mdc: "form" }, novalidate: "novalidate" });
    var inputs = {};
    node.fields.forEach(function (f) {
      var labelTxt = self.t(f.labelKey) + (f.required ? " *" : "");
      var input = el("input", {
        type: f.type === "email" ? "email" : (f.type === "tel" ? "tel" : "text"),
        class: "mdc-input", name: f.name, dataset: { mdc: "field-" + f.name },
        placeholder: labelTxt, "aria-label": labelTxt,
        autocomplete: f.name === "firstName" ? "given-name" : f.name === "lastName" ? "family-name"
          : f.name === "email" ? "email" : f.name === "phone" ? "tel" : "on"
      });
      inputs[f.name] = input;
      var fieldErr = el("div", { class: "mdc-field-error", dataset: { mdc: "err-" + f.name } });
      form.appendChild(el("div", { class: "mdc-field" }, [ input, fieldErr ]));
    });

    var submit = el("button", { type: "submit", class: "mdc-primary-btn", dataset: { mdc: "form-submit" }, text: this.t("next") });
    var row = el("div", { class: "mdc-actions" }, [ submit ]);
    form.appendChild(row);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      var data = {};
      node.fields.forEach(function (f) {
        var v = inputs[f.name].value.trim();
        var errBox = form.querySelector('[data-mdc="err-' + f.name + '"]');
        errBox.textContent = "";
        inputs[f.name].classList.remove("is-invalid");
        if (f.required && !v) { errBox.textContent = self.t("fillField"); inputs[f.name].classList.add("is-invalid"); ok = false; return; }
        if (f.type === "email" && v && !emailValid(v)) { errBox.textContent = self.t("invalidEmail"); inputs[f.name].classList.add("is-invalid"); ok = false; return; }
        if (f.type === "tel" && v && !phoneValid(v)) { errBox.textContent = self.t("invalidPhone"); inputs[f.name].classList.add("is-invalid"); ok = false; return; }
        data[f.name] = v;
      });
      if (!ok) { return; }
      self.answers.contact = data;
      var summary = [ (data.firstName || "") + " " + (data.lastName || "") ].join("").trim();
      summary = summary + (data.email ? " · " + data.email : "");
      self.pushUser(summary || "—");
      self.committed.push({ nodeId: node.id, key: "contact", value: data, label: summary });
      self.goTo(node.next);
    });

    this.interaction.appendChild(form);
    this.appendBackIfPossible(row);
  };

  Widget.prototype.renderConsent = function (node) {
    var self = this;
    var wrap = el("div", { class: "mdc-consent", dataset: { mdc: "consent" } });

    var checkbox = el("input", { type: "checkbox", class: "mdc-checkbox", id: "mdc-consent-cb", dataset: { mdc: "consent-cb" } });
    var labelNodes = this.consentLabelNodes();
    var label = el("label", { class: "mdc-consent-label", for: "mdc-consent-cb" }, labelNodes);
    wrap.appendChild(el("div", { class: "mdc-consent-row" }, [ checkbox, label ]));

    var err = el("div", { class: "mdc-error", dataset: { mdc: "consent-error" }, "aria-live": "assertive" });
    wrap.appendChild(err);

    var submit = el("button", {
      type: "button", class: "mdc-primary-btn mdc-send", dataset: { mdc: "consent-submit" },
      text: this.t("send"),
      onclick: function () {
        if (!checkbox.checked) { err.textContent = self.t("consentRequired"); return; }
        err.textContent = "";
        self.answers.consent = true;
        self.submitLead(node, submit, err);
      }
    });
    var row = el("div", { class: "mdc-actions" }, [ submit ]);
    wrap.appendChild(row);

    this.interaction.appendChild(wrap);
    this.appendBackIfPossible(row);
  };

  // Build consent label with embedded privacy-policy link if available
  Widget.prototype.consentLabelNodes = function () {
    var txt = this.t("consentText");
    var parts = txt.split("{privacy}");
    var out = [];
    out.push(d.createTextNode(parts[0]));
    if (this.cfg.privacyUrl) {
      out.push(el("a", { href: this.cfg.privacyUrl, target: "_blank", rel: "noopener noreferrer", class: "mdc-privacy-link", text: this.t("privacyText") }));
    } else {
      out.push(d.createTextNode(this.t("privacyText")));
    }
    if (parts[1] !== undefined) { out.push(d.createTextNode(parts[1])); }
    return out;
  };

  /* ----------------------------- submit ------------------------------ */
  Widget.prototype.submitLead = function (node, submitBtn, errBox) {
    var self = this;
    submitBtn.disabled = true;
    submitBtn.classList.add("is-loading");
    submitBtn.textContent = this.t("sending");

    var payload = this.buildPayload(node);
    var url = this.cfg.restUrl;

    var headers = { "Content-Type": "application/json" };
    if (this.cfg.nonce) { headers["X-WP-Nonce"] = this.cfg.nonce; }

    var done = function (ok) {
      self.submitted = true;
      if (ok) {
        self.goTo(node.next);
      } else {
        submitBtn.disabled = false;
        submitBtn.classList.remove("is-loading");
        submitBtn.textContent = self.t("send");
        errBox.textContent = self.t("errorGeneric");
      }
    };

    if (!url) { // no backend configured (e.g. preview) – still complete gracefully
      w.setTimeout(function () { done(true); }, 200);
      return;
    }

    try {
      w.fetch(url, { method: "POST", headers: headers, credentials: "same-origin", body: JSON.stringify(payload) })
        .then(function (res) { return res.ok ? res.json().catch(function () { return {}; }) : Promise.reject(res); })
        .then(function () { done(true); })
        .catch(function () { done(false); });
    } catch (e) { done(false); }
  };

  Widget.prototype.buildPayload = function (node) {
    var a = this.answers;
    return {
      flow: node.flow || this.flowType || "home",
      context: this.context,
      lang: this.lang,
      answers: shallowCopyAnswers(a),
      contact: a.contact || {},
      consent: !!a.consent,
      meta: {
        pageUrl: w.location ? w.location.href : "",
        pageTitle: d.title || "",
        referrer: d.referrer || "",
        startedAt: this.startedAt,
        completedAt: nowIso(),
        widgetVersion: this.F.version || "1.0.0",
        brand: this.cfg.brandName || "MALLORCA DELUXE"
      }
    };
  };

  function shallowCopyAnswers(a) {
    var out = {};
    Object.keys(a).forEach(function (k) {
      if (k === "contact" || k === "consent") { return; }
      out[k] = a[k];
    });
    return out;
  }

  /* ----------------------------- end node ---------------------------- */
  Widget.prototype.renderEnd = function (node) {
    this.clearInteraction();
    // WhatsApp click-to-chat button if requested + number configured
    if (this.answers.contactPref === "whatsapp" && this.cfg.whatsappNumber) {
      var num = String(this.cfg.whatsappNumber).replace(/\D/g, "");
      var text = encodeURIComponent(this.t("whatsappPrefill"));
      var href = "https://wa.me/" + num + "?text=" + text;
      var btn = el("a", {
        class: "mdc-primary-btn mdc-whatsapp", dataset: { mdc: "whatsapp" }, href: href,
        target: "_blank", rel: "noopener noreferrer"
      }, [ el("span", { class: "mdc-wa-icon", "aria-hidden": "true", html: waIcon() }), el("span", { text: this.t("whatsappBtn") }) ]);
      this.interaction.appendChild(btn);
    }
    var self = this;
    this.interaction.appendChild(el("button", {
      type: "button", class: "mdc-ghost-btn", dataset: { mdc: "restart-end" },
      onclick: function () { self.restart(); }, text: this.t("restart")
    }));
    this.scrollQuestionIntoView();
  };

  /* ----------------------------- back -------------------------------- */
  Widget.prototype.appendBackIfPossible = function (rowEl) {
    if (this.committed.length === 0) { return; }
    var self = this;
    var back = el("button", { type: "button", class: "mdc-back", dataset: { mdc: "back" },
      onclick: function () { self.back(); }, html: backIcon() + "<span>" + escHtml(this.t("back")) + "</span>" });
    if (rowEl) { rowEl.insertBefore(back, rowEl.firstChild); }
    else {
      var row = el("div", { class: "mdc-actions mdc-actions-back" }, [ back ]);
      this.interaction.appendChild(row);
    }
  };

  Widget.prototype.back = function () {
    if (this.committed.length === 0) { return; }
    var last = this.committed.pop();
    delete this.answers[last.key];
    this.currentId = last.nodeId;
    this.replay(last.nodeId);
  };

  // Rebuild the whole transcript statically up to (and interactive at) targetId
  Widget.prototype.replay = function (targetId) {
    this.body.innerHTML = "";
    this.clearInteraction();
    this.body.appendChild(this.interaction);   // keep interaction as the last child
    var queue = this.committed.slice();   // committed entries to consume, in order
    var nodeId = this.entryId();
    var guard = 0;
    while (nodeId && guard++ < 100) {
      var node = this.nodes[nodeId];
      if (!node) { break; }
      if (node.flow && node.flow !== "entry") { this.flowType = node.flow; }
      // render bot bubbles statically
      var bots = botTexts(node);
      this.appendBotInstant(bots);

      if (nodeId === targetId) {
        // interactive node the user is returning to
        this.clearInteraction();
        this.renderInteraction(node);
        return;
      }

      if (node.type === "message") { nodeId = node.next; continue; }
      if (node.type === "dynamic") {
        var ref = this.answers[node.from];
        var vals = Array.isArray(ref) ? ref : (ref ? [ref] : []);
        var dyn = [];
        for (var i = 0; i < vals.length; i++) { if (node.map && node.map[vals[i]]) { dyn.push(node.map[vals[i]]); } }
        this.appendBotInstant(dyn);
        nodeId = node.next; continue;
      }
      if (node.type === "end") { this.renderEnd(node); return; }

      // interactive node already answered -> consume committed entry, show user bubble, branch
      var entry = queue.shift();
      if (!entry) { // safety: nothing committed for this interactive node
        this.clearInteraction(); this.renderInteraction(node); return;
      }
      this.pushUserInstant(entry.label);
      var nextId = node.next;
      if (node.type === "single") {
        var opt = findOption(node, entry.value);
        if (opt && opt.next) { nextId = opt.next; }
      }
      nodeId = nextId;
    }
  };

  function findOption(node, value) {
    if (!node.options) { return null; }
    for (var i = 0; i < node.options.length; i++) { if (node.options[i].v === value) { return node.options[i]; } }
    return null;
  }

  /* ----------------------------- message rendering ------------------- */
  // Insert a message before the interaction so the options always stay last.
  Widget.prototype.bodyInsert = function (node) {
    if (this.interaction && this.interaction.parentNode === this.body) {
      this.body.insertBefore(node, this.interaction);
    } else {
      this.body.appendChild(node);
    }
  };
  Widget.prototype.appendBotBubble = function (textObj) {
    var bubble = el("div", { class: "mdc-msg mdc-msg-bot", dataset: { mdc: "bot-msg" } }, [
      el("img", { class: "mdc-msg-avatar", src: this.cfg.avatarUrl || "", alt: "" }),
      el("div", { class: "mdc-bubble", text: this.tr(textObj).replace("{name}", this.firstName()) })
    ]);
    this.bodyInsert(bubble);
    this.scroll();
    return bubble;
  };
  Widget.prototype.appendBotInstant = function (arr) {
    var self = this;
    (arr || []).forEach(function (t) { self.appendBotBubble(t); });
  };
  Widget.prototype.pushUser = function (text) {
    var b = el("div", { class: "mdc-msg mdc-msg-user", dataset: { mdc: "user-msg" } }, [
      el("div", { class: "mdc-bubble", text: text })
    ]);
    this.bodyInsert(b);
    this.scroll();
  };
  Widget.prototype.pushUserInstant = function (text) { this.pushUser(text); };

  Widget.prototype.firstName = function () {
    return (this.answers.contact && this.answers.contact.firstName) ? this.answers.contact.firstName : "";
  };

  Widget.prototype.showTyping = function () {
    this.hideTyping();
    this.typingEl = el("div", { class: "mdc-msg mdc-msg-bot mdc-typing", dataset: { mdc: "typing" } }, [
      el("img", { class: "mdc-msg-avatar", src: this.cfg.avatarUrl || "", alt: "" }),
      el("div", { class: "mdc-bubble mdc-bubble-typing" }, [
        el("span", { class: "mdc-dotty" }), el("span", { class: "mdc-dotty" }), el("span", { class: "mdc-dotty" })
      ])
    ]);
    this.bodyInsert(this.typingEl);
    this.scroll();
  };
  Widget.prototype.hideTyping = function () {
    if (this.typingEl && this.typingEl.parentNode) { this.typingEl.parentNode.removeChild(this.typingEl); }
    this.typingEl = null;
  };

  Widget.prototype.scroll = function () {
    var b = this.body;
    w.requestAnimationFrame ? w.requestAnimationFrame(function () { b.scrollTop = b.scrollHeight; })
      : (b.scrollTop = b.scrollHeight);
  };

  // Scroll so the current question (last bot bubble) sits near the top, revealing
  // the options below it – important when an option list is taller than the panel.
  Widget.prototype.scrollQuestionIntoView = function () {
    var b = this.body;
    var bots = b.querySelectorAll('.mdc-msg-bot:not(.mdc-typing)');
    var last = bots.length ? bots[bots.length - 1] : null;
    var run = function () {
      if (last) { b.scrollTop = Math.max(0, last.offsetTop - 14); }
      else { b.scrollTop = b.scrollHeight; }
    };
    w.requestAnimationFrame ? w.requestAnimationFrame(run) : run();
  };

  // Sequentially reveal bot bubbles with a typing indicator between them
  function sequenceBot(self, arr, instant, doneCb) {
    arr = arr || [];
    var delay = instant ? 0 : (typeof self.cfg.typingDelayMs === "number" ? self.cfg.typingDelayMs : 450);
    var i = 0;
    function step() {
      if (i >= arr.length) { self.hideTyping(); doneCb && doneCb(); return; }
      if (delay <= 0) {
        self.appendBotBubble(arr[i]); i++; step();
      } else {
        self.showTyping();
        w.setTimeout(function () {
          self.hideTyping();
          self.appendBotBubble(arr[i]); i++;
          step();
        }, Math.min(delay + (i === 0 ? 0 : 120), 1200));
      }
    }
    step();
  }

  /* ----------------------------- icons ------------------------------- */
  function chatIcon() { return '<svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor"><path d="M12 3C6.5 3 2 6.8 2 11.5c0 2.2 1 4.2 2.7 5.7-.1 1.2-.6 2.4-1.5 3.4-.2.2 0 .6.3.5 1.9-.3 3.4-1 4.4-1.7 1.1.3 2.3.5 3.6.5 5.5 0 10-3.8 10-8.4S17.5 3 12 3z"/></svg>'; }
  function waIcon() { return '<svg viewBox="0 0 32 32" width="20" height="20" fill="currentColor"><path d="M16 3C9 3 3.5 8.5 3.5 15.4c0 2.4.7 4.7 1.9 6.7L3 29l7.1-2.3c1.9 1 4 1.6 6.1 1.6 6.9 0 12.5-5.5 12.5-12.4S22.9 3 16 3zm0 22.6c-1.9 0-3.7-.5-5.3-1.5l-.4-.2-4.2 1.3 1.4-4-.3-.4a9.9 9.9 0 01-1.6-5.4c0-5.5 4.7-10 10.4-10 5.7 0 10.3 4.5 10.3 10s-4.6 10.2-10.3 10.2zm5.7-7.5c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.5-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.7l.5-.6c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.6l-1-2.3c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.2-.3-.2-.6-.4z"/></svg>'; }
  function refreshIcon() { return '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 11-2.6-6.4"/><path d="M21 3v5h-5"/></svg>'; }
  function backIcon() { return '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>'; }
  function escHtml(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  /* ----------------------------- bootstrap --------------------------- */
  function boot() {
    var cfg = w.MDC_CONFIG || {};
    var flows = w.MDC_FLOWS;
    if (!flows) { return; }
    if (cfg.enabled === false) { return; }
    var widget = new Widget(cfg, flows);
    w.__MDC_BOOTED__ = true;
    w.MDC = {
      open: function () { widget.openPanel(); },
      close: function () { widget.close(); },
      setLang: function (l) { widget.setLang(l); },
      restart: function () { widget.restart(); },
      getState: function () {
        return { lang: widget.lang, context: widget.context, currentId: widget.currentId,
          flowType: widget.flowType, answers: widget.answers, submitted: widget.submitted,
          committed: widget.committed.map(function (c) { return c.nodeId; }) };
      },
      _w: widget
    };
  }

  if (d.readyState === "loading") { d.addEventListener("DOMContentLoaded", boot); }
  else { boot(); }
})(window, document);
