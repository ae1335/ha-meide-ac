/**
 * Midea Meiju (美的美居) style air-conditioner card for Home Assistant.
 *
 * Bundled with the midea_ac_lan integration: the integration registers this
 * file as a frontend resource automatically, so no extra HACS plugin is
 * needed. Visual language follows the Meiju app AC screen: dark blue
 * gradient, large target temperature, round mode buttons, ungraded fan
 * slider, 7-level airflow pills and quick-toggle chips.
 *
 * Config:
 *   type: custom:midea-meiju-ac-card
 *   entity: climate.<device_id>_climate
 *   name: 卧室空调            # optional
 *   switches:                 # optional, defaults to the four Meiju ones
 *     - switch.<device_id>_eco_mode
 *     - switch.<device_id>_aux_heating
 *
 * All companion entities are derived from the climate entity id, which the
 * integration builds as "<platform>.<device_id>_<entity_key>".
 */

const CARD_VERSION = "2026.9.5-meiju.2";

const MODE_LABELS = {
  auto: "自动",
  cool: "制冷",
  dry: "抽湿",
  heat: "制热",
  fan_only: "送风",
};

const DEFAULT_SWITCHES = [
  ["eco_mode", "酷省电"],
  ["aux_heating", "电辅热"],
  ["indirect_wind", "防直吹"],
  ["comfort_mode", "智控温"],
];

const EXTRA_SWITCHES = [
  ["self_clean", "自清洁"],
  ["degerming", "除菌"],
  ["breezeless", "无风感"],
  ["sleep_mode", "睡眠"],
];

const SWING_UD = [
  ["swing", "摆风"],
  ["off", "停止"],
  ["up", "最上"],
  ["up_mid", "偏上"],
  ["middle", "居中"],
  ["down_mid", "偏下"],
  ["down", "最下"],
];

const SWING_LR = [
  ["swing", "摆风"],
  ["off", "停止"],
  ["left", "最左"],
  ["left_mid", "偏左"],
  ["middle", "居中"],
  ["right_mid", "偏右"],
  ["right", "最右"],
];

const STYLES = `
:host {
  display: block;
  --mm-accent: #5b9dff;
  --mm-accent-soft: rgba(91, 157, 255, 0.18);
  --mm-on: #4fd1c5;
  --mm-text: #eef4ff;
  --mm-text-dim: #9db0cc;
  --mm-surface: rgba(255, 255, 255, 0.07);
  --mm-surface-strong: rgba(255, 255, 255, 0.13);
}
ha-card {
  background: linear-gradient(165deg, #17294b 0%, #0e1a33 55%, #0a1226 100%);
  border-radius: var(--ha-card-border-radius, 14px);
  overflow: hidden;
  color: var(--mm-text);
  font-family: var(--paper-font-body1_-_font-family, inherit);
}
.wrap { padding: 16px 16px 14px; }
.head {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 6px;
}
.name { font-size: 15px; font-weight: 500; letter-spacing: 0.2px; }
.sub { font-size: 12px; color: var(--mm-text-dim); margin-top: 2px; }
.power {
  width: 42px; height: 42px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.22);
  background: var(--mm-surface); color: var(--mm-text-dim); cursor: pointer;
  display: flex; align-items: center; justify-content: center; padding: 0;
}
.power.on {
  background: var(--mm-accent-soft); border-color: var(--mm-accent); color: var(--mm-accent);
}
.power svg { width: 20px; height: 20px; }
.temp-row {
  display: flex; align-items: center; justify-content: center; gap: 18px;
  margin: 10px 0 4px;
}
.step {
  width: 40px; height: 40px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.18);
  background: var(--mm-surface); color: var(--mm-text); font-size: 20px; line-height: 1;
  cursor: pointer; padding: 0;
}
.step:disabled { opacity: 0.35; cursor: default; }
.temp { text-align: center; min-width: 130px; }
.temp .target {
  font-size: 46px; font-weight: 300; line-height: 1;
  font-variant-numeric: tabular-nums;
}
.temp .target small { font-size: 18px; font-weight: 400; color: var(--mm-text-dim); }
.temp .current { font-size: 12px; color: var(--mm-text-dim); margin-top: 6px; }
.section { margin-top: 14px; }
.section-title {
  font-size: 12px; color: var(--mm-text-dim); margin-bottom: 8px;
  display: flex; justify-content: space-between; align-items: baseline;
}
.modes { display: flex; justify-content: space-between; gap: 6px; }
.mode {
  flex: 1; background: none; border: none; padding: 0; cursor: pointer;
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  color: var(--mm-text-dim);
}
.mode .disc {
  width: 42px; height: 42px; border-radius: 50%;
  background: var(--mm-surface); border: 1px solid rgba(255,255,255,0.12);
  display: flex; align-items: center; justify-content: center;
}
.mode.active { color: var(--mm-accent); }
.mode.active .disc { background: var(--mm-accent-soft); border-color: var(--mm-accent); }
.mode svg { width: 20px; height: 20px; }
.mode span { font-size: 11px; }
.slider-row { display: flex; align-items: center; gap: 10px; }
input[type="range"] {
  flex: 1; accent-color: var(--mm-accent); height: 4px;
}
.slider-value { font-size: 13px; min-width: 58px; text-align: right; font-variant-numeric: tabular-nums; }
.pills { display: flex; flex-wrap: wrap; gap: 6px; }
.pill {
  border: 1px solid rgba(255,255,255,0.14); background: var(--mm-surface);
  color: var(--mm-text-dim); border-radius: 999px; padding: 5px 12px;
  font-size: 12px; cursor: pointer;
}
.pill.active {
  background: var(--mm-accent-soft); border-color: var(--mm-accent); color: var(--mm-accent);
}
.chips { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.chip {
  border: 1px solid rgba(255,255,255,0.14); background: var(--mm-surface);
  color: var(--mm-text-dim); border-radius: 10px; padding: 9px 4px;
  font-size: 12px; cursor: pointer; text-align: center;
}
.chip.active {
  background: rgba(79, 209, 197, 0.16); border-color: var(--mm-on); color: var(--mm-on);
}
.chip.unavailable { opacity: 0.4; cursor: default; }
.fault {
  margin-top: 12px; padding: 8px 10px; border-radius: 10px; font-size: 12px;
  background: rgba(226, 75, 74, 0.16); border: 1px solid rgba(226, 75, 74, 0.5);
  color: #f7c1c1;
}
.hint { font-size: 12px; color: var(--mm-text-dim); padding: 8px 0; }
@media (max-width: 380px) {
  .temp .target { font-size: 38px; }
  .modes { flex-wrap: wrap; }
  .chips { grid-template-columns: repeat(2, 1fr); }
}
`;

