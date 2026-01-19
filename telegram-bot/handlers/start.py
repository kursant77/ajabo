"""
Handler for /start command.
"""
from aiogram import Router
from aiogram.filters import CommandStart
from aiogram.types import Message
from keyboards.reply import get_main_menu_keyboard
from utils.logger import logger

router = Router()


@router.message(CommandStart())
async def cmd_start(message: Message):
    """
    Handle /start command.
    
    Args:
        message: Incoming message
    """
    user = message.from_user
    telegram_user_id = user.id
    username = user.username or "Foydalanuvchi"
    
    logger.info(f"User {telegram_user_id} ({username}) started the bot")
    
    welcome_text = (
        f"👋 <b>Assalomu alaykum, {user.first_name}!</b>\n\n"
        "Bizning yetkazib berish botimizga xush kelibsiz! 🍔\n\n"
        "Buyurtma berish uchun quyidagi tugmani bosing:"
    )
    
    await message.answer(
        welcome_text,
        reply_markup=get_main_menu_keyboard()
    )
