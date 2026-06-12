from datetime import date
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    ListFlowable,
    ListItem,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "reports"
OUT_PDF = OUT_DIR / "Event_Media_Platform_Project_Report.pdf"

BLUE = colors.HexColor("#2E74B5")
DARK_BLUE = colors.HexColor("#1F4D78")
INK = colors.HexColor("#202020")
MUTED = colors.HexColor("#5A5A5A")
LIGHT = colors.HexColor("#F2F4F7")
BORDER = colors.HexColor("#C9D2DC")


def make_styles():
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "TitleCustom",
            parent=base["Title"],
            fontName="Helvetica-Bold",
            fontSize=26,
            leading=31,
            alignment=TA_CENTER,
            textColor=DARK_BLUE,
            spaceAfter=4,
        ),
        "subtitle": ParagraphStyle(
            "SubtitleCustom",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=17,
            leading=22,
            alignment=TA_CENTER,
            textColor=BLUE,
            spaceAfter=18,
        ),
        "h1": ParagraphStyle(
            "H1Custom",
            parent=base["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=16,
            leading=20,
            textColor=BLUE,
            spaceBefore=6,
            spaceAfter=8,
        ),
        "h2": ParagraphStyle(
            "H2Custom",
            parent=base["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=12.5,
            leading=16,
            textColor=BLUE,
            spaceBefore=8,
            spaceAfter=5,
        ),
        "body": ParagraphStyle(
            "BodyCustom",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=10.2,
            leading=13.2,
            textColor=INK,
            alignment=TA_LEFT,
            spaceAfter=6,
        ),
        "small": ParagraphStyle(
            "SmallCustom",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=8.7,
            leading=11,
            textColor=INK,
            spaceAfter=3,
        ),
        "table": ParagraphStyle(
            "TableText",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=8.6,
            leading=10.4,
            textColor=INK,
        ),
        "table_head": ParagraphStyle(
            "TableHead",
            parent=base["BodyText"],
            fontName="Helvetica-Bold",
            fontSize=8.8,
            leading=10.6,
            textColor=INK,
        ),
        "code": ParagraphStyle(
            "CodeCustom",
            parent=base["Code"],
            fontName="Courier",
            fontSize=9,
            leading=12,
            leftIndent=12,
            rightIndent=12,
            backColor=colors.HexColor("#F7F8FA"),
            borderColor=BORDER,
            borderWidth=0.5,
            borderPadding=7,
            spaceAfter=8,
        ),
    }


def footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 8.5)
    canvas.setFillColor(MUTED)
    canvas.drawString(inch, 0.55 * inch, "Event Media Platform Project Report")
    canvas.drawRightString(7.5 * inch, 0.55 * inch, f"Page {doc.page}")
    canvas.restoreState()


def para(text, style):
    return Paragraph(text, style)


def bullets(items, styles):
    return ListFlowable(
        [ListItem(para(item, styles["body"]), leftIndent=8) for item in items],
        bulletType="bullet",
        start="circle",
        leftIndent=18,
        bulletFontName="Helvetica",
        bulletFontSize=7,
        bulletColor=BLUE,
        spaceAfter=4,
    )


def numbers(items, styles):
    return ListFlowable(
        [ListItem(para(item, styles["body"]), leftIndent=8) for item in items],
        bulletType="1",
        leftIndent=20,
        spaceAfter=4,
    )


def table(data, styles, widths):
    converted = []
    for row_idx, row in enumerate(data):
        converted.append([
            para(str(cell), styles["table_head" if row_idx == 0 else "table"])
            for cell in row
        ])
    t = Table(converted, colWidths=widths, repeatRows=1, hAlign="LEFT")
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), LIGHT),
                ("GRID", (0, 0), (-1, -1), 0.45, BORDER),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    return t


