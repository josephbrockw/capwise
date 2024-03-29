# Test my new version route
def test_version(client):
    response = client.get("/version")
    assert response.status_code == 200
    assert response.json() == {"version": "0.0.1"}
