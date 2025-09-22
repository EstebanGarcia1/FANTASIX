import pandas as pd

def tiene_espacios(nombre):
    return " " in nombre.strip()

def main():
    df = pd.read_csv("jugadores_base.csv")

    jugadores_validos = df[~df["Nombre"].apply(tiene_espacios)]
    jugadores_descartados = df[df["Nombre"].apply(tiene_espacios)]

    jugadores_validos.to_csv("jugadores_limpios.csv", index=False)
    jugadores_descartados.to_csv("jugadores_filtrados.csv", index=False)

    print(f"✅ Se guardaron {len(jugadores_validos)} jugadores en 'jugadores_limpios.csv'.")
    print(f"📤 Se filtraron {len(jugadores_descartados)} entradas no válidas en 'jugadores_filtrados.csv'.")

if __name__ == "__main__":
    main()
