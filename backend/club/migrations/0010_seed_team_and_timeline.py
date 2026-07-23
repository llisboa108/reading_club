import shutil
from pathlib import Path

from django.conf import settings
from django.db import migrations

# Source images already used by the (now retired) hardcoded frontend arrays —
# copied into MEDIA_ROOT so the new admin-managed models can reference real,
# already-published photos instead of starting empty.
FRONTEND_LANDING_IMAGES = Path(settings.BASE_DIR).parent / "frontend" / "public" / "images" / "landing"

TEAM_MEMBERS = [
    {"name": "Daiane A. Hoffmann", "role": "Idealizadora e Fundadora", "file": "daiane.jpg",
     "instagram": "https://www.instagram.com/daianehoffmann/", "order": 0},
    {"name": "Cirene A. L. Hoffmann", "role": "Membro desde 2018", "file": "cirene.jpg",
     "instagram": "https://www.instagram.com/cirenelisboa/", "order": 1},
    {"name": "Larissa Zembruski", "role": "Membro desde 2018", "file": "larissa.jpg",
     "instagram": "https://www.instagram.com/larizembruski/", "order": 2},
    {"name": "Simone Lisboa", "role": "Membro desde 2021", "file": "simone.jpg",
     "instagram": "https://www.instagram.com/simone_lisboa15/", "order": 3},
    {"name": "Valéria Garcia", "role": "Membro desde 2022", "file": "valeria.jpg",
     "instagram": "https://www.instagram.com/valeria_garcia1525/", "order": 4},
    {"name": "Ionete Santos", "role": "Membro desde 2022", "file": "ionete.jpg",
     "instagram": "https://www.instagram.com/ionete_santoss/", "order": 5},
    {"name": "Franciele M. Freitas", "role": "Membro desde 2025", "file": "franciele.jpg",
     "instagram": "https://www.instagram.com/leitorados30epoucos", "order": 6},
]

TIMELINE_ENTRIES = [
    {"title": "Fundação do Clube", "date": "29 de agosto de 2018",
     "description": "O clube Sonhos Literários se transforma em realidade.",
     "file": "fundacao.png", "link": "", "order": 0},
    {"title": "Primeiro Amigo Literário", "date": "Dezembro de 2018",
     "description": "Revelação do primeiro amigo literário do clube, o amigo secreto do Clube Sonhos Literários.",
     "file": "amigo-literario.jpg", "link": "", "order": 1},
    {"title": "Segundo Amigo Literário", "date": "Novembro de 2019",
     "description": "Realização do segundo amigo literário.",
     "file": "segundo-amigo.jpeg", "link": "", "order": 2},
    {"title": "Pandemia COVID", "date": "Janeiro de 2020",
     "description": "Com o início da pandemia de COVID os encontros passam a ser realizados de forma remota.",
     "file": "COVID-final.jpg", "link": "", "order": 3},
    {"title": "Primeiro evento literário", "date": "15 de novembro de 2021",
     "description": "Uma nova página é escrita na história do clube: o primeiro evento promovido pelo Clube "
                     "Sonhos Literários, tendo como inspiração a série de livros Bridgerton.",
     "file": "primeiro-evento.jpg", "link": "https://www.instagram.com/p/Ccg5-zXMT3i/", "order": 4},
    {"title": "Encontros híbridos", "date": "Janeiro de 2022",
     "description": "Com o recuo das medidas de isolamento da pandemia de COVID, os encontros do clube passam "
                     "a ser realizados de forma híbrida (online e presencial).",
     "file": "encontros-hibridos.jpg", "link": "", "order": 5},
    {"title": "Segundo Evento Literário", "date": "18 de junho de 2022",
     "description": "O Clube Sonhos Literários realiza seu segundo evento, tendo dessa vez como tema As "
                     "Brumas de Avalon.",
     "file": "segundo-evento.jpeg", "link": "", "order": 6},
    {"title": "Terceiro Amigo Literário", "date": "Novembro de 2022",
     "description": "Concluímos o ano de leitura com a realização do terceiro amigo literário, aproveitando "
                     "para realizar nosso primeiro piquenique.",
     "file": "terceiro-amigo.jpg", "link": "https://www.instagram.com/p/CmOuYCor85q/?img_index=1", "order": 7},
    {"title": "Terceiro Evento Literário", "date": "25 de junho de 2023",
     "description": "Pela terceira vez em sua história o Clube Sonhos Literários promove um evento, dessa "
                     "vez inspirado no próprio clube: uma celebração de todo o esforço e amor dedicados "
                     "durante seus 3 anos de existência.",
     "file": "terceiro-evento.jpeg", "link": "https://www.instagram.com/p/Cumpw0Jg0Jt/", "order": 8},
    {"title": "Quarto Amigo Literário", "date": "Novembro de 2022",
     "description": "Mais um ano de leituras e encontros se encerra, com a realização de mais um amigo "
                     "literário.",
     "file": "quarto-amigo.jpg", "link": "", "order": 9},
    {"title": "Início da gravação das leituras", "date": "20 de fevereiro de 2024",
     "description": "Uma nova forma de disponibilização das leituras: visando a comodidade dos membros, a "
                     "idealizadora decide gravar as leituras e disponibilizá-las ao clube.",
     "file": "gravacoes.jpeg", "link": "", "order": 10},
    {"title": "Sonhos Literários em Portugal", "date": "11 de junho de 2024",
     "description": "Apresentação do trabalho realizado com o Sonhos Literários na Universidade do Minho "
                     "(Portugal).",
     "file": "portugal.jpeg", "link": "", "order": 11},
    {"title": "Desbravamento Literário", "date": "1 de outubro de 2024",
     "description": "Mais um marco importante: o início de uma nova dinâmica de leitura, dedicando a última "
                     "leitura do ano a obras que levem os membros a conhecer diferentes culturas, países e "
                     "continentes.",
     "file": "desbravamento.jpg", "link": "https://www.instagram.com/p/DFfqezwOM2h/", "order": 12},
    {"title": "Convidada Especial", "date": "12 de outubro de 2024",
     "description": "No âmbito do Desbravamento Literário, o clube recebe pela primeira vez uma convidada "
                     "especial, Tathiana Cassiano, doutoranda em História pela UDESC.",
     "file": "convidada.jpg", "link": "", "order": 13},
    {"title": "Quinto Amigo Literário", "date": "9 de novembro de 2024",
     "description": "Mantendo o já tradicional Amigo Literário para encerrar a temporada 2024 de leituras "
                     "do clube.",
     "file": "quinto-amigo.jpg", "link": "https://www.instagram.com/p/DCLImAmRXyJ/?img_index=1", "order": 14},
    {"title": "Aniversário de 7 anos", "date": "29 de agosto de 2025",
     "description": "Em 2025 o Clube Sonhos Literários completa 7 anos.",
     "file": "sete-anos.jpeg", "link": "", "order": 15},
    {"title": "Primeiro Natal Literário", "date": "Dezembro de 2025",
     "description": "Projeto que nasceu para levar a literatura a crianças, viabilizado por doações de "
                     "padrinhos literários e entregue em parceria com o grupo Andarilhos. Ao todo, 218 "
                     "crianças foram atendidas.",
     "file": "natalliterario.jpg", "link": "", "order": 16},
]


