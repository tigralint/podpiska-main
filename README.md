<div align="center">
  <img src="https://raw.githubusercontent.com/tigralint/chestnayapodpiska/main/public/favicon.ico" width="80" alt="Logo" />
  <h1>🛡️ Честная Подписка <br/> <sup>(Honest Subscription)</sup></h1>
  
  <p><strong>Бесплатный правовой навигатор и генератор претензий для защиты прав потребителей в цифровой среде.</strong></p>
  
  <p>
    <a href="https://react.dev/"><img src="https://img.shields.io/badge/React%2019-61dafb?style=for-the-badge&logo=react&logoColor=black" alt="React" /></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-3178c6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
    <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-646cff?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" /></a>
    <a href="https://vitest.dev/"><img src="https://img.shields.io/badge/Tests-133_passed-2ea44f?style=for-the-badge&logo=vitest&logoColor=white" alt="Tests" /></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/License-Dual_License-blue?style=for-the-badge" alt="License" /></a>
  </p>

  <p>
    <i>Создано в рамках Всероссийского студенческого конкурса <b>«Твой Ход»</b>.</i>
  </p>
</div>

<br/>

> 💡 **Сервис незаконно списал деньги? Онлайн-школа отказывается возвращать оплату? Кнопка отмены спрятана за семью слоями интерфейса?** <br/>
> Корпорации тратят миллионы на UX-дизайнеров, чтобы спрятать отмену подписки. Среднестатистический пользователь даже не подозревает о существовании ст. 32 ЗоЗПП РФ. **Мы поможем вернуть ваше.**

«Честная Подписка» — это инструмент, который за **2 минуты** сгенерирует юридически грамотную претензию на возврат денег. **Без регистрации. Без скрытых платежей. Без сбора персональных данных.**

---

