
/* IKUSAMI — Supabase integration.
   Перед регистрацией отключи Confirm email в настройках Supabase.
   Никогда не добавляй Secret/service_role key в этот файл.
*/

const pages = document.querySelectorAll(".page");
const navLinks = document.querySelectorAll(".nav-link");
const overlays = document.querySelectorAll(".overlay");

const noticeOverlay = document.getElementById("noticeOverlay");
const serverOverlay = document.getElementById("serverOverlay");
const formOverlay = document.getElementById("formOverlay");

const createTicket = document.getElementById("createTicket");
const continueApplication = document.getElementById("continueApplication");
const selectedServer = document.getElementById("selectedServer");

const applicationForm = document.getElementById("applicationForm");
const formGrid = applicationForm?.querySelector(".form-grid");
const formError = document.getElementById("formError");
const toast = document.getElementById("toast");

const formTitle = document.querySelector(".form-modal h2");
const formFootnote = document.querySelector(".form-footnote");

let currentServer = "";
let toastTimeout;

/* ПЕРЕКЛЮЧЕНИЕ СТРАНИЦ */

function showPage(name) {
  pages.forEach(page => {
    page.classList.toggle("active", page.id === `page-${name}`);
  });

  navLinks.forEach(link => {
    link.classList.toggle("active", link.dataset.page === name);
  });

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

navLinks.forEach(link => {
  link.addEventListener("click", () => {
    showPage(link.dataset.page);
  });
});

document.querySelector(".brand")?.addEventListener("click", event => {
  event.preventDefault();
  showPage("application");
});

/* МОДАЛЬНЫЕ ОКНА */

function openOverlay(overlay) {
  if (!overlay) return;

  overlay.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeOverlay(overlay) {
  if (!overlay) return;

  overlay.classList.remove("open");

  const anotherOpen = [...overlays].some(item =>
    item.classList.contains("open")
  );

  if (!anotherOpen) {
    document.body.style.overflow = "";
  }
}

/* ЭТАПЫ ЗАЯВКИ */

function openNotice() {
  openOverlay(noticeOverlay);
}

function openServerPicker() {
  closeOverlay(noticeOverlay);
  openOverlay(serverOverlay);
}

function openApplicationForm(server) {
  currentServer = server;

  if (selectedServer) {
    selectedServer.textContent = server;
  }

  applicationForm.reset();

  if (formError) {
    formError.textContent = "";
  }

  renderApplicationForm(server);

  closeOverlay(serverOverlay);
  openOverlay(formOverlay);
}

createTicket?.addEventListener("click", openNotice);
continueApplication?.addEventListener("click", openServerPicker);

/* ВЫБОР РАЗДЕЛА */

document.querySelectorAll(".server-option").forEach(button => {
  button.addEventListener("click", () => {
    openApplicationForm(button.dataset.server);
  });
});

/* HTML-ПОЛЯ */

function field(label, name, type = "text", placeholder = "", required = true) {
  return `
    <label class="form-field">
      <span>${label}${required ? ' <b>*</b>' : ""}</span>
      <input
        name="${name}"
        type="${type}"
        placeholder="${placeholder}"
        ${required ? "required" : ""}
        ${type === "number" ? 'min="1" max="99"' : ""}
      >
    </label>
  `;
}

function textarea(label, name, placeholder, required = true) {
  return `
    <label class="form-field full-field">
      <span>${label}${required ? ' <b>*</b>' : ""}</span>
      <textarea
        name="${name}"
        rows="3"
        placeholder="${placeholder}"
        ${required ? "required" : ""}
      ></textarea>
    </label>
  `;
}

function selectField(label, name, options, required = true) {
  return `
    <label class="form-field">
      <span>${label}${required ? ' <b>*</b>' : ""}</span>
      <select name="${name}" ${required ? "required" : ""}>
        <option value="">Выбери вариант</option>
        ${options.map(option => `
          <option value="${option.value}">${option.label}</option>
        `).join("")}
      </select>
    </label>
  `;
}

/* ЧАСОВЫЕ ПОЯСА */

function timezoneOptions() {
  return Array.from({ length: 25 }, (_, index) => {
    const value = index - 12;

    const label = value > 0
      ? `МСК +${value}`
      : value < 0
        ? `МСК ${value}`
        : "МСК ±0";

    return { value, label };
  });
}

/* MINECRAFT-АНКЕТА */

function renderMinecraftForm() {
  formTitle.textContent = "Анкета игрока";

  const pvpOptions = Array.from({ length: 10 }, (_, index) => ({
    value: index + 1,
    label: `${index + 1} / 10`
  }));

  formGrid.innerHTML = `
    ${field("Никнейм Minecraft", "nickname", "text", "Твой никнейм")}

    ${field("Возраст", "age", "number", "Твой возраст")}

    ${field("Опыт игры", "experience", "text", "Например, 2 года")}

    ${field("Онлайн в день", "online", "text", "Например, 4–6 часов")}

    ${field("Предыдущие кланы", "clans", "text", "Укажи кланы или напиши «Нет»")}

    ${field("Ваш донат", "donate", "text", "Например, отсутствует")}

    ${selectField("Оценка своего PvP", "pvp", pvpOptions)}

    ${selectField("Часовой пояс относительно МСК", "timezone", timezoneOptions())}

    ${textarea("Почему хочешь вступить к нам?", "reason", "Расскажи о своей мотивации...")}

    ${textarea("Дополнительная информация", "extra", "Необязательно", false)}
  `;

  formFootnote.textContent = "* Обязательные поля";
}

/* DISCORD STAFF — ОТДЕЛЬНАЯ АНКЕТА */

function renderStaffForm() {
  formTitle.textContent = "Анкета Discord Staff";

  formGrid.innerHTML = `
    ${field("Твой Discord-никнейм", "discordNickname", "text", "Например, username")}

    ${field("Возраст", "age", "number", "Твой возраст")}

    ${selectField("Есть ли опыт модерации?", "staffExperience", [
      { value: "Да, был модератором", label: "Да, был модератором" },
      { value: "Да, был администратором", label: "Да, был администратором" },
      { value: "Есть небольшой опыт", label: "Есть небольшой опыт" },
      { value: "Нет опыта", label: "Нет опыта" }
    ])}

    ${selectField("Ознакомлен ли ты с правилами сервера?", "rules", [
      { value: "Да, полностью ознакомлен", label: "Да, полностью ознакомлен" },
      { value: "Нет, пока не ознакомлен", label: "Нет, пока не ознакомлен" }
    ])}

    ${selectField("Сколько времени готов уделять серверу?", "staffOnline", [
      { value: "Менее 1 часа", label: "Менее 1 часа в день" },
      { value: "1–2 часа", label: "1–2 часа в день" },
      { value: "3–4 часа", label: "3–4 часа в день" },
      { value: "Более 4 часов", label: "Более 4 часов в день" }
    ])}

    ${selectField("Твой часовой пояс", "staffTimezone", timezoneOptions())}

    ${textarea("Почему ты хочешь попасть в команду Ikusami?", "staffReason", "Расскажи о своей мотивации...")}

    ${textarea("Как ты поступишь, если два участника начнут конфликт?", "conflict", "Опиши свои действия...")}

    ${textarea("Что сделаешь, если твой друг нарушит правила?", "friendViolation", "Как будешь действовать в такой ситуации?")}

    ${textarea("Почему именно тебя стоит принять в команду?", "staffAdvantages", "Расскажи о своих качествах и преимуществах...")}

    ${textarea("Дополнительная информация", "extra", "Необязательно", false)}
  `;

  formFootnote.textContent = "* Обязательные поля";
}

/* ВЫБОР НУЖНОЙ АНКЕТЫ */

function renderApplicationForm(server) {
  if (server === "Discord Staff") {
    renderStaffForm();
  } else {
    renderMinecraftForm();
  }
}

/* ЗАКРЫТИЕ ОКОН */

document.querySelectorAll("[data-close]").forEach(button => {
  button.addEventListener("click", () => {
    const overlay = document.getElementById(button.dataset.close);
    closeOverlay(overlay);
  });
});

overlays.forEach(overlay => {
  overlay.addEventListener("click", event => {
    if (event.target === overlay) {
      closeOverlay(overlay);
    }
  });
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    const openModal = [...overlays].find(overlay =>
      overlay.classList.contains("open")
    );

    if (openModal) {
      closeOverlay(openModal);
    }
  }
});

/* УВЕДОМЛЕНИЯ */

function showToast(message) {
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimeout);

  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 3500);
}

