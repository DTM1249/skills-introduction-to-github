# tests/test_data_loader.py

import pytest
# Adjust import path if necessary, depending on how pytest discovers your project root
# If running pytest from the root 'career_path_predictor' directory, this should work.
from src.data_loader import load_skills_data, load_jobs_data, load_market_trends_data

def test_load_skills_data():
    """
    Test that load_skills_data returns a list of skill dictionaries.
    """
    skills = load_skills_data()
    assert isinstance(skills, list)
    assert len(skills) > 0  # Expecting some sample data
    for skill in skills:
        assert isinstance(skill, dict)
        assert "id" in skill
        assert "name" in skill
        assert "category" in skill
    # Check for a known skill (optional, but good for sanity check)
    assert any(skill['name'] == "Python" for skill in skills)

def test_load_jobs_data():
    """
    Test that load_jobs_data returns a list of job dictionaries.
    """
    jobs = load_jobs_data()
    assert isinstance(jobs, list)
    assert len(jobs) > 0  # Expecting some sample data
    for job in jobs:
        assert isinstance(job, dict)
        assert "id" in job
        assert "title" in job
        assert "required_skills" in job
        assert isinstance(job["required_skills"], list)
    # Check for a known job
    assert any(job['title'] == "Software Engineer" for job in jobs)

def test_load_market_trends_data():
    """
    Test that load_market_trends_data returns a list of trend dictionaries.
    """
    trends = load_market_trends_data()
    assert isinstance(trends, list)
    assert len(trends) > 0  # Expecting some sample data
    for trend in trends:
        assert isinstance(trend, dict)
        assert "id" in trend
        assert "name" in trend
        assert "related_skills" in trend
        assert isinstance(trend["related_skills"], list)
    # Check for a known trend
    assert any(trend['name'] == "AI and Machine Learning Growth" for trend in trends)

if __name__ == '__main__':
    # This allows running tests with `python tests/test_data_loader.py`
    # However, it's better to use `pytest`
    pytest.main()