def add_page_1(story, s):
    story.append(para("Event Media Platform", s["title"]))
    story.append(para("Project Report", s["subtitle"]))
    story.append(
        table(
            [
                ["Area", "Project detail"],
                ["Project type", "Full-stack web application for hosting, managing, searching, and sharing event media."],
                ["Frontend", "Next.js 16 App Router, React 19, Tailwind CSS, shadcn-style UI components, Zustand, Axios, Socket.IO client."],
                ["Backend", "Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, Multer, Sharp, Socket.IO, JWT authentication."],
                ["AI modules", "Python scripts for MobileNetV2-based image tagging and DeepFace-based face matching."],
                ["Storage", "Cloudinary integration with local uploads fallback."],
                ["Prepared on", date.today().strftime("%B %d, %Y")],
            ],
            s,
            [1.45 * inch, 5.05 * inch],
        )
    )
    story.append(Spacer(1, 12))
    story.append(para("Abstract", s["h1"]))
    story.append(
        para(
            "The Event Media Platform is a media management system designed for events where large numbers of photos and videos must be uploaded, organized, searched, and shared. "
            "The application combines a modern web client, an API server, a relational database, automated image tagging, face-recognition based discovery, real-time notifications, and controlled media download features.",
            s["body"],
        )
    )
    story.append(
        para(
            "This report summarizes the project objectives, functional scope, technology stack, architecture, database design, implementation modules, deployment approach, and future enhancements.",
            s["body"],
        )
    )


def add_page_2(story, s):
    story.append(para("1. Introduction and Objectives", s["h1"]))
    story.append(
        para(
            "Event photography commonly produces hundreds or thousands of files across multiple albums. Manual searching is slow, sharing is fragmented, and useful engagement data is often unavailable. "
            "This project addresses those issues by creating a single platform where events, media files, user interactions, and intelligent discovery features work together.",
            s["body"],
        )
    )
    story.append(para("Problem Statement", s["h2"]))
    story.append(
        bullets(
            [
                "Guests need a fast way to find photos that include them or match a specific event, tag, photographer, or category.",
                "Photographers need controlled upload, organization, and deletion workflows for event galleries.",
                "Organizers need visibility into media volume, likes, shares, and top-performing content.",
                "The platform must support both public galleries and private event access rules.",
            ],
            s,
        )
    )
    story.append(para("Project Objectives", s["h2"]))
    story.append(
        numbers(
            [
                "Build a responsive frontend for authentication, dashboards, event pages, gallery browsing, search, comments, favorites, and shared media links.",
                "Implement a secure REST API with JWT-based authentication, role-aware access checks, and Prisma-backed persistence.",
                "Automate media understanding through image tagging and face matching services.",
                "Support image and video uploads with Cloudinary deployment readiness and local storage fallback.",
                "Provide real-time notifications when users receive likes, comments, or tags.",
            ],
            s,
        )
    )


def add_page_3(story, s):
    story.append(para("2. Functional Requirements and Scope", s["h1"]))
    story.append(para("Major Features", s["h2"]))
    story.append(
        table(
            [
                ["Feature", "Description"],
                ["Authentication", "Registration, login, JWT token issuance, protected profile retrieval, and role assignment."],
                ["Event management", "Create, view, update, delete, sort, and filter events with public/private visibility."],
                ["Media management", "Single and bulk upload, image optimization, video handling, deletion, favorites, likes, comments, and downloads."],
                ["AI discovery", "Automatic hashtag generation from image content, file names, and event metadata; selfie upload and face-match discovery."],
                ["Sharing", "Generated shared media links, share-count tracking, and social sharing support in the frontend."],
                ["Notifications", "Persistent notification records plus Socket.IO delivery for likes, comments, and photo tags."],
                ["Analytics", "Dashboard summaries for event counts, media counts, engagement, and leading content."],
            ],
            s,
            [1.55 * inch, 4.95 * inch],
        )
    )
    story.append(Spacer(1, 8))
    story.append(para("User Roles", s["h2"]))
    story.append(
        bullets(
            [
                "ADMIN: broad administrative access and moderation authority.",
                "PHOTOGRAPHER: event/media contribution workflows and private-event visibility.",
                "MEMBER: authenticated event participant with broader private gallery access than a public viewer.",
                "VIEWER: default registered role with basic browsing and interaction capabilities.",
            ],
            s,
        )
    )
    story.append(
        para(
            "The implementation focuses on a working minimum production-style system: frontend flows, backend routes, persistence, AI services, upload handling, and deployment configuration are represented in the repository.",
            s["body"],
        )
    )