/* SUPABASE CONFIG */

const SUPABASE_URL = "https://ewwztycqoordjahcbwbv.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_S7LeQhE2DcjPG18r9kJrxg_FWzxw25z";

const supabaseClient = window.supabase?.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

/* ЭЛЕМЕНТЫ АВТОРИЗАЦИИ */

const authOverlay = document.getElementById("authOverlay");
const accountOverlay = document.getElementById("accountOverlay");
const adminOverlay = document.getElementById("adminOverlay");

const accountButton = document.getElementById("accountButton");
const authForm = document.getElementById("authForm");
const authError = document.getElementById("authError");
const authTitle = document.getElementById("authTitle");
const authDescription = document.getElementById("authDescription");
const authSubmit = document.getElementById("authSubmit");
const authSwitch = document.getElementById("authSwitch");

const accountUsername = document.getElementById("accountUsername");
const myApplications = document.getElementById("myApplications");
const openAdmin = document.getElementById("openAdmin");
const adminApplications = document.getElementById("adminApplications");
const logoutButton = document.getElementById("logoutButton");

let authMode = "login";
let currentUser = null;
let currentProfile = null;
let pendingApplication = null;

/* USERNAME И ТЕХНИЧЕСКИЙ EMAIL */

/*
  Новые аккаунты используют @ikusami.com.
  Старые аккаунты с @ikusami.local поддерживаются
  при входе, чтобы не потерять доступ к ним.

  В Supabase необходимо отключить Confirm email.
*/

