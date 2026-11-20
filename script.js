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
    const isActive = link.dataset.page === name;

    link.classList.toggle("active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

navLinks.forEach(link => {
  link.addEventListener("click", () => showPage(link.dataset.page));
});

document.querySelector(".brand")?.addEventListener("click", event => {
  event.preventDefault();
  showPage("application");
});

/* МОДАЛЬНЫЕ ОКНА */

let lastFocusedElement = null;

/* Доступность: роли диалогов, подписи и кнопки закрытия */
overlays.forEach((overlay, index) => {
  const modal = overlay.querySelector(".modal");
  const heading = modal?.querySelector("h2");

  if (modal) {
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("tabindex", "-1");

    if (heading) {
      heading.id = heading.id || `modalTitle${index}`;
      modal.setAttribute("aria-labelledby", heading.id);
    }
  }
});

document.querySelectorAll(".close-button").forEach(button => {
  button.setAttribute("aria-label", "Закрыть");
});

function openOverlay(overlay) {
  if (!overlay) return;

  const anotherOpen = [...overlays].some(item =>
    item !== overlay && item.classList.contains("open")
  );

  if (!anotherOpen && document.activeElement instanceof HTMLElement) {
    lastFocusedElement = document.activeElement;
  }

  overlay.classList.add("open");
  document.body.style.overflow = "hidden";

  const modal = overlay.querySelector(".modal");
  const firstField =
    overlay.id === "authOverlay"
      ? modal?.querySelector("input")
      : null;

  (firstField || modal)?.focus({ preventScroll: true });
}

function closeOverlay(overlay) {
  if (!overlay) return;

  overlay.classList.remove("open");

  const anotherOpen = [...overlays].some(item =>
    item.classList.contains("open")
  );

  if (!anotherOpen) {
    document.body.style.overflow = "";

    if (lastFocusedElement?.isConnected) {
      lastFocusedElement.focus({ preventScroll: true });
    }
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

  if (selectedServer) selectedServer.textContent = server;

  applicationForm.reset();

  if (formError) formError.textContent = "";

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

/* DISCORD STAFF */

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

    if (openModal) closeOverlay(openModal);
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

/* ЭЛЕМЕНТЫ НОВОЙ АДМИНКИ */

const adminSearch = document.getElementById("adminSearch");
const adminStatusFilter = document.getElementById("adminStatusFilter");
const adminServerFilter = document.getElementById("adminServerFilter");
const adminSort = document.getElementById("adminSort");
const refreshAdmin = document.getElementById("refreshAdmin");

const statTotal = document.getElementById("statTotal");
const statPending = document.getElementById("statPending");
const statApproved = document.getElementById("statApproved");
const statRejected = document.getElementById("statRejected");

const adminResultsCount = document.getElementById("adminResultsCount");
const adminLastUpdated = document.getElementById("adminLastUpdated");

let authMode = "login";
let currentUser = null;
let currentProfile = null;
let pendingApplication = null;

let allAdminApplications = [];
let adminLoadInProgress = false;

/* ДОСТУП АДМИНИСТРАТОРА */

function updateAdminAccess() {
  const isAdmin =
    Boolean(currentUser) &&
    currentProfile?.role === "admin";

  if (openAdmin) {
    openAdmin.hidden = !isAdmin;
  }

  if (!isAdmin && adminOverlay?.classList.contains("open")) {
    closeOverlay(adminOverlay);
  }

  return isAdmin;
}

function clearAdminData() {
  allAdminApplications = [];

  if (adminApplications) {
    adminApplications.innerHTML =
      '<p class="empty-state">Войдите в аккаунт администратора.</p>';
  }

  if (statTotal) statTotal.textContent = "—";
  if (statPending) statPending.textContent = "—";
  if (statApproved) statApproved.textContent = "—";
  if (statRejected) statRejected.textContent = "—";

  if (adminResultsCount) {
    adminResultsCount.textContent = "Нет доступа";
  }

  if (adminLastUpdated) {
    adminLastUpdated.textContent = "";
  }
}

function clearAccountState() {
  currentUser = null;
  currentProfile = null;

  if (accountButton) {
    accountButton.textContent = "Войти";
  }

  if (openAdmin) {
    openAdmin.hidden = true;
  }

  clearAdminData();

  closeOverlay(adminOverlay);
  closeOverlay(accountOverlay);
}

async function verifyAdminAccess() {
  if (!supabaseClient) {
    clearAccountState();
    return false;
  }

  try {
    const { data: userData, error: userError } =
      await supabaseClient.auth.getUser();

    if (userError || !userData?.user) {
      clearAccountState();
      return false;
    }

    currentUser = userData.user;

    const profile = await loadProfile();

    if (!profile || profile.role !== "admin") {
      currentProfile = profile || null;
      updateAdminAccess();
      return false;
    }

    updateAdminAccess();
    return true;

  } catch (error) {
    console.error("Admin access verification error:", error);

    currentProfile = null;
    updateAdminAccess();

    return false;
  }
}

/* USERNAME И ТЕХНИЧЕСКИЙ EMAIL */

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

  if (authError) authError.textContent = "";

  authTitle.textContent =
    mode === "signup" ? "Создание аккаунта" : "Вход в аккаунт";

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

  const authHint = document.getElementById("authHint");
  if (authHint) authHint.hidden = mode !== "signup";

  const passwordInput = authForm.querySelector('input[name="password"]');
  if (passwordInput) {
    passwordInput.autocomplete =
      mode === "signup" ? "new-password" : "current-password";
  }

  authForm.reset();
  openOverlay(authOverlay);
}

/* ЗАГРУЗКА ПРОФИЛЯ */

async function loadProfile() {
  if (!supabaseClient || !currentUser) {
    currentProfile = null;
    updateAdminAccess();
    return null;
  }

  const { data, error } = await supabaseClient
    .from("profiles")
    .select("id, username, role, created_at")
    .eq("id", currentUser.id)
    .single();

  if (error) {
    currentProfile = null;
    updateAdminAccess();
    throw error;
  }

  currentProfile = data;
  updateAdminAccess();

  return data;
}

/* ПРОВЕРКА СЕССИИ */

async function refreshAuthState() {
  if (!supabaseClient) {
    clearAccountState();
    showToast("Не удалось загрузить Supabase. Проверь подключение к интернету.");
    return;
  }

  try {
    const { data, error } = await supabaseClient.auth.getUser();

    if (error || !data?.user) {
      clearAccountState();
      return;
    }

    currentUser = data.user;
    currentProfile = null;

    if (accountButton) {
      accountButton.textContent = "Мой аккаунт";
    }

    try {
      await loadProfile();
    } catch (profileError) {
      console.error("Profile load error:", profileError);
      currentProfile = null;
      updateAdminAccess();
    }

  } catch (error) {
    console.error("Session refresh error:", error);
    clearAccountState();
  }
}

/* ЛИЧНЫЙ КАБИНЕТ */

accountButton?.addEventListener("click", async () => {
  if (!supabaseClient) {
    openAuth("login");
    return;
  }

  await refreshAuthState();

  if (!currentUser) {
    openAuth("login");
    return;
  }

  try {
    await renderMyApplications();

    accountUsername.textContent =
      currentProfile?.username || currentUser.email;

    updateAdminAccess();
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
    authMode === "signup" ? "Создаём аккаунт..." : "Входим...";

  authError.textContent = "";

  try {
    let result;

    if (authMode === "signup") {
      result = await supabaseClient.auth.signUp({
        email: usernameEmail(username),
        password,
        options: {
          data: { username }
        }
      });

      if (result.error) throw result.error;

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

      if (
        result.error &&
        result.error.message?.includes("Invalid login credentials")
      ) {
        result = await supabaseClient.auth.signInWithPassword({
          email: legacyUsernameEmail(username),
          password
        });
      }

      if (result.error) throw result.error;
    }

    currentUser = result.data.user;
    currentProfile = null;

    await loadProfile();

    closeOverlay(authOverlay);

    accountButton.textContent = "Мой аккаунт";
    updateAdminAccess();

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
  if (!supabaseClient || !currentUser) {
    throw new Error("Необходимо войти в аккаунт.");
  }

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

  const discordUsername =
    currentProfile?.username ||
    currentUser.user_metadata?.username ||
    null;

  const payload = {
    user_id: currentUser.id,
    server: currentServer,
    data: { ...application, discordUsername },
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

/* АДМИНКА — СТАТИСТИКА */

function updateAdminStats(applications) {
  const total = applications.length;
  const pending = applications.filter(item => item.status === "pending").length;
  const approved = applications.filter(item => item.status === "approved").length;
  const rejected = applications.filter(item => item.status === "rejected").length;

  if (statTotal) statTotal.textContent = total;
  if (statPending) statPending.textContent = pending;
  if (statApproved) statApproved.textContent = approved;
  if (statRejected) statRejected.textContent = rejected;
}

/* ПОЛУЧЕНИЕ ИМЕНИ ИГРОКА */

function getApplicationNickname(item) {
  return (
    item.data?.nickname ||
    item.data?.discordNickname ||
    item.data?.username ||
    "Участник"
  );
}

/* ФИЛЬТРАЦИЯ И СОРТИРОВКА */

function getFilteredAdminApplications() {
  const search = (adminSearch?.value || "").trim().toLowerCase();
  const status = adminStatusFilter?.value || "all";
  const server = adminServerFilter?.value || "all";
  const sort = adminSort?.value || "newest";

  let filtered = [...allAdminApplications];

  if (status !== "all") {
    filtered = filtered.filter(item => item.status === status);
  }

  if (server !== "all") {
    filtered = filtered.filter(item => item.server === server);
  }

  if (search) {
    filtered = filtered.filter(item => {
      const searchable = [
        item.server,
        getApplicationNickname(item),
        item.user_id,
        item.id,
        item.status,
        item.data?.discordNickname,
        item.data?.discordUsername
      ].join(" ").toLowerCase();

      return searchable.includes(search);
    });
  }

  filtered.sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();

    return sort === "oldest"
      ? dateA - dateB
      : dateB - dateA;
  });

  return filtered;
}

/* ОТОБРАЖЕНИЕ ЗАЯВОК */

function renderFilteredAdminApplications() {
  if (!adminApplications) return;

  const filtered = getFilteredAdminApplications();

  if (adminResultsCount) {
    adminResultsCount.textContent =
      `Показано ${filtered.length} из ${allAdminApplications.length} заявок`;
  }

  if (!filtered.length) {
    adminApplications.innerHTML = `
      <div class="empty-state admin-empty">
        По выбранным параметрам заявок не найдено.
      </div>
    `;
    return;
  }

  adminApplications.innerHTML = filtered.map(item => {
    const nickname = getApplicationNickname(item);
    const date = new Date(item.created_at).toLocaleString("ru-RU");
    const applicationData = JSON.stringify(item.data || {}, null, 2);

    return `
      <article
        class="admin-application"
        data-application-id="${escapeHtml(item.id)}"
      >
        <div class="admin-card-top">
          <div class="admin-card-title">
            <h3>
              ${escapeHtml(item.server)}
              <span style="color:var(--muted)">/</span>
              ${escapeHtml(nickname)}
            </h3>
            <p class="admin-card-subtitle">
              Заявка участника Ikusami
            </p>
          </div>

          <span class="application-status ${escapeHtml(item.status)}">
            ${statusLabel(item.status)}
          </span>
        </div>

        <div class="admin-card-meta">
          <span class="admin-meta-chip">Дата: ${escapeHtml(date)}</span>
          <span class="admin-meta-chip">ID: ${escapeHtml(item.id)}</span>
        </div>

        ${
          item.data?.discordUsername
            ? `<p>Discord для связи: <span class="admin-discord">@${escapeHtml(item.data.discordUsername)}</span></p>`
            : ""
        }

        <p>Пользователь: ${escapeHtml(item.user_id)}</p>

        <details class="admin-details">
          <summary>Посмотреть ответы анкеты</summary>
          <pre>${escapeHtml(applicationData)}</pre>
        </details>

        <label class="admin-comment-label" for="comment-${escapeHtml(item.id)}">
          Комментарий администрации
        </label>

        <textarea
          id="comment-${escapeHtml(item.id)}"
          class="admin-comment"
          placeholder="Напиши комментарий к решению..."
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
            На рассмотрение
          </button>
        </div>
      </article>
    `;
  }).join("");
}

/* ФИЛЬТРЫ */

adminSearch?.addEventListener("input", renderFilteredAdminApplications);
adminStatusFilter?.addEventListener("change", renderFilteredAdminApplications);
adminServerFilter?.addEventListener("change", renderFilteredAdminApplications);
adminSort?.addEventListener("change", renderFilteredAdminApplications);

/* ОТКРЫТИЕ АДМИН-ПАНЕЛИ */

openAdmin?.addEventListener("click", async () => {
  openAdmin.disabled = true;

  try {
    const isAdmin = await verifyAdminAccess();

    if (!isAdmin) {
      closeOverlay(adminOverlay);
      showToast("Доступ запрещён. Панель доступна только администраторам.");
      return;
    }

    closeOverlay(accountOverlay);
    openOverlay(adminOverlay);

    await renderAdminApplications();

  } catch (error) {
    console.error("Admin panel error:", error);

    closeOverlay(adminOverlay);
    showToast("Не удалось открыть панель администратора.");

  } finally {
    openAdmin.disabled = false;
    updateAdminAccess();
  }
});

/* ОБНОВЛЕНИЕ ЗАЯВОК */

async function renderAdminApplications() {
  if (!adminApplications || adminLoadInProgress) return;

  adminLoadInProgress = true;

  try {
    const isAdmin = await verifyAdminAccess();

    if (!isAdmin) {
      clearAdminData();
      closeOverlay(adminOverlay);
      showToast("У тебя нет прав администратора.");
      return;
    }

    adminApplications.innerHTML =
      '<p class="empty-state">Загружаем заявки...</p>';

    const { data, error } = await supabaseClient
      .from("applications")
      .select("id, user_id, server, data, status, admin_comment, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      adminApplications.innerHTML =
        `<p class="empty-state">${escapeHtml(error.message)}</p>`;
      throw error;
    }

    allAdminApplications = data || [];

    updateAdminStats(allAdminApplications);
    renderFilteredAdminApplications();

    if (adminLastUpdated) {
      adminLastUpdated.textContent =
        "Обновлено: " + new Date().toLocaleTimeString("ru-RU");
    }

  } catch (error) {
    console.error("Admin applications loading error:", error);

    if (adminApplications) {
      adminApplications.innerHTML =
        `<p class="empty-state">Не удалось загрузить заявки: ${escapeHtml(error.message)}</p>`;
    }

  } finally {
    adminLoadInProgress = false;
  }
}

/* КНОПКА ОБНОВЛЕНИЯ */

refreshAdmin?.addEventListener("click", async () => {
  refreshAdmin.disabled = true;
  refreshAdmin.textContent = "Обновляем...";

  try {
    const isAdmin = await verifyAdminAccess();

    if (!isAdmin) {
      closeOverlay(adminOverlay);
      showToast("Доступ запрещён.");
      return;
    }

    await renderAdminApplications();
    showToast("Список заявок обновлён.");

  } finally {
    refreshAdmin.disabled = false;
    refreshAdmin.textContent = "Обновить";
  }
});

/* ОБРАБОТКА РЕШЕНИЙ АДМИНИСТРАТОРА */

adminApplications?.addEventListener("click", async event => {
  const button = event.target.closest?.("button[data-status]");

  if (!button) return;

  button.disabled = true;

  const card = button.closest("[data-application-id]");
  const id = card?.dataset.applicationId;

  try {
    const isAdmin = await verifyAdminAccess();

    if (!isAdmin) {
      showToast("Доступ запрещён. Необходима роль администратора.");
      closeOverlay(adminOverlay);
      return;
    }

    if (!id) {
      showToast("Не удалось определить заявку.");
      return;
    }

    const comment =
      card.querySelector(".admin-comment")?.value || "";

    const newStatus = button.dataset.status;

    const { data, error } = await supabaseClient
      .from("applications")
      .update({
        status: newStatus,
        admin_comment: comment,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select("id, status")
      .maybeSingle();

    if (error) {
      console.error("Ошибка обновления заявки:", error);
      showToast("Не удалось обновить заявку: " + error.message);
      return;
    }

    if (!data) {
      console.error(
        "Supabase не обновил ни одной строки. Проверь UPDATE-политику RLS.",
        { applicationId: id, requestedStatus: newStatus }
      );

      showToast(
        "Заявка не обновлена. Проверь UPDATE-политику RLS в Supabase."
      );
      return;
    }

    if (data.status !== newStatus) {
      showToast("Supabase вернул неожиданный статус: " + data.status);
      await renderAdminApplications();
      return;
    }

    showToast("Статус заявки успешно изменён.");
    await renderAdminApplications();

  } catch (error) {
    console.error("Ошибка при изменении статуса:", error);
    showToast("Ошибка при изменении статуса: " + error.message);

  } finally {
    button.disabled = false;
  }
});

/* ВЫХОД ИЗ АККАУНТА */

logoutButton?.addEventListener("click", async () => {
  if (!supabaseClient) {
    clearAccountState();
    return;
  }

  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    showToast("Не удалось выйти из аккаунта.");
    return;
  }

  clearAccountState();
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

    if (requiredFields.some(key => !String(data[key] || "").trim())) {
      formError.textContent = "Заполни все обязательные поля анкеты.";
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

    if (requiredFields.some(key => !String(data[key] || "").trim())) {
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

  const submitButton = applicationForm.querySelector('button[type="submit"]');

  if (submitButton?.disabled) return;

  const submitLabel = submitButton?.innerHTML;

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Отправляем...";
  }

  try {
    await submitApplicationToSupabase(application);
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.innerHTML = submitLabel;
    }
  }
});

/* СИНХРОНИЗАЦИЯ СЕССИИ */

if (supabaseClient) {
  supabaseClient.auth.onAuthStateChange((_event, session) => {
    currentUser = session?.user || null;
    currentProfile = null;

    updateAdminAccess();

    if (!currentUser) {
      clearAccountState();
      return;
    }

    if (accountButton) {
      accountButton.textContent = "Мой аккаунт";
    }

    Promise.resolve().then(() => refreshAuthState());
  });

  refreshAuthState();

} else {
  console.error("Supabase SDK не загружен. Проверь подключение CDN.");
  clearAccountState();
}