def add_page_4(story, s):
    story.append(para("3. System Architecture", s["h1"]))
    story.append(
        para(
            "The platform follows a layered full-stack architecture. The Next.js client handles user interaction and calls the Express API. "
            "The API coordinates business rules, Prisma data access, file handling, AI subprocesses, and real-time Socket.IO messages. PostgreSQL stores structured records, while uploaded assets are stored in Cloudinary or the local uploads directory.",
            s["body"],
        )
    )
    story.append(para("Architecture Flow", s["h2"]))
    story.append(
        para(
            "Browser / Next.js UI<br/>"
            "&nbsp;&nbsp;&nbsp;&nbsp;-> REST API + Socket.IO<br/>"
            "&nbsp;&nbsp;&nbsp;&nbsp;-> Controllers and Services<br/>"
            "&nbsp;&nbsp;&nbsp;&nbsp;-> Prisma ORM -> PostgreSQL<br/>"
            "&nbsp;&nbsp;&nbsp;&nbsp;-> Multer/Sharp -> Cloudinary or local uploads<br/>"
            "&nbsp;&nbsp;&nbsp;&nbsp;-> Python AI scripts -> MobileNetV2 tags / DeepFace matches",
            s["code"],
        )
    )
    story.append(para("Technology Stack", s["h2"]))
    story.append(
        table(
            [
                ["Layer", "Technology", "Purpose"],
                ["Frontend", "Next.js 16, React 19, Tailwind CSS", "Dashboard UI, routing, media browsing, auth screens, responsive layout."],
                ["State/API", "Zustand, Axios, Socket.IO client", "Client state, API requests, and real-time event handling."],
                ["Backend", "Express 5, TypeScript, Socket.IO", "REST endpoints, request validation, authentication, notifications."],
                ["Database", "Prisma 6, PostgreSQL", "Typed ORM and relational storage for users, events, media, engagement, and tags."],
                ["AI", "Python, TensorFlow/Keras, MobileNetV2, DeepFace", "Image classification tags and face-match search."],
                ["Media", "Multer, Sharp, Cloudinary", "Upload intake, image optimization, cloud storage, and local fallback."],
            ],
            s,
            [1.3 * inch, 2.2 * inch, 3.0 * inch],
        )
    )


def add_page_5(story, s):
    story.append(para("4. Database and API Design", s["h1"]))
    story.append(
        para(
            "The Prisma schema models the platform around users, events, media, and engagement records. Relationships are explicit, and uniqueness constraints prevent duplicate likes, favorites, face matches, and user tags for the same media item.",
            s["body"],
        )
    )
    story.append(para("Core Data Model", s["h2"]))
    story.append(
        table(
            [
                ["Entity", "Important fields", "Relationships"],
                ["User", "id, name, email, password, role, selfieUrl", "Owns events/media; creates likes, comments, favorites, face matches, notifications, and media tags."],
                ["Event", "title, description, category, eventDate, isPublic", "Created by one user and contains many media records."],
                ["Media", "url, type, tags, shareCount", "Belongs to an event and uploader; has likes, comments, favorites, tags, and face matches."],
                ["Engagement", "Like, Comment, Favorite, Notification", "Captures social actions and user-facing activity updates."],
                ["Recognition", "FaceMatch, MediaTag", "Connects users to matching or manually tagged media."],
            ],
            s,
            [1.15 * inch, 2.35 * inch, 3.0 * inch],
        )
    )
    story.append(Spacer(1, 8))
    story.append(para("API Modules", s["h2"]))
    story.append(
        bullets(
            [
                "Auth routes handle registration and login with bcrypt password hashing and JWT token creation.",
                "Event routes expose event CRUD operations with private-event visibility checks.",
                "Media routes cover upload, bulk upload, search, likes, comments, favorites, selfie recognition, manual tagging, sharing, downloads, and deletion.",
                "Notification routes support listing, unread counts, marking as read, and clearing notifications.",
                "Analytics routes support dashboard reporting for activity and engagement metrics.",
            ],
            s,
        )
    )
    story.append(para("Protected backend middleware decodes the JWT and attaches user identity and role to authenticated request objects.", s["body"]))