const ICONS = {
  power:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 3v9"/><path d="M6.6 6.6a8 8 0 1 0 10.8 0"/></svg>',
  auto: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12h16"/><path d="M8 8l-4 4 4 4"/><path d="M16 8l4 4-4 4"/></svg>',
  cool: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 3v18M5 7.5l14 9M19 7.5l-14 9"/></svg>',
  dry: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 4c3 4 5 6.5 5 9a5 5 0 0 1-10 0c0-2.5 2-5 5-9z"/></svg>',
  heat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 21a5 5 0 0 0 5-5c0-3-5-9-5-9S7 13 7 16a5 5 0 0 0 5 5z"/><path d="M12 17a1.5 1.5 0 0 0 1.5-1.5c0-1-1.5-2.5-1.5-2.5s-1.5 1.5-1.5 2.5A1.5 1.5 0 0 0 12 17z"/></svg>',
  fan: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="2.2"/><path d="M12 9.8c0-4-1.5-6.3-3.6-5.6C6.2 4.9 7.9 8 12 9.8zM14.2 12c4 0 6.3-1.5 5.6-3.6C19.1 6.2 16 7.9 14.2 12zM12 14.2c0 4 1.5 6.3 3.6 5.6 2.2-.7.5-3.8-3.6-5.6zM9.8 12c-4 0-6.3 1.5-5.6 3.6.7 2.2 3.8.5 5.6-3.6z"/></svg>',
};

function icon(name) {
  return ICONS[name] || "";
}

export class MideaMeijuAcCard extends HTMLElement {
  static getStubConfig(hass) {
    const climate = Object.keys(hass.states).find(
      (e) => e.startsWith("climate.") && e.includes("_climate"),
    );
    return { entity: climate || "", name: "空调" };
  }

