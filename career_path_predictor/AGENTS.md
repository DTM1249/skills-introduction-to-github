# Agent Instructions for Career Path Predictor

## General Guidelines
- Follow standard Python coding conventions (PEP 8).
- Write clear and concise code with comments where necessary.
- Ensure all new code is accompanied by unit tests.
- Keep dependencies listed in `requirements.txt` up to date.

## Project Structure
- `data/`: Stores datasets (raw and processed).
- `notebooks/`: Jupyter notebooks for exploration and prototyping.
- `scripts/`: Utility scripts for tasks like data fetching, preprocessing.
- `src/`: Core application logic.
- `tests/`: Unit and integration tests.

## Development Process
1.  **Understand the Task:** Clarify any ambiguities before starting.
2.  **Plan:** Outline the steps to implement the feature or fix the bug.
3.  **Implement:** Write the code.
4.  **Test:** Write and run tests to verify the changes.
5.  **Document:** Update any relevant documentation.
6.  **Commit:** Use clear and descriptive commit messages.

## Data Handling
- Sensitive data should not be committed to the repository. Use environment variables or configuration files (added to `.gitignore`) for credentials or API keys.
- Document data sources and preprocessing steps.

## Testing
- Aim for high test coverage.
- Use `pytest` for running tests.
- Tests should be independent and repeatable.

## Future Considerations (for the agent)
- This application might involve:
    - Web scraping for job data.
    - Natural Language Processing (NLP) for skill extraction.
    - Machine Learning models for prediction.
    - Integration with job APIs (e.g., LinkedIn, Indeed).
- Be mindful of the potential scale and complexity as new features are added.
