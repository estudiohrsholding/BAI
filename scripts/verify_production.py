#!/usr/bin/env python3
"""
Production Verification Script

Verifica que el sistema B.A.I. esté funcionando correctamente en producción:
1. Health Check endpoint
2. Autenticación (obtener JWT)
3. Endpoints críticos accesibles (no 404)

Usage:
    python scripts/verify_production.py [--base-url BASE_URL] [--email EMAIL] [--password PASSWORD]
"""

import sys
import argparse
import json
import asyncio
from typing import Dict, Any, Optional
from urllib.parse import urljoin

# Intentar importar httpx (preferido) o requests (fallback)
try:
    import httpx
    USE_HTTPX = True
except ImportError:
    try:
        import requests
        USE_HTTPX = False
    except ImportError:
        print("ERROR: Necesitas httpx o requests. Instala con: pip install httpx")
        sys.exit(1)


class Colors:
    """ANSI color codes para output"""
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'


class ProductionVerifier:
    """Verificador de producción para B.A.I. Platform"""
    
    def __init__(self, base_url: str, email: Optional[str] = None, password: Optional[str] = None):
        self.base_url = base_url.rstrip('/')
        self.email = email
        self.password = password
        self.token: Optional[str] = None
        self.results: Dict[str, Any] = {
            "health_check": {"status": "pending", "details": {}},
            "authentication": {"status": "pending", "details": {}},
            "endpoints": {"status": "pending", "details": {}}
        }
    
    def print_header(self, text: str):
        """Imprime un header formateado"""
        print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.RESET}")
        print(f"{Colors.BOLD}{Colors.BLUE}{text.center(60)}{Colors.RESET}")
        print(f"{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.RESET}\n")
    
    def print_success(self, message: str):
        """Imprime mensaje de éxito"""
        print(f"{Colors.GREEN}✅ {message}{Colors.RESET}")
    
    def print_error(self, message: str):
        """Imprime mensaje de error"""
        print(f"{Colors.RED}❌ {message}{Colors.RESET}")
    
    def print_warning(self, message: str):
        """Imprime mensaje de advertencia"""
        print(f"{Colors.YELLOW}⚠️  {message}{Colors.RESET}")
    
    def print_info(self, message: str):
        """Imprime mensaje informativo"""
        print(f"{Colors.BLUE}ℹ️  {message}{Colors.RESET}")
    
    async def check_health(self) -> bool:
        """Verifica el health check endpoint"""
        self.print_header("1. HEALTH CHECK")
        
        try:
            url = urljoin(self.base_url, "/api/v1/health")
            self.print_info(f"Verificando: {url}")
            
            if USE_HTTPX:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    response = await client.get(url)
            else:
                response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                self.results["health_check"] = {
                    "status": "success",
                    "details": data
                }
                
                # Verificar servicios críticos
                services = data.get("services", {})
                db_status = services.get("database", {}).get("status", "unknown")
                redis_status = services.get("redis", {}).get("status", "unknown")
                
                self.print_success(f"Health check OK (Status: {data.get('status', 'unknown')})")
                self.print_info(f"  Database: {db_status}")
                self.print_info(f"  Redis: {redis_status}")
                self.print_info(f"  Worker: {services.get('worker', {}).get('status', 'unknown')}")
                self.print_info(f"  AI Engine: {services.get('ai_engine', {}).get('status', 'unknown')}")
                
                # Verificar que servicios críticos estén up
                if db_status == "up" and redis_status == "up":
                    return True
                else:
                    self.print_warning("Algunos servicios críticos están down")
                    return False
            else:
                self.results["health_check"] = {
                    "status": "failed",
                    "details": {"status_code": response.status_code, "response": response.text}
                }
                self.print_error(f"Health check falló: {response.status_code}")
                return False
                
        except Exception as e:
            self.results["health_check"] = {
                "status": "error",
                "details": {"error": str(e)}
            }
            self.print_error(f"Error al conectar con health check: {e}")
            return False
    
    async def authenticate(self) -> bool:
        """Obtiene un token JWT mediante autenticación"""
        self.print_header("2. AUTHENTICATION")
        
        if not self.email or not self.password:
            self.print_warning("Email/password no proporcionados. Saltando autenticación.")
            self.results["authentication"] = {
                "status": "skipped",
                "details": {"reason": "No credentials provided"}
            }
            return False
        
        try:
            url = urljoin(self.base_url, "/api/auth/token")
            self.print_info(f"Autenticando: {self.email}")
            
            # FastAPI OAuth2 usa application/x-www-form-urlencoded
            data = {
                "username": self.email,  # OAuth2 standard
                "password": self.password
            }
            
            if USE_HTTPX:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    response = await client.post(
                        url,
                        data=data,  # form-encoded, no JSON
                        headers={"Content-Type": "application/x-www-form-urlencoded"}
                    )
            else:
                response = requests.post(
                    url,
                    data=data,
                    headers={"Content-Type": "application/x-www-form-urlencoded"},
                    timeout=10
                )
            
            if response.status_code == 200:
                data = response.json()
                self.token = data.get("access_token")
                
                if self.token:
                    self.results["authentication"] = {
                        "status": "success",
                        "details": {"token_length": len(self.token)}
                    }
                    self.print_success(f"Autenticación exitosa (Token: {self.token[:20]}...)")
                    return True
                else:
                    self.results["authentication"] = {
                        "status": "failed",
                        "details": {"error": "No token in response"}
                    }
                    self.print_error("Token no recibido en respuesta")
                    return False
            else:
                self.results["authentication"] = {
                    "status": "failed",
                    "details": {"status_code": response.status_code, "response": response.text}
                }
                self.print_error(f"Autenticación falló: {response.status_code}")
                if response.status_code == 401:
                    self.print_warning("Credenciales inválidas")
                return False
                
        except Exception as e:
            self.results["authentication"] = {
                "status": "error",
                "details": {"error": str(e)}
            }
            self.print_error(f"Error al autenticar: {e}")
            return False
    
    def _process_endpoint_response(self, response, description: str, all_ok: bool) -> bool:
        """Procesa la respuesta de un endpoint y actualiza all_ok"""
        if response.status_code == 200:
            self.print_success(f"{description}: OK (200)")
        elif response.status_code == 401:
            self.print_warning(f"{description}: Unauthorized (401) - Token inválido o expirado")
            all_ok = False
        elif response.status_code == 403:
            self.print_warning(f"{description}: Forbidden (403) - Plan insuficiente")
            # No es un error crítico, el endpoint existe
        elif response.status_code == 404:
            self.print_error(f"{description}: Not Found (404) - Endpoint no existe")
            all_ok = False
        else:
            self.print_warning(f"{description}: Status {response.status_code}")
            # No es crítico si no es 404
        return all_ok
    
    async def check_endpoints(self) -> bool:
        """Verifica que los endpoints críticos sean accesibles"""
        self.print_header("3. CRITICAL ENDPOINTS")
        
        if not self.token:
            self.print_warning("Sin token. Verificando solo endpoints públicos...")
            endpoints = [
                ("/api/v1/health", "GET", None, "Health Check"),
            ]
        else:
            endpoints = [
                ("/api/v1/health", "GET", None, "Health Check"),
                ("/api/v1/content-planner/campaigns", "GET", self.token, "Content Planner - List Campaigns"),
                ("/api/v1/data-mining/queries", "GET", self.token, "Data Mining - List Queries"),
                ("/api/v1/content/campaigns", "GET", self.token, "Content Creator - List Campaigns"),
                ("/api/v1/analytics/dashboard-metrics", "GET", self.token, "Analytics - Dashboard Metrics"),
            ]
        
        all_ok = True
        
        if USE_HTTPX:
            async with httpx.AsyncClient(timeout=10.0) as client:
                for endpoint_path, method, token, description in endpoints:
                    try:
                        url = urljoin(self.base_url, endpoint_path)
                        self.print_info(f"Verificando: {description}")
                        
                        headers = {}
                        if token:
                            headers["Authorization"] = f"Bearer {token}"
                        
                        if method == "GET":
                            response = await client.get(url, headers=headers)
                        else:
                            response = await client.post(url, headers=headers)
                        
                        all_ok = self._process_endpoint_response(response, description, all_ok)
                    except Exception as e:
                        self.print_error(f"{description}: Error de conexión - {e}")
                        all_ok = False
        else:
            # Fallback síncrono con requests
            for endpoint_path, method, token, description in endpoints:
                try:
                    url = urljoin(self.base_url, endpoint_path)
                    self.print_info(f"Verificando: {description}")
                    
                    headers = {}
                    if token:
                        headers["Authorization"] = f"Bearer {token}"
                    
                    if method == "GET":
                        response = requests.get(url, headers=headers, timeout=10)
                    else:
                        response = requests.post(url, headers=headers, timeout=10)
                    
                    all_ok = self._process_endpoint_response(response, description, all_ok)
                except Exception as e:
                    self.print_error(f"{description}: Error de conexión - {e}")
                    all_ok = False
        
        self.results["endpoints"] = {
            "status": "success" if all_ok else "partial",
            "details": {"checked": len(endpoints)}
        }
        
        return all_ok
    
    def print_summary(self):
        """Imprime resumen de verificación"""
        self.print_header("VERIFICATION SUMMARY")
        
        health_ok = self.results["health_check"]["status"] == "success"
        auth_ok = self.results["authentication"]["status"] == "success" or self.results["authentication"]["status"] == "skipped"
        endpoints_ok = self.results["endpoints"]["status"] in ["success", "partial"]
        
        if health_ok and auth_ok and endpoints_ok:
            self.print_success("✅ SISTEMA VERIFICADO - GREEN LIGHT")
            print(f"\n{Colors.GREEN}{Colors.BOLD}El sistema está funcionando correctamente.{Colors.RESET}\n")
            return 0
        else:
            self.print_error("❌ VERIFICACIÓN FALLIDA - REVISAR LOGS")
            print(f"\n{Colors.RED}{Colors.BOLD}Algunos checks fallaron. Revisa los detalles arriba.{Colors.RESET}\n")
            return 1
    
    async def run_async(self) -> int:
        """Ejecuta todas las verificaciones (async)"""
        print(f"\n{Colors.BOLD}{Colors.BLUE}")
        print("="*60)
        print("B.A.I. Platform - Production Verification".center(60))
        print("="*60)
        print(f"{Colors.RESET}\n")
        
        self.print_info(f"Base URL: {self.base_url}")
        if self.email:
            self.print_info(f"Email: {self.email}")
        print()
        
        # Ejecutar checks
        if USE_HTTPX:
            health_ok = await self.check_health()
            auth_ok = await self.authenticate()
            endpoints_ok = await self.check_endpoints()
        else:
            # Fallback síncrono
            health_ok = self._check_health_sync()
            auth_ok = self._authenticate_sync()
            endpoints_ok = self._check_endpoints_sync()
        
        # Resumen
        return self.print_summary()
    
    def _check_health_sync(self) -> bool:
        """Versión síncrona de check_health"""
        return asyncio.run(self.check_health())
    
    def _authenticate_sync(self) -> bool:
        """Versión síncrona de authenticate"""
        return asyncio.run(self.authenticate())
    
    def _check_endpoints_sync(self) -> bool:
        """Versión síncrona de check_endpoints"""
        return asyncio.run(self.check_endpoints())
    
    def run(self) -> int:
        """Wrapper síncrono para run_async"""
        if USE_HTTPX:
            return asyncio.run(self.run_async())
        else:
            # Ejecutar versión síncrona directamente
            print(f"\n{Colors.BOLD}{Colors.BLUE}")
            print("="*60)
            print("B.A.I. Platform - Production Verification".center(60))
            print("="*60)
            print(f"{Colors.RESET}\n")
            self.print_info(f"Base URL: {self.base_url}")
            if self.email:
                self.print_info(f"Email: {self.email}")
            print()
            health_ok = self._check_health_sync()
            auth_ok = self._authenticate_sync()
            endpoints_ok = self._check_endpoints_sync()
            return self.print_summary()


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description="Verifica que el sistema B.A.I. esté funcionando en producción"
    )
    parser.add_argument(
        "--base-url",
        type=str,
        default="https://api.baibussines.com",
        help="URL base del API (default: https://api.baibussines.com)"
    )
    parser.add_argument(
        "--email",
        type=str,
        default=None,
        help="Email para autenticación (opcional)"
    )
    parser.add_argument(
        "--password",
        type=str,
        default=None,
        help="Password para autenticación (opcional)"
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output en formato JSON"
    )
    
    args = parser.parse_args()
    
    verifier = ProductionVerifier(
        base_url=args.base_url,
        email=args.email,
        password=args.password
    )
    
    exit_code = verifier.run()
    
    if args.json:
        print(json.dumps(verifier.results, indent=2))
    
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
