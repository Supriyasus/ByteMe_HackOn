from fastapi import APIRouter

router = APIRouter()

@router.get("/api/metrics")
async def get_metrics():
    return {
        "total_listings": 15890,
        "counterfeit_flagged_pct": 6.2,
        "fake_review_pct": 12.4,
        "avg_trust_score": 84.3,
        "return_flags_today": 27,
        "review_timeline": {
            "labels": ["Mon", "Tue", "Wed", "Thu", "Fri"],
            "data": [12, 17, 10, 26, 33]
        },
        "category_distribution": {
            "labels": ["Fashion", "Electronics", "Beauty", "Books", "Toys"],
            "data": [22, 34, 15, 5, 18]
        },
        "recent_events": [
            {"time": "2025-06-20 13:22", "event": "Fake Review", "entity": "REV-78213", "status": "Flagged"},
            {"time": "2025-06-20 13:10", "event": "Counterfeit", "entity": "PROD-56231", "status": "Escalated"},
            {"time": "2025-06-20 12:50", "event": "Complaint", "entity": "ORD-18277", "status": "Resolved"},
        ]
    }
