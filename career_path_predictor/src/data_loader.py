# src/data_loader.py

def load_skills_data():
    """
    Placeholder function to load skills data.
    In a real application, this would load from a file or database.
    """
    print("Loading skills data (placeholder)...")
    # Sample data
    skills = [
        {"id": "s1", "name": "Python", "category": "Programming Language"},
        {"id": "s2", "name": "JavaScript", "category": "Programming Language"},
        {"id": "s3", "name": "Data Analysis", "category": "Data Science"},
        {"id": "s4", "name": "Machine Learning", "category": "Data Science"},
        {"id": "s5", "name": "Communication", "category": "Soft Skill"},
        {"id": "s6", "name": "Project Management", "category": "Management"},
    ]
    return skills

def load_jobs_data():
    """
    Placeholder function to load job roles data.
    In a real application, this would load from a file, database, or API.
    """
    print("Loading jobs data (placeholder)...")
    # Sample data
    jobs = [
        {
            "id": "j1",
            "title": "Software Engineer",
            "description": "Develops and maintains software applications.",
            "required_skills": ["s1", "s2"], # Referencing skill IDs
            "typical_salary_range": (70000, 120000),
            "career_path_progression": ["j2"] # Potential next roles
        },
        {
            "id": "j2",
            "title": "Senior Software Engineer",
            "description": "Leads development projects and mentors junior engineers.",
            "required_skills": ["s1", "s2", "s6"],
            "typical_salary_range": (90000, 150000),
            "career_path_progression": []
        },
        {
            "id": "j3",
            "title": "Data Analyst",
            "description": "Analyzes data to provide insights.",
            "required_skills": ["s1", "s3", "s5"],
            "typical_salary_range": (60000, 100000),
            "career_path_progression": ["j4"]
        },
        {
            "id": "j4",
            "title": "Data Scientist",
            "description": "Uses advanced techniques to solve complex data problems.",
            "required_skills": ["s1", "s3", "s4", "s5"],
            "typical_salary_range": (80000, 140000),
            "career_path_progression": []
        },
    ]
    return jobs

def load_market_trends_data():
    """
    Placeholder function to load market trends data.
    """
    print("Loading market trends data (placeholder)...")
    # Sample data
    trends = [
        {
            "id": "t1",
            "name": "AI and Machine Learning Growth",
            "description": "Increasing demand for AI/ML skills.",
            "growth_indicator": 0.15, # e.g., 15% projected annual growth
            "related_skills": ["s4", "s1"]
        },
        {
            "id": "t2",
            "name": "Cloud Computing Expansion",
            "description": "Continued growth in cloud technologies and related roles.",
            "growth_indicator": 0.12,
            "related_skills": ["s1"] # Placeholder, would add cloud specific skills
        }
    ]
    return trends

if __name__ == '__main__':
    # Example usage (for testing purposes)
    skills_data = load_skills_data()
    print(f"\nLoaded {len(skills_data)} skills.")
    for skill in skills_data:
        print(f"- {skill['name']} ({skill['category']})")

    jobs_data = load_jobs_data()
    print(f"\nLoaded {len(jobs_data)} job roles.")
    for job in jobs_data:
        print(f"- {job['title']}")

    trends_data = load_market_trends_data()
    print(f"\nLoaded {len(trends_data)} market trends.")
    for trend in trends_data:
        print(f"- {trend['name']}")