## 📑 Оглавление
- [✨ Ключевые возможности](#-ключевые-возможности)
- [🏗 Архитектура и Технологии](#-архитектура-и-технологии)
- [🛡 Безопасность](#-безопасность)
- [🚀 Быстрый старт (Локально)](#-быстрый-старт-локально)
- [🤝 Участие в проекте (Contributing)](#-участие-в-проекте-contributing)
- [⚖️ Лицензия](#️-лицензия)
- [📞 Контакты](#-контакты)

---

## ✨ Ключевые возможности

### 📝 Генератор претензий (AI-Driven)
Работает на базе связки проверенных юридических шаблонов и LLM, помогая составить документ для:
1. **Подписок** (Яндекс Плюс, ivi, VK Музыка и др.).
2. **Онлайн-курсов** (Skillbox, GeekBrains, Нетология и др.).

Вы сами выбираете **тон документа**, который лучше всего подходит вашей ситуации:
- 🤝 **Вежливое обращение** (позиция лояльного клиента).
- ⚔️ **Жёсткая досудебная претензия** (с упоминанием Роспотребнадзора, суда и штрафа 50%).

*Юридическая база строится на ст. 32 ЗоЗПП и ст. 782 ГК РФ. Компании обычно возвращают деньги добровольно, увидев уверенное знание закона.*

### 🎮 Тренажёр-симулятор "Дарк-паттернов"
Попробуйте найти настоящую кнопку отмены подписки среди уловок маркетологов («Остаться с нами», «Может, передумаете?» и микроскопических крестиков). 
* Интерактивное обучение через игру.
* Вырабатывает иммунитет к агрессивному UX.

### 📡 Народный радар (Live Radar)
Живая тепловая карта жалоб на сервисы. Полноценная лента алертов на базе **Upstash Redis**, позволяющая мгновенно выявлять массовые списания. Пользователи могут анонимно передавать сигналы через защищенную форму (**Turnstile**), а юристы — получать их в реальном времени через **Telegram Bot API**.

### 📚 Интеллектуальная База Знаний
Расширенный каталог инструкций по отписке со встроенным **умным поиском**, фильтрацией по категориям и рейтингом сложности отмены (Низкая / Средняя / Высокая).

---

## 🏗 Архитектура и Технологии

| Слой           | Инструменты                                                                        |
|----------------|------------------------------------------------------------------------------------|
| **Frontend**   | React 19, TypeScript, Vite                                                         |
| **Styling**    | Tailwind CSS, кастомная *Glassmorphism* UI-система                                 |
| **State**      | Zustand с `persist` middleware для сохранения прогресса                            |
| **Backend**    | Vercel Serverless Functions + Upstash Redis                                        |
| **AI Engine**  | OpenRouter API (LLM Qwen) + Smart Prompt Builder                                   |
| **Security**   | Cloudflare Turnstile, Rate Limiting, CSP, Strict Typings (Zod)                     |
| **Тесты**      | Vitest + React Testing Library (133 tests)                                         |

> **Интересное под капотом:**
> Универсальный дженерик-хук `useClaimForm<T>`, строгий TypeScript Discriminant Unions для различных бизнес-моделей (курсы vs подписки) и полностью изолированный от бизнес-логики класс RateLimiter.

---

## 🛡 Безопасность

Проект спроектирован с учетом высоких требований к безопасности и защите от злоупотреблений (Abuse Protection):
- **Serverless Rate Limiting** (на базе Redis) с автоматическим Fail-Closed для спасения API-бюджета.
- **Cloudflare Turnstile** — невидимая защита от ботов перед дорогостоящими AI-вызовами.
- **Input Sanitization & Runtime Type Guards (Zod)** — защита от промпт-инъекций и переполнения Payload.

---

## 🚀 Быстрый старт (Локально)

Хотите пощупать код и запустить локально? Это просто!

1. **Клонируйте репозиторий:**
   ```bash
   git clone https://github.com/tigralint/chestnayapodpiska.git
   cd chestnayapodpiska
   npm install
   ```

2. **Настройте `.env`:**
   Создайте файл `.env` в корне (за основу возьмите `.env.example`):
   ```env
   OPENROUTER_API_KEY=sk-or-...
   VITE_TURNSTILE_SITE_KEY=0x...
   TURNSTILE_SECRET_KEY=0x...
   UPSTASH_REDIS_REST_URL=https://...
   UPSTASH_REDIS_REST_TOKEN=...
   ```

3. **Запустите проект:**
   ```bash
   # Запуск фронтенда (localhost:3000)
   npm run dev        
   
   # Рекомендуется для тестирования фулстек-флоу:
   npx vercel dev
   ```

4. **Запуск тестов:**
   ```bash
   npm test
   ```

---

## 🤝 Участие в проекте (Contributing)

Мы всегда рады пулл-реквестам, баг-репортам и идеям!
Пожалуйста, ознакомьтесь с [CONTRIBUTING.md](./.github/CONTRIBUTING.md) перед созданием PR.  
*Обратите внимание, что отправляя код, вы соглашаетесь с условиями передачи прав в рамках модели двойного лицензирования.*

---

## ⚖️ Лицензия

Проект использует модель **Двойного лицензирования (Dual License)**:

1. **Некоммерческое использование (Non-Commercial Use)**
   Свободно для изучения, форков и переиспользования в личных и образовательных целях по лицензии [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/).
2. **Коммерческое использование (Commercial Use)**
   Использование кода или UI-компонентов в коммерческих, приносящих прибыль проектах (B2B, подписки, копирование сервиса и т.д.) **СТРОГО ЗАПРЕЩЕНО** без покупки коммерческой лицензии у автора.

Подробности и полный текст см. в файле [LICENSE](LICENSE).

---

## 📞 Контакты

Создано **Тиграном Мкртчяном**.

[![Telegram Badge](https://img.shields.io/badge/Telegram-@tigralint-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/tigralint)
[![VK Badge](https://img.shields.io/badge/ВКонтакте-vk.com%2Ffairsubs-0077FF?style=for-the-badge&logo=vk&logoColor=white)](https://vk.com/fairsubs)

---
<div align="center">
  <i>Спасибо, что делаете цифровой мир честнее.</i>
</div>
