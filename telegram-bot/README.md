# 📦 Telegram Bot for Food Delivery System

Professional, production-ready Telegram Bot built with `aiogram 3.x` and `FastAPI`. This bot handles user interactions via Telegram Web App and receives real-time order status updates from your backend.

## 🚀 Quick Start

### 1. Installation
Ensure you have Python 3.8+ installed.

```bash
cd telegram-bot
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configuration
Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `BOT_TOKEN` | Your bot token from [@BotFather](https://t.me/botfather) |
| `BACKEND_API_URL` | Your website's backend URL |
| `API_SECRET_KEY` | Random secret key to secure webhook calls |
| `WEBSITE_URL` | Your frontend URL for the Web App |
| `WEBHOOK_PORT` | Port for the bot to listen for order updates (default: 8080) |

### 3. Run the Bot
```bash
python main.py
```

---

## 🔗 Backend Integration

The bot exposes a secure API endpoint that your backend must call to notify users about order status changes.

### Endpoint: `POST /api/order-update`

**Headers:**
- `Content-Type: application/json`
- `X-API-Key: <YOUR_API_SECRET_KEY>`

**Payload:**
```json
{
  "order_id": "ORD-12345",
  "telegram_user_id": 12345678,
  "status": "confirmed"
}
```

### Available Statuses:
- `confirmed`: ✅ Buyurtmangiz qabul qilindi.
- `ready`: 🍳 Buyurtmangiz tayyor bo‘ldi.
- `delivering`: 🚚 Buyurtmangiz yetkazilmoqda.
- `delivered`: ✅ Buyurtmangiz yetkazib berildi.

---

## 🛠 Project Structure

```text
telegram-bot/
├── bot.py             # Bot initialization
├── main.py            # Entry point (Runs Bot + Webhook)
├── handlers/          # Telegram message handlers
│   ├── start.py       # /start command
│   └── webapp.py      # Buyurtma button & Web App logic
├── keyboards/         # Keyboard layouts
│   ├── reply.py       # Main menu buttons
│   └── inline.py      # Web App inline buttons
├── api/               # External API interface
│   └── order_listener.py # FastAPI Webhook server
├── services/          # Business logic
│   └── notify_user.py # Notification templates
├── utils/             # Utilities
│   └── logger.py      # Structured logging
├── .env               # Configuration
└── requirements.txt   # Dependencies
```

## 🔒 Security
- **API Key Validation**: Only your backend can trigger notifications using the `X-API-Key`.
- **Async/Await**: High performance handling of multiple concurrent users.
- **Production Ready**: Uses `FastAPI` and `uvicorn` for robust webhook processing.

---

## 🇺🇿 Uzbek Language Default
The bot identifies users by their `telegram_user_id` and provides all status updates in Uzbek.
