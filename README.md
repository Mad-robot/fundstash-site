# Fundstash

> **Your funds, stashed locally.**  
> The 100% private, on-device personal finance & expense tracker for iOS and Android.

[![Website](https://img.shields.io/badge/Website-fundstash.app-4ECDC4?style=flat-square)](https://fundstash.app)
[![Platforms](https://img.shields.io/badge/Platforms-iOS%20%7C%20Android-1A1A2E?style=flat-square)](#platform-availability)
[![Privacy](https://img.shields.io/badge/Privacy-100%25%20On--Device%20%7C%20Zero%20Cloud-51CF66?style=flat-square)](#the-fundstash-philosophy)
[![Security](https://img.shields.io/badge/Storage-Local%20AES--256%20SQLite-45B7D1?style=flat-square)](#local-encrypted-storage)
[![License](https://img.shields.io/badge/License-PolyForm%20Strict%201.0.0-6C757D?style=flat-square)](LICENSE)

---

## Overview

**Fundstash** is an intelligent, offline-first personal finance application engineered from the ground up for privacy, speed, and automation. Unlike traditional budgeting applications that require linking your bank credentials through third-party aggregators, creating cloud accounts, or uploading your transaction history to remote servers, Fundstash runs **entirely on your smartphone**.

Fundstash pairs hardware-accelerated local machine learning and fast heuristic engines with intuitive budgeting, intelligent expense tracking, receipt OCR, and deep visual financial analytics.

---

## The Fundstash Philosophy

Modern financial tools demand too many privacy compromises: banking passwords, email scraping permissions, phone numbers, and cloud database storage. Your financial history reveals where you shop, where you travel, your medical appointments, and your personal relationships.

Fundstash takes the opposite approach:

* **0 Bytes to the Cloud**: Your financial data never leaves your device. No remote servers, no syncing to third-party clouds, no central database.
* **No Accounts or Sign-ups**: No email addresses, phone numbers, social logins, or passwords required. Open the app and begin tracking immediately.
* **100% Offline Capability**: Fundstash operates without an active internet connection. All calculations, categorizations, reports, and searches are performed on-device.
* **No Ads & No Tracking**: No advertising, analytics or tracking SDKs of our own. Google ML Kit (receipt text recognition, and Gemini Nano on Android) sends Google technical diagnostics; see the privacy policy.
* **Local Encrypted Storage**: All transactions, budgets, accounts, and categories are saved in an on-device SQLite database secured with AES-256 encryption.

---

## Core Features

### 1. Automated Bank & Card SMS Sync
* **Instant Background Parsing**: Automatically captures and logs debit, credit, UPI, ATM, and credit card transaction alerts as they arrive via SMS.
* **High-Precision Heuristics**: Custom regex and pattern-matching engines extract amounts, currencies, merchant/payee names, payment modes, account/card references, and dates in milliseconds.
* **Broad Financial Provider Support**: Supports national and international banks, card issuers, and payment networks (including Indian banking and UPI ecosystems such as HDFC, SBI, ICICI, Axis, Kotak, Chase, Barclays, and more).
* **Smooth Resource Throttling**: Background SMS messages are queued and processed cleanly without battery drain or interface lag.
* **Cross-Platform Parity**: Background SMS integration on Android and iOS automation via Shortcuts.
* **Silencing iOS Automation Banners**: To stop iOS from displaying a banner alert each time an automation runs: open **Settings → Screen Time → See All App & Website Activity → Notifications → Shortcuts** and turn off **Allow Notifications** (see our [support guide](https://fundstash.app/support/#hide-shortcuts-notifications) or the [wikiHow walkthrough](https://www.wikihow.com/Turn-Off-Shortcut-Notifications) for additional options).

### 2. On-Device AI & Decision Intelligence
* **Hardware-Accelerated Local Intelligence**:
  * **Android AICore / Gemini Nano**: Native system LLM integration on supported Android devices.
  * **Apple Intelligence**: Native on-device foundation models on supported iOS devices.
  * **Compact Open Model (Qwen 0.6B GGUF)**: High-efficiency local model running via embedded llama.cpp for devices without built-in system models. Stored persistently in app document storage so updates never require re-downloading.
* **Batched Background Review**: When AI review is enabled, historical or unreviewed transactions are evaluated in smooth batches of 5 with pacing delays, keeping device temperatures cool and memory usage low.
* **Smart Clean-Up & Categorization**: Resolves cryptic merchant billing descriptors (e.g., `POS 491290 XFR`) into clean, recognizable merchant names and accurately categorizes transactions.
* **Ask Fundstash**: A private conversational interface running 100% on-device to answer questions about your spending trends, category totals, and financial habits.
* **Fully Optional**: The app operates fully with heuristic engines even if on-device AI is disabled.

### 3. Instant Receipt & Invoice OCR
* **On-Device Vision Recognition**: Snap a photo or import a document from your photo library to extract text using Apple Vision (iOS) and Google MLKit (Android).
* **Automated Line-Item Detection**: Automatically isolates the merchant, invoice date, subtotal, taxes, and total amount.
* **Local Receipt Storage**: Store compressed receipt photos locally alongside transaction records for audits, expense claims, or tax tracking.

### 4. Natural Language & Quick Voice Logging
* **Conversational Syntax ("Chai 40")**: Quickly enter expenses like `coffee 4.50`, `uber 320 to airport`, or `groceries 85` without filling out multiple form fields manually.
* **Offline Voice Input**: Dictate transactions hands-free using system offline speech recognition.

### 5. Dynamic Budgets & Category Management
* **Flexible Periodic Cycles**: Create weekly, monthly, or yearly spending caps tailored to individual categories or overall spending.
* **Color-Coded Health Indicators**:
  * Safe Zone (`< 60%` spent): Green
  * Caution Zone (`60% – 80%` spent): Amber
  * Critical Zone (`> 80%` or over-budget): Red
* **Custom Categories**: Customize your categories with personalized names, emoji icons, and curated color palettes.
* **Universal Layout Engine**: Adaptive UI layouts designed to dynamically accommodate all phone screen sizes, aspect ratios, and virtual keyboard states across iOS and Android.
* **Velocity-Based Suggestions**: Calculates historical spending patterns to suggest realistic category limits.

### 6. Interactive Financial Analytics & Insights
* **Dynamic Donut Spending Breakdown**: Real-time spending distribution with responsive typographic scaling and centered metric hierarchy.
* **Safe-to-Spend Daily Allowance**: Dynamically calculates your remaining daily budget after factoring in recurring bills, current spending velocity, and remaining days in the cycle.
* **Cash Flow & Trend Tracking**: Weekly activity charts, monthly comparisons, and net cash flow visualizations.
* **Spending Velocity Forecasting**: Projects end-of-cycle totals based on current run rates to help prevent overspending before it happens.

### 7. Multi-Account & Multi-Currency System
* **Unified Account Management**: Track multiple accounts in one place—Checking accounts, Credit Cards, Cash Wallets, Digital Wallets, and Savings.
* **Inter-Account Transfers**: Move money between accounts without distorting monthly expense metrics.
* **100+ World Currencies**: Multi-currency support with offline exchange reference tables from the European Central Bank (ECB).

### 8. Debts, IOUs & Cryptographic Bill Splitting
* **Debt & Loan Tracking**: Track money owed to you or money you owe to others, complete with settlement histories.
* **Zero-Knowledge Bill Sharing (`fundstash.app/split/#d=...`)**:
  * Split restaurant bills, trip expenses, or shared household costs with friends via a shareable link.
  * The entire bill breakdown is serialized directly into the **URL fragment hash (`#d=...`)**.
  * The web viewer decodes the data **100% client-side in the recipient's browser**.
  * Because browsers never send URL hash fragments to web servers, your bill data remains completely private and never touches our servers.

### 9. System Integrations & Widgets
* **Home Screen & Lock Screen Widgets**: View your remaining monthly balance, recent transactions, and quick-add shortcuts at a glance.
* **Shortcuts & Quick Actions**: Quickly log transactions from system action sheets, control center tiles, or home screen quick actions.

### 10. Data Ownership, Backups & Portability
* **No Lock-In**: Export your complete transaction history and category ledger anytime in standard CSV or JSON formats.
* **Encrypted Full Backups**: Create encrypted snapshots of your entire SQLite database and save them to local storage, iCloud Drive, or Google Drive.
* **One-Tap Restore**: Restore backups smoothly when migrating to a new device.

---

## About This Repository

This repository (`fundstash-site`) hosts:
1. The official static marketing website and feature tour at [fundstash.app](https://fundstash.app).
2. The zero-knowledge client-side bill splitting decoder at `/split/`.
3. Support documentation, terms, and privacy policy pages.
4. Universal Link and Android App Link domain association files (`/.well-known/`).
5. **The public community issue tracker** for Fundstash.

---

## Community & Issue Reporting

We welcome community feedback, bug reports, and SMS pattern contributions! You can raise issues directly in our GitHub Issues tracker:

* [🐛 **Report a Bug**](https://github.com/Mad-robot/fundstash-site/issues/new?template=bug_report.yml): App crashes, layout issues, calculation anomalies, or unexpected behavior.
* [📨 **Request Bank SMS Pattern**](https://github.com/Mad-robot/fundstash-site/issues/new?template=bank_sms_pattern.yml): Submit an unrecognized bank, card, or UPI transaction SMS format for automated parsing.
* [💡 **Submit a Feature Request**](https://github.com/Mad-robot/fundstash-site/issues/new?template=feature_request.yml): Propose an enhancement or new feature adhering to our offline-first, privacy-respecting architecture.

> **Privacy Reminder**: When filing issues or requesting SMS patterns, **never** include real bank account numbers, debit/credit card numbers, PINs, OTPs, or personal identifiable information. Always redact sensitive numbers with placeholder values (`XXXX1234`, `XX,XXX.XX`).

---

## Legal & Privacy

* **Privacy Policy**: [fundstash.app/privacy](https://fundstash.app/privacy/)
* **Terms of Service**: [fundstash.app/terms](https://fundstash.app/terms/)
* **License**: [PolyForm Strict License 1.0.0](LICENSE)