  /** Derive companion entity ids from the climate entity id. */
  static deriveEntities(climateEntityId) {
    const dot = climateEntityId.indexOf(".");
    const prefix = dot >= 0 ? climateEntityId.slice(0, dot) : "";
    const objectId =
      dot >= 0 ? climateEntityId.slice(dot + 1) : climateEntityId;
    const base = objectId.endsWith("_climate")
      ? objectId.slice(0, -"_climate".length)
      : objectId;
    const mk = (platform, key) =>
      prefix && base ? `${platform}.${base}_${key}` : "";
    return {
      prefix,
      base,
      power: climateEntityId,
      eco: mk("switch", "eco_mode"),
      auxHeat: mk("switch", "aux_heating"),
      indirectWind: mk("switch", "indirect_wind"),
      comfort: mk("switch", "comfort_mode"),
      extra: Object.fromEntries(
        EXTRA_SWITCHES.map(([key]) => [key, mk("switch", key)]),
      ),
      fanSpeed: mk("number", "fan_speed"),
      swingUd: mk("select", "wind_ud_angle"),
      swingLr: mk("select", "wind_lr_angle"),
      indoorTemp: mk("sensor", "indoor_temperature"),
      errorCode: mk("sensor", "error_code"),
      realtimePower: mk("sensor", "realtime_power"),
    };
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._built = false;
  }

  setConfig(config) {
    if (!config || !config.entity) {
      throw new Error("请配置空调 climate 实体（entity）");
    }
    this._config = config;
    this._built = false;
  }

