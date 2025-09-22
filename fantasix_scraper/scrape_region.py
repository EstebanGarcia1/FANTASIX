import requests
from bs4 import BeautifulSoup
import csv

# Páginas por región
region_urls = [
    "https://liquipedia.net/rainbowsix/Portal:Players/Europe",
    "https://liquipedia.net/rainbowsix/Portal:Players/North_America",
    "https://liquipedia.net/rainbowsix/Portal:Players/South_America",
    "https://liquipedia.net/rainbowsix/Portal:Players/Asia_Pacific",
    "https://liquipedia.net/rainbowsix/Portal:Players/Middle_East_Africa"
]

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
}

all_players = []

for url in region_urls:
    res = requests.get(url, headers=headers)
    soup = BeautifulSoup(res.text, "html.parser")

    content = soup.find("div", class_="mw-parser-output")
    if not content:
        continue

    for link in content.find_all("a", href=True):
        href = link["href"]
        name = link.get_text(strip=True)
        if (
            href.startswith("/rainbowsix/") 
            and not href.startswith("/rainbowsix/File")
            and not ":" in href
            and name != ""
        ):
            full_url = f"https://liquipedia.net{href}"
            all_players.append((name, full_url))

# Eliminar duplicados
all_players = list(set(all_players))

# Guardar en CSV
with open("jugadores_activos.csv", mode="w", newline="", encoding="utf-8") as file:
    writer = csv.writer(file)
    writer.writerow(["Nombre", "URL"])
    for jugador in all_players:
        writer.writerow(jugador)

print(f"\n✅ Guardado {len(all_players)} jugadores en jugadores_activos.csv")
