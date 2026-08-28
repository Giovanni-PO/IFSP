import tkinter as tk
from tkinter import messagebox
import csv
from io import StringIO
from datetime import datetime
import re


ARQUIVO_SAIDA = "inserts_inventario.sql"


# ============================================================
# COLUNAS DA TABELA
# ============================================================

COLUNAS = [
    "numero",
    "status",
    "ed",
    "descricao",
    "rotulos",
    "carga_atual",
    "setor_responsavel",
    "campus_responsavel",
    "campus_carga",
    "valor",
    "numero_nota_fiscal",
    "data_entrada",
    "data_carga",
    "fornecedor",
    "sala",
    "estado_conservacao",
    "numero_serie"
]


# ============================================================
# ESCAPAR TEXTO
# ============================================================

def sql_texto(valor):

    valor = valor.replace("'", "''")

    # Converte quebras de linha para que possam
    # ser armazenadas corretamente no MySQL.
    valor = valor.replace("\\", "\\\\")

    return "'" + valor + "'"


# ============================================================
# FORMATAR CAMPO
# ============================================================

def formatar_campo(campo, valor):

    valor = valor.strip()

    # --------------------------------------------------------
    # NULL
    # --------------------------------------------------------

    if valor == "" or valor == "-":
        return "NULL"


    # --------------------------------------------------------
    # NUMERO
    # --------------------------------------------------------

    if campo == "numero":

        if not valor.isdigit():
            raise ValueError(
                f"numero inválido: {valor}"
            )

        return valor


    # --------------------------------------------------------
    # ED
    # --------------------------------------------------------

    if campo == "ed":

        if not valor.isdigit():
            raise ValueError(
                f"ed inválido: {valor}"
            )

        return valor


    # --------------------------------------------------------
    # VALOR
    # --------------------------------------------------------

    if campo == "valor":

        valor = valor.replace(",", ".")

        try:
            float(valor)
        except ValueError:
            raise ValueError(
                f"valor inválido: {valor}"
            )

        return valor


    # --------------------------------------------------------
    # DATA DE ENTRADA
    # --------------------------------------------------------

    if campo == "data_entrada":

        formatos = [
            "%d/%m/%Y %H:%M:%S",
            "%d/%m/%Y",
            "%Y-%m-%d %H:%M:%S",
            "%Y-%m-%d"
        ]

        for formato in formatos:

            try:

                data = datetime.strptime(
                    valor,
                    formato
                )

                return (
                    "'"
                    + data.strftime(
                        "%Y-%m-%d %H:%M:%S"
                    )
                    + "'"
                )

            except ValueError:
                continue


        raise ValueError(
            f"Data inválida: {valor}"
        )


    # --------------------------------------------------------
    # DATA DE CARGA
    # --------------------------------------------------------

    if campo == "data_carga":

        # A coluna no seu MySQL é VARCHAR(20)
        return sql_texto(valor)


    # --------------------------------------------------------
    # TEXTO
    # --------------------------------------------------------

    return sql_texto(valor)


# ============================================================
# GERAR INSERT
# ============================================================

def gerar_insert(campos):

    valores = []

    for campo, valor in zip(
        COLUNAS,
        campos
    ):

        valores.append(
            formatar_campo(
                campo,
                valor
            )
        )


    return """INSERT INTO Itens
(
numero,
status,
ed,
descricao,
rotulos,
carga_atual,
setor_responsavel,
campus_responsavel,
campus_carga,
valor,
numero_nota_fiscal,
data_entrada,
data_carga,
fornecedor,
sala,
estado_conservacao,
numero_serie
)
VALUES
(
%s
);""" % ",\n".join(valores)


# ============================================================
# SEPARAR OS REGISTROS
# ============================================================

def separar_registros(texto):

    linhas = texto.splitlines()

    registros = []

    atual = []

    for linha in linhas:

        linha_limpa = linha.strip()


        # ----------------------------------------------------
        # IGNORA CABEÇALHOS
        # ----------------------------------------------------

        if (
            linha_limpa.upper().startswith("NUMERO;")
            or
            linha_limpa.upper().startswith("NÚMERO;")
        ):

            continue


        # ----------------------------------------------------
        # DETECTA NOVO REGISTRO
        #
        # Exemplos:
        #
        # 1;445;ativo;...
        # 2;454;ativo;...
        # 3;455;ativo;...
        #
        # ----------------------------------------------------

        if re.match(
            r"^\d+;",
            linha_limpa
        ):

            # Se já existe registro anterior,
            # salva antes de começar o próximo.
            if atual:

                registros.append(
                    "\n".join(atual)
                )

            atual = [
                linha
            ]

        else:

            # Linha complementar da descrição
            if atual:

                atual.append(
                    linha
                )


    # Último registro

    if atual:

        registros.append(
            "\n".join(atual)
        )


    return registros


# ============================================================
# PROCESSAR UM REGISTRO
# ============================================================

