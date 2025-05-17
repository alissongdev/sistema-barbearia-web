#!/bin/bash

# Script para substituir variáveis de ambiente nos arquivos de ambiente
# Este script é executado automaticamente no processo de build da Vercel

# Arquivos onde as substituições serão feitas
ENV_FILES=(
  "dist/sistema-barbearia-web/browser/assets/config/config.json"
  "dist/sistema-barbearia-web/browser/chunk-*.js"
)

# Verifica se as variáveis de ambiente da API existem
if [ -z "$VERCEL_API_USERNAME" ] || [ -z "$VERCEL_API_PASSWORD" ]; then
  echo "AVISO: Variáveis de ambiente VERCEL_API_USERNAME e/ou VERCEL_API_PASSWORD não definidas."
  echo "As requisições para a API podem falhar sem credenciais válidas."
fi

# Cria o diretório de configuração e o arquivo config.json se não existirem
mkdir -p dist/sistema-barbearia-web/browser/assets/config
cat > dist/sistema-barbearia-web/browser/assets/config/config.json << EOF
{
  "apiCredentials": {
    "username": "${VERCEL_API_USERNAME:-}",
    "password": "${VERCEL_API_PASSWORD:-}"
  },
  "apiUrl": "https://viewsource-001-site1.ptempurl.com"
}
EOF

echo "Arquivo de configuração para a Vercel criado com sucesso."

echo "Substituindo marcadores nos arquivos JavaScript..."
find dist/sistema-barbearia-web/browser -name "*.js" -type f -exec sed -i "s/%%API_USERNAME%%/${VERCEL_API_USERNAME:-}/g" {} \;
find dist/sistema-barbearia-web/browser -name "*.js" -type f -exec sed -i "s/%%API_PASSWORD%%/${VERCEL_API_PASSWORD:-}/g" {} \;

echo "Substituições de variáveis de ambiente concluídas com sucesso!"
