from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="UserBehavior",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("customer_id", models.PositiveIntegerField(db_index=True)),
                ("book_id", models.PositiveIntegerField(db_index=True)),
                ("action", models.CharField(
                    choices=[
                        ("view", "View"),
                        ("click", "Click"),
                        ("add_to_cart", "Add to Cart"),
                        ("purchase", "Purchase"),
                    ],
                    max_length=20,
                )),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("metadata", models.JSONField(blank=True, default=dict)),
            ],
            options={"ordering": ["-created_at"]},
        ),
    ]
