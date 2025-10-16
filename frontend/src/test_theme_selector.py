#test_theme_selector.py
import unittest
import theme_selector

class TestUserThemeSelection(unittest.TestCase):
    """Unit Tests for userThemeSelection() function in theme_selector module"""

    def setUp(self):
        """Setup: Reset local storage and valid themes before each test"""
        theme_selector._local_storage.clear()
        theme_selector.VALID_THEMES = ['light', 'dark']

    def test_valid_theme_selected(self):
        """
        Unit: Functional / Correct Input
        Description: Ensures userThemeSelection() correctly stores and returns
        a valid theme when provided an allowed theme value.
        """
        result = theme_selector.userThemeSelection('dark')
        self.assertEqual(result, 'dark')
        self.assertEqual(theme_selector._local_storage.get('theme'), 'dark')

    def test_invalid_theme_not_in_list(self):
        """
        Unit: Error Handling / Incorrect Input
        Description: Verifies that userThemeSelection() raises ValueError
        when provided a theme that is not in the VALID_THEMES list.
        """
        with self.assertRaises(ValueError) as ctx:
            theme_selector.userThemeSelection('neonPink')
        self.assertIn('Invalid theme', str(ctx.exception))

    def test_boundary_rapid_theme_changes(self):
        """
        Unit: Boundary / Rapid Input Changes
        Description: Checks that userThemeSelection() can handle rapid,
        consecutive theme selections without error or state corruption.
        """
        themes = ['light', 'dark', 'light']
        for t in themes:
            result = theme_selector.userThemeSelection(t)
            self.assertEqual(result, t)
            self.assertEqual(theme_selector._local_storage['theme'], t)

    def test_edge_called_before_load(self):
        """
        Unit: Edge Case / Initialization
        Description: Tests that a ValueError is raised when userThemeSelection()
        is called before VALID_THEMES is initialized or loaded.
        """
        theme_selector.VALID_THEMES = None
        with self.assertRaises(ValueError) as ctx:
            theme_selector.userThemeSelection('dark')
        self.assertIn('Themes not loaded', str(ctx.exception))


if __name__ == '__main__':
    unittest.main()
