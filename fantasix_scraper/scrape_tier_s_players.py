import requests
from bs4 import BeautifulSoup
import csv
import time

def cargar_urls(filename="tier_s_links.txt"):
    with open(filename, "r", encoding="utf-8") as f:
        return [line.strip() for line in f if line.strip()]

def extraer_jugadores(url):
    print(f"🔍 Procesando: {url}")
    jugadores = dict()
    try:
        response = requests.get(url, timeout=10)
        soup = BeautifulSoup(response.text, "html.parser")

        # Buscar solo en tablas .wikitable
        tablas = soup.find_all("table", class_="wikitable")

        for tabla in tablas:
            for a in tabla.find_all("a", href=True):
                href = a["href"]
                nombre = a.get_text(strip=True)
                # Filtrado más preciso
                if (
                    href.startswith("/rainbowsix/")
                    and not any(x in href for x in ["File:", "Category:", "Team_", "Portal:", "index.php"])
                    and nombre
                    and nombre != "•"
                    and len(nombre) > 1
                ):
                    url_completa = "https://liquipedia.net" + href
                    jugadores[nombre.lower()] = (nombre, url_completa)

    except Exception as e:
        print(f"❌ Error al procesar {url}: {e}")
    return list(jugadores.values())

def main():
    urls = cargar_urls()
    todos_jugadores = dict()

    for url in urls:
        jugadores = extraer_jugadores(url)
        for nombre, enlace in jugadores:
            todos_jugadores[nombre.lower()] = (nombre, enlace)
        time.sleep(1)

    with open("jugadores_tier_s.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["Nombre", "URL"])
        writer.writerows(sorted(todos_jugadores.values()))

    print(f"\n✅ Se guardaron {len(todos_jugadores)} jugadores únicos en 'jugadores_tier_s.csv'.")

if __name__ == "__main__":
    main()