def add_page_6(story, s):
    story.append(para("5. Implementation Highlights", s["h1"]))
    story.append(para("Media Processing", s["h2"]))
    story.append(
        bullets(
            [
                "Images are optimized with Sharp to a maximum 1920 x 1080 size and JPEG quality settings before storage.",
                "Videos are recognized through file extensions and served with HTML5-compatible playback behavior in the frontend.",
                "Cloudinary upload is attempted first; if cloud configuration is unavailable, local upload paths remain usable.",
                "Image downloads receive a generated watermark containing club, event, and user-role context.",
            ],
            s,
        )
    )
    story.append(para("AI Tagging and Face Recognition", s["h2"]))
    story.append(
        para(
            "The tagging pipeline calls a Python MobileNetV2 script, maps ImageNet predictions into event-friendly tags such as people, portrait, celebration, sports, dining, and outdoor, then supplements those tags with filename and event metadata keywords. "
            "The face matching pipeline stores a user's reference selfie and compares it against uploaded media using DeepFace, creating FaceMatch records for personal photo results.",
            s["body"],
        )
    )
    story.append(para("Frontend Experience", s["h2"]))
    story.append(
        bullets(
            [
                "Dashboard pages cover events, event details, event creation/editing, search, favorites, my photos, notifications, and user profiles.",
                "Reusable UI components include buttons, dialogs, sheets, inputs, cards, badges, tables, skeleton loading states, avatars, and dropdown menus.",
                "Gallery components provide likes, comments, favorites, media cards, upload controls, and shared media views.",
            ],
            s,
        )
    )


def add_page_7(story, s):
    story.append(para("6. Security, Deployment, Testing, and Conclusion", s["h1"]))
    story.append(para("Security Measures", s["h2"]))
    story.append(
        bullets(
            [
                "Passwords are hashed with bcrypt before being stored.",
                "JWTs carry user id and role information for protected route authorization.",
                "Private events are hidden from users who do not have sufficient role permissions.",
                "Media deletion checks ownership or ADMIN status before removing records and related engagement data.",
                "CORS is configured against the frontend origin supplied through environment variables.",
            ],
            s,
        )
    )
    story.append(para("Deployment Model", s["h2"]))
    story.append(
        table(
            [
                ["Component", "Deployment note"],
                ["Frontend", "Deploy the frontend directory to Vercel with NEXT_PUBLIC_API_URL pointing to the backend API."],
                ["Backend", "Deploy the Express server to Render, Railway, Heroku, or similar Node-capable hosting."],
                ["Database", "Use a managed PostgreSQL service such as Supabase, Neon, AWS RDS, or another compatible provider."],
                ["Environment", "Configure DATABASE_URL, JWT_SECRET, FRONTEND_URL, and optional Cloudinary credentials."],
                ["AI runtime", "Install Python dependencies including DeepFace, TensorFlow/Keras, OpenCV, and NumPy on the backend host."],
            ],
            s,
            [1.45 * inch, 5.05 * inch],
        )
    )
    story.append(Spacer(1, 7))
    story.append(para("Conclusion and Future Scope", s["h2"]))
    story.append(
        para(
            "The Event Media Platform demonstrates a practical full-stack solution for event albums. It combines user management, event organization, media publishing, engagement tools, AI-assisted search, and deployment-ready infrastructure in a coherent application.",
            s["body"],
        )
    )
    story.append(
        bullets(
            [
                "Add automated API, frontend, and AI-service tests.",
                "Move AI jobs into a background queue for large upload and recognition workloads.",
                "Add admin moderation screens, audit logs, richer search filters, expiring share links, and observability.",
            ],
            s,
        )
    )
    story.append(para("References: repository README, package manifests, Prisma schema, backend controllers/services, frontend pages/components, and Python AI scripts.", s["small"]))


def build_pdf():
    OUT_DIR.mkdir(exist_ok=True)
    styles = make_styles()
    doc = BaseDocTemplate(
        str(OUT_PDF),
        pagesize=letter,
        leftMargin=inch,
        rightMargin=inch,
        topMargin=inch,
        bottomMargin=0.85 * inch,
        title="Event Media Platform Project Report",
        author="Codex",
    )
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="normal")
    doc.addPageTemplates([PageTemplate(id="main", frames=[frame], onPage=footer)])

    story = []
    add_page_1(story, styles)
    story.append(PageBreak())
    add_page_2(story, styles)
    story.append(PageBreak())
    add_page_3(story, styles)
    story.append(PageBreak())
    add_page_4(story, styles)
    story.append(PageBreak())
    add_page_5(story, styles)
    story.append(PageBreak())
    add_page_6(story, styles)
    story.append(PageBreak())
    add_page_7(story, styles)

    doc.build(story)
    print(OUT_PDF)


if __name__ == "__main__":
    build_pdf()
