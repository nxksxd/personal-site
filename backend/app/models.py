from sqlalchemy import Column, ForeignKey, Integer, String, Text, JSON
from sqlalchemy.orm import relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    slug = Column(String, unique=True, nullable=False)
    color = Column(String, nullable=False, default="#6366f1")

    posts = relationship("Post", back_populates="category")


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, nullable=False)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    image = Column(Text, nullable=True)
    comment = Column(Text, nullable=True)
    tags = Column(JSON, nullable=False, default=list)
    # Social/external links attached to the post: [{label, url, icon}, ...]
    links = Column(JSON, nullable=False, default=list)

    # CMS fields
    status = Column(String, nullable=False, default="published")
    slug = Column(String, unique=True, nullable=True)
    meta_description = Column(Text, nullable=True)
    og_image = Column(Text, nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    post_type = Column(String, nullable=True)
    created_at = Column(String, nullable=True)
    updated_at = Column(String, nullable=True)

    category = relationship("Category", back_populates="posts")
    project = relationship("Project", back_populates="posts")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    detail_content = Column(Text, nullable=False, default="")
    tags = Column(JSON, nullable=False, default=list)
    link = Column(String, nullable=False, default="#")
    github = Column(String, nullable=True)
    # Social/external links: [{label, url, icon}, ...]
    links = Column(JSON, nullable=False, default=list)
    image = Column(Text, nullable=True)

    posts = relationship("Post", back_populates="project")


class Social(Base):
    __tablename__ = "socials"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    url = Column(String, nullable=False)
    icon = Column(String, nullable=False, default="github")
    sort_order = Column(Integer, nullable=False, default=0)


class Upload(Base):
    __tablename__ = "uploads"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    original_name = Column(String, nullable=False)
    mime_type = Column(String, nullable=False)
    size = Column(Integer, nullable=False)
    uploaded_at = Column(String, nullable=False)
    url = Column(String, nullable=False)
