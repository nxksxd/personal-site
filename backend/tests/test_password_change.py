import unittest

from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.auth import hash_password, verify_password
from app.database import Base
from app.models import User
from app.routers.auth import change_user_password
from app.schemas import PasswordChange


class PasswordChangeTest(unittest.TestCase):
    def setUp(self):
        engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        Base.metadata.create_all(engine)
        self.db = sessionmaker(bind=engine)()
        self.admin = User(username="admin", password_hash=hash_password("current-password-123"))
        self.target = User(username="editor", password_hash=hash_password("old-editor-password"))
        self.db.add_all([self.admin, self.target])
        self.db.commit()
        self.db.refresh(self.admin)
        self.db.refresh(self.target)

    def tearDown(self):
        self.db.close()

    def request(self, **overrides):
        values = {
            "current_password": "current-password-123",
            "new_password": "new-secure-password-456",
            "confirm_password": "new-secure-password-456",
        }
        values.update(overrides)
        return PasswordChange(**values)

    def test_wrong_current_password_does_not_change_target(self):
        with self.assertRaises(HTTPException) as error:
            change_user_password(
                self.target.id,
                self.request(current_password="wrong-password"),
                self.admin,
                self.db,
            )
        self.assertEqual(error.exception.status_code, 401)
        self.assertTrue(verify_password("old-editor-password", self.target.password_hash))

    def test_confirmation_must_match(self):
        with self.assertRaises(HTTPException) as error:
            change_user_password(
                self.target.id,
                self.request(confirm_password="different-password"),
                self.admin,
                self.db,
            )
        self.assertEqual(error.exception.status_code, 400)

    def test_changes_only_selected_user_password(self):
        change_user_password(self.target.id, self.request(), self.admin, self.db)
        self.db.refresh(self.target)
        self.db.refresh(self.admin)
        self.assertTrue(verify_password("new-secure-password-456", self.target.password_hash))
        self.assertTrue(verify_password("current-password-123", self.admin.password_hash))


if __name__ == "__main__":
    unittest.main()
