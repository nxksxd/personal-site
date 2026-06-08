from sqlalchemy import Column, Integer, String, Text, JSON

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, nullable=False)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    image = Column(Text, nullable=True)
    comment = Column(Text, nullable=True)
    tags = Column(JSON, nullable=False, default=list)


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    tags = Column(JSON, nullable=False, default=list)
    link = Column(String, nullable=False, default="#")
    github = Column(String, nullable=True)
    image = Column(Text, nullable=True)


class Social(Base):
    __tablename__ = "socials"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    url = Column(String, nullable=False)
    icon = Column(String, nullable=False, default="github")
