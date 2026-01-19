"""
Bot initialization and configuration.
"""
import os
from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from dotenv import load_dotenv
from utils.logger import logger

# Load environment variables
load_dotenv()

# Validate required environment variables
BOT_TOKEN = os.getenv("BOT_TOKEN")
if not BOT_TOKEN:
    logger.error("BOT_TOKEN not found in environment variables!")
    raise ValueError("BOT_TOKEN is required")

BACKEND_API_URL = os.getenv("BACKEND_API_URL", "http://localhost:3000")
API_SECRET_KEY = os.getenv("API_SECRET_KEY")
if not API_SECRET_KEY:
    logger.error("API_SECRET_KEY not found in environment variables!")
    raise ValueError("API_SECRET_KEY is required for webhook security")

WEBSITE_URL = os.getenv("WEBSITE_URL", "http://localhost:5173")
WEBHOOK_HOST = os.getenv("WEBHOOK_HOST", "0.0.0.0")
WEBHOOK_PORT = int(os.getenv("WEBHOOK_PORT", "8080"))


# Initialize bot with default properties
bot = Bot(
    token=BOT_TOKEN,
    default=DefaultBotProperties(parse_mode=ParseMode.HTML)
)

# Initialize dispatcher
dp = Dispatcher()

logger.info("Bot initialized successfully")
logger.info(f"Backend API URL: {BACKEND_API_URL}")
logger.info(f"Website URL: {WEBSITE_URL}")
logger.info(f"Webhook will run on {WEBHOOK_HOST}:{WEBHOOK_PORT}")
