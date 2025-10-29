"""
Simulates the behavior of the ThemeSelector React component in Python.
This manages dark/light mode, local storage, and theme toggling.
"""

# Simulated HTML root element (document.documentElement)
class HTMLDocument:
    def __init__(self):
        self.classes = set()

    def classList_contains(self, name):
        return name in self.classes

    def classList_add(self, name):
        self.classes.add(name)

    def classList_remove(self, name):
        self.classes.discard(name)

    def classList_toggle(self, name):
        """Toggle a class and return True if added (dark mode on), False if removed."""
        if name in self.classes:
            self.classes.remove(name)
            return False
        else:
            self.classes.add(name)
            return True


# Initialize simulated browser environment
document = HTMLDocument()
_local_storage = {}


class ThemeSelector:
    def __init__(self):
        """
        Initialize the theme selector, safely handling missing localStorage.
        """
        self.isDark = document.classList_contains("dark")

        # Try to load saved theme safely
        saved_theme = None
        try:
            if isinstance(_local_storage, dict):
                saved_theme = _local_storage.get("theme")
        except Exception:
            # If storage is broken, ignore
            saved_theme = None

        # Apply stored theme or fallback to light
        if saved_theme == "dark":
            document.classList_add("dark")
            self.isDark = True
        else:
            document.classList_remove("dark")
            self.isDark = False

    def toggle_theme(self):
        """
        Mimics the onClick handler in your React component.
        Toggles between light and dark mode.
        """
        new_is_dark = document.classList_toggle("dark")

        # Safely write to local storage
        try:
            if isinstance(_local_storage, dict):
                _local_storage["theme"] = "dark" if new_is_dark else "light"
        except Exception:
            pass

        self.isDark = new_is_dark
        return self.isDark

    def get_theme_label(self):
        """Returns the label shown on the button in your React UI."""
        return "Light Mode" if self.isDark else "Dark Mode"

    def get_theme_icon(self):
        """Returns the emoji shown on the button in your React UI."""
        return "🌞" if self.isDark else "🌙"
