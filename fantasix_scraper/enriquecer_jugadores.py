import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
import csv

def limpiar_texto(texto):
    return texto.replace('\xa0', ' ').replace('\n', ' ').strip()

def es_pagina_valida(soup):
    return bool(soup.select_one(".infobox-image img") or soup.find("span", id="Player_History"))

def extraer_info_jugador(url):
    try:
        res = requests.get(url, timeout=10)
        soup = BeautifulSoup(res.text, "html.parser")

        if not es_pagina_valida(soup):
            return None

        info = {
            "Nombre real": "",
            "Nacionalidad": "",
            "Fecha de nacimiento / Edad": "",
            "Foto": "",
            "Estado": "",
            "Equipo actual": "",
            "Equipos históricos": "",
            "Último torneo jugado": "",
            "Regiones": "",
        }

        # FOTO
        img_tag = soup.select_one(".infobox-image img")
        if img_tag and img_tag.get("src"):
            info["Foto"] = "https://liquipedia.net" + img_tag["src"]

        # === DATOS PERSONALES (nueva estructura de divs) ===
        descripciones = soup.select("div.infobox-cell-2.infobox-description")
        for desc in descripciones:
            label = limpiar_texto(desc.text)
            valor_div = desc.find_next_sibling("div")
            if not valor_div:
                continue
            valor = limpiar_texto(valor_div.text)

            if label == "Name:":
                info["Nombre real"] = valor
            elif label == "Born:":
                info["Fecha de nacimiento / Edad"] = valor
            elif label == "Nationality:":
                bandera = valor_div.find("img")
                if bandera and bandera.get("alt"):
                    info["Nacionalidad"] = bandera["alt"]
            elif label == "Status:":
                info["Estado"] = valor
            elif label == "Team:":
                info["Equipo actual"] = valor

        # === BACKUP DATOS PERSONALES (estructura anterior si no se extrajo nada) ===
        if not info["Nombre real"] or not info["Nacionalidad"]:
            filas = soup.select(".infobox-cell-2")
            for fila in filas:
                label = fila.find_previous_sibling("td")
                if not label:
                    continue
                texto = limpiar_texto(fila.text)

                if "Name" in label.text and not info["Nombre real"]:
                    info["Nombre real"] = texto
                elif "Born" in label.text and not info["Fecha de nacimiento / Edad"]:
                    info["Fecha de nacimiento / Edad"] = texto
                elif "Country" in label.text and not info["Nacionalidad"]:
                    bandera = fila.find("img")
                    if bandera and bandera.get("title"):
                        info["Nacionalidad"] = bandera["title"]

        # === ESTADO (si no extraído aún, buscar en texto general) ===
        if not info["Estado"]:
            texto_general = soup.get_text().lower()
            if "retired" in texto_general or "former" in texto_general or "inactive" in texto_general:
                info["Estado"] = "Retirado"
            else:
                info["Estado"] = "Activo"

        # === EQUIPOS HISTÓRICOS (con fechas) ===
        equipos = []
        tabla_transferencias = soup.find("table", style=lambda s: s and "text-align:left" in s)
        if tabla_transferencias:
            filas = tabla_transferencias.find_all("tr")[1:]
            for fila in filas:
                celdas = fila.find_all("td")
                if len(celdas) == 3:
                    join = limpiar_texto(celdas[0].text)
                    leave = limpiar_texto(celdas[1].text)
                    equipo = limpiar_texto(celdas[2].text)
                    equipos.append(f"{equipo} ({join} – {leave})")
        info["Equipos históricos"] = "; ".join(equipos)

        # === EQUIPO ACTUAL (si está activo y no se extrajo antes) ===
        if info["Estado"] == "Activo" and not info["Equipo actual"] and equipos:
            info["Equipo actual"] = equipos[-1].split(" (")[0]

        # === ÚLTIMO TORNEO (por texto) ===
        for a in soup.find_all("a", href=True):
            if "/rainbowsix/" in a["href"] and "202" in a.text and ("Major" in a.text or "Invitational" in a.text):
                info["Último torneo jugado"] = a.text
                break

        # === Validación básica final ===
        if not info["Nacionalidad"] and not info["Nombre real"] and not equipos:
            return None

        return info

    except Exception as e:
        print(f"❌ Error con {url}: {e}")
        return None

def main():
    df = pd.read_csv("jugadores_limpios.csv")
    resultados = []
    filtrados = []

    for idx, row in df.iterrows():
        nombre = row["Nombre"]
        url = row["URL"]
        print(f"[{idx+1}/{len(df)}] 🔍 {nombre}")

        datos = extraer_info_jugador(url)
        if datos:
            resultados.append({
                "Nickname": nombre,
                "URL": url,
                **datos
            })
        else:
            filtrados.append(row)

        time.sleep(1)

    campos = ["Nickname", "Nombre real", "Nacionalidad", "Fecha de nacimiento / Edad",
              "Foto", "Estado", "Equipo actual", "Equipos históricos", "Último torneo jugado",
              "Regiones", "URL"]

    pd.DataFrame(resultados).to_csv("jugadores_enriquecidos_final.csv", index=False)
    pd.DataFrame(filtrados).to_csv("jugadores_filtrados.csv", index=False)

    print(f"\n✅ Se guardaron {len(resultados)} jugadores válidos en 'jugadores_enriquecidos_final.csv'.")
    print(f"📤 Se filtraron {len(filtrados)} entradas no válidas en 'jugadores_filtrados.csv'.")

if __name__ == "__main__":
    main()
