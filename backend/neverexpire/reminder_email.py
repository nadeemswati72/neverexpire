"""Real email delivery for document-expiry reminders, via Gmail SMTP."""
import smtplib
from dataclasses import dataclass
from datetime import date
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from . import config

SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587


@dataclass
class ReminderItem:
    document_title: str
    person_name: str
    owner_email: str
    expiry_date: date
    threshold_days: int
    days_remaining: int


def send_email(to_email: str, subject: str, html_body: str, text_body: str) -> None:
    """Send an email via Gmail SMTP. Raises on failure — caller decides how to handle it."""
    if not config.GMAIL_ADDRESS or not config.GMAIL_APP_PASSWORD:
        raise RuntimeError(
            "GMAIL_ADDRESS / GMAIL_APP_PASSWORD not configured — set them in backend/.env"
        )

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = config.GMAIL_ADDRESS
    msg["To"] = to_email
    msg.attach(MIMEText(text_body, "plain"))
    msg.attach(MIMEText(html_body, "html"))

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls()
        server.login(config.GMAIL_ADDRESS, config.GMAIL_APP_PASSWORD)
        server.sendmail(config.GMAIL_ADDRESS, to_email, msg.as_string())


def _urgency_label(days_remaining: int) -> str:
    if days_remaining < 0:
        return "EXPIRED"
    if days_remaining <= 7:
        return "URGENT"
    if days_remaining <= 30:
        return "SOON"
    return "UPCOMING"


def _urgency_color(days_remaining: int) -> str:
    if days_remaining < 0:
        return "#c53030"
    if days_remaining <= 7:
        return "#c53030"
    if days_remaining <= 30:
        return "#b45309"
    return "#276749"


def build_digest(items: list[ReminderItem]) -> tuple[str, str, str]:
    """Returns (subject, html_body, text_body) for a digest covering all given items."""
    subject = f"NeverExpire: {len(items)} document{'s' if len(items) != 1 else ''} need attention"

    items_sorted = sorted(items, key=lambda i: i.days_remaining)

    text_lines = [f"NeverExpire — {len(items)} document(s) need attention", ""]
    row_html = []
    for item in items_sorted:
        days_label = f"{abs(item.days_remaining)}d ago" if item.days_remaining < 0 else f"{item.days_remaining}d left"
        text_lines.append(
            f"- [{_urgency_label(item.days_remaining)}] {item.document_title} ({item.person_name}) "
            f"— expires {item.expiry_date.strftime('%d %b %Y')} ({days_label}) "
            f"— account: {item.owner_email}"
        )
        row_html.append(f"""
        <tr>
          <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;">
            <span style="display:inline-block;font-size:11px;font-weight:700;color:white;background:{_urgency_color(item.days_remaining)};padding:2px 8px;border-radius:99px;">
              {_urgency_label(item.days_remaining)}
            </span>
          </td>
          <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;">
            <div style="font-weight:600;color:#15203a;">{item.document_title}</div>
            <div style="font-size:12px;color:#8a9ab5;">{item.person_name} · account: {item.owner_email}</div>
          </td>
          <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;text-align:right;white-space:nowrap;">
            <div style="font-weight:600;color:{_urgency_color(item.days_remaining)};">{days_label}</div>
            <div style="font-size:12px;color:#8a9ab5;">{item.expiry_date.strftime('%d %b %Y')}</div>
          </td>
        </tr>""")

    text_body = "\n".join(text_lines)

    html_body = f"""
    <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:640px;margin:0 auto;">
      <div style="background:linear-gradient(135deg,#34c9ba,#22a99c);padding:20px 24px;border-radius:12px 12px 0 0;">
        <div style="color:white;font-size:18px;font-weight:700;">⏰ NeverExpire</div>
        <div style="color:rgba(255,255,255,0.85);font-size:13px;margin-top:2px;">{len(items)} document(s) need your attention</div>
      </div>
      <table style="width:100%;border-collapse:collapse;background:white;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;">
        {''.join(row_html)}
      </table>
      <div style="padding:14px 4px;font-size:11px;color:#8a9ab5;">
        PoC note: this digest would normally be split and sent to each document owner's own inbox —
        during the PoC every reminder is routed here instead, with the intended account shown per row.
      </div>
    </div>
    """

    return subject, html_body, text_body
