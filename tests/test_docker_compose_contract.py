import unittest
from pathlib import Path


class DockerComposeContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.compose = (Path(__file__).parents[1] / "docker-compose.yml").read_text()

    def test_site_is_loopback_only(self):
        self.assertIn('127.0.0.1:${PORT:-8000}:8000', self.compose)

    def test_site_has_hard_resource_limits(self):
        self.assertIn("cpus: 1.0", self.compose)
        self.assertIn("mem_limit: 1g", self.compose)
        self.assertIn("pids_limit: 256", self.compose)


if __name__ == "__main__":
    unittest.main()
