from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


# ---------- Auth ----------

class Credentials(BaseModel):
    username: str = Field(min_length=1)
    password: str = Field(min_length=4)


class PasswordChange(BaseModel):
    current_password: str = Field(min_length=1)
    new_password: str = Field(min_length=12)
    confirm_password: str = Field(min_length=12)


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str


class AuthResult(BaseModel):
    token: str
    user: UserOut


class AuthStatus(BaseModel):
    has_users: bool


# ---------- Categories ----------

class CategoryBase(BaseModel):
    name: str = Field(min_length=1)
    slug: Optional[str] = None
    color: Optional[str] = "#6366f1"


class CategoryOut(CategoryBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


# ---------- Shared ----------

class SocialLink(BaseModel):
    """A social/external link attached to a post or project."""
    label: str = Field(min_length=1)
    url: str = Field(min_length=1)
    icon: str = "link"


# ---------- Posts ----------

class PostBase(BaseModel):
    date: str
    title: str = Field(min_length=1)
    content: str = Field(min_length=1)
    image: Optional[str] = None
    comment: Optional[str] = None
    tags: list[str] = Field(default_factory=list)
    links: list[SocialLink] = Field(default_factory=list)
    status: str = "published"
    slug: Optional[str] = None
    meta_description: Optional[str] = None
    og_image: Optional[str] = None
    category_id: Optional[int] = None
    project_id: Optional[int] = None
    post_type: Optional[str] = None


class ProjectRef(BaseModel):
    """Lightweight project reference embedded in a post."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str


class PostOut(PostBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    category: Optional[CategoryOut] = None
    project: Optional[ProjectRef] = None


# ---------- Projects ----------

class ProjectBase(BaseModel):
    title: str = Field(min_length=1)
    description: str = Field(min_length=1)
    detail_content: str = ""
    tags: list[str] = Field(default_factory=list)
    link: str = "#"
    github: Optional[str] = None
    links: list[SocialLink] = Field(default_factory=list)
    image: Optional[str] = None


class ProjectOut(ProjectBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    post_count: int = 0


# ---------- Socials ----------

class SocialBase(BaseModel):
    name: str = Field(min_length=1)
    url: str = Field(min_length=1)
    icon: str = "github"
    sort_order: int = 0


class SocialOut(SocialBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


# ---------- Uploads ----------

class UploadOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    filename: str
    original_name: str
    mime_type: str
    size: int
    uploaded_at: str
    url: str


# ---------- Dashboard ----------

class DashboardStats(BaseModel):
    total_posts: int
    total_projects: int
    total_socials: int
    published_posts: int
    draft_posts: int
    total_categories: int
    total_uploads: int
    recent_posts: list[PostOut] = Field(default_factory=list)