def _copy_image(source_dir, subdir, filename):
    """Copies an existing landing-page image into MEDIA_ROOT/<subdir>/ and
    returns the relative path an ImageField expects. No-ops (still returns
    the path) if already copied by a previous run."""
    dest_dir = Path(settings.MEDIA_ROOT) / subdir
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest_path = dest_dir / filename
    if not dest_path.exists():
        shutil.copy(source_dir / filename, dest_path)
    return f"{subdir}/{filename}"


def seed_team_and_timeline(apps, schema_editor):
    TeamMember = apps.get_model("club", "TeamMember")
    TimelineEntry = apps.get_model("club", "TimelineEntry")

    team_source = FRONTEND_LANDING_IMAGES / "team"
    for data in TEAM_MEMBERS:
        image_path = _copy_image(team_source, "team", data["file"])
        TeamMember.objects.get_or_create(
            name=data["name"],
            defaults={
                "role": data["role"],
                "image": image_path,
                "instagram": data["instagram"],
                "order": data["order"],
            },
        )

    timeline_source = FRONTEND_LANDING_IMAGES / "timeline"
    for data in TIMELINE_ENTRIES:
        image_path = _copy_image(timeline_source, "timeline", data["file"])
        TimelineEntry.objects.get_or_create(
            title=data["title"],
            date=data["date"],
            defaults={
                "description": data["description"],
                "image": image_path,
                "link": data["link"],
                "order": data["order"],
            },
        )


def remove_seeded_team_and_timeline(apps, schema_editor):
    TeamMember = apps.get_model("club", "TeamMember")
    TimelineEntry = apps.get_model("club", "TimelineEntry")
    TeamMember.objects.filter(name__in=[m["name"] for m in TEAM_MEMBERS]).delete()
    TimelineEntry.objects.filter(title__in=[t["title"] for t in TIMELINE_ENTRIES]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('club', '0009_teammember_timelineentry'),
    ]

    operations = [
        migrations.RunPython(seed_team_and_timeline, remove_seeded_team_and_timeline),
    ]
