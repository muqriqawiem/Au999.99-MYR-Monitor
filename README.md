# Au 999.9 Monitor

A lightweight browser-based dashboard for monitoring **Au 999.9 (24K Gold)** prices in **Malaysian Ringgit (MYR) per gram**.

The application retrieves live gold spot prices, converts them into MYR/gram using current USD/MYR exchange rates, displays intraday market statistics, and allows users to configure browser-based price alerts.

---

## Features

### Live Gold Pricing

- Real-time XAU/USD spot price retrieval
- Automatic USD/MYR exchange rate conversion
- Au 999.9 price displayed in MYR per gram
- Daily price movement tracking

### Market Statistics

Displays:

- Current gold price (MYR/g)
- Open price
- Daily high
- Daily low
- Daily change
- Daily percentage change

### Price Alerts

Create custom alerts when gold:

- Rises above a specified price
- Falls below a specified price

Supports browser notifications when enabled.

### Educational Guide

Built-in explanations covering:

- What XAU/USD means
- How gold prices are calculated
- Why exchange rates matter
- Understanding daily market movements

### API Key Management

- Local API key storage
- Automatic key validation
- Re-prompt on authentication failure

---

## How Pricing Is Calculated

International gold prices are quoted in:

> USD per Troy Ounce (XAU/USD)

The application converts this into:

> MYR per Gram

Formula:

```text
MYR per gram = (XAU/USD × USD/MYR) ÷ 31.1034768
```

Where:

```text
1 Troy Ounce = 31.1034768 grams
```

### Example

```text
XAU/USD = 3,400.00
USD/MYR = 4.2500

MYR/g = (3400 × 4.25) ÷ 31.1034768
      ≈ RM 464.57
```

---

## Data Sources

### Gold Spot Price

Used to retrieve the current XAU/USD price.

```text
https://api.gold-api.com/price/XAU
```

### Exchange Rate Data

Used to retrieve the current USD/MYR exchange rate.

```text
https://open.er-api.com/v6/latest/USD
```

### OHLC Market Data

Used to retrieve:

- Open
- High
- Low

```text
https://api.gold-api.com/ohlc/XAU
```

Authentication is required for OHLC requests.

---

## Technical Overview

### Stack

- HTML5
- CSS3
- Vanilla JavaScript

### Architecture

```text
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ├── Gold API (XAU/USD)
       │
       ├── Exchange Rate API (USD/MYR)
       │
       └── Local Storage
              ├── API Key
              └── Alert Settings
```

No backend server is required.

---

## Browser Storage

The application uses `localStorage` to persist:

- API key
- User preferences
- Alert configurations

All data remains on the user's device.

---

## Running Locally

Clone the repository:

```bash
git clone https://github.com/<your-username>/au999-monitor.git
```

Open:

```text
index.html
```

directly in a modern browser.

Alternatively, run a local web server:

```bash
python -m http.server 8000
```

Then visit:

```text
http://localhost:8000
```

---

## API Key Setup

To enable OHLC market data:

1. Obtain an API key from Gold API.
2. Open the application.
3. Enter the API key when prompted.
4. Save and refresh market data.

If the key is rejected:

- The stored key is cleared automatically.
- The application prompts for a new key.

---

## Disclaimer

This project is provided for informational and educational purposes only.

Gold prices displayed by this application should not be considered financial advice. Always verify prices with official market sources before making investment or trading decisions.
