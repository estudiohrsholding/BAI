"""
Stress Test Script - Verifica que las tareas pesadas en background
no bloqueen la latencia de la API principal.

Escenario:
- Thread A (Load): Encola 20 tareas pesadas en paralelo.
- Thread B (Control): Pinge /api/v1/health cada 0.5s mientras se
  encolan las tareas y mide la latencia.

Requisitos:
- Python 3.11+
- httpx (instalado en backend requirements)

Uso:
    python scripts/stress_test.py --base-url http://localhost:8000
"""

from __future__ import annotations

import argparse
import asyncio
import json
import statistics
import time
from dataclasses import dataclass, field
from typing import List

import httpx


HEAVY_TASK_ENDPOINT = "/api/v1/utils/tasks/heavy"
HEALTH_ENDPOINT = "/api/v1/health"


@dataclass
class HealthSample:
    timestamp: float
    latency_ms: float
    status: str


@dataclass
class StressTestResult:
    queued_tasks: int = 0
    successful_queues: int = 0
    failed_queues: int = 0
    health_samples: List[HealthSample] = field(default_factory=list)

    @property
    def health_latency_p95(self) -> float:
        if not self.health_samples:
            return 0.0
        latencies = sorted(sample.latency_ms for sample in self.health_samples)
        index = int(len(latencies) * 0.95) - 1
        index = max(0, min(index, len(latencies) - 1))
        return latencies[index]

    @property
    def api_availability(self) -> float:
        if not self.health_samples:
            return 0.0
        healthy = sum(1 for sample in self.health_samples if sample.status == "healthy")
        return (healthy / len(self.health_samples)) * 100


async def enqueue_heavy_task(client: httpx.AsyncClient, base_url: str, payload: dict) -> bool:
    """Encola una tarea pesada y retorna True si fue exitosa."""
    url = f"{base_url}{HEAVY_TASK_ENDPOINT}"
    try:
        response = await client.post(url, json=payload, timeout=10.0)
        response.raise_for_status()
        return True
    except httpx.HTTPError as exc:
        print(f"[ERROR] Falló enqueue task: {exc}")
        return False


async def monitor_health(client: httpx.AsyncClient, base_url: str, running_event: asyncio.Event, result: StressTestResult) -> None:
    """Pinge el health endpoint cada 0.5s mientras running_event esté activo."""
    url = f"{base_url}{HEALTH_ENDPOINT}"
    while running_event.is_set():
        start = time.perf_counter()
        status_label = "down"
        try:
            response = await client.get(url, timeout=5.0)
            latency_ms = (time.perf_counter() - start) * 1000
            if response.is_success:
                data = response.json()
                status_label = data.get("status", "unknown")
            else:
                latency_ms = (time.perf_counter() - start) * 1000
        except httpx.HTTPError:
            latency_ms = (time.perf_counter() - start) * 1000
        result.health_samples.append(
            HealthSample(timestamp=time.time(), latency_ms=latency_ms, status=status_label)
        )
        await asyncio.sleep(0.5)


async def run_stress_test(base_url: str, concurrent_tasks: int, payload: dict) -> StressTestResult:
    """
    Ejecuta el stress test:
    - Encola concurrent_tasks tareas pesadas.
    - Monitorea health en paralelo.
    """
    result = StressTestResult(queued_tasks=concurrent_tasks)
    running_event = asyncio.Event()
    running_event.set()

    async with httpx.AsyncClient() as client:
        # Lanzar monitor de salud
        health_task = asyncio.create_task(monitor_health(client, base_url, running_event, result))

        # Lanzar enqueue tasks en paralelo
        enqueue_tasks = [
            enqueue_heavy_task(
                client,
                base_url,
                payload | {"task_name": f"stress_task_{i+1}", "duration_seconds": 5},
            )
            for i in range(concurrent_tasks)
        ]

        enqueue_results = await asyncio.gather(*enqueue_tasks)

        # Actualizar métricas
        result.successful_queues = sum(1 for success in enqueue_results if success)
        result.failed_queues = concurrent_tasks - result.successful_queues

        # Esperar breve tiempo adicional para capturar salud post carga
        await asyncio.sleep(2)
        running_event.clear()
        await health_task

    return result


def print_summary(result: StressTestResult) -> None:
    """Imprime una tabla simple con los resultados."""
    print("\n=== Stress Test Summary ===")
    print(f"Tareas encoladas: {result.queued_tasks}")
    print(f"Tareas exitosas: {result.successful_queues}/{result.queued_tasks}")
    print(f"Latencia P95 Health: {result.health_latency_p95:.2f} ms")
    print(f"Disponibilidad API (health OK): {result.api_availability:.2f}%")
    print("\nMuestras de Health (primeras 10):")
    for sample in result.health_samples[:10]:
        ts = time.strftime("%H:%M:%S", time.localtime(sample.timestamp))
        print(f"- [{ts}] {sample.status.upper():8} | {sample.latency_ms:.2f} ms")

    print("\nMétricas JSON:")
    print(
        json.dumps(
            {
                "queued_tasks": result.queued_tasks,
                "successful_queues": result.successful_queues,
                "failed_queues": result.failed_queues,
                "health_latency_p95_ms": round(result.health_latency_p95, 2),
                "api_availability_pct": round(result.api_availability, 2),
            },
            indent=2,
        )
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Stress test para workers y health check")
    parser.add_argument(
        "--base-url",
        default="http://localhost:8000",
        help="URL base del backend (default: http://localhost:8000)",
    )
    parser.add_argument(
        "--concurrency",
        type=int,
        default=20,
        help="Número de tareas pesadas a encolar en paralelo (default: 20)",
    )
    parser.add_argument(
        "--duration",
        type=int,
        default=5,
        help="Duración simulada de cada tarea pesada en segundos (default: 5)",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    payload = {
        "duration_seconds": args.duration,
        "simulate_work": True,
    }
    print("Iniciando stress test...")
    print(f"- Base URL: {args.base_url}")
    print(f"- Concurrency: {args.concurrency}")
    print(f"- Task duration: {args.duration}s")

    result = asyncio.run(run_stress_test(args.base_url, args.concurrency, payload))
    print_summary(result)


if __name__ == "__main__":
    main()

