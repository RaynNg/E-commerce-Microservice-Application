from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("catalogs", "0002_add_icon_to_catalog"),
    ]

    operations = [
        migrations.AlterField(
            model_name="catalog",
            name="name",
            field=models.CharField(max_length=255),
        ),
        migrations.AddField(
            model_name="catalog",
            name="product_type",
            field=models.CharField(
                choices=[
                    ("book", "Sách"),
                    ("laptop", "Laptop & Thiết bị điện tử"),
                    ("fashion", "Thời trang"),
                ],
                default="book",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="catalog",
            name="image_url",
            field=models.URLField(blank=True),
        ),
        migrations.AddField(
            model_name="catalog",
            name="is_active",
            field=models.BooleanField(default=True),
        ),
    ]
