"""
Inline keyboard layouts.
"""
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
from bot import WEBSITE_URL


def get_webapp_keyboard(telegram_user_id: int) -> InlineKeyboardMarkup:
    """
    Create an inline keyboard with Web App button.
    
    Args:
        telegram_user_id: User's Telegram ID to pass to the website
        
    Returns:
        InlineKeyboardMarkup with Web App button
    """
    # Add telegram_user_id as URL parameter for the Web App
    webapp_url = f"{WEBSITE_URL}?telegram_user_id={telegram_user_id}"
    
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="🍔 Buyurtma berish",
                    web_app=WebAppInfo(url=webapp_url)
                )
            ]
        ]
    )
    
    return keyboard
