#!/bin/sh
set -e

echo "========================================================"
echo "🐳 [VANTA ERP Engine] Initializing Docker Container"
echo "========================================================"

# Database Provider Alignment Engine
if echo "$DATABASE_URL" | grep -qE '^postgres(ql)?://'; then
  echo "🐘 PostgreSQL database connection detected."
  echo "🔧 Aligning Prisma schema datasource provider to 'postgresql'..."
  sed -i 's/provider = "sqlite"/provider = "postgresql"/g' /app/apps/api/prisma/schema.prisma

  echo "⏳ Synchronizing PostgreSQL schema with Prisma engine..."
  npx prisma generate --schema=/app/apps/api/prisma/schema.prisma
  
  # Retry until Postgres is accepting connections
  MAX_RETRIES=30
  COUNT=0
  until npx prisma db push --schema=/app/apps/api/prisma/schema.prisma --accept-data-loss; do
    COUNT=$((COUNT + 1))
    if [ $COUNT -ge $MAX_RETRIES ]; then
      echo "❌ Database connection timed out after $MAX_RETRIES attempts."
      exit 1
    fi
    echo "⏳ Waiting for database connection ($COUNT/$MAX_RETRIES)..."
    sleep 2
  done

  echo "🌱 Seeding demo catalog, users, CRM customers, and challans..."
  npx tsx /app/apps/api/prisma/seed.ts || echo "⚠️ Seed script completed with notice (records already present)."

else
  echo "📦 SQLite database detected."
  echo "🔧 Aligning Prisma schema datasource provider to 'sqlite'..."
  sed -i 's/provider = "postgresql"/provider = "sqlite"/g' /app/apps/api/prisma/schema.prisma
  npx prisma generate --schema=/app/apps/api/prisma/schema.prisma
  npx prisma db push --schema=/app/apps/api/prisma/schema.prisma --accept-data-loss
fi

echo "========================================================"
echo "🚀 Booting VANTA ERP API Server on port ${PORT:-5001}..."
echo "========================================================"

exec "$@"
