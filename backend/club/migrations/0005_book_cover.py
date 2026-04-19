from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("club", "0004_alter_blogpost_options_alter_notification_options_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="book",
            name="cover",
            field=models.ImageField(
                upload_to="books/covers/",
                blank=True,
                null=True,
                help_text="Imagem de capa do livro",
            ),
        ),
    ]
