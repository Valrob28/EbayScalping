import re
from typing import Optional
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


class CardNormalizer:
    """
    Service pour normaliser les noms de cartes depuis les titres eBay.
    Gère les variations dans les titres (PSA, grading, set names, etc.)
    """
    
    def __init__(self):
        self.use_openai = bool(settings.openai_api_key)
        if self.use_openai:
            try:
                import openai
                self.openai_client = openai.OpenAI(api_key=settings.openai_api_key)
            except ImportError:
                logger.warning("OpenAI non disponible, utilisation de la normalisation basique")
                self.use_openai = False
    
    def normalize_card_name(self, title: str, use_ai: bool = False) -> str:
        """
        Normalise le nom d'une carte depuis un titre eBay.
        
        Args:
            title: Titre du listing eBay
            use_ai: Utiliser OpenAI pour la normalisation (si disponible)
        
        Returns:
            Nom normalisé de la carte
        """
        if use_ai and self.use_openai:
            return self._normalize_with_ai(title)
        else:
            return self._normalize_basic(title)
    
    def _normalize_basic(self, title: str) -> str:
        """
        Normalisation basique avec regex et règles heuristiques.
        """
        # Convertir en minuscules pour traitement
        normalized = title.lower()
        
        # Supprimer les mentions PSA et grades
        normalized = re.sub(r'\bpsa\s*\d+\b', '', normalized, flags=re.IGNORECASE)
        normalized = re.sub(r'\bgrade\s*\d+\b', '', normalized, flags=re.IGNORECASE)
        
        # Supprimer les mots communs eBay
        ebay_keywords = [
            'pokemon', 'pokémon', 'card', 'trading card', 'tcg',
            'authentic', 'original', 'mint', 'near mint', 'nm',
            'psa', 'cgc', 'bgs', 'graded', 'slab',
            'shipping', 'free shipping', 'fast shipping',
            'rare', 'ultra rare', 'secret rare',
            'first edition', '1st edition', '1st ed',
            'shadowless', 'unlimited',
            'japanese', 'jpn', 'jp', 'english', 'en',
            'holo', 'holofoil', 'reverse holo',
            'ebay', 'seller', 'auction', 'buy it now',
        ]
        
        for keyword in ebay_keywords:
            normalized = re.sub(rf'\b{re.escape(keyword)}\b', '', normalized, flags=re.IGNORECASE)
        
        # Nettoyer les espaces multiples
        normalized = re.sub(r'\s+', ' ', normalized)
        normalized = normalized.strip()
        
        # Extraire le nom principal (généralement au début)
        # Ex: "Charizard Base Set PSA 10" -> "Charizard Base Set"
        parts = normalized.split()
        if len(parts) > 1:
            # Prendre les 2-3 premiers mots comme nom principal
            normalized = ' '.join(parts[:3])
        
        # Capitaliser la première lettre de chaque mot
        normalized = normalized.title()
        
        return normalized
    
    def _normalize_with_ai(self, title: str) -> str:
        """
        Normalisation avancée avec OpenAI GPT.
        """
        try:
            prompt = f"""Extrait et normalise le nom de la carte Pokémon depuis ce titre eBay.
Retourne uniquement le nom normalisé de la carte (ex: "Charizard Base Set", "Pikachu Jungle").
Ignore les mentions de grading (PSA, CGC), condition, shipping, etc.

Titre: {title}
Nom normalisé:"""
            
            response = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "Tu es un expert en cartes Pokémon. Extrait uniquement le nom normalisé de la carte."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=50,
                temperature=0.3
            )
            
            normalized = response.choices[0].message.content.strip()
            return normalized
            
        except Exception as e:
            logger.warning(f"Erreur lors de la normalisation AI, fallback sur méthode basique: {e}")
            return self._normalize_basic(title)
    
    def extract_card_set(self, title: str) -> Optional[str]:
        """
        Extrait le nom du set depuis le titre.
        """
        sets = [
            "Base Set", "Jungle", "Fossil", "Team Rocket", "Gym Heroes",
            "Gym Challenge", "Neo Genesis", "Neo Discovery", "Neo Revelation",
            "Neo Destiny", "Expedition", "Aquapolis", "Skyridge",
            "Ruby & Sapphire", "Sandstorm", "Dragon", "Team Magma vs Team Aqua",
            "Hidden Legends", "FireRed & LeafGreen", "Team Rocket Returns",
            "Deoxys", "Emerald", "Unseen Forces", "Delta Species",
            "Legend Maker", "Holon Phantoms", "Crystal Guardians",
            "Dragon Frontiers", "Power Keepers", "Diamond & Pearl",
            "Mysterious Treasures", "Secret Wonders", "Great Encounters",
            "Majestic Dawn", "Legends Awakened", "Stormfront",
            "Platinum", "Rising Rivals", "Supreme Victors", "Arceus",
            "HeartGold & SoulSilver", "Unleashed", "Undaunted", "Triumphant",
            "Call of Legends", "Black & White", "Emerging Powers",
            "Noble Victories", "Next Destinies", "Dark Explorers",
            "Dragons Exalted", "Boundaries Crossed", "Plasma Storm",
            "Plasma Freeze", "Plasma Blast", "XY", "Flashfire",
            "Furious Fists", "Phantom Forces", "Primal Clash",
            "Roaring Skies", "Ancient Origins", "BREAKthrough",
            "BREAKpoint", "Fates Collide", "Steam Siege", "Evolutions",
            "Sun & Moon", "Guardians Rising", "Burning Shadows",
            "Crimson Invasion", "Ultra Prism", "Forbidden Light",
            "Celestial Storm", "Lost Thunder", "Team Up",
            "Detective Pikachu", "Unbroken Bonds", "Unified Minds",
            "Hidden Fates", "Cosmic Eclipse", "Sword & Shield",
            "Rebel Clash", "Darkness Ablaze", "Champion's Path",
            "Vivid Voltage", "Shining Fates", "Battle Styles",
            "Chilling Reign", "Evolving Skies", "Celebrations",
            "Fusion Strike", "Brilliant Stars", "Astral Radiance",
            "Lost Origin", "Silver Tempest", "Scarlet & Violet",
            "Paldea Evolved", "Obsidian Flames", "151",
        ]
        
        title_lower = title.lower()
        for card_set in sets:
            if card_set.lower() in title_lower:
                return card_set
        
        return None
    
    def extract_card_number(self, title: str) -> Optional[str]:
        """
        Extrait le numéro de la carte dans le set.
        """
        # Chercher des patterns comme "1/102", "#1", "No. 1"
        patterns = [
            r'(\d+)\s*/\s*\d+',  # "1/102"
            r'#\s*(\d+)',  # "#1"
            r'no\.?\s*(\d+)',  # "No. 1" ou "No 1"
            r'number\s*(\d+)',  # "Number 1"
        ]
        
        for pattern in patterns:
            match = re.search(pattern, title, re.IGNORECASE)
            if match:
                return match.group(1)
        
        return None

