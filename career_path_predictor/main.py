# main.py

from src.analyzer import CareerAnalyzer
from src.utils import simple_logger

def run_career_predictor_cli():
    """
    Runs a simple Command-Line Interface for the Career Path Predictor.
    """
    simple_logger("Initializing Career Path Predictor CLI...")
    analyzer = CareerAnalyzer()

    print("\n--- Welcome to the Career Path Predictor! ---")
    print("This tool provides placeholder predictions based on sample data.")

    while True:
        try:
            skills_input = input("\nEnter your current skills (comma-separated, e.g., Python,Data Analysis): ")
            if not skills_input:
                print("No skills entered. Please provide at least one skill.")
                continue

            current_skills = [skill.strip() for skill in skills_input.split(',')]
            simple_logger(f"User input skills: {current_skills}")

            prediction = analyzer.predict_career_path(current_skills)
            print("\n--- Career Path Recommendation ---")
            print(prediction)

            upskilling_suggestion = analyzer.suggest_upskilling_paths(current_skills)
            print("\n--- Upskilling Suggestion ---")
            print(upskilling_suggestion)

        except Exception as e:
            simple_logger(f"An error occurred: {e}", level="ERROR")
            print(f"An unexpected error occurred: {e}. Please try again.")

        another_query = input("\nDo you want to try another prediction? (yes/no): ").strip().lower()
        if another_query != 'yes':
            break

    print("\nThank you for using the Career Path Predictor!")

if __name__ == "__main__":
    # To run the CLI, execute this file: python main.py
    # Ensure you are in the root directory 'career_path_predictor'
    # If you encounter ModuleNotFoundError, you might need to set PYTHONPATH
    # For example: export PYTHONPATH=. (on Linux/macOS) or set PYTHONPATH=. (on Windows)
    # Or run as a module: python -m main (this often handles imports better)
    # However, since we are using relative imports within the src package,
    # running 'python main.py' from the root should work if Python adds the current directory to sys.path.

    # A more robust way to handle imports if main.py is inside src:
    # If main.py were in src, you'd call it with `python -m src.main` from the root.
    # But since it's in the root, direct execution is fine.

    # Test if imports work as expected when running from root
    try:
        from src.data_loader import load_skills_data # Try a deeper import
        simple_logger("Successfully imported src.data_loader in main.py.")
        # skills = load_skills_data() # This would print loading messages from data_loader
        # simple_logger(f"Test load_skills_data returned {len(skills)} skills.")
    except ImportError as e:
        simple_logger(f"ImportError in main.py: {e}. Ensure PYTHONPATH is set correctly if running from a different directory structure or consider running as a module.", level="WARNING")
        print("\n[WARNING] Could not fully verify imports. If you see errors, please check your Python path.")
        print("Try running from the 'career_path_predictor' directory using 'python main.py'.")


    run_career_predictor_cli()