function normalizeUsername(username) {
  return username.trim().toLowerCase();
}

function usernameEmail(username) {
  return `${normalizeUsername(username)}@ikusami.com`;
}

function legacyUsernameEmail(username) {
  return `${normalizeUsername(username)}@ikusami.local`;
}

function validUsername(username) {
  return /^[a-zA-Z0-9_.-]{3,24}$/.test(username);
}

/* ОТКРЫТИЕ АВТОРИЗАЦИИ */

function openAuth(mode = "login") {
  authMode = mode;

  authError.textContent = "";

  authTitle.textContent =
    mode === "signup"
      ? "Создание аккаунта"
      : "Вход в аккаунт";

  authDescription.textContent =
    mode === "signup"
      ? "Придумай username и пароль для своего аккаунта Ikusami."
      : "Войди, чтобы отправлять анкеты и отслеживать их статус.";

  authSubmit.innerHTML =
    mode === "signup"
      ? "Зарегистрироваться <span>→</span>"
      : "Войти <span>→</span>";

  authSwitch.textContent =
    mode === "signup"
      ? "Уже есть аккаунт? Войти"
      : "Нет аккаунта? Зарегистрироваться";

  authForm.reset();

  openOverlay(authOverlay);
}

/* ЗАГРУЗКА ПРОФИЛЯ */

async function loadProfile() {
  if (!supabaseClient || !currentUser) return null;

  const { data, error } = await supabaseClient
    .from("profiles")
    .select("id, username, role, created_at")
    .eq("id", currentUser.id)
    .single();

  if (error) throw error;

  currentProfile = data;

  return data;
}

/* ПРОВЕРКА СЕССИИ */

async function refreshAuthState() {
  if (!supabaseClient) {
    if (accountButton) {
      accountButton.textContent = "Войти";
    }

    showToast(
      "Не удалось загрузить Supabase. Проверь подключение к интернету."
    );

    return;
  }

  const { data } = await supabaseClient.auth.getSession();

  currentUser = data.session?.user || null;
  currentProfile = null;

  if (currentUser) {
    try {
      await loadProfile();

      if (accountButton) {
        accountButton.textContent = "Мой аккаунт";
      }
    } catch (error) {
      console.error("Profile load error:", error);

      if (accountButton) {
        accountButton.textContent = "Аккаунт";
      }
    }
  } else if (accountButton) {
    accountButton.textContent = "Войти";
  }
}

