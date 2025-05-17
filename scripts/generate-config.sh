#!/bin/bash

# Script para gerar arquivo de configuração a partir de variáveis de ambiente
# Este script deve ser executado durante o processo de deploy em produção

CONFIG_DIR="./dist/assets/config"
CONFIG_FILE="$CONFIG_DIR/config.json"

# Carrega variáveis de ambiente do arquivo .env se existir
if [ -f ".env" ]; then
  echo "Carregando variáveis de ambiente do arquivo .env..."
  export $(grep -v '^#' .env | xargs)
fi

# Verifica se as variáveis de ambiente necessárias estão definidas
if [ -z "$API_USERNAME" ] || [ -z "$API_PASSWORD" ]; then
  echo "Erro: As variáveis de ambiente API_USERNAME e API_PASSWORD precisam estar definidas."
  echo "Por favor, configure-as no seu ambiente ou crie um arquivo .env baseado no .env.example."
  exit 1
fi

# Cria o diretório de configuração se não existir
mkdir -p "$CONFIG_DIR"

# Gera o arquivo de configuração
cat > "$CONFIG_FILE" << EOF
{
  "apiCredentials": {
    "username": "$API_USERNAME",
    "password": "$API_PASSWORD"
  }
}
EOF

echo "Arquivo de configuração gerado com sucesso em $CONFIG_FILE"
