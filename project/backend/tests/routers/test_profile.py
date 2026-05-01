import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.config.database import get_db
from app.utils.security import create_access_token


@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    del app.dependency_overrides[get_db]


@pytest.fixture
def auth_headers(test_user):
    token = create_access_token(data={"sub": test_user.id})
    return {"Authorization": f"Bearer {token}"}


def test_get_literacy_radar_unauthorized(client):
    response = client.get("/api/profile/literacy-radar")
    assert response.status_code == 401


def test_get_literacy_radar_authenticated_empty(client, auth_headers):
    response = client.get("/api/profile/literacy-radar", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["overall_score"] is None
    assert data["level_text"] is None
    assert data["summary_text"] is None
    assert len(data["dimensions"]) == 8
    for dim in data["dimensions"]:
        assert dim["score"] is None
        assert "key" in dim
        assert "label" in dim
        assert "framework_code" in dim


def test_get_literacy_radar_with_data(client, auth_headers, db_session, test_user):
    from app.models.evaluation import Evaluation

    db_session.add(
        Evaluation(
            user_id=test_user.id,
            project_id=1,
            form_type="sub_project_1",
            scores={"5.2基础性阅读知识_0": 5},
        )
    )
    db_session.commit()

    response = client.get("/api/profile/literacy-radar", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["overall_score"] is not None
    assert data["level_text"] is not None
    assert data["summary_text"] is not None
    by_key = {d["key"]: d for d in data["dimensions"]}
    assert by_key["basic_knowledge"]["score"] == 100
    assert by_key["basic_knowledge"]["self_score"] == 100.0
    assert by_key["basic_knowledge"]["behavior_score"] is None
