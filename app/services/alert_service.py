from typing import List
from app.models import Opportunity
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


class AlertService:
    """
    Service pour envoyer des alertes sur les opportunités détectées.
    Supporte console (toujours) et Telegram (optionnel).
    """
    
    def __init__(self):
        self.telegram_enabled = bool(settings.telegram_bot_token and settings.telegram_chat_id)
        if self.telegram_enabled:
            try:
                from telegram import Bot
                self.telegram_bot = Bot(token=settings.telegram_bot_token)
                self.telegram_chat_id = settings.telegram_chat_id
            except ImportError:
                logger.warning("python-telegram-bot non disponible")
                self.telegram_enabled = False
    
    async def send_opportunity_alert(self, opportunity: Opportunity) -> None:
        """
        Envoie une alerte pour une opportunité d'arbitrage.
        """
        message = self._format_opportunity_message(opportunity)
        
        # Toujours afficher dans la console
        logger.info(f"🚨 OPPORTUNITÉ DÉTECTÉE:\n{message}")
        print(f"\n{'='*60}")
        print(f"🚨 OPPORTUNITÉ D'ARBITRAGE DÉTECTÉE")
        print(f"{'='*60}")
        print(message)
        print(f"{'='*60}\n")
        
        # Envoyer sur Telegram si configuré
        if self.telegram_enabled:
            await self._send_telegram_message(message)
    
    async def send_batch_alerts(self, opportunities: List[Opportunity]) -> None:
        """
        Envoie des alertes pour plusieurs opportunités.
        """
        for opp in opportunities:
            await self.send_opportunity_alert(opp)
    
    def _format_opportunity_message(self, opportunity: Opportunity) -> str:
        """
        Formate le message d'alerte pour une opportunité.
        """
        card = opportunity.card
        listing = opportunity.listing
        
        message = f"""
📦 Carte: {card.normalized_name}
   Set: {card.card_set or 'N/A'}
   Grade: {listing.psa_grade or 'N/A'}
   Langue: {card.language}

💰 Prix Listing: ${opportunity.listing_price:.2f}
📊 Prix Plancher: ${opportunity.floor_price:.2f}
💸 Réduction: {opportunity.discount_percentage:.1f}%

💵 Profit Brut Estimé: ${opportunity.estimated_gross_profit:.2f}
💵 Profit Net Estimé: ${opportunity.estimated_net_profit:.2f}
📈 Marge: {opportunity.profit_margin:.1f}%

🔗 Listing: {listing.listing_url or f"eBay Item ID: {listing.ebay_item_id}"}
"""
        return message.strip()
    
    async def _send_telegram_message(self, message: str) -> None:
        """
        Envoie un message sur Telegram.
        """
        try:
            await self.telegram_bot.send_message(
                chat_id=self.telegram_chat_id,
                text=f"🚨 *Opportunité d'Arbitrage*\n\n{message}",
                parse_mode="Markdown"
            )
            logger.info("Message Telegram envoyé")
        except Exception as e:
            logger.error(f"Erreur lors de l'envoi Telegram: {e}")

