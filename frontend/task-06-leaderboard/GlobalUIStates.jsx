import monitor from "./assets/ui-states/monitor.svg";
import monitorDisabled from "./assets/ui-states/monitor-disabled.svg";
import bookOpen from "./assets/ui-states/book-open.svg";
import bookOpenDisabled from "./assets/ui-states/book-open-disabled.svg";
import folderOpen from "./assets/ui-states/folder-open.svg";
import folderOpenDisabled from "./assets/ui-states/folder-open-disabled.svg";
import play from "./assets/ui-states/play.svg";
import playPressed from "./assets/ui-states/play-pressed.svg";
import codeXml from "./assets/ui-states/code-xml.svg";
import lock from "./assets/ui-states/lock.svg";
import check from "./assets/ui-states/check.svg";
import checkSmall from "./assets/ui-states/check-small.svg";
import checkWhite from "./assets/ui-states/check-white.svg";
import checkGreen from "./assets/ui-states/check-green.svg";
import x from "./assets/ui-states/x.svg";
import library from "./assets/ui-states/library.svg";
import trophy from "./assets/ui-states/trophy.svg";
import bed from "./assets/ui-states/bed.svg";
import bedLarge from "./assets/ui-states/bed-large.svg";
import "./GlobalUIStates.css";

const states = [
  ["default", "Энгийн"],
  ["hover", "Заахад"],
  ["pressed", "Дарахад"],
  ["selected", "Сонгосон"],
  ["disabled", "Идэвхгүй"],
];

const nodeIcons = { default: play, hover: play, pressed: playPressed, selected: codeXml, disabled: lock };

const elements = [
  ["Үндсэн товч", (state) => (
    <button className={`ui-btn ui-primary is-${state}`} disabled={state === "disabled"}>
      Эхлэх
      {state === "selected" && <img src={checkWhite} alt="" />}
    </button>
  )],
  ["Туслах товч", (state) => (
    <button className={`ui-btn ui-secondary is-${state}`} disabled={state === "disabled"}>
      Эхлэх
      {state === "selected" && <img src={checkSmall} alt="" />}
    </button>
  )],
  ["Хичээлийн карт", (state) => (
    <button className={`ui-option ui-course is-${state}`} disabled={state === "disabled"}>
      <img src={state === "disabled" ? folderOpenDisabled : folderOpen} alt="" />
      Веб систем ба технологи
    </button>
  )],
  ["Хичээлийн зангилаа", (state) => (
    <button className={`ui-node is-${state}`} disabled={state === "disabled"}>
      <span className="ui-marker">
        <img src={nodeIcons[state]} alt="" />
      </span>
      Компонент
    </button>
  )],
  ["Хариултын сонголт", (state) => (
    <button className={`ui-option ui-answer is-${state}`} disabled={state === "disabled"}>
      <span className="ui-key">B</span>
      <span className="ui-grow">Хариулт</span>
      {state === "selected" && <img src={check} alt="" />}
    </button>
  )],
  ["Навигацийн таб", (state) => (
    <button className={`ui-option is-${state}`} disabled={state === "disabled"}>
      <img src={state === "disabled" ? bookOpenDisabled : bookOpen} alt="" />
      Судлах
    </button>
  )],
  ["Холбоос", (state) => (
    <button className={`ui-link is-${state}`} disabled={state === "disabled"}>
      Дэлгэрэнгүй →
    </button>
  )],
  ["Өрөөний чиглэл", (state) => (
    <button className={`ui-option is-${state}`} disabled={state === "disabled"}>
      <img src={state === "disabled" ? monitorDisabled : monitor} alt="" />
      Дадлага хийх
    </button>
  )],
];

const tooltips = [
  [monitor, "Дадлага хийх"],
  [library, "Судлах"],
  [trophy, "Чансаа"],
  [bed, "Амрах · Гарах"],
];

const quizActions = ["Дахин оролдох", "Үргэлжлүүлэх", "Буцах"];

