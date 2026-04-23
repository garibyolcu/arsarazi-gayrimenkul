#!/bin/bash

# ============================================================
# ARSARAZI GAYRIMENKUL - TEK KOMUTLA BASLATMA SCRIPTI
# ============================================================
# Bu scripti calistir: ./start.sh
# Yapilanlar:
#   1. Docker ile MySQL + Redis + MinIO baslatir
#   2. Node modules kurar (eger eksikse)
#   3. Veritabani tablolari olusturur
#   4. Ornek verileri yukler (admin, ilanlar, musteriler)
#   5. Gelistirme sunucusunu baslatir
# ============================================================

set -e  # Hata olursa dur

YELLOW='\033[1;33m'
GREEN='\033[1;32m'
RED='\033[1;31m'
BLUE='\033[1;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  ARSARAZI GAYRIMENKUL - BASLATILIYOR${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# --- 1. Docker kontrolu ---
echo -e "${YELLOW}[1/6] Docker kontrol ediliyor...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}HATA: Docker kurulu degil!${NC}"
    echo "Lutfen once Docker Desktop kurun: https://www.docker.com/products/docker-desktop"
    exit 1
fi
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}HATA: Docker Compose bulunamadi!${NC}"
    exit 1
fi
echo -e "${GREEN}Docker OK${NC}"

# --- 2. Docker servislerini baslat ---
echo -e "${YELLOW}[2/6] MySQL + Redis + MinIO baslatiliyor...${NC}"
if docker compose version &> /dev/null; then
    docker compose up -d
else
    docker-compose up -d
fi
echo -e "${GREEN}Docker servisleri calisiyor${NC}"

# --- 3. Node modules ---
echo -e "${YELLOW}[3/6] Node paketleri kontrol ediliyor...${NC}"
if [ ! -d "node_modules" ]; then
    echo "node_modules bulunamadi, kuruluyor..."
    npm install
fi
echo -e "${GREEN}Paketler OK${NC}"

# --- 4. .env.local dosyasi ---
echo -e "${YELLOW}[4/6] Ortam degiskenleri kontrol ediliyor...${NC}"
if [ ! -f ".env.local" ]; then
    cp .env.local.example .env.local
    echo -e "${GREEN}.env.local olusturuldu${NC}"
else
    echo -e "${GREEN}.env.local zaten var${NC}"
fi

# --- 5. Veritabani kurulumu ---
echo -e "${YELLOW}[5/6] Veritabani senkronize ediliyor...${NC}"
npm run db:push
echo -e "${GREEN}Veritabani tablolari hazir${NC}"

# --- 6. Seed data ---
echo -e "${YELLOW}[6/6] Ornek veriler yukleniyor...${NC}"
npx tsx db/seed.ts
echo -e "${GREEN}Seed data yuklendi${NC}"

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  HAZIR! Sunucu baslatiliyor...${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo -e "Site:     ${BLUE}http://localhost:3000${NC}"
echo -e "Admin:    ${BLUE}http://localhost:3000/admin${NC}"
echo -e "Giris:    ${YELLOW}admin@arsarazi.com / admin123${NC}"
echo -e "MinIO:    ${BLUE}http://localhost:9001${NC} (minioadmin / minioadmin123)"
echo ""
echo -e "Durdurmak icin: ${YELLOW}Ctrl+C${NC}"
echo ""

# Sunucuyu baslat
npm run dev