/* ЛИЧНЫЙ КАБИНЕТ */

accountButton?.addEventListener("click", async () => {
  if (!currentUser) {
    openAuth("login");
    return;
  }

  try {
    if (!currentProfile) {
      await loadProfile();
    }

    await renderMyApplications();

    accountUsername.textContent =
      currentProfile?.username || currentUser.email;

    openAdmin.hidden = currentProfile?.role !== "admin";

    openOverlay(accountOverlay);
  } catch (error) {
    console.error(error);
    showToast("Не удалось загрузить личный кабинет.");
  }
});

authSwitch?.addEventListener("click", () => {
  openAuth(authMode === "login" ? "signup" : "login");
});

/* РЕГИСТРАЦИЯ И ВХОД */

authForm?.addEventListener("submit", async event => {
  event.preventDefault();

  if (!supabaseClient) {
    authError.textContent = "Supabase не загрузился. Обнови страницу.";
    return;
  }

  const form = new FormData(authForm);

  const username = normalizeUsername(
    String(form.get("username") || "")
  );

  const password = String(form.get("password") || "");

  if (!validUsername(username)) {
    authError.textContent =
      "Username: 3–24 символа, только латиница, цифры, точка, дефис и _.";

    return;
  }

  if (password.length < 8) {
    authError.textContent =
      "Пароль должен содержать минимум 8 символов.";

    return;
  }

  authSubmit.disabled = true;

  authSubmit.textContent =
    authMode === "signup"
      ? "Создаём аккаунт..."
      : "Входим...";

  authError.textContent = "";

  try {
    let result;

    if (authMode === "signup") {
      result = await supabaseClient.auth.signUp({
        email: usernameEmail(username),
        password,
        options: {
          data: {
            username
          }
        }
      });

      if (result.error) {
        throw result.error;
      }

      if (!result.data.session) {
        throw new Error(
          "Supabase ожидает подтверждение email. Отключи Confirm email в настройках Email Provider и повтори регистрацию."
        );
      }
    } else {
      result = await supabaseClient.auth.signInWithPassword({
        email: usernameEmail(username),
        password
      });

      /*
        Если вход по новому адресу не удался,
        пробуем старый адрес @ikusami.local.
      */

      if (
        result.error &&
        result.error.message?.includes("Invalid login credentials")
      ) {
        result = await supabaseClient.auth.signInWithPassword({
          email: legacyUsernameEmail(username),
          password
        });
      }

      if (result.error) {
        throw result.error;
      }
    }

    currentUser = result.data.user;

    await loadProfile();

    closeOverlay(authOverlay);

    accountButton.textContent = "Мой аккаунт";

    showToast(
      authMode === "signup"
        ? "Аккаунт создан. Добро пожаловать в Ikusami."
        : "Вход выполнен."
    );

    if (pendingApplication) {
      await submitApplicationToSupabase(pendingApplication);
    }

  } catch (error) {
    console.error(error);

    const message = error.message || "Не удалось выполнить операцию.";

    authError.textContent =
      message.includes("already registered") ||
      message.includes("already been registered") ||
      message.includes("User already registered")
        ? "Этот username уже занят. Попробуй войти."
        : message.includes("Invalid login credentials")
          ? "Неверный username или пароль."
          : message;

  } finally {
    authSubmit.disabled = false;

    authSubmit.innerHTML =
      authMode === "signup"
        ? "Зарегистрироваться <span>→</span>"
        : "Войти <span>→</span>";
  }
});

/* МОИ АНКЕТЫ */

