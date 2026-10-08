#!/bin/bash
# Configuração inicial da VPS — rodar UMA VEZ como root
# ssh root@179.197.68.19 'bash -s' < setup-vps.sh
set -e

echo "🔧 Configurando VPS para CTM CRM..."

# Docker
if ! command -v docker &>/dev/null; then
  echo "Instalando Docker..."
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker
  systemctl start docker
fi

# Git
apt-get install -y git 2>/dev/null || yum install -y git 2>/dev/null || true

# Clonar repo
mkdir -p /opt/crm
cd /opt/crm
git clone https://github.com/ctmautomacao/crm.git . 2>/dev/null || git pull origin main

# Criar .env se não existir
if [ ! -f .env ]; then
  echo "⚠️  Criando .env — EDITE com as senhas reais antes de continuar!"
  SECRET=$(openssl rand -base64 32)
  PGPASS=$(openssl rand -base64 16 | tr -d '/')
  cat > .env << EOF
DATABASE_URL=postgres://crmuser:${PGPASS}@postgres:5432/crmdb
POSTGRES_DB=crmdb
POSTGRES_USER=crmuser
POSTGRES_PASSWORD=${PGPASS}
NEXTAUTH_SECRET=${SECRET}
NEXTAUTH_URL=https://crm.ctmautomacao.com.br
EOF
  echo "✅ .env criado em /opt/crm/.env"
  echo "   NEXTAUTH_SECRET e POSTGRES_PASSWORD foram gerados automaticamente"
fi

# Subir serviços
docker compose up -d --build

echo ""
echo "✅ VPS configurada!"
echo "   Aguarde o build terminar e acesse: https://crm.ctmautomacao.com.br"
echo "   Para ver logs: docker compose -f /opt/crm/docker-compose.yml logs -f"
