import sys
import os
import unittest

# Add project root to sys.path so "src" can be imported
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))

import src.theme_selector as theme_selector


class TestThemeSelector(unittest.TestCase):
    """Unit Tests for ThemeSelector class in theme_selector module"""

    def setUp(self):
        """Reset environment before each test"""
        theme_selector._local_storage.clear()
        theme_selector.document.classes.clear()

    def test_default_starts_in_light_mode(self):
        """
        Ensures ThemeSelector starts in light mode when no theme is stored.
        """
        selector = theme_selector.ThemeSelector()
        self.assertFalse(selector.isDark)
        self.assertEqual(selector.get_theme_label(), "Dark Mode")
        self.assertEqual(selector.get_theme_icon(), "🌙")

    def test_loads_saved_dark_mode(self):
        """
        Ensures that if 'dark' is in localStorage, component initializes in dark mode.
        """
        theme_selector._local_storage["theme"] = "dark"
        selector = theme_selector.ThemeSelector()
        self.assertTrue(selector.isDark)
        self.assertIn("dark", theme_selector.document.classes)
        self.assertEqual(selector.get_theme_label(), "Light Mode")
        self.assertEqual(selector.get_theme_icon(), "🌞")

    def test_toggle_switches_light_to_dark(self):
        """
        Simulates clicking the toggle to switch from light → dark mode.
        """
        selector = theme_selector.ThemeSelector()
        selector.toggle_theme()
        self.assertTrue(selector.isDark)
        self.assertEqual(theme_selector._local_storage["theme"], "dark")
        self.assertIn("dark", theme_selector.document.classes)

    def test_toggle_switches_dark_to_light(self):
        """
        Simulates clicking twice to go dark → light mode again.
        """
        selector = theme_selector.ThemeSelector()
        selector.toggle_theme()  # Light → Dark
        selector.toggle_theme()  # Dark → Light
        self.assertFalse(selector.isDark)
        self.assertEqual(theme_selector._local_storage["theme"], "light")
        self.assertNotIn("dark", theme_selector.document.classes)

    def test_multiple_rapid_toggles(self):
        """
        Verifies multiple rapid theme toggles don’t corrupt state.
        """
        selector = theme_selector.ThemeSelector()
        for _ in range(5):
            selector.toggle_theme()
        # Odd number of toggles → ends in dark
        self.assertTrue(selector.isDark)
        self.assertEqual(theme_selector._local_storage["theme"], "dark")

    def test_handles_missing_local_storage_gracefully(self):
        """
        Ensures ThemeSelector doesn't crash if localStorage is missing.
        """
        original_storage = theme_selector._local_storage
        try:
            # Simulate localStorage not available
            theme_selector._local_storage = None
            selector = theme_selector.ThemeSelector()
            # Should fallback to light mode safely
            self.assertFalse(selector.isDark)
        finally:
            # Restore original local storage
            theme_selector._local_storage = original_storage


if __name__ == "__main__":
    unittest.main()
