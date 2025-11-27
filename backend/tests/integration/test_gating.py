"""
Integration Tests - Feature Gating End-to-End

Este módulo verifica que el sistema de Feature Gating funciona correctamente
tanto a nivel visual (Frontend) como a nivel de API (Backend).

Objetivo: Probar que un usuario con plan MOTOR no puede acceder a endpoints
que requieren CEREBRO o PARTNER, y que recibe el mensaje de error correcto.
"""

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, create_engine, SQLModel
from sqlmodel.pool import StaticPool

from app.main import app
from app.models.user import User, PlanTier
from app.core.security import create_access_token
from app.core.database import get_session


# Setup test database
@pytest.fixture(scope="function")
def test_db():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    
    with Session(engine) as session:
        yield session
    
    SQLModel.metadata.drop_all(engine)


@pytest.fixture
def client(test_db: Session):
    def override_get_session():
        yield test_db
    
    app.dependency_overrides[get_session] = override_get_session
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture
def motor_user(test_db: Session) -> User:
    """Crea un usuario con plan MOTOR para testing."""
    from app.core.security import get_password_hash
    
    user = User(
        email="motor@test.com",
        hashed_password=get_password_hash("testpass123"),
        full_name="Motor User",
        plan_tier=PlanTier.MOTOR,
        subscription_status="active",
        is_active=True,
        role="client",
    )
    test_db.add(user)
    test_db.commit()
    test_db.refresh(user)
    return user


@pytest.fixture
def cerebro_user(test_db: Session) -> User:
    """Crea un usuario con plan CEREBRO para testing."""
    from app.core.security import get_password_hash
    
    user = User(
        email="cerebro@test.com",
        hashed_password=get_password_hash("testpass123"),
        full_name="Cerebro User",
        plan_tier=PlanTier.CEREBRO,
        subscription_status="active",
        is_active=True,
        role="client",
    )
    test_db.add(user)
    test_db.commit()
    test_db.refresh(user)
    return user


@pytest.fixture
def partner_user(test_db: Session) -> User:
    """Crea un usuario con plan PARTNER para testing."""
    from app.core.security import get_password_hash
    
    user = User(
        email="partner@test.com",
        hashed_password=get_password_hash("testpass123"),
        full_name="Partner User",
        plan_tier=PlanTier.PARTNER,
        subscription_status="active",
        is_active=True,
        role="client",
    )
    test_db.add(user)
    test_db.commit()
    test_db.refresh(user)
    return user


class TestFeatureGating:
    """
    Suite de tests para verificar el Feature Gating end-to-end.
    """
    
    def test_motor_user_cannot_access_mining_endpoint(self, client, motor_user):
        """
        Test: Usuario MOTOR intenta acceder a endpoint de Data Mining.
        Esperado: 403 Forbidden con mensaje de upgrade.
        """
        token = create_access_token(data={"sub": motor_user.email})
        headers = {"Authorization": f"Bearer {token}"}
        
        response = client.post(
            "/api/v1/mining/run-analysis",
            json={"topic": "test topic"},
            headers=headers,
        )
        
        assert response.status_code == 403
        data = response.json()
        assert "detail" in data
        assert "CEREBRO" in data["detail"] or "access_mining" in data["detail"]
        assert "error_type" in data
        assert data["error_type"] == "FeatureForbiddenError"
    
    def test_motor_user_cannot_access_ai_content_generation(self, client, motor_user):
        """
        Test: Usuario MOTOR intenta usar el chat (requiere ai_content_generation).
        Esperado: 403 Forbidden.
        """
        token = create_access_token(data={"sub": motor_user.email})
        headers = {"Authorization": f"Bearer {token}"}
        
        response = client.post(
            "/api/v1/chat/message",
            json={"text": "Hola", "client_id": "test"},
            headers=headers,
        )
        
        assert response.status_code == 403
        data = response.json()
        assert "CEREBRO" in data["detail"] or "ai_content_generation" in data["detail"]
    
    def test_cerebro_user_can_access_mining(self, client, cerebro_user):
        """
        Test: Usuario CEREBRO puede acceder a Data Mining.
        Esperado: 202 Accepted (o el código de éxito correspondiente).
        """
        token = create_access_token(data={"sub": cerebro_user.email})
        headers = {"Authorization": f"Bearer {token}"}
        
        response = client.post(
            "/api/v1/mining/run-analysis",
            json={"topic": "test topic"},
            headers=headers,
        )
        
        # Puede ser 202 (Accepted) o 200 (OK) dependiendo de la implementación
        assert response.status_code in [200, 202]
    
    def test_cerebro_user_can_access_chat(self, client, cerebro_user):
        """
        Test: Usuario CEREBRO puede usar el chat.
        Esperado: 200 OK.
        """
        token = create_access_token(data={"sub": cerebro_user.email})
        headers = {"Authorization": f"Bearer {token}"}
        
        response = client.post(
            "/api/v1/chat/message",
            json={"text": "Hola", "client_id": "test"},
            headers=headers,
        )
        
        # Puede fallar por otras razones (servicio no disponible, etc.)
        # pero NO debe ser 403
        assert response.status_code != 403
    
    def test_partner_user_has_full_access(self, client, partner_user):
        """
        Test: Usuario PARTNER tiene acceso completo a todos los endpoints.
        Esperado: Acceso exitoso a todos los endpoints protegidos.
        """
        token = create_access_token(data={"sub": partner_user.email})
        headers = {"Authorization": f"Bearer {token}"}
        
        # Test Mining
        mining_response = client.post(
            "/api/v1/mining/run-analysis",
            json={"topic": "test topic"},
            headers=headers,
        )
        assert mining_response.status_code in [200, 202]
        
        # Test Chat
        chat_response = client.post(
            "/api/v1/chat/message",
            json={"text": "Hola", "client_id": "test"},
            headers=headers,
        )
        assert chat_response.status_code != 403
    
    def test_requires_plan_dependency(self, client, motor_user):
        """
        Test: Verificar que requires_plan funciona correctamente.
        Endpoint: /api/v1/utils/guard/mining-access (requiere CEREBRO).
        """
        token = create_access_token(data={"sub": motor_user.email})
        headers = {"Authorization": f"Bearer {token}"}
        
        response = client.get(
            "/api/v1/utils/guard/mining-access",
            headers=headers,
        )
        
        assert response.status_code == 403
        data = response.json()
        assert "CEREBRO" in data["detail"]


class TestErrorMessages:
    """
    Verifica que los mensajes de error son informativos y guían al upgrade.
    """
    
    def test_feature_forbidden_error_message(self, client, motor_user):
        """
        Test: El mensaje de error debe mencionar el plan requerido.
        """
        token = create_access_token(data={"sub": motor_user.email})
        headers = {"Authorization": f"Bearer {token}"}
        
        response = client.post(
            "/api/v1/mining/run-analysis",
            json={"topic": "test"},
            headers=headers,
        )
        
        assert response.status_code == 403
        data = response.json()
        # El mensaje debe ser claro sobre qué plan se necesita
        assert "CEREBRO" in data["detail"] or "actualiza" in data["detail"].lower()


# Instrucciones para ejecutar los tests:
# 
# 1. Instalar dependencias de testing:
#    pip install pytest pytest-asyncio httpx
#
# 2. Ejecutar los tests:
#    pytest backend/tests/integration/test_gating.py -v
#
# 3. Ejecutar con coverage:
#    pytest backend/tests/integration/test_gating.py --cov=app --cov-report=html

