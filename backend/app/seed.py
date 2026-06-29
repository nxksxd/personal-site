from sqlalchemy.orm import Session

from .models import Post, Project, Social

DEFAULT_PROJECTS = [
    {
        "title": "FinAI",
        "description": (
            "iOS-приложение для управления личными финансами с AI-аналитикой "
            "расходов и автоматическим импортом банковских выписок."
        ),
        "tags": ["Swift", "SwiftUI", "SwiftData", "AI"],
        "link": "https://github.com/nxksxd/app_finai_nxksxd",
        "github": "https://github.com/nxksxd/app_finai_nxksxd",
        "image": None,
    },
    {
        "title": "MTProxyMax",
        "description": (
            "Форк MTProxy с полной интернационализацией интерфейса "
            "(English/Русский) и расширенной конфигурацией."
        ),
        "tags": ["Python", "Telegram", "Proxy", "i18n"],
        "link": "https://github.com/nxksxd/MTProxyMax",
        "github": "https://github.com/nxksxd/MTProxyMax",
        "image": None,
    },
    {
        "title": "Personal Blog",
        "description": (
            "Этот сайт — персональный блог и визитка, собранный на React + "
            "TypeScript с поддержкой тёмной и светлой тем."
        ),
        "tags": ["React", "TypeScript", "CSS"],
        "link": "#",
        "github": None,
        "image": None,
    },
]

DEFAULT_POSTS = [
    {
        "date": "2026-06-07",
        "title": "Запуск личного сайта",
        "content": (
            "Наконец-то собрал свой персональный сайт! Здесь буду делиться "
            "новостями о проектах, мыслями и полезными ссылками. Сайт "
            "поддерживает тёмную и светлую тему — переключайте в шапке."
        ),
        "image": "/images/placeholder-launch.svg",
        "comment": (
            "Давно хотел сделать что-то подобное. Теперь есть единое место для "
            "всех обновлений."
        ),
        "tags": ["анонс", "сайт"],
    },
    {
        "date": "2026-06-05",
        "title": "FinAI v1.8 — новый импорт с дедупликацией",
        "content": (
            "Выпустил обновление FinAI с секцией «Дубликаты» при импорте "
            "выписок. Теперь можно включать и выключать проверку на дубли, а "
            "MerchantClassifier стал точнее распознавать категории."
        ),
        "image": "/images/placeholder-finai.svg",
        "comment": (
            "Импорт был одной из самых сложных фич. Рад, что удалось "
            "реализовать красиво."
        ),
        "tags": ["FinAI", "релиз"],
    },
    {
        "date": "2026-06-01",
        "title": "MTProxyMax — полная интернационализация",
        "content": (
            "Добавил полный перевод интерфейса MTProxyMax на русский и "
            "английский языки. Теперь при первом запуске можно выбрать язык."
        ),
        "image": "/images/placeholder-proxy.svg",
        "comment": None,
        "tags": ["MTProxyMax", "i18n"],
    },
]

DEFAULT_SOCIALS = [
    {"name": "GitHub", "url": "https://github.com/nxksxd", "icon": "github"},
    {"name": "Telegram", "url": "https://t.me/nxksxd", "icon": "telegram"},
    {"name": "Email", "url": "mailto:12455nikita.nd@gmail.com", "icon": "email"},
]


def seed_content(db: Session, *, force: bool = False) -> None:
    """Populate default content.

    When force is True, wipes existing content first (used by /reset).
    Otherwise only seeds tables that are currently empty.
    """
    if force:
        db.query(Post).delete()
        db.query(Project).delete()
        db.query(Social).delete()
        db.commit()

    if db.query(Project).count() == 0:
        db.add_all(Project(**p) for p in DEFAULT_PROJECTS)
    if db.query(Post).count() == 0:
        db.add_all(Post(**p) for p in DEFAULT_POSTS)
    if db.query(Social).count() == 0:
        db.add_all(Social(**s) for s in DEFAULT_SOCIALS)
    db.commit()
