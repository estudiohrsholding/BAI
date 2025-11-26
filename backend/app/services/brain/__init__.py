"""
Brain Services Module

Modular architecture for B.A.I. neural processing.
Separates concerns: Prompts, Tools, Memory, and Core Neural Engine.
"""

from app.services.brain.prompts import PromptManager
from app.services.brain.tools import ToolExecutor, ToolResult
from app.services.brain.memory import MemoryService
from app.services.brain.core import NeuralCore, EmailCommandHandler

__all__ = [
    "PromptManager",
    "ToolExecutor",
    "ToolResult",
    "MemoryService",
    "NeuralCore",
    "EmailCommandHandler",
]

