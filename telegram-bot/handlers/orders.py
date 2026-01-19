"""
Handler for order history and admin contact.
"""
from aiogram import Router, F
from aiogram.types import Message
from bot import supabase, logger

router = Router()

@router.message(F.text == "📝 Mening buyurtmalarim")
async def handle_my_orders(message: Message):
    """Fetch and show user's order history from Supabase."""
    telegram_id = message.from_user.id
    logger.info(f"User {telegram_id} requested order history")
    
    try:
        # Fetch last 5 orders for this user
        response = await supabase.table("orders").select("*").eq("telegram_user_id", telegram_id).order("created_at", desc=True).limit(5).execute()
        
        if not response.data:
            await message.answer("Sizda hali buyurtmalar yo'q. 🍔\nBuyurtma berish uchun 'Buyurtma berish' tugmasini bosing.")
            return

        text = "📝 <b>Oxirgi buyurtmalaringiz:</b>\n\n"
        
        status_map = {
            "pending_payment": "💳 To'lov kutilmoqda",
            "pending": "⏳ Qabul qilindi",
            "confirmed": "🍳 Tayyorlanmoqda",
            "ready": "🥡 Tayyor",
            "delivering": "🚚 Yo'lda",
            "on_way": "🚚 Yo'lda",
            "delivered": "✅ Yetkazildi",
            "cancelled": "❌ Bekor qilindi"
        }

        for order in response.data:
            status = status_map.get(order.get("status"), order.get("status"))
            price = f"{order.get('total_price'):,}".replace(",", " ") if order.get("total_price") else "0"
            
            text += (
                f"🆔 <b>Buyurtma #{order.get('id')[:6]}</b>\n"
                f"🍟 Mahsulot: {order.get('product_name')} (x{order.get('quantity')})\n"
                f"💰 Narxi: {price} so'm\n"
                f"📊 Holati: {status}\n"
                f"📅 Sana: {order.get('created_at')[:16].replace('T', ' ')}\n"
                f"------------------\n\n"
            )
        
        await message.answer(text)
        
    except Exception as e:
        logger.error(f"Error fetching orders: {e}")
        await message.answer("Xatolik yuz berdi. Iltimos keyinroq qayta urinib ko'ring.")

@router.message(F.text == "📞 Adminga bog'lanish")
async def handle_contact_admin(message: Message):
    """Show admin contact details."""
    text = (
        "📞 <b>Adminga bog'lanish</b>\n\n"
        "Savollaringiz yoki takliflaringiz bo'lsa, quyidagi raqamga qo'ng'iroq qiling yoki yozing:\n\n"
        "☎️ Telefon: +998 90 123 45 67\n"
        "💬 Telegram: @ajabo_admin\n\n"
        "Ish vaqti: 09:00 - 23:00"
    )
    await message.answer(text)
