#!/usr/bin/env python3
"""
Script Python para crear usuario administrador en producción.

USO:
    python scripts/create_admin_user.py

Este script usa SQLModel para crear el usuario directamente,
asegurándose de que todos los campos estén correctamente configurados.
"""

import sys
import os
from pathlib import Path

# Añadir el directorio backend al path
backend_dir = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from sqlmodel import Session, select
from app.core.database import engine
from app.core.security import get_password_hash
from app.models.user import User, PlanTier, SubscriptionStatus


def create_admin_user(
    email: str = "admin@club.com",
    password: str = "admin_prod_password",
    full_name: str = "Administrador B.A.I.",
    plan_tier: PlanTier = PlanTier.PARTNER,
    role: str = "admin"
) -> User:
    """
    Crea o actualiza un usuario administrador en la base de datos.
    
    Args:
        email: Email del usuario administrador
        password: Contraseña en texto plano (será hasheada)
        full_name: Nombre completo del usuario
        plan_tier: Plan de suscripción (default: PARTNER)
        role: Rol del usuario (default: "admin")
    
    Returns:
        User: Usuario creado o actualizado
    """
    with Session(engine) as session:
        # Verificar si el usuario ya existe
        statement = select(User).where(User.email == email)
        existing_user = session.exec(statement).first()
        
        # Hashear la contraseña
        hashed_password = get_password_hash(password)
        
        if existing_user:
            # Actualizar usuario existente
            print(f"⚠️  Usuario {email} ya existe. Actualizando...")
            existing_user.hashed_password = hashed_password
            existing_user.full_name = full_name
            existing_user.plan_tier = plan_tier
            existing_user.subscription_status = SubscriptionStatus.ACTIVE
            existing_user.role = role
            existing_user.is_active = True
            
            session.add(existing_user)
            session.commit()
            session.refresh(existing_user)
            
            print(f"✅ Usuario {email} actualizado correctamente")
            return existing_user
        else:
            # Crear nuevo usuario
            print(f"📝 Creando nuevo usuario administrador: {email}")
            new_user = User(
                email=email,
                hashed_password=hashed_password,
                full_name=full_name,
                plan_tier=plan_tier,
                subscription_status=SubscriptionStatus.ACTIVE,
                role=role,
                is_active=True
            )
            
            session.add(new_user)
            session.commit()
            session.refresh(new_user)
            
            print(f"✅ Usuario {email} creado correctamente")
            return new_user


def main():
    """Función principal del script."""
    print("=" * 70)
    print("CREACIÓN DE USUARIO ADMINISTRADOR")
    print("=" * 70)
    print()
    
    try:
        user = create_admin_user()
        
        print()
        print("=" * 70)
        print("✅ USUARIO CREADO EXITOSAMENTE")
        print("=" * 70)
        print(f"ID: {user.id}")
        print(f"Email: {user.email}")
        print(f"Nombre: {user.full_name}")
        print(f"Plan: {user.plan_tier.value}")
        print(f"Rol: {user.role}")
        print(f"Estado: {'Activo' if user.is_active else 'Inactivo'}")
        print()
        print("=" * 70)
        print("CREDENCIALES DE ACCESO:")
        print("=" * 70)
        print(f"Email: admin@club.com")
        print(f"Contraseña: admin_prod_password")
        print("=" * 70)
        
    except Exception as e:
        print(f"❌ Error al crear usuario: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()

