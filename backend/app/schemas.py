from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


# ---------- Auth ----------

class Credentials(BaseModel):
    username: str = Field(min_length=1)
    password: str = Field(min_length=4)


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str


class AuthResult(BaseModel):
    token: str
    user: UserOut


class AuthStatus(BaseModel):
    has_users: bool


# ---------- Posts ----------

class PostBase(BaseModel):
    date: str
    title: str = Field(min_length=1)
    content: str = Field(min_length=1)
    image: Optional[str] = None
    comment: Optional[str] = None
    tags: list[str] = Field(default_factory=list)


class PostOut(PostBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


# ---------- Projects ----------

class ProjectBase(BaseModel):
    title: str = Field(min_length=1)
    description: str = Field(min_length=1)
    tags: list[str] = Field(default_factory=list)
    link: str = "#"
    github: Optional[str] = None
    image: Optional[str] = None


class ProjectOut(ProjectBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


# ---------- Socials ----------

class SocialBase(BaseModel):
    name: str = Field(min_length=1)
    url: str = Field(min_length=1)
    icon: str = "github"


class SocialOut(SocialBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
