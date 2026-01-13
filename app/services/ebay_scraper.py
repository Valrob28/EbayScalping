"""
Service de scraping eBay (à utiliser avec précaution).

⚠️ AVERTISSEMENT IMPORTANT :
- Le scraping peut violer les Conditions d'Utilisation d'eBay
- eBay a des protections anti-scraping (rate limiting, CAPTCHA, IP blocking)
- Utilisez les APIs officielles eBay en priorité
- Ce service est fourni à des fins éducatives uniquement
- Respectez les robots.txt et les limites de taux
- Considérez utiliser des proxies et des délais entre requêtes
"""

import httpx
from typing import List, Dict, Optional
from datetime import datetime
from bs4 import BeautifulSoup
import re
import time
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)


class eBayScraper:
    """
    Scraper eBay pour récupérer des données non disponibles via l'API.
    
    ⚠️ Utilisez avec précaution et respectez les ToS d'eBay.
    """
    
    def __init__(self):
        self.base_url = "https://www.ebay.com"
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Accept-Encoding": "gzip, deflate",
            "Connection": "keep-alive",
        }
        self.delay_between_requests = 2.0  # Secondes entre chaque requête
        self.last_request_time = 0
    
    def _rate_limit(self):
        """Respecter un délai entre les requêtes pour éviter le rate limiting"""
        current_time = time.time()
        time_since_last = current_time - self.last_request_time
        if time_since_last < self.delay_between_requests:
            time.sleep(self.delay_between_requests - time_since_last)
        self.last_request_time = time.time()
    
    async def scrape_completed_listings(
        self,
        search_query: str,
        max_results: int = 50,
        days_back: int = 30,
        psa_grade: Optional[str] = None
    ) -> List[Dict]:
        """
        Scrape les ventes complétées depuis la page de recherche eBay.
        
        ⚠️ Cette méthode peut être bloquée par eBay. Utilisez l'API Finding en priorité.
        """
        try:
            self._rate_limit()
            
            # Construire l'URL de recherche pour les ventes complétées
            # eBay utilise des paramètres spécifiques pour les ventes complétées
            query_with_grade = f"{search_query} {psa_grade}" if psa_grade else search_query
            
            params = {
                "_nkw": query_with_grade,
                "_sop": "13",  # Trier par prix décroissant
                "LH_Complete": "1",  # Ventes complétées uniquement
                "LH_Sold": "1",  # Ventes vendues
                "rt": "nc",  # Recherche dans les titres et descriptions
                "_ipg": "200",  # Items par page (max 200)
            }
            
            # Filtrer par date si nécessaire
            if days_back:
                from datetime import datetime, timedelta
                end_date = datetime.now()
                start_date = end_date - timedelta(days=days_back)
                # eBay accepte les dates au format YYYYMMDDHHMM
                params["_udlo"] = start_date.strftime("%Y%m%d")
                params["_udhi"] = end_date.strftime("%Y%m%d")
            
            async with httpx.AsyncClient(
                headers=self.headers,
                timeout=30.0,
                follow_redirects=True
            ) as client:
                response = await client.get(
                    f"{self.base_url}/sch/i.html",
                    params=params
                )
                response.raise_for_status()
                
                # Parser le HTML
                soup = BeautifulSoup(response.text, "html.parser")
                
                # Extraire les listings
                listings = []
                # eBay utilise plusieurs classes possibles pour les items
                items = soup.find_all("li", class_=re.compile(r"s-item"))
                
                # Si pas d'items trouvés, essayer d'autres sélecteurs
                if not items:
                    items = soup.find_all("div", class_=re.compile(r"s-item"))
                
                logger.info(f"Trouvé {len(items)} items dans la page")
                
                for item in items[:max_results]:
                    try:
                        listing_data = self._parse_listing_item(item)
                        if listing_data:
                            # Filtrer par date si nécessaire
                            if days_back:
                                sold_date = listing_data.get("sold_date")
                                if sold_date:
                                    days_ago = (datetime.now() - sold_date).days
                                    if days_ago > days_back:
                                        continue
                            
                            listings.append(listing_data)
                    except Exception as e:
                        logger.warning(f"Erreur lors du parsing d'un item: {e}")
                        continue
                
                logger.info(f"Scrapé {len(listings)} ventes complétées pour '{search_query}'")
                return listings
                
        except Exception as e:
            logger.error(f"Erreur lors du scraping eBay: {e}")
            return []
    
    def _parse_listing_item(self, item) -> Optional[Dict]:
        """Parse un élément de listing depuis le HTML"""
        try:
            # Titre
            title_elem = item.find("h3", class_="s-item__title")
            title = title_elem.get_text(strip=True) if title_elem else ""
            
            # URL
            link_elem = item.find("a", class_="s-item__link")
            url = link_elem.get("href", "") if link_elem else ""
            
            # Prix
            price_elem = item.find("span", class_="s-item__price")
            price_text = price_elem.get_text(strip=True) if price_elem else ""
            price = self._extract_price(price_text)
            
            # Date de vente
            sold_elem = item.find("span", class_="s-item__ended-date")
            sold_date = None
            if sold_elem:
                sold_text = sold_elem.get_text(strip=True)
                sold_date = self._parse_sold_date(sold_text)
            
            # Image
            img_elem = item.find("img", class_="s-item__image-img")
            image_url = img_elem.get("src", "") if img_elem else ""
            
            # Item ID depuis l'URL
            item_id = self._extract_item_id(url)
            
            # Condition
            condition_elem = item.find("span", class_="SECONDARY_INFO")
            condition = condition_elem.get_text(strip=True) if condition_elem else None
            
            if not title or not price:
                return None
            
            return {
                "ebay_item_id": item_id,
                "title": title,
                "price": price,
                "sold_date": sold_date or datetime.now(),
                "url": url,
                "image_url": image_url,
                "condition": condition,
                "shipping_cost": 0.0,  # Difficile à extraire depuis la liste
            }
            
        except Exception as e:
            logger.warning(f"Erreur lors du parsing: {e}")
            return None
    
    def _extract_price(self, price_text: str) -> float:
        """Extrait le prix depuis le texte"""
        # Format: "$450.00" ou "$450.00 to $500.00"
        price_match = re.search(r'\$?([\d,]+\.?\d*)', price_text.replace(",", ""))
        if price_match:
            return float(price_match.group(1))
        return 0.0
    
    def _extract_item_id(self, url: str) -> str:
        """Extrait l'item ID depuis l'URL eBay"""
        # Format: https://www.ebay.com/itm/123456789
        match = re.search(r'/itm/(\d+)', url)
        if match:
            return match.group(1)
        return ""
    
    def _parse_sold_date(self, date_text: str) -> Optional[datetime]:
        """Parse la date de vente depuis le texte"""
        # Formats possibles: "Sold Jan 12, 2024" ou "Ended Jan 12, 2024" ou "Jan 12"
        try:
            from dateutil import parser
            # Essayer avec dateutil qui gère beaucoup de formats
            return parser.parse(date_text, fuzzy=True)
        except ImportError:
            # Fallback sans dateutil
            try:
                month_map = {
                    'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
                    'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
                }
                # Format: "Sold Jan 12, 2024"
                date_match = re.search(r'(\w+)\s+(\d+),?\s+(\d{4})', date_text, re.IGNORECASE)
                if date_match:
                    month_str, day, year = date_match.groups()
                    month = month_map.get(month_str.lower()[:3], 1)
                    return datetime(int(year), month, int(day))
                # Format: "Jan 12" (année actuelle)
                date_match = re.search(r'(\w+)\s+(\d+)', date_text, re.IGNORECASE)
                if date_match:
                    month_str, day = date_match.groups()
                    month = month_map.get(month_str.lower()[:3], 1)
                    return datetime(datetime.now().year, month, int(day))
            except:
                pass
        except:
            pass
        return None
    
    async def scrape_listing_details(self, item_id: str) -> Optional[Dict]:
        """
        Scrape les détails d'un listing spécifique.
        
        Utile pour récupérer des informations non disponibles via l'API.
        """
        try:
            self._rate_limit()
            
            url = f"{self.base_url}/itm/{item_id}"
            
            async with httpx.AsyncClient(
                headers=self.headers,
                timeout=30.0,
                follow_redirects=True
            ) as client:
                response = await client.get(url)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.text, "html.parser")
                
                # Extraire les détails spécifiques
                details = {
                    "item_id": item_id,
                    "title": self._extract_title(soup),
                    "price": self._extract_current_price(soup),
                    "condition": self._extract_condition(soup),
                    "seller": self._extract_seller(soup),
                    "description": self._extract_description(soup),
                    "images": self._extract_images(soup),
                    "shipping": self._extract_shipping_info(soup),
                }
                
                return details
                
        except Exception as e:
            logger.error(f"Erreur lors du scraping des détails: {e}")
            return None
    
    def _extract_title(self, soup: BeautifulSoup) -> str:
        """Extrait le titre depuis la page de détails"""
        title_elem = soup.find("h1", {"id": "x-item-title-label"})
        if not title_elem:
            title_elem = soup.find("h1", class_="x-item-title-label")
        return title_elem.get_text(strip=True) if title_elem else ""
    
    def _extract_current_price(self, soup: BeautifulSoup) -> float:
        """Extrait le prix actuel"""
        price_elem = soup.find("span", {"id": "prcIsum"})
        if not price_elem:
            price_elem = soup.find("span", class_="notranslate")
        if price_elem:
            return self._extract_price(price_elem.get_text())
        return 0.0
    
    def _extract_condition(self, soup: BeautifulSoup) -> Optional[str]:
        """Extrait la condition"""
        condition_elem = soup.find("div", {"id": "vi-condition"})
        if condition_elem:
            return condition_elem.get_text(strip=True)
        return None
    
    def _extract_seller(self, soup: BeautifulSoup) -> Optional[str]:
        """Extrait le nom du vendeur"""
        seller_elem = soup.find("span", {"id": "mbgLink"})
        if seller_elem:
            return seller_elem.get_text(strip=True)
        return None
    
    def _extract_description(self, soup: BeautifulSoup) -> str:
        """Extrait la description"""
        desc_elem = soup.find("div", {"id": "viTabs_0_is"})
        if desc_elem:
            return desc_elem.get_text(strip=True)
        return ""
    
    def _extract_images(self, soup: BeautifulSoup) -> List[str]:
        """Extrait les URLs des images"""
        images = []
        img_elems = soup.find_all("img", {"id": re.compile(r"icImg")})
        for img in img_elems:
            src = img.get("src") or img.get("data-src")
            if src:
                images.append(src)
        return images
    
    def _extract_shipping_info(self, soup: BeautifulSoup) -> Dict:
        """Extrait les informations de shipping"""
        shipping = {
            "cost": 0.0,
            "method": None,
            "location": None,
        }
        
        # Chercher les informations de shipping
        shipping_elem = soup.find("span", {"id": "fshippingCost"})
        if shipping_elem:
            shipping_text = shipping_elem.get_text(strip=True)
            shipping["cost"] = self._extract_price(shipping_text)
        
        return shipping


# Alternative : Utiliser des services de scraping tiers (légaux)
class eBayScrapingAPI:
    """
    Wrapper pour des services de scraping tiers légaux.
    
    Services recommandés :
    - ScraperAPI
    - Bright Data (anciennement Luminati)
    - Apify eBay Scraper
    """
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        # Exemple avec ScraperAPI
        self.scraperapi_url = "http://api.scraperapi.com"
    
    async def scrape_with_proxy(self, url: str) -> Optional[str]:
        """Scrape avec proxy via ScraperAPI"""
        if not self.api_key:
            logger.warning("ScraperAPI key non configurée")
            return None
        
        try:
            params = {
                "api_key": self.api_key,
                "url": url,
            }
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(self.scraperapi_url, params=params)
                response.raise_for_status()
                return response.text
        except Exception as e:
            logger.error(f"Erreur ScraperAPI: {e}")
            return None

