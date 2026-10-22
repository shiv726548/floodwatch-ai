from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    response = client.get('/health')
    assert response.status_code == 200
    assert response.json()['status'] == 'ok'


def test_routes_exclude_confirmed_closure():
    response = client.get('/api/routes?origin=response_base&destination=medical_zone')
    data = response.json()
    assert 'R-07' in data['closed_segments']
    assert data['verified_route'] is True


def test_requests_prioritized():
    response = client.get('/api/requests')
    payload = response.json()
    assert len(payload['requests']) >= 2
    assert payload['requests'][0]['priority_score'] > 70


def test_ai_fallback_object_shape():
    response = client.get('/api/evaluate')
    payload = response.json()
    assert 'duplicate_detection' in payload
    assert 'image_classification' in payload
