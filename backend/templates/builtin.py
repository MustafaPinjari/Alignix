"""
Built-in formatting templates seeded into the database on first run.
"""

BUILTIN_TEMPLATES = [
    {
        "name": "IEEE Paper",
        "description": "IEEE conference/journal formatting standard",
        "rules": [
            {"element": "heading1", "font_name": "Times New Roman", "font_size": 14, "bold": True, "alignment": "center", "color": "000000"},
            {"element": "heading2", "font_name": "Times New Roman", "font_size": 12, "bold": True, "italic": True, "alignment": "left"},
            {"element": "body", "font_name": "Times New Roman", "font_size": 10, "alignment": "justify", "line_spacing": 1.0},
            {"element": "caption", "font_name": "Times New Roman", "font_size": 9, "italic": True, "alignment": "center"},
            {"element": "table", "alignment": "center"},
        ],
    },
    {
        "name": "College Report",
        "description": "Standard academic report formatting",
        "rules": [
            {"element": "heading1", "font_name": "Times New Roman", "font_size": 18, "bold": True, "alignment": "center", "color": "1F3864"},
            {"element": "heading2", "font_name": "Times New Roman", "font_size": 14, "bold": True, "alignment": "left", "color": "2E74B5"},
            {"element": "heading3", "font_name": "Times New Roman", "font_size": 12, "bold": True, "alignment": "left"},
            {"element": "body", "font_name": "Times New Roman", "font_size": 12, "alignment": "justify", "line_spacing": 1.5, "space_after": 6},
            {"element": "table", "alignment": "center"},
        ],
    },
    {
        "name": "Business Proposal",
        "description": "Professional business document formatting",
        "rules": [
            {"element": "heading1", "font_name": "Calibri", "font_size": 20, "bold": True, "alignment": "left", "color": "1F3864"},
            {"element": "heading2", "font_name": "Calibri", "font_size": 14, "bold": True, "alignment": "left", "color": "2E74B5"},
            {"element": "body", "font_name": "Calibri", "font_size": 11, "alignment": "left", "line_spacing": 1.15, "space_after": 8},
            {"element": "table", "alignment": "center"},
        ],
    },
    {
        "name": "Legal Document",
        "description": "Legal document formatting standard",
        "rules": [
            {"element": "heading1", "font_name": "Times New Roman", "font_size": 14, "bold": True, "alignment": "center"},
            {"element": "heading2", "font_name": "Times New Roman", "font_size": 12, "bold": True, "alignment": "left"},
            {"element": "body", "font_name": "Times New Roman", "font_size": 12, "alignment": "justify", "line_spacing": 2.0},
            {"element": "table", "alignment": "left"},
        ],
    },
    {
        "name": "Resume",
        "description": "Professional resume/CV formatting",
        "rules": [
            {"element": "heading1", "font_name": "Calibri", "font_size": 16, "bold": True, "alignment": "center"},
            {"element": "heading2", "font_name": "Calibri", "font_size": 12, "bold": True, "alignment": "left", "color": "2E74B5"},
            {"element": "body", "font_name": "Calibri", "font_size": 11, "alignment": "left", "line_spacing": 1.15},
            {"element": "list", "font_name": "Calibri", "font_size": 11, "alignment": "left"},
        ],
    },
    {
        "name": "Dissertation",
        "description": "Academic dissertation/thesis formatting",
        "rules": [
            {"element": "heading1", "font_name": "Times New Roman", "font_size": 16, "bold": True, "alignment": "center", "color": "000000"},
            {"element": "heading2", "font_name": "Times New Roman", "font_size": 14, "bold": True, "alignment": "left"},
            {"element": "heading3", "font_name": "Times New Roman", "font_size": 12, "bold": True, "italic": True, "alignment": "left"},
            {"element": "body", "font_name": "Times New Roman", "font_size": 12, "alignment": "justify", "line_spacing": 2.0, "space_after": 0},
            {"element": "caption", "font_name": "Times New Roman", "font_size": 10, "italic": True, "alignment": "center"},
            {"element": "table", "alignment": "center"},
        ],
    },
]


def seed_templates():
    from db.database import get_session, Profile, Rule
    db = get_session()
    try:
        if db.query(Profile).count() > 0:
            return
        for tmpl in BUILTIN_TEMPLATES:
            p = Profile(name=tmpl["name"], description=tmpl["description"])
            db.add(p)
            db.flush()
            for r in tmpl["rules"]:
                db.add(Rule(profile_id=p.id, **{k: v for k, v in r.items()}))
        db.commit()
    finally:
        db.close()