async function renderMyApplications() {
  myApplications.innerHTML =
    '<p class="empty-state">Загрузка...</p>';

  const { data, error } = await supabaseClient
    .from("applications")
    .select("id, server, data, status, admin_comment, created_at")
    .eq("user_id", currentUser.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  if (!data?.length) {
    myApplications.innerHTML =
      '<p class="empty-state">У тебя пока нет отправленных анкет.</p>';

    return;
  }

  myApplications.innerHTML = data.map(item => `
    <article class="application-item">
      <div class="application-item-head">
        <h3>${escapeHtml(item.server)}</h3>

        <span class="application-status ${escapeHtml(item.status)}">
          ${statusLabel(item.status)}
        </span>
      </div>

      <p>
        Отправлена:
        ${new Date(item.created_at).toLocaleString("ru-RU")}
      </p>

      ${
        item.admin_comment
          ? `<p>Комментарий администрации: ${escapeHtml(item.admin_comment)}</p>`
          : ""
      }
    </article>
  `).join("");
}

/* ЗАЩИТА HTML-ВЫВОДА */

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

/* СТАТУСЫ */

function statusLabel(status) {
  return ({
    pending: "На рассмотрении",
    approved: "Одобрена",
    rejected: "Отклонена"
  })[status] || status;
}

/* ОТПРАВКА АНКЕТЫ В SUPABASE */

async function submitApplicationToSupabase(application) {
  if (!currentUser) {
    pendingApplication = application;

    closeOverlay(formOverlay);

    openAuth("login");

    showToast("Сначала войди или создай аккаунт.");

    return;
  }

  const payload = {
    user_id: currentUser.id,
    server: currentServer,
    data: application,
    status: "pending"
  };

  const { error } = await supabaseClient
    .from("applications")
    .insert(payload);

  if (error) {
    console.error(error);

    formError.textContent =
      "Не удалось отправить анкету: " + error.message;

    pendingApplication = null;

    openOverlay(formOverlay);

    return;
  }

  pendingApplication = null;

  closeOverlay(formOverlay);

  showToast("Анкета отправлена администрации Ikusami.");
}

/* АДМИН-ПАНЕЛЬ */

openAdmin?.addEventListener("click", async () => {
  closeOverlay(accountOverlay);

  openOverlay(adminOverlay);

  await renderAdminApplications();
});

/* ЗАГРУЗКА ЗАЯВОК ДЛЯ АДМИНА */

async function renderAdminApplications() {
  adminApplications.innerHTML =
    '<p class="empty-state">Загрузка заявок...</p>';

  const { data, error } = await supabaseClient
    .from("applications")
    .select("id, user_id, server, data, status, admin_comment, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    adminApplications.innerHTML =
      `<p class="empty-state">${escapeHtml(error.message)}</p>`;

    return;
  }

  if (!data?.length) {
    adminApplications.innerHTML =
      '<p class="empty-state">Пока нет заявок.</p>';

    return;
  }

  adminApplications.innerHTML = data.map(item => `
    <article
      class="admin-application"
      data-application-id="${escapeHtml(item.id)}"
    >
      <div class="application-item-head">
        <h3>
          ${escapeHtml(item.server)}
          ·
          ${escapeHtml(
            item.data?.nickname ||
            item.data?.discordNickname ||
            "Участник"
          )}
        </h3>

        <span class="application-status ${escapeHtml(item.status)}">
          ${statusLabel(item.status)}
        </span>
      </div>

      <p>Пользователь: ${escapeHtml(item.user_id)}</p>

      <p>
        Дата:
        ${new Date(item.created_at).toLocaleString("ru-RU")}
      </p>

      <pre>${escapeHtml(JSON.stringify(item.data, null, 2))}</pre>

      <textarea
        class="admin-comment"
        placeholder="Комментарий администрации"
      >${escapeHtml(item.admin_comment || "")}</textarea>

      <div class="admin-actions">
        <button
          class="admin-decision approve"
          data-status="approved"
          type="button"
        >
          Одобрить
        </button>

        <button
          class="admin-decision reject"
          data-status="rejected"
          type="button"
        >
          Отклонить
        </button>

        <button
          class="admin-decision"
          data-status="pending"
          type="button"
        >
          Оставить на рассмотрении
        </button>
      </div>
    </article>
  `).join("");
}

/* ОБРАБОТКА РЕШЕНИЙ АДМИНИСТРАТОРА */

adminApplications?.addEventListener("click", async event => {
  const button = event.target.closest("button[data-status]");

  if (!button) return;

  const card = button.closest("[data-application-id]");

  const id = card?.dataset.applicationId;

  const comment =
    card?.querySelector(".admin-comment")?.value || "";

  button.disabled = true;

  const { error } = await supabaseClient
    .from("applications")
    .update({
      status: button.dataset.status,
      admin_comment: comment,
      updated_at: new Date().toISOString()
    })
    .eq("id", id);

  button.disabled = false;

  if (error) {
    showToast("Не удалось обновить заявку: " + error.message);
    return;
  }

  showToast("Статус заявки обновлён.");

  await renderAdminApplications();
});

/* ВЫХОД ИЗ АККАУНТА */

logoutButton?.addEventListener("click", async () => {
  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    showToast("Не удалось выйти из аккаунта.");
    return;
  }

  currentUser = null;
  currentProfile = null;

  closeOverlay(accountOverlay);

  accountButton.textContent = "Войти";

  showToast("Ты вышел из аккаунта.");
});