def processar_registro(registro):

    arquivo = StringIO(
        registro
    )

    leitor = csv.reader(
        arquivo,
        delimiter=";",
        quotechar='"'
    )


    campos = []


    for linha in leitor:

        campos.extend(
            linha
        )


    # --------------------------------------------------------
    # PRIMEIRO CAMPO = ÍNDICE
    #
    # 1;445;ativo...
    #
    # remove o 1
    # --------------------------------------------------------

    if len(campos) >= 1:

        campos = campos[1:]


    # --------------------------------------------------------
    # Deve ter exatamente 17 campos
    # --------------------------------------------------------

    if len(campos) != 17:

        raise ValueError(
            f"Registro possui {len(campos)} campos. "
            f"Esperados: 17."
        )


    return gerar_insert(
        campos
    )


# ============================================================
# GERAR ARQUIVO
# ============================================================

def gerar_arquivo():

    texto = caixa_texto.get(
        "1.0",
        tk.END
    )


    if not texto.strip():

        messagebox.showwarning(
            "Atenção",
            "Cole os dados primeiro."
        )

        return


    # --------------------------------------------------------
    # SEPARA OS REGISTROS
    # --------------------------------------------------------

    registros = separar_registros(
        texto
    )


    if not registros:

        messagebox.showerror(
            "Erro",
            "Nenhum registro foi encontrado.\n\n"
            "O programa procura registros que começam "
            "com 1;, 2;, 3;, etc."
        )

        return


    inserts = []

    erros = []


    # --------------------------------------------------------
    # PROCESSA CADA REGISTRO
    # --------------------------------------------------------

    for numero, registro in enumerate(
        registros,
        start=1
    ):

        try:

            insert = processar_registro(
                registro
            )

            inserts.append(
                insert
            )

        except Exception as erro:

            erros.append(
                f"Registro {numero}: {erro}"
            )


    # --------------------------------------------------------
    # NENHUM INSERT
    # --------------------------------------------------------

    if not inserts:

        messagebox.showerror(
            "Erro",
            "Nenhum INSERT pôde ser gerado.\n\n"
            + "\n".join(erros)
        )

        return


    # --------------------------------------------------------
    # SALVAR
    # --------------------------------------------------------

    try:

        with open(
            ARQUIVO_SAIDA,
            "w",
            encoding="utf-8"
        ) as arquivo:

            arquivo.write(
                "\n\n".join(inserts)
            )


    except Exception as erro:

        messagebox.showerror(
            "Erro ao salvar",
            str(erro)
        )

        return


    # --------------------------------------------------------
    # RESULTADO
    # --------------------------------------------------------

    mensagem = (
        "Arquivo gerado com sucesso!\n\n"
        f"Registros encontrados: {len(registros)}\n"
        f"INSERTs gerados: {len(inserts)}\n\n"
        f"Arquivo:\n{ARQUIVO_SAIDA}"
    )


    if erros:

        mensagem += (
            "\n\n"
            f"Registros com erro: {len(erros)}\n\n"
            + "\n".join(erros[:10])
        )


    messagebox.showinfo(
        "Concluído",
        mensagem
    )


# ============================================================
# LIMPAR
# ============================================================

def limpar():

    caixa_texto.delete(
        "1.0",
        tk.END
    )


# ============================================================
# JANELA
# ============================================================

janela = tk.Tk()

janela.title(
    "Gerador de INSERTs - Inventário"
)

janela.geometry(
    "1200x750"
)


# ============================================================
# TÍTULO
# ============================================================

tk.Label(
    janela,
    text="Gerador de INSERTs do Inventário",
    font=("Arial", 18, "bold")
).pack(
    pady=10
)


# ============================================================
# INSTRUÇÃO
# ============================================================

tk.Label(
    janela,
    text=(
        "Cole sua lista completa abaixo. "
        "O programa identifica automaticamente cada item "
        "pelo número inicial (1;, 2;, 3;...)."
    ),
    font=("Arial", 11)
).pack(
    pady=5
)


# ============================================================
# CAIXA DE TEXTO
# ============================================================

caixa_texto = tk.Text(
    janela,
    wrap=tk.NONE,
    font=("Consolas", 10)
)

caixa_texto.pack(
    fill=tk.BOTH,
    expand=True,
    padx=15,
    pady=10
)


# ============================================================
# BOTÕES
# ============================================================

frame = tk.Frame(
    janela
)

frame.pack(
    pady=10
)


tk.Button(
    frame,
    text="GERAR INSERTS",
    command=gerar_arquivo,
    bg="#198754",
    fg="white",
    font=("Arial", 12, "bold"),
    padx=30,
    pady=10
).pack(
    side=tk.LEFT,
    padx=10
)


tk.Button(
    frame,
    text="LIMPAR",
    command=limpar,
    bg="#dc3545",
    fg="white",
    font=("Arial", 12, "bold"),
    padx=30,
    pady=10
).pack(
    side=tk.LEFT,
    padx=10
)


# ============================================================
# EXECUTAR
# ============================================================

janela.mainloop()
