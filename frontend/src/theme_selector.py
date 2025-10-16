# theme_selector.py

# Simulate local storage as a dictionary
_local_storage = {}

# Initialize valid themes
VALID_THEMES = ['light', 'dark']

def userThemeSelection(theme: str) -> str:
    """
    Allows the user to select a display theme.

    Args:
        theme (str): The name of the theme to select.

    Returns:
        str: The selected theme.

    Raises:
        ValueError: If VALID_THEMES is not initialized or theme is invalid.
    """
    # Check if themes are loaded
    if VALID_THEMES is None:
        raise ValueError("Themes not loaded")

    # Validate theme selection
    if theme not in VALID_THEMES:
        raise ValueError("Invalid theme")

    # Store the selected theme
    _local_storage['theme'] = theme

    # Return the selected theme
    return theme
