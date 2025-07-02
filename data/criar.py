import json
import os
from datetime import datetime

def get_db_path():
    mes = datetime.now().strftime('%B').lower()  # exemplo: 'julho'
    return f"estoque-{mes}.json"

def carregar_estoque():
    caminho = get_db_path()
    if not os.path.exists(caminho):
        with open(caminho, 'w') as f:
            json.dump({}, f)
    with open(caminho, 'r') as f:
        return json.load(f)

def salvar_estoque(estoque):
    caminho = get_db_path()
    with open(caminho, 'w') as f:
        json.dump(estoque, f, indent=2)

def adicionar_produto(produto, quantidade):
    estoque = carregar_estoque()
    produto = produto.capitalize()
    estoque[produto] = estoque.get(produto, 0) + quantidade
    salvar_estoque(estoque)
    print(f"✅ Adicionado: {quantidade}x {produto}")

def remover_produto(produto, quantidade):
    estoque = carregar_estoque()
    produto = produto.capitalize()
    if produto not in estoque:
        print(f"❌ Produto '{produto}' não existe no estoque.")
        return
    if estoque[produto] < quantidade:
        print(f"⚠️ Estoque insuficiente para '{produto}'. Disponível: {estoque[produto]}")
        return
    estoque[produto] -= quantidade
    salvar_estoque(estoque)
    print(f"🗑️ Removido: {quantidade}x {produto}")

# Exemplo de uso:
# adicionar_produto("Arroz", 10)
# remover_produto("Arroz", 3)
