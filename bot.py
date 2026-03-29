import httpx
from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes

import os
TELEGRAM_TOKEN = os.environ.get("BOT_TOKEN", "8341178430:AAFNGin4XurtZWXhtFMVMrpSFC6Jm1fM-tg")
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://aqetmalvgaqhhzkduqok.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxZXRtYWx2Z2FxaGh6a2R1cW9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NDc5MzcsImV4cCI6MjA5MDEyMzkzN30.jLpl85pNXgMK_4rdWgje3DW4gWLdfwJBo77RTkv9mQ0")

def query_supabase(table, filters={}):
    url = SUPABASE_URL + "/rest/v1/" + table
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": "Bearer " + SUPABASE_KEY
    }
    params = {"select": "*", "limit": "5"}
    params.update(filters)
    r = httpx.get(url, headers=headers, params=params)
    return r.json()

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "Welcome to ExamGoBot!\n\n"
        "Commands:\n"
        "/deals [city] - Top deals in your city\n"
        "/register - Register on ExamGo\n"
        "/status [phone] - Check verification status\n"
        "/scholar [phone] - Check scholar tier"
    )

async def deals(update: Update, context: ContextTypes.DEFAULT_TYPE):
    city = ' '.join(context.args) if context.args else None
    if not city:
        await update.message.reply_text("Usage: /deals Hyderabad")
        return
    data = query_supabase("deals", {"active": "eq.true", "city": "ilike.*" + city + "*"})
    if not data:
        await update.message.reply_text("No deals found in " + city)
        return
    msg = "Top deals in " + city + ":\n\n"
    for deal in data:
        msg += deal['title'] + " - " + str(deal['discount_percent']) + "% off\n"
        msg += deal['description'] + "\n\n"
    await update.message.reply_text(msg)

async def register(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("Register here: https://examgo.vercel.app/register")

async def status(update: Update, context: ContextTypes.DEFAULT_TYPE):
    phone = context.args[0] if context.args else None
    if not phone:
        await update.message.reply_text("Usage: /status 9999999999")
        return
    data = query_supabase("students", {"phone": "eq." + phone})
    if not data:
        await update.message.reply_text("Phone not found. Register at examgo.vercel.app/register")
        return
    s = data[0]
    msg = "Student: " + str(s.get('name', '')) + "\n"
    msg += "Verified: " + ("Yes" if s.get('is_verified') else "Pending") + "\n"
    msg += "Exam: " + str(s.get('exam_name', '')) + "\n"
    msg += "City: " + str(s.get('city', ''))
    await update.message.reply_text(msg)

async def scholar(update: Update, context: ContextTypes.DEFAULT_TYPE):
    phone = context.args[0] if context.args else None
    if not phone:
        await update.message.reply_text("Usage: /scholar 9999999999")
        return
    data = query_supabase("students", {"phone": "eq." + phone})
    if not data:
        await update.message.reply_text("Phone not found.")
        return
    s = data[0]
    if not s.get('scholar_tier'):
        await update.message.reply_text("No scholar tier yet. Upload result at examgo.vercel.app/scholar")
        return
    await update.message.reply_text("Scholar Tier: " + s['scholar_tier'] + "\nVisit examgo.vercel.app/scholar for offers!")

app = Application.builder().token(TELEGRAM_TOKEN).build()
app.add_handler(CommandHandler("start", start))
app.add_handler(CommandHandler("deals", deals))
app.add_handler(CommandHandler("register", register))
app.add_handler(CommandHandler("status", status))
app.add_handler(CommandHandler("scholar", scholar))

print("Bot is running...")
app.run_polling()