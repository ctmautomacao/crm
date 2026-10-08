#!/bin/bash
# Script de deploy para VPS 179.197.68.19
# Uso: ./deploy.sh
set -e

VPS="root@179.197.68.19"
REMOTE_DIR="/opt/crm"

echo "🚀 Deploy CTM CRM → $VPS"

# 1. Push para GitHub
echo "📦 Enviando código para o GitHub..."
git add -A
git commit -m "deploy: $(date '+%Y-%m-%d %H:%M')" 2>/dev/null || echo "Nada novo para commitar"
git push origin main

# 2. Conectar na VPS e atualizar
echo "🖥  Conectando na VPS..."
ssh $VPS << 'ENDSSH'
set -e

cd /opt/crm 2>/dev/null || (mkdir -p /opt/crm && cd /opt/crm && git clone https://github.com/ctmautomacao/crm.git . )

echo "⬇️  Atualizando código..."
git pull origin main

echo "🔨 Buildando containers..."
docker compose build app migrate

echo "🗃  Aplicando schema no banco..."
docker compose --profile migrate run --rm migrate

echo "🌱 Rodando seed (cria tenant + usuários iniciais)..."
# O seed usa onConflictDoNothing — seguro rodar mais de uma vez
docker compose run --rm \
  -e DATABASE_URL="postgres://${POSTGRES_USER:-crmuser}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB:-crmdb}" \
  --no-deps \
  migrate \
  npx tsx scripts/seed.ts 2>/dev/null || echo "⚠️  Seed ignorado (opcional)"

echo "🚀 Subindo aplicação..."
docker compose up -d app

echo "✅ Deploy concluído!"
docker compose ps
ENDSSH

echo "🌐 CRM disponível em https://crm.ctmautomacao.com.br"
