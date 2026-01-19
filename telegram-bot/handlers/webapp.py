"""
Handler for Web App button and interactions.
"""
from aiogram import Router, F
from aiogram.types import Message
from keyboards.inline import get_webapp_keyboard
from utils.logger import logger

router = Router()


@router.message(F.text == "🍔 Buyurtma berish")
async def handle_order_button(message: Message):
    """
    Handle the 'Buyurtma berish' button click.
    Opens the website as a Telegram Web App.
    
    Args:
        message: Incoming message
    """
    user = message.from_user
    telegram_user_id = user.id
    
    logger.info(f"User {telegram_user_id} clicked order button")
    
    text = (
        "🍔 <b>Buyurtma berish</b>\n\n"
        "Pastdagi tugmani bosing va taomlarimizni ko'ring!"
    )
    
    await message.answer(
        text,
        reply_markup=get_webapp_keyboard(telegram_user_id)
    )
