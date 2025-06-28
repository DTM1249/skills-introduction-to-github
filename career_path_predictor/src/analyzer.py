# src/analyzer.py

from .data_loader import load_jobs_data, load_skills_data

class CareerAnalyzer:
    def __init__(self):
        self.jobs_data = load_jobs_data()
        self.skills_data = load_skills_data()
        # Create a skill name to ID map for easier lookup
        self.skill_name_to_id = {skill['name'].lower(): skill['id'] for skill in self.skills_data}

    def get_skill_id(self, skill_name):
        return self.skill_name_to_id.get(skill_name.lower())

    def predict_career_path(self, current_skill_names: list[str]):
        """
        Placeholder function to predict a career path based on current skills.
        This is a very basic implementation for now.
        """
        print(f"\nAnalyzing career path for skills: {', '.join(current_skill_names)}")

        current_skill_ids = [self.get_skill_id(name) for name in current_skill_names if self.get_skill_id(name)]
        if not current_skill_ids:
            return "Could not identify any of your skills. Please check the spelling or try different skills."

        print(f"Identified skill IDs: {current_skill_ids}")

        # Basic logic: Find jobs that require at least one of the user's skills
        potential_jobs = []
        for job in self.jobs_data:
            # Check for intersection of skills
            if any(skill_id in job["required_skills"] for skill_id in current_skill_ids):
                potential_jobs.append(job)

        if not potential_jobs:
            return "No direct career path found with the provided skills based on current data. Consider upskilling or exploring related fields."

        # Simplistic recommendation: suggest the first job found
        # A real system would have more complex ranking (e.g., skill match percentage, trends)
        recommended_job = potential_jobs[0]

        recommendation = f"Based on your skills, a potential career direction is: {recommended_job['title']}.\n"
        recommendation += f"Description: {recommended_job['description']}\n"

        # Suggest upskilling for missing skills for the recommended job
        missing_skills_for_job = [
            skill_id for skill_id in recommended_job["required_skills"] if skill_id not in current_skill_ids
        ]

        if missing_skills_for_job:
            missing_skill_names = [
                next(s['name'] for s in self.skills_data if s['id'] == ms_id) for ms_id in missing_skills_for_job
            ]
            recommendation += f"To strengthen your profile for this role, consider developing skills in: {', '.join(missing_skill_names)}.\n"

        return recommendation

    def suggest_upskilling_paths(self, current_skill_names: list[str]):
        """
        Placeholder for suggesting upskilling paths.
        """
        # This could analyze skill gaps for various roles or look at trending skills.
        # For now, let's suggest learning a trending skill not already possessed.
        # In a real app, this would be much more sophisticated.

        current_skill_ids = [self.get_skill_id(name) for name in current_skill_names if self.get_skill_id(name)]

        # Placeholder: Suggest learning "Machine Learning" if not already skilled and it's a trend
        ml_skill_id = self.get_skill_id("Machine Learning")
        if ml_skill_id and ml_skill_id not in current_skill_ids:
            return "Consider upskilling in 'Machine Learning' as it's a high-growth area."

        data_analysis_skill_id = self.get_skill_id("Data Analysis")
        if data_analysis_skill_id and data_analysis_skill_id not in current_skill_ids:
            return "Consider upskilling in 'Data Analysis' as it's a foundational skill for many tech roles."

        return "Currently, no specific upskilling suggestions. Explore job descriptions for desired roles to identify skill gaps."

if __name__ == '__main__':
    analyzer = CareerAnalyzer()

    # Test case 1: User with Python
    user_skills_1 = ["Python"]
    prediction_1 = analyzer.predict_career_path(user_skills_1)
    print("\n--- Prediction 1 ---")
    print(prediction_1)
    upskilling_1 = analyzer.suggest_upskilling_paths(user_skills_1)
    print(f"Upskilling suggestion: {upskilling_1}")

    # Test case 2: User with Python and Data Analysis
    user_skills_2 = ["Python", "Data Analysis", "Communication"]
    prediction_2 = analyzer.predict_career_path(user_skills_2)
    print("\n--- Prediction 2 ---")
    print(prediction_2)
    upskilling_2 = analyzer.suggest_upskilling_paths(user_skills_2)
    print(f"Upskilling suggestion: {upskilling_2}")

    # Test case 3: User with a skill not directly matching many jobs initially
    user_skills_3 = ["JavaScript"]
    prediction_3 = analyzer.predict_career_path(user_skills_3)
    print("\n--- Prediction 3 ---")
    print(prediction_3)
    upskilling_3 = analyzer.suggest_upskilling_paths(user_skills_3)
    print(f"Upskilling suggestion: {upskilling_3}")

    # Test case 4: User with no recognized skills
    user_skills_4 = ["Basket Weaving"]
    prediction_4 = analyzer.predict_career_path(user_skills_4)
    print("\n--- Prediction 4 ---")
    print(prediction_4)
    upskilling_4 = analyzer.suggest_upskilling_paths(user_skills_4)
    print(f"Upskilling suggestion: {upskilling_4}")
