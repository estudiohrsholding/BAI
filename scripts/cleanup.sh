#!/bin/bash

# B.A.I. SYSTEMS - Script de Limpieza Automatizado
# Basado en AUDIT_REPORT_PROFESIONAL.md
# Elimina archivos duplicados, legacy y configuración redundante

set -e  # Salir si hay errores

echo "🧹 Iniciando limpieza del proyecto B.A.I..."

FRONTEND_DIR="frontend/src"

# ============================================
# 1. ELIMINAR COMPONENTES DUPLICADOS (CRÍTICO)
# ============================================
echo ""
echo "📦 Eliminando componentes duplicados..."

if [ -f "$FRONTEND_DIR/components/BaiAvatar.tsx" ]; then
    echo "  ❌ Eliminando components/BaiAvatar.tsx (legacy)"
    rm "$FRONTEND_DIR/components/BaiAvatar.tsx"
    echo "  ✅ Eliminado"
else
    echo "  ℹ️  components/BaiAvatar.tsx no existe (ya eliminado)"
fi

if [ -f "$FRONTEND_DIR/components/Sidebar.tsx" ]; then
    echo "  ❌ Eliminando components/Sidebar.tsx (legacy)"
    rm "$FRONTEND_DIR/components/Sidebar.tsx"
    echo "  ✅ Eliminado"
else
    echo "  ℹ️  components/Sidebar.tsx no existe (ya eliminado)"
fi

# ============================================
# 2. ELIMINAR CONFIGURACIÓN DUPLICADA (MEDIO)
# ============================================
echo ""
echo "⚙️  Verificando configuración duplicada..."

# Verificar next.config
if [ -f "frontend/next.config.js" ] && [ -f "frontend/next.config.mjs" ]; then
    echo "  ⚠️  Detectados next.config.js y next.config.mjs"
    echo "  ❌ Eliminando next.config.js (Next.js prioriza .mjs)"
    rm "frontend/next.config.js"
    echo "  ✅ Eliminado"
elif [ -f "frontend/next.config.js" ]; then
    echo "  ℹ️  Solo existe next.config.js (mantener si es necesario)"
else
    echo "  ✅ Configuración de Next.js OK"
fi

# Verificar postcss.config
if [ -f "frontend/postcss.config.js" ] && [ -f "frontend/postcss.config.mjs" ]; then
    echo "  ⚠️  Detectados postcss.config.js y postcss.config.mjs"
    echo "  ❌ Eliminando postcss.config.js (PostCSS prioriza .mjs)"
    rm "frontend/postcss.config.js"
    echo "  ✅ Eliminado"
elif [ -f "frontend/postcss.config.js" ]; then
    echo "  ℹ️  Solo existe postcss.config.js (mantener si es necesario)"
else
    echo "  ✅ Configuración de PostCSS OK"
fi

# ============================================
# 3. CONSOLIDAR CSS (BAJO)
# ============================================
echo ""
echo "🎨 Verificando archivos CSS..."

if [ -f "$FRONTEND_DIR/styles/globals.css" ] && [ -f "$FRONTEND_DIR/app/globals.css" ]; then
    echo "  ⚠️  Detectados dos archivos globals.css"
    echo "  📝 Contenido de styles/globals.css:"
    cat "$FRONTEND_DIR/styles/globals.css" | head -5
    echo ""
    echo "  ⚠️  ACCIÓN MANUAL REQUERIDA:"
    echo "     - Revisar contenido de styles/globals.css"
    echo "     - Copiar estilos necesarios a app/globals.css"
    echo "     - Eliminar styles/globals.css manualmente"
elif [ -f "$FRONTEND_DIR/styles/globals.css" ]; then
    echo "  ⚠️  Solo existe styles/globals.css (mover a app/globals.css)"
else
    echo "  ✅ CSS consolidado correctamente"
fi

# Eliminar carpeta styles/ si está vacía
if [ -d "$FRONTEND_DIR/styles" ] && [ -z "$(ls -A $FRONTEND_DIR/styles)" ]; then
    echo "  ❌ Eliminando carpeta styles/ vacía"
    rmdir "$FRONTEND_DIR/styles"
    echo "  ✅ Eliminada"
fi

# ============================================
# 4. VERIFICAR ARCHIVOS LEGACY (INFO)
# ============================================
echo ""
echo "📋 Verificando archivos legacy..."

if [ -f "$FRONTEND_DIR/lib/api.ts" ]; then
    echo "  ⚠️  lib/api.ts existe (legacy, usar api-client.ts)"
    echo "     → Acción: Deprecar y migrar usos"
else
    echo "  ✅ lib/api.ts no existe"
fi

if [ -f "$FRONTEND_DIR/components/ChatWidget.tsx" ]; then
    echo "  ⚠️  components/ChatWidget.tsx existe (legacy)"
    echo "     → Acción: Verificar si se usa, eliminar si no"
else
    echo "  ✅ ChatWidget.tsx no existe"
fi

# ============================================
# RESUMEN
# ============================================
echo ""
echo "✅ Limpieza completada"
echo ""
echo "📊 Resumen:"
echo "  - Componentes duplicados: Eliminados"
echo "  - Configuración duplicada: Verificada"
echo "  - CSS: Requiere revisión manual"
echo "  - Archivos legacy: Verificados (requieren migración)"
echo ""
echo "📝 Próximos pasos:"
echo "  1. Revisar y consolidar CSS manualmente"
echo "  2. Deprecar lib/api.ts y migrar usos"
echo "  3. Verificar ChatWidget.tsx y eliminar si no se usa"
echo "  4. Ejecutar: npm run build (verificar que todo funciona)"
echo ""