  getCardSize() {
    return 9;
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._built) {
      this._build();
      this._built = true;
    }
    this._render();
  }

  _state(id) {
    return id && this._hass ? this._hass.states[id] : undefined;
  }

  _build() {
    const root = this.shadowRoot;
    root.innerHTML = `<style>${STYLES}</style><ha-card><div class="wrap"></div></ha-card>`;
    this._wrap = root.querySelector(".wrap");
  }

  _call(domain, service, data) {
    this._hass.callService(domain, service, data);
  }

  _toggle(entityId, turnOn) {
    this._call("homeassistant", turnOn ? "turn_on" : "turn_off", {
      entity_id: entityId,
    });
  }

  _render() {
    const s = this._config.entity;
    const ents = this.constructor.deriveEntities(s);
    const climate = this._state(s);
    if (!climate) {
      this._wrap.innerHTML = `<div class="hint">找不到实体 ${s}</div>`;
      return;
    }
    const attrs = climate.attributes || {};
    const target = attrs.temperature;
    const current =
      attrs.current_temperature ?? this._state(ents.indoorTemp)?.state;
    const mode = climate.state;
    const fanMode = attrs.fan_mode;
    const fanSpeedEntity = this._state(ents.fanSpeed);
    const fanValue = fanSpeedEntity ? Number(fanSpeedEntity.state) : undefined;
    const udState = this._state(ents.swingUd);
    const lrState = this._state(ents.swingLr);
    const fault = this._state(ents.errorCode);
    const faultText =
      fault &&
      fault.state &&
      !["0", "unknown", "unavailable", "正常"].includes(fault.state)
        ? fault.state
        : "";
    const powerOn = mode && mode !== "off";
    const name =
      this._config.name || climate.attributes.friendly_name || "空调";

    const modeButtons = Object.entries(MODE_LABELS)
      .map(
        ([key, label]) => `
        <button class="mode ${mode === key ? "active" : ""}" data-mode="${key}" ${powerOn ? "" : "disabled"}>
          <span class="disc">${icon(key === "fan_only" ? "fan" : key)}</span><span>${label}</span>
        </button>`,
      )
      .join("");

    const fanLabel =
      fanMode === "auto" || fanValue === 102
        ? "自动"
        : fanValue !== undefined
          ? `${Math.round(fanValue)}%`
          : "—";

    const pills = (list, activeValue) =>
      list
        .map(
          ([value, label]) =>
            `<button class="pill ${activeValue === value ? "active" : ""}" data-pill="${value}">${label}</button>`,
        )
        .join("");

    const chips = DEFAULT_SWITCHES.map(([key, label]) => {
      const id =
        ents[
          key === "eco_mode"
            ? "eco"
            : key === "aux_heating"
              ? "auxHeat"
              : key === "indirect_wind"
                ? "indirectWind"
                : "comfort"
        ];
      const st = this._state(id);
      const on = st && st.state === "on";
      return `<button class="chip ${on ? "active" : ""} ${st ? "" : "unavailable"}" data-switch="${id}">${label}</button>`;
    }).join("");

    const extraChips = EXTRA_SWITCHES.map(([key, label]) => {
      const id = ents.extra[key];
      const st = this._state(id);
      if (!st) {
        return `<button class="chip unavailable" disabled>${label}</button>`;
      }
      return `<button class="chip ${st.state === "on" ? "active" : ""}" data-switch="${id}">${label}</button>`;
    }).join("");

    this._wrap.innerHTML = `
      <div class="head">
        <div>
          <div class="name">${name}</div>
          <div class="sub">${powerOn ? MODE_LABELS[mode] || mode : "已关机"}${attrs.current_humidity ? ` · 湿度 ${Math.round(attrs.current_humidity)}%` : ""}</div>
        </div>
        <button class="power ${powerOn ? "on" : ""}" data-power="1">${icon("power")}</button>
      </div>

      <div class="temp-row">
        <button class="step" data-step="-1" ${powerOn && attrs.temperature !== undefined ? "" : "disabled"}>−</button>
        <div class="temp">
          <div class="target">${target !== undefined && target !== null ? Number(target).toFixed(1) : "—"}<small>°C</small></div>
          <div class="current">室温 ${current !== undefined && current !== null && current !== "unknown" ? Number(current).toFixed(1) : "—"}°C</div>
        </div>
        <button class="step" data-step="1" ${powerOn && attrs.temperature !== undefined ? "" : "disabled"}>+</button>
      </div>

      <div class="section">
        <div class="modes">${modeButtons}</div>
      </div>

      <div class="section">
        <div class="section-title"><span>风速</span><span>${fanLabel}</span></div>
        <div class="slider-row">
          <input type="range" min="1" max="100" step="1" value="${fanValue !== undefined && fanValue <= 100 ? Math.round(fanValue) : 60}" data-fan="1" ${fanSpeedEntity ? "" : "disabled"} />
        </div>
      </div>

      <div class="section">
        <div class="section-title"><span>上下风</span><span>${udState ? udState.state : "—"}</span></div>
        <div class="pills" data-target="ud">${pills(SWING_UD, udState ? udState.state : "")}</div>
      </div>

      <div class="section">
        <div class="section-title"><span>左右风</span><span>${lrState ? lrState.state : "—"}</span></div>
        <div class="pills" data-target="lr">${pills(SWING_LR, lrState ? lrState.state : "")}</div>
      </div>

      <div class="section">
        <div class="chips">${chips}</div>
      </div>

      <div class="section">
        <div class="section-title"><span>更多</span></div>
        <div class="chips">${extraChips}</div>
      </div>

      ${faultText ? `<div class="fault">故障：${faultText}</div>` : ""}
    `;

    this._bind(ents);
  }

  _bind(ents) {
    const s = this._config.entity;
    this._wrap.querySelector("[data-power]").addEventListener("click", () => {
      const climate = this._state(s);
      const on = climate && climate.state !== "off";
      this._call("climate", on ? "turn_off" : "turn_on", { entity_id: s });
    });

    this._wrap.querySelectorAll("[data-step]").forEach((btn) =>
      btn.addEventListener("click", () => {
        const climate = this._state(s);
        const target = Number(climate.attributes.temperature);
        if (Number.isNaN(target)) {
          return;
        }
        const next = Math.min(
          30,
          Math.max(
            16,
            Math.round((target + Number(btn.dataset.step) * 0.5) * 2) / 2,
          ),
        );
        this._call("climate", "set_temperature", {
          entity_id: s,
          temperature: next,
        });
      }),
    );

    this._wrap.querySelectorAll("[data-mode]").forEach((btn) =>
      btn.addEventListener("click", () =>
        this._call("climate", "set_hvac_mode", {
          entity_id: s,
          hvac_mode: btn.dataset.mode,
        }),
      ),
    );

    const slider = this._wrap.querySelector("[data-fan]");
    if (slider) {
      slider.addEventListener("change", () =>
        this._call("number", "set_value", {
          entity_id: ents.fanSpeed,
          value: Number(slider.value),
        }),
      );
    }

    this._wrap.querySelectorAll("[data-pill]").forEach((btn) =>
      btn.addEventListener("click", () => {
        const entity =
          btn.closest("[data-target]").dataset.target === "ud"
            ? ents.swingUd
            : ents.swingLr;
        this._call("select", "select_option", {
          entity_id: entity,
          option: btn.dataset.pill,
        });
      }),
    );

    this._wrap.querySelectorAll("[data-switch]").forEach((btn) =>
      btn.addEventListener("click", () => {
        const st = this._state(btn.dataset.switch);
        this._toggle(btn.dataset.switch, !(st && st.state === "on"));
      }),
    );
  }
}

if (!customElements.get("midea-meiju-ac-card")) {
  customElements.define("midea-meiju-ac-card", MideaMeijuAcCard);
}

window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === "midea-meiju-ac-card")) {
  window.customCards.push({
    type: "midea-meiju-ac-card",
    name: "美的美居空调卡片",
    description: "美的美居风格的空调控制卡片（温度/模式/风速/摆风/快捷开关）",
    preview: true,
    version: CARD_VERSION,
  });
}