/* ПРОВЕРКА ВОЗРАСТА */

function validateAge(value) {
  const age = Number(value);

  return Number.isInteger(age) && age >= 1 && age <= 99;
}

/* ОТПРАВКА АНКЕТЫ */

applicationForm?.addEventListener("submit", async event => {
  event.preventDefault();

  const formData = new FormData(applicationForm);

  const data = Object.fromEntries(formData.entries());

  formError.textContent = "";

  if (!validateAge(data.age)) {
    formError.textContent = "Укажи корректный возраст.";
    return;
  }

  let application;

  if (currentServer === "Discord Staff") {
    const requiredFields = [
      "discordNickname",
      "age",
      "staffExperience",
      "rules",
      "staffOnline",
      "staffTimezone",
      "staffReason",
      "conflict",
      "friendViolation",
      "staffAdvantages"
    ];

    if (
      requiredFields.some(key =>
        !String(data[key] || "").trim()
      )
    ) {
      formError.textContent =
        "Заполни все обязательные поля анкеты.";

      return;
    }

    if (data.rules !== "Да, полностью ознакомлен") {
      formError.textContent =
        "Для подачи заявки необходимо ознакомиться с правилами сервера.";

      return;
    }

    application = {
      type: "Discord Staff",
      discordNickname: data.discordNickname.trim(),
      age: Number(data.age),
      experience: data.staffExperience,
      rules: data.rules,
      online: data.staffOnline,
      timezone: Number(data.staffTimezone),
      reason: data.staffReason.trim(),
      conflict: data.conflict.trim(),
      friendViolation: data.friendViolation.trim(),
      advantages: data.staffAdvantages.trim(),
      extra: (data.extra || "").trim(),
      createdAt: new Date().toISOString()
    };

  } else {
    const requiredFields = [
      "nickname",
      "age",
      "experience",
      "online",
      "clans",
      "donate",
      "pvp",
      "timezone",
      "reason"
    ];

    if (
      requiredFields.some(key =>
        !String(data[key] || "").trim()
      )
    ) {
      formError.textContent =
        "Поля, отмеченные звёздочкой (*), должны быть заполнены!";

      return;
    }

    application = {
      type: "Minecraft",
      server: currentServer,
      nickname: data.nickname.trim(),
      age: Number(data.age),
      experience: data.experience.trim(),
      online: data.online.trim(),
      previousClans: data.clans.trim(),
      donate: data.donate.trim(),
      pvp: Number(data.pvp),
      timezone: Number(data.timezone),
      reason: data.reason.trim(),
      extra: (data.extra || "").trim(),
      createdAt: new Date().toISOString()
    };
  }

  await submitApplicationToSupabase(application);
});

/* СИНХРОНИЗАЦИЯ СЕССИИ */

if (supabaseClient) {
  supabaseClient.auth.onAuthStateChange((_event, session) => {
    currentUser = session?.user || null;

    if (!currentUser) {
      currentProfile = null;

      if (accountButton) {
        accountButton.textContent = "Войти";
      }
    }
  });

  refreshAuthState();

} else {
  console.error(
    "Supabase SDK не загружен. Проверь подключение CDN."
  );
}
