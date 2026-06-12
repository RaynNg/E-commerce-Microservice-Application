from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("recommender", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="ProductIndex",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("product_id", models.IntegerField(unique=True)),
                ("product_type", models.CharField(max_length=20)),
                ("name", models.CharField(max_length=500)),
                ("description", models.TextField()),
                ("price", models.DecimalField(decimal_places=0, max_digits=12)),
                ("catalog_id", models.IntegerField()),
                ("catalog_name", models.CharField(blank=True, max_length=255)),
                ("search_text", models.TextField()),
                ("embedding_updated_at", models.DateTimeField(blank=True, null=True)),
                ("raw_data", models.JSONField(default=dict)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={"db_table": "product_index"},
        ),
        migrations.CreateModel(
            name="ChatHistory",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("customer_id", models.IntegerField()),
                ("message", models.TextField()),
                ("response", models.TextField()),
                ("products_recommended", models.JSONField(default=list)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={"db_table": "chat_history", "ordering": ["-created_at"]},
        ),
    ]
