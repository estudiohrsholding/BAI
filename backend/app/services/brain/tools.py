"""
Tool Executor

Detects and executes external tools (n8n, Brave Search) based on user input.
Separates tool detection and execution from neural processing.
"""

import json
import httpx
from typing import Optional, Dict, Any
from dataclasses import dataclass

from app.services.tools.search import search_brave


@dataclass
class ToolResult:
    """Result of tool execution."""
    executed: bool
    context_update: Optional[str] = None
    tool_name: Optional[str] = None
    error: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class ToolExecutor:
    """Executes external tools based on user input detection."""
    
    # n8n trigger keywords
    N8N_KEYWORDS = ["diagnostico", "test"]
    
    # Search trigger keywords
    SEARCH_KEYWORDS = ["busca", "investiga", "analiza", "search", "find", "encuentra", "noticias"]
    
    # n8n webhook URL
    N8N_WEBHOOK_URL = "http://n8n:5678/webhook/test"
    N8N_TIMEOUT = 10.0
    
    @classmethod
    async def detect_and_execute(
        cls, 
        user_input: str, 
        user_id: Optional[int] = None,
        session: Optional[Any] = None
    ) -> ToolResult:
        """
        Detect tool intent and execute if applicable.
        Priority: n8n > Brave Search
        
        Args:
            user_input: The user's message
            user_id: User ID for logging (optional)
            session: Database session for logging (optional)
            
        Returns:
            ToolResult with execution status and context update
        """
        input_lower = user_input.lower()
        
        # Priority 1: Check for n8n automation tool
        n8n_result = await cls._try_n8n(user_input, input_lower)
        if n8n_result.executed:
            return n8n_result
        
        # Priority 2: Check for Brave Search tool
        search_result = await cls._try_search(user_input, input_lower, user_id, session)
        if search_result.executed:
            return search_result
        
        # No tool executed
        return ToolResult(executed=False)
    
    @classmethod
    async def _try_n8n(cls, user_input: str, input_lower: str) -> ToolResult:
        """Try to execute n8n workflow if keywords detected."""
        # Check for n8n keywords
        if not any(keyword in input_lower for keyword in cls.N8N_KEYWORDS):
            return ToolResult(executed=False)
        
        try:
            async with httpx.AsyncClient(timeout=cls.N8N_TIMEOUT) as client:
                response = await client.post(
                    cls.N8N_WEBHOOK_URL,
                    json={"user_input": user_input}
                )
                response.raise_for_status()
                n8n_data = response.json()
                
                # Build context update for Gemini
                context_update = (
                    f"System Update: The user requested a system test. "
                    f"I executed the n8n workflow. The tool returned: {json.dumps(n8n_data)}. "
                    f"Please inform the user of this result naturally."
                )
                
                return ToolResult(
                    executed=True,
                    context_update=context_update,
                    tool_name="n8n",
                    metadata={"n8n_data": n8n_data}
                )
                
        except httpx.TimeoutException:
            return ToolResult(
                executed=True,
                context_update=(
                    f"System Update: The user requested a system test. "
                    f"I tried to execute the n8n workflow, but it timed out. "
                    f"Please inform the user that the automation engine took too long to respond."
                ),
                tool_name="n8n",
                error="Timeout"
            )
        except httpx.RequestError as e:
            return ToolResult(
                executed=True,
                context_update=(
                    f"System Update: The user requested a system test. "
                    f"I tried to execute the n8n workflow, but the automation engine is offline. "
                    f"Connection error: {str(e)}. "
                    f"Please inform the user that the automation engine is currently unavailable."
                ),
                tool_name="n8n",
                error=f"Connection error: {str(e)}"
            )
        except httpx.HTTPStatusError as e:
            return ToolResult(
                executed=True,
                context_update=(
                    f"System Update: The user requested a system test. "
                    f"I tried to execute the n8n workflow, but it returned HTTP {e.response.status_code}. "
                    f"Please inform the user that the automation engine returned an error."
                ),
                tool_name="n8n",
                error=f"HTTP {e.response.status_code}"
            )
        except Exception as e:
            return ToolResult(
                executed=True,
                context_update=(
                    f"System Update: The user requested a system test. "
                    f"I tried to execute the n8n workflow, but an unexpected error occurred: {str(e)}. "
                    f"Please inform the user that the automation engine encountered an error."
                ),
                tool_name="n8n",
                error=f"Unexpected error: {str(e)}"
            )
    
    @classmethod
    async def _try_search(
        cls, 
        user_input: str, 
        input_lower: str,
        user_id: Optional[int] = None,
        session: Optional[Any] = None
    ) -> ToolResult:
        """Try to execute Brave Search if keywords detected."""
        # Check for search keywords
        detected_keyword = None
        for keyword in cls.SEARCH_KEYWORDS:
            if keyword in input_lower:
                detected_keyword = keyword
                break
        
        if not detected_keyword:
            return ToolResult(executed=False)
        
        # Extract search query
        query_parts = input_lower.split(detected_keyword, 1)
        if len(query_parts) > 1:
            search_query = query_parts[1].strip()
        else:
            search_query = user_input.strip()
        
        if not search_query:
            return ToolResult(executed=False)
        
        # Execute search
        search_results = await search_brave(search_query, limit=5)
        
        # Log search to database if session provided
        if session and user_id:
            from app.models.log import SearchLog
            if search_results and not search_results.startswith("Search failed"):
                summary = search_results[:500] if len(search_results) > 500 else search_results
                log_entry = SearchLog(
                    query=search_query,
                    summary=summary,
                    status="completed",
                    user_id=user_id
                )
                session.add(log_entry)
                session.commit()
            else:
                log_entry = SearchLog(
                    query=search_query,
                    summary=f"Search failed: {search_results[:200] if search_results else 'Unknown error'}",
                    status="failed",
                    user_id=user_id
                )
                session.add(log_entry)
                session.commit()
        
        # Build context update for Gemini
        if search_results and not search_results.startswith("Search failed"):
            context_update = (
                f"System Context: I have performed a web search for you. "
                f"Here are the results:\n{search_results}\n\n"
                f"Based on these results and your knowledge, answer the user's request: {user_input}"
            )
            
            return ToolResult(
                executed=True,
                context_update=context_update,
                tool_name="brave_search",
                metadata={"query": search_query, "results_count": len(search_results.split('\n'))}
            )
        else:
            # Search failed, but we still executed the tool
            return ToolResult(
                executed=True,
                context_update=user_input,  # Fallback to original input
                tool_name="brave_search",
                error="Search failed",
                metadata={"query": search_query}
            )

