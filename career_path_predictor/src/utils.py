# src/utils.py

import json

def format_output_json(data):
    """
    Formats dictionary data as a pretty-printed JSON string.
    """
    return json.dumps(data, indent=4)

def simple_logger(message, level="INFO"):
    """
    A very simple logger.
    In a real application, use Python's `logging` module.
    """
    print(f"[{level}] - {message}")

if __name__ == '__main__':
    sample_data = {"name": "Test User", "id": 123, "active": True}
    json_output = format_output_json(sample_data)
    print("Formatted JSON output:")
    print(json_output)

    simple_logger("This is an info message.")
    simple_logger("This is a warning message.", level="WARNING")
