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

echo "🔨 Buildando e subindo containers..."
docker compose pull caddy postgres 2>/dev/null || true
docker compose build app
docker compose up -d

echo "🗃  Rodando migrations do banco..."
docker compose exec app npx drizzle-kit push --config=drizzle.config.ts 2>/dev/null || \
  docker compose run --rm -e DATABASE_URL=$DATABASE_URL app npx drizzle-kit push

echo "✅ Deploy concluído!"
docker compose ps
ENDSSH

echo "🌐 CRM disponível em https://crm.ctmautomacao.com.br"
