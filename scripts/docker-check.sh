#!/usr/bin/env bash
# TASK-06 (Lab 6): Docker readiness шалгалт.
# docker-compose.yml-ээр backend + MongoDB-г ШИНЭЭР үүсгэж ажиллуулаад дараахыг баталгаажуулна:
#   1. GET /api/health → 200
#   2. JWT auth: нэвтрээгүй 401, STUDENT 403, TEACHER 201 (POST /api/achievements)
#   3. Persistence: `restart` болон `down` → `up` (container дахин үүсгэх) хийсний дараа өгөгдөл хэвээр
#
# Ажиллуулах:  npm run docker:check      (эсвэл: bash scripts/docker-check.sh)
# Тусдаа compose project (studyquest-check) ашиглах тул таны үндсэн өгөгдөлд хүрэхгүй;
# дуусахад түүнийг volume-тай нь устгана. Үлдээх бол: KEEP=1 npm run docker:check
set -euo pipefail
cd "$(dirname "$0")/.."

BASE="${BASE_URL:-http://localhost:4000}"
PROJECT="${COMPOSE_PROJECT_NAME:-studyquest-check}"
FAILED=0

compose() { docker compose -p "$PROJECT" "$@"; }

cleanup() {
  if [ "${KEEP:-0}" != "1" ]; then
    compose down -v --remove-orphans >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

wait_for_api() {
  for _ in $(seq 1 90); do
    curl -sf "$BASE/api/health" >/dev/null 2>&1 && return 0
    sleep 2
  done
  echo "API $BASE дээр асаагүй. app container-ийн log:"
  compose logs app | tail -40
  exit 1
}

# check <нэр> <хүлээгдэх status> <бодит status>
check() {
  if [ "$2" = "$3" ]; then
    echo "PASS  $1 → $3"
  else
    echo "FAIL  $1 → хүлээгдэж байсан $2, ирсэн $3"
    FAILED=1
  fi
}

# JSON-оос нэг талбар уншина (jq суулгах шаардлагагүй)
field() { node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const v=JSON.parse(s)[process.argv[1]];process.stdout.write(v==null?"":String(v))})' "$1"; }

login() {
  curl -s -X POST "$BASE/api/auth/login" -H 'Content-Type: application/json' \
    -d "{\"username\":\"$1\",\"password\":\"$2\"}" | field token
}

echo "==> docker compose -p $PROJECT up --build -d"
compose up --build -d
wait_for_api
check "GET /api/health" 200 "$(curl -s -o /dev/null -w '%{http_code}' "$BASE/api/health")"

CODE="docker-check-$(date +%s)"
BADGE="{\"code\":\"$CODE\",\"title\":\"Docker тэмдэг\",\"type\":\"XP_TOTAL\",\"threshold\":100,\"xpReward\":5}"

check "POST /api/achievements (нэвтрээгүй)" 401 \
  "$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/api/achievements" -H 'Content-Type: application/json' -d "$BADGE")"

STUDENT_TOKEN="$(login temuulen student123)"
check "POST /api/achievements (STUDENT)" 403 \
  "$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/api/achievements" -H 'Content-Type: application/json' \
      -H "Authorization: Bearer $STUDENT_TOKEN" -d "$BADGE")"

TEACHER_TOKEN="$(login bagsh teacher123)"
CREATED="$(curl -s -w '\n%{http_code}' -X POST "$BASE/api/achievements" -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $TEACHER_TOKEN" -d "$BADGE")"
check "POST /api/achievements (TEACHER)" 201 "$(printf '%s' "$CREATED" | tail -n1)"
ID="$(printf '%s' "$CREATED" | sed '$d' | field id)"
echo "      үүссэн тэмдэг: $ID ($CODE)"

echo "==> docker compose restart app"
compose restart app >/dev/null
wait_for_api
check "GET /api/achievements/$ID (restart-ийн дараа)" 200 \
  "$(curl -s -o /dev/null -w '%{http_code}' "$BASE/api/achievements/$ID")"

echo "==> docker compose down → up (container-уудыг дахин үүсгэнэ, mongo volume үлдэнэ)"
compose down >/dev/null
compose up -d >/dev/null
wait_for_api
check "GET /api/achievements/$ID (down → up-ийн дараа)" 200 \
  "$(curl -s -o /dev/null -w '%{http_code}' "$BASE/api/achievements/$ID")"
check "GET /api/me/achievements (нэвтрээгүй)" 401 \
  "$(curl -s -o /dev/null -w '%{http_code}' "$BASE/api/me/achievements")"

if [ "$FAILED" = "0" ]; then
  echo "Docker шалгалт амжилттай ✔"
else
  echo "Docker шалгалт амжилтгүй ✘"
  exit 1
fi
