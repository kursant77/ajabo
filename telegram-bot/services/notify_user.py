"""
Service for sending notifications to users.
"""
from aiogram import Bot
from aiogram.exceptions import TelegramBadRequest, TelegramForbiddenError
from utils.logger import logger


# Message templates in Uzbek
MESSAGE_TEMPLATES = {
    "confirmed": (
        "✅ <b>Buyurtmangiz qabul qilindi!</b>\n\n"
        "Buyurtma raqami: #{order_id}\n"
        "Tez orada buyurtmangizni tayyorlaymiz."
    ),
    "ready": (
        "🍳 <b>Buyurtmangiz tayyor bo'ldi!</b>\n\n"
        "Buyurtma raqami: #{order_id}\n"
        "Dastavkachi olib ketmoqda."
    ),
    "delivering": (
        "🚚 <b>Buyurtmangiz yetkazilmoqda!</b>\n\n"
        "Buyurtma raqami: #{order_id}\n"
        "Iltimos, kuting."
    ),
    "delivered": (
        "✅ <b>Buyurtmangiz yetkazib berildi!</b>\n\n"
        "Buyurtma raqami: #{order_id}\n"
        "Yoqimli ishtaha! 🍽️"
    )
}


async def notify_user_order_status(
    bot: Bot,
    telegram_user_id: int,
    order_id: str,
    status: str
) -> dict:
    """
    Send order status notification to the user.
    
    Args:
        bot: Bot instance
        telegram_user_id: User's Telegram ID
        order_id: Order ID
        status: Order status (confirmed, ready, delivering, delivered)
        
    Returns:
        dict with success status and message
    """
    if status not in MESSAGE_TEMPLATES:
        logger.error(f"Invalid status: {status}")
        return {
            "success": False,
            "message": f"Invalid status: {status}"
        }
    
    # Get message template
    message_text = MESSAGE_TEMPLATES[status].format(order_id=order_id)
    
    try:
        await bot.send_message(
            chat_id=telegram_user_id,
            text=message_text
        )
        
        logger.info(
            f"Notification sent to user {telegram_user_id} "
            f"for order {order_id} with status {status}"
        )
        
        return {
            "success": True,
            "message": "Notification sent successfully"
        }
        
    except TelegramForbiddenError:
        logger.warning(
            f"User {telegram_user_id} blocked the bot"
        )
        return {
            "success": False,
            "message": "User blocked the bot"
        }
        
    except TelegramBadRequest as e:
        logger.error(
            f"Bad request sending notification to {telegram_user_id}: {e}"
        )
        return {
            "success": False,
            "message": f"Bad request: {str(e)}"
        }
        
    except Exception as e:
        logger.error(
            f"Error sending notification to {telegram_user_id}: {e}"
        )
        return {
            "success": False,
            "message": f"Error: {str(e)}"
        }
