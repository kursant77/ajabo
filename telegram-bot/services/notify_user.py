
"""
Service for sending notifications to users.
"""
from aiogram import Bot
from aiogram.exceptions import TelegramBadRequest, TelegramForbiddenError
from utils.logger import logger
from utils.id_formatter import format_order_id


# Message templates in Uzbek with rich formatting
MESSAGE_TEMPLATES = {
    "confirmed": (
        "✨ <b>Yangi buyurtma qabul qilindi!</b>\n\n"
        "🆔 <b>Buyurtma:</b> <code>{order_id}</code>\n"
        "🍔 <b>Mahsulot:</b> {product_name}\n"
        "⏳ <b>Holat:</b> Tasdiqlandi\n\n"
        "<i>Tez orada taomingizni tayyorlashni boshlaymiz!</i>"
    ),
    "ready": {
        "delivery": (
            "🍳 <b>Buyurtmangiz tayyor bo'ldi!</b>\n\n"
            "🆔 <b>Buyurtma:</b> <code>{order_id}</code>\n"
            "🍔 <b>Mahsulot:</b> {product_name}\n"
            "🏃‍♂️ <b>Holat:</b> Dastavkaga berildi\n\n"
            "<i>Dastavkachi hozir yo'lga chiqadi.</i>"
        ),
        "takeaway": (
            "🍳 <b>Buyurtmangiz tayyor bo'ldi!</b>\n\n"
            "🆔 <b>Buyurtma:</b> <code>{order_id}</code>\n"
            "🍔 <b>Mahsulot:</b> {product_name}\n"
            "🛍️ <b>Holat:</b> Tayyor\n\n"
            "<i>Kelib olib ketishingiz mumkin!</i>"
        ),
        "preorder": (
            "🍳 <b>Broningiz tayyor!</b>\n\n"
            "🆔 <b>ID:</b> <code>{order_id}</code>\n"
            "🍔 <b>Mahsulot:</b> {product_name}\n"
            "📅 <b>Holat:</b> Stolingiz tayyor\n\n"
            "<i>Sizni kutmoqdamiz!</i>"
        )
    },
    "delivering": (
        "🚚 <b>Buyurtmangiz yo'lda!</b>\n\n"
        "🆔 <b>Buyurtma:</b> <code>{order_id}</code>\n"
        "🍔 <b>Mahsulot:</b> {product_name}\n"
        "📍 <b>Holat:</b> Yetkazilmoqda\n\n"
        "<i>Iltimos, kuting, dastavkachi yaqin orada yetib boradi.</i>"
    ),
    "delivered": {
        "delivery": (
            "✅ <b>Tabriklaymiz! Buyurtma yetkazildi!</b>\n\n"
            "🆔 <b>Buyurtma:</b> <code>{order_id}</code>\n"
            "🍔 <b>Mahsulot:</b> {product_name}\n"
            "🏁 <b>Holat:</b> Yakunlandi\n\n"
            "<b>Yoqimli ishtaha! 🍽️</b>\n"
            "<i>Bizni tanlaganingiz uchun rahmat!</i>"
        ),
        "takeaway": (
            "✅ <b>Tabriklaymiz! Buyurtma olib ketildi!</b>\n\n"
            "🆔 <b>Buyurtma:</b> <code>{order_id}</code>\n"
            "🍔 <b>Mahsulot:</b> {product_name}\n"
            "🏁 <b>Holat:</b> Yakunlandi\n\n"
            "<b>Yoqimli ishtaha! 🍽️</b>\n"
            "<i>Bizni tanlaganingiz uchun rahmat!</i>"
        ),
        "preorder": (
            "✅ <b>Tabriklaymiz! Tashrifingiz yakunlandi!</b>\n\n"
            "🆔 <b>ID:</b> <code>{order_id}</code>\n"
            "🏁 <b>Holat:</b> Yakunlandi\n\n"
            "<i>Tashrifingiz uchun rahmat! Yana kutib qolamiz! 🍽️</i>"
        )
    }
}


async def notify_user_order_status(
    bot: Bot,
    telegram_user_id: int,
    order_id: str,
    status: str,
    product_name: str = "Savatcha",
    order_type: str = "delivery"
) -> dict:
    """
    Send order status notification to the user.
    """
    if status not in MESSAGE_TEMPLATES:
        logger.error(f"Invalid status: {status}")
        return {
            "success": False,
            "message": f"Invalid status: {status}"
        }
    
    # Format order ID for display
    display_id = format_order_id(order_id)
    
    # Get message template base
    template = MESSAGE_TEMPLATES[status]
    
    # If template is a dictionary, pick based on order_type
    if isinstance(template, dict):
        # Default to 'delivery' if order_type is unknown, None or empty
        current_type = order_type if order_type and order_type in template else "delivery"
        text_template = template.get(current_type, template.get("delivery"))
    else:
        text_template = template
        
    # Get message template
    message_text = text_template.format(
        order_id=display_id,
        product_name=product_name or "Taomlar"
    )
    
    try:
        await bot.send_message(
            chat_id=telegram_user_id,
            text=message_text,
            parse_mode="HTML"
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
