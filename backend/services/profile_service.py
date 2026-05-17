"""
Profile Service — CRUD for formatting profiles and their rules.
"""
from db.database import get_session, Profile, Rule


class ProfileService:

    def list_all(self) -> list:
        db = get_session()
        try:
            profiles = db.query(Profile).all()
            return [self._serialize_profile(p) for p in profiles]
        finally:
            db.close()

    def get(self, pid: int) -> dict:
        db = get_session()
        try:
            p = db.query(Profile).filter_by(id=pid).first()
            return self._serialize_profile(p) if p else {}
        finally:
            db.close()

    def create(self, data: dict) -> dict:
        db = get_session()
        try:
            p = Profile(name=data["name"], description=data.get("description", ""))
            db.add(p)
            db.commit()
            db.refresh(p)
            if data.get("rules"):
                self._save_rules(db, p.id, data["rules"])
            return self._serialize_profile(p)
        finally:
            db.close()

    def update(self, pid: int, data: dict) -> dict:
        db = get_session()
        try:
            p = db.query(Profile).filter_by(id=pid).first()
            if not p:
                return {}
            p.name = data.get("name", p.name)
            p.description = data.get("description", p.description)
            db.commit()
            return self._serialize_profile(p)
        finally:
            db.close()

    def delete(self, pid: int):
        db = get_session()
        try:
            p = db.query(Profile).filter_by(id=pid).first()
            if p:
                db.delete(p)
                db.commit()
        finally:
            db.close()

    def get_rules(self, profile_id: int) -> list:
        db = get_session()
        try:
            rules = db.query(Rule).filter_by(profile_id=profile_id).all()
            return [self._serialize_rule(r) for r in rules]
        finally:
            db.close()

    def update_rules(self, profile_id: int, rules_data: list) -> list:
        db = get_session()
        try:
            db.query(Rule).filter_by(profile_id=profile_id).delete()
            self._save_rules(db, profile_id, rules_data)
            return self.get_rules(profile_id)
        finally:
            db.close()

    # ── Internal ──────────────────────────────────────────────────────────────

    def _save_rules(self, db, profile_id: int, rules_data: list):
        for r in rules_data:
            rule = Rule(
                profile_id=profile_id,
                element=r["element"],
                font_name=r.get("font_name"),
                font_size=r.get("font_size"),
                bold=int(r.get("bold", 0)),
                italic=int(r.get("italic", 0)),
                color=r.get("color"),
                alignment=r.get("alignment"),
                line_spacing=r.get("line_spacing"),
                space_before=r.get("space_before"),
                space_after=r.get("space_after"),
            )
            db.add(rule)
        db.commit()

    def _serialize_profile(self, p: Profile) -> dict:
        return {"id": p.id, "name": p.name, "description": p.description,
                "created_at": str(p.created_at)}

    def _serialize_rule(self, r: Rule) -> dict:
        return {
            "id": r.id, "profile_id": r.profile_id, "element": r.element,
            "font_name": r.font_name, "font_size": r.font_size,
            "bold": bool(r.bold), "italic": bool(r.italic),
            "color": r.color, "alignment": r.alignment,
            "line_spacing": r.line_spacing,
            "space_before": r.space_before, "space_after": r.space_after,
        }
