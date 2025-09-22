# filtrar_nombres.py

import pandas as pd

def main():
    archivo_entrada = "jugadores_base.csv"
    archivo_salida = "jugadores_limpios.csv"
    archivo_filtrados = "jugadores_filtrados_nombres.csv"

    # Leer CSV original
    df = pd.read_csv(archivo_entrada)

    # Filtrar nombres sin espacios (posibles jugadores reales)
    df_validos = df[df["Nombre"].apply(lambda x: isinstance(x, str) and " " not in x)]
    df_filtrados = df[~df.index.isin(df_validos.index)]

    # Guardar resultados
    df_validos.to_csv(archivo_salida, index=False)
    df_filtrados.to_csv(archivo_filtrados, index=False)

    print(f"✅ Se han guardado {len(df_validos)} jugadores en '{archivo_salida}'.")
    print(f"📤 Se han filtrado {len(df_filtrados)} entradas en '{archivo_filtrados}'.")

if __name__ == "__main__":
    main()