export default function GlobalUIStates() {
  return (
    <main className="ui-page" data-testid="page-ui-states">
      <h1 className="ui-title">Харагдах төлөвүүд</h1>
      <p className="ui-subtitle">Зөвхөн статик загвар · Заах, дарах болон шилжих төлөвийг дүрслэв. Үйлдэл холбогдоогүй.</p>

      <div className="ui-row ui-head">
        <span>Элемент</span>
        {states.map(([key, label]) => (
          <span key={key}>{label}</span>
        ))}
      </div>
      {elements.map(([name, render]) => (
        <div key={name} className="ui-row">
          <span className="ui-row-label">{name}</span>
          {states.map(([key, label]) => (
            <div key={key} className="ui-sample" data-state={label}>
              {render(key)}
            </div>
          ))}
        </div>
      ))}

      <h2 className="ui-section">Өрөөний дөрвөн тайлбар</h2>
      <div className="ui-grid ui-tooltips">
        {tooltips.map(([icon, label]) => (
          <div key={label} className="ui-tooltip">
            <img src={icon} alt="" />
            {label}
          </div>
        ))}
      </div>

      <div className="ui-grid ui-cards">
        <div className="ui-card">
          <h3>Нэвтрэх · Заавал бөглөх</h3>
          <label className="ui-label" htmlFor="ui-required-code">Оюутны код *</label>
          <input id="ui-required-code" className="ui-input" placeholder="Оюутны кодоо оруулна уу" aria-invalid="true" />
          <p className="ui-error">Оюутны кодоо оруулна уу.</p>
          <label className="ui-label" htmlFor="ui-required-password">Нууц үг *</label>
          <input id="ui-required-password" className="ui-input" type="password" placeholder="Нууц үгээ оруулна уу" aria-invalid="true" />
          <p className="ui-error">Нууц үгээ оруулна уу.</p>
          <button className="ui-btn ui-primary" disabled>Сэрэх</button>
        </div>

        <div className="ui-card">
          <h3>Нэвтрэх · Алдаа</h3>
          <p className="ui-label">Оюутны код</p>
          <p className="ui-value">B23CS0142</p>
          <label className="ui-label" htmlFor="ui-error-password">Нууц үг</label>
          <input id="ui-error-password" className="ui-input is-error" type="password" defaultValue="0123456789" aria-invalid="true" />
          <p className="ui-error ui-error-lg">Оюутны код эсвэл нууц үг буруу байна. Дахин оролдоно уу.</p>
          <button className="ui-btn ui-primary">Дахин оролдох</button>
          <button className="ui-link ui-forgot">Нууц үгээ мартсан уу?</button>
        </div>

        <div className="ui-card">
          <img src={bedLarge} alt="" />
          <h3 className="ui-dialog-title">Амрах уу?</h3>
          <p className="ui-muted">Өрөөнөөс гарахдаа итгэлтэй байна уу? Чиний ахиц хадгалагдана.</p>
          <button className="ui-btn ui-secondary">Үргэлжлүүлэн суралцах</button>
          <button className="ui-btn ui-primary">Амрах · Гарах</button>
        </div>
      </div>

      <h2 className="ui-section">Дадлага · Дахин оролдох / Үргэлжлүүлэх / Буцах</h2>
      <div className="ui-grid ui-quiz">
        {quizActions.map((label) => (
          <div key={label} className="ui-card">
            <h3 className="ui-card-label">{label}</h3>
            {["default", "hover", "pressed", "disabled"].map((state) => (
              <button key={state} className={`ui-btn ui-primary is-${state}`} disabled={state === "disabled"}>
                {label}
              </button>
            ))}
          </div>
        ))}
      </div>

      <div className="ui-grid ui-feedback">
        <div className="ui-option ui-answer is-wrong">
          <span className="ui-key">A</span>
          <span className="ui-grow">Буруу хариулт</span>
          <img src={x} alt="" />
        </div>
        <div className="ui-option ui-answer is-correct">
          <span className="ui-key">B</span>
          <span className="ui-grow">Зөв хариулт</span>
          <img src={checkGreen} alt="" />
        </div>
      </div>
    </main>
  );
}
