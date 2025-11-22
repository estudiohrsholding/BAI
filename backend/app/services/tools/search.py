import os
import httpx
from typing import Optional


async def search_brave(query: str, limit: int = 5) -> str:
  """
  Perform a web search using the Brave Search API.
  
  Args:
    query: The search query string
    limit: Maximum number of results to return (default: 5, max: 20)
    
  Returns:
    A formatted string containing search results suitable for LLM consumption.
    Format: "Source 1: [Title] - [Description] (URL)"
    
    Returns error message string if search fails.
  """
  # Get API key from environment
  api_key = os.environ.get("BRAVE_API_KEY")
  
  if not api_key:
    return "Search failed: BRAVE_API_KEY environment variable is not set."
  
  # Ensure limit is within valid range (Brave API typically allows 1-20)
  limit = max(1, min(limit, 20))
  
  try:
    # Brave Search API endpoint
    url = "https://api.search.brave.com/res/v1/web/search"
    
    # Request parameters
    params = {
      "q": query,
      "count": limit
    }
    
    # Request headers
    headers = {
      "X-Subscription-Token": api_key,
      "Accept": "application/json"
    }
    
    # Make async HTTP GET request
    async with httpx.AsyncClient(timeout=10.0) as client:
      response = await client.get(url, params=params, headers=headers)
      response.raise_for_status()
      
      # Parse JSON response
      data = response.json()
      
      # Extract web results
      web_results = data.get("web", {}).get("results", [])
      
      if not web_results:
        return f"No search results found for query: {query}"
      
      # Format results as a readable string for LLM
      formatted_results = []
      for idx, result in enumerate(web_results, start=1):
        title = result.get("title", "No title")
        description = result.get("description", "No description")
        url = result.get("url", "No URL")
        
        formatted_results.append(
          f"Source {idx}: {title} - {description} ({url})"
        )
      
      # Join all results with newlines
      return "\n".join(formatted_results)
      
  except httpx.TimeoutException:
    return f"Search failed: Request timeout while searching for '{query}'."
  except httpx.HTTPStatusError as e:
    return f"Search failed: HTTP {e.response.status_code} - {e.response.text[:200]}"
  except httpx.RequestError as e:
    return f"Search failed: Network error - {str(e)}"
  except KeyError as e:
    return f"Search failed: Unexpected API response format - missing key: {str(e)}"
  except Exception as e:
    return f"Search failed: Unexpected error - {str(e)}"

