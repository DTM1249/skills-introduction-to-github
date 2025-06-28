# tests/test_analyzer.py

import pytest
from src.analyzer import CareerAnalyzer
from src.data_loader import load_skills_data # For checking against actual skill names/IDs

# Sample skills known to be in the data_loader for testing
# This helps make tests more robust to minor changes in sample data IDs, by looking them up.
# However, for simplicity in these initial tests, we might hardcode some skill names
# that are expected to be present.

@pytest.fixture
def analyzer():
    """Fixture to create a CareerAnalyzer instance for tests."""
    return CareerAnalyzer()

@pytest.fixture
def skills_map(analyzer):
    """Fixture to provide the skill name to ID map from the analyzer."""
    return analyzer.skill_name_to_id

def test_analyzer_initialization(analyzer):
    """Test that CareerAnalyzer initializes and loads data."""
    assert analyzer.skills_data is not None
    assert len(analyzer.skills_data) > 0
    assert analyzer.jobs_data is not None
    assert len(analyzer.jobs_data) > 0
    assert analyzer.skill_name_to_id is not None
    assert "python" in analyzer.skill_name_to_id # Check for a known skill (lowercase)

def test_get_skill_id(analyzer):
    """Test the get_skill_id method."""
    python_id = analyzer.get_skill_id("Python")
    assert python_id is not None
    assert analyzer.get_skill_id("python") == python_id # Case-insensitivity
    assert analyzer.get_skill_id("NonExistentSkill") is None

def test_predict_career_path_with_known_skills(analyzer):
    """Test basic career path prediction with skills known to match a job."""
    # Assuming "Python" maps to a skill that matches "Software Engineer" or "Data Analyst"
    # in the sample data.
    prediction = analyzer.predict_career_path(["Python"])
    assert isinstance(prediction, str)
    assert "potential career direction" in prediction.lower()
    # Example check - this depends heavily on the sample data and basic prediction logic
    assert "Software Engineer" in prediction or "Data Analyst" in prediction

def test_predict_career_path_with_multiple_skills(analyzer):
    """Test with multiple skills."""
    prediction = analyzer.predict_career_path(["Python", "Data Analysis"])
    assert isinstance(prediction, str)
    assert "potential career direction" in prediction.lower()
    # This combination currently points to "Software Engineer" due to basic "first match" logic
    # and the order in sample data. If logic becomes more sophisticated, this test may change.
    assert "Software Engineer" in prediction or "Data Analyst" in prediction or "Data Scientist" in prediction

def test_predict_career_path_upskilling_suggestion(analyzer):
    """Test that upskilling suggestions are included in the prediction."""
    # e.g., If "Python" leads to "Software Engineer", and "JavaScript" is also required
    # but not provided by the user.
    prediction = analyzer.predict_career_path(["Python"]) # Assuming SE needs more than just Python from sample
    if "Software Engineer" in prediction: # This check makes the test conditional on current placeholder logic
        # Check if it suggests a skill like JavaScript or Project Management based on sample data for SE
        # This is highly dependent on the initial data and could be fragile.
        # A better test would mock data_loader or have very stable minimal sample data for testing.
        # For now, we just check if *some* upskilling advice is present if a job is found.
        assert "consider developing skills in" in prediction.lower() or "strengthen your profile" in prediction.lower()

def test_predict_career_path_no_matching_job(analyzer):
    """Test prediction when no job matches the provided skills."""
    # Use a skill that's unlikely to be required by any sample job, or is very niche
    prediction = analyzer.predict_career_path(["Ancient Greek Literature"]) # Unlikely in sample data
    assert isinstance(prediction, str)
    assert "no direct career path found" in prediction.lower() or "could not identify any of your skills" in prediction.lower()

def test_predict_career_path_unidentified_skill(analyzer):
    """Test prediction when skills are not in the known skills list."""
    prediction = analyzer.predict_career_path(["NonExistentSkill123"])
    assert isinstance(prediction, str)
    assert "could not identify any of your skills" in prediction.lower()

def test_suggest_upskilling_paths_basic(analyzer):
    """Test the basic upskilling path suggestion."""
    # Test when user lacks a common suggested skill (e.g., Machine Learning)
    suggestion = analyzer.suggest_upskilling_paths(["Python"])
    assert isinstance(suggestion, str)
    # Based on current placeholder, it might suggest ML or Data Analysis
    assert "Machine Learning" in suggestion or "Data Analysis" in suggestion or "no specific upskilling suggestions" in suggestion

def test_suggest_upskilling_paths_already_skilled(analyzer):
    """Test upskilling when user already has the commonly suggested skills."""
    # Assuming "Machine Learning" and "Data Analysis" are the primary suggestions
    suggestion = analyzer.suggest_upskilling_paths(["Python", "Machine Learning", "Data Analysis"])
    assert isinstance(suggestion, str)
    # In this case, the placeholder might return a generic message
    assert "no specific upskilling suggestions" in suggestion or not ("Machine Learning" in suggestion or "Data Analysis" in suggestion)


if __name__ == '__main__':
    pytest.main()
