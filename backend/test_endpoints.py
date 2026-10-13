import asyncio
import os
import sys
import time
import httpx

# If a live URL is provided as an argument or env var, use it; otherwise test in-memory via ASGITransport
BASE_URL = sys.argv[1] if len(sys.argv) > 1 else os.getenv("BASE_URL")


async def create_client():
    if BASE_URL:
        return httpx.AsyncClient(base_url=BASE_URL.rstrip("/"), timeout=5.0)
    # Zero-setup fallback: direct in-memory ASGI dispatch against the FastAPI app
    from app.main import app
    return httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test", timeout=5.0)


async def test_get_routes(client: httpx.AsyncClient):
    start = time.perf_counter()
    res = await client.get("/api/routes")
    elapsed = time.perf_counter() - start

    assert res.status_code == 200, f"/api/routes returned {res.status_code}: {res.text}"
    data = res.json()
    assert "routes" in data and len(data["routes"]) > 0, "Invalid /api/routes payload"
    return f"  [PASS] GET  /api/routes   -> {res.status_code} ({elapsed * 1000:.1f}ms, {len(data['routes'])} routes)"


async def test_post_evaluate(client: httpx.AsyncClient):
    payload = {"selected_route_id": "route_balanced"}
    start = time.perf_counter()
    res = await client.post("/api/evaluate", json=payload)
    elapsed = time.perf_counter() - start

    assert res.status_code == 200, f"/api/evaluate returned {res.status_code}: {res.text}"
    data = res.json()
    assert "recommended_route_id" in data, "Invalid /api/evaluate payload: missing recommended_route_id"
    return f"  [PASS] POST /api/evaluate -> {res.status_code} ({elapsed * 1000:.1f}ms, rec: '{data.get('recommended_route_id')}')"


async def main():
    target_desc = BASE_URL if BASE_URL else "Local FastAPI App (ASGI in-memory)"
    print(f"\n[IceGuard API Verifier] Target: {target_desc}")

    overall_start = time.perf_counter()

    async with await create_client() as client:
        # Run both endpoint checks concurrently to guarantee < 5s total execution
        results = await asyncio.gather(test_get_routes(client), test_post_evaluate(client))

    total_time = time.perf_counter() - overall_start

    for r in results:
        print(r)

    print(f"\nTotal verification time: {total_time:.2f}s")
    assert total_time < 5.0, f"Execution exceeded 5s threshold ({total_time:.2f}s)"
    print("All checks passed successfully.\n")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except AssertionError as err:
        print(f"\n[FAIL] {err}\n", file=sys.stderr)
        sys.exit(1)
    except Exception as err:
        print(f"\n[ERROR] {err}\n", file=sys.stderr)
        sys.exit(1)
